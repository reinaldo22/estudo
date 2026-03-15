import { supabase } from './supabase';

export interface AdDataPayload {
    titulo: string;
    tipo: 'venda' | 'doação';
    preco: number;
    categoria_id: string;
    descricao: string;
    peso: number;
    unidade_medida: string;
    estado: string;
    cidade: string;
    imagens: string[];
    impulsionado?: boolean;
    plan_id?: string | null;
}

class AnunciosService {

    /**
     * Obtem o perfil do usuário para pré-preencher informações de localização
     */
    async getUserProfileLocation(userId: string) {
        const { data, error } = await supabase
            .from('profile')
            .select('endereco')
            .eq('id', userId)
            .single();
        
        if (error) throw error;
        return data;
    }


    /**
     * Verifica e retorna a contagem de anúncios criados gratuitamente pelo usuário nos últimos 7 dias.
     */
    async checkFreeAdsLimit(userId: string): Promise<number> {
        const umaSemanaAtras = new Date();
        umaSemanaAtras.setDate(umaSemanaAtras.getDate() - 7);

        const { count, error } = await supabase
            .from('anuncios')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', userId)
            .eq('impulsionado', false)
            .gte('created_at', umaSemanaAtras.toISOString());

        if (error) throw error;
        return count ?? 0;
    }

    /**
     * Faz upload de uma lista de imagens para o Supabase Storage e retorna as URLs públicas.
     * Ignora URLs web já existentes.
     */
    async uploadImages(userId: string, uris: string[]): Promise<string[]> {
        const finalUrls: string[] = [];

        for (const uri of uris) {
            if (uri.startsWith('http')) {
                finalUrls.push(uri);
                continue;
            }

            const fileExt = uri.split('.').pop();
            const fileName = `${userId}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

            const formData = new FormData();
            formData.append('file', {
                uri,
                name: fileName,
                type: `image/${fileExt === 'jpg' ? 'jpeg' : fileExt}`,
            } as any);

            const { error: uploadError } = await supabase.storage
                .from('anuncios')
                .upload(fileName, formData);

            if (uploadError) throw uploadError;

            const { data: { publicUrl } } = supabase.storage
                .from('anuncios')
                .getPublicUrl(fileName);

            finalUrls.push(publicUrl);
        }

        return finalUrls;
    }

    /**
     * Insere um novo anúncio no banco de dados.
     */
    async createAd(userId: string, adData: AdDataPayload) {
        const { data: insertData, error: insertError } = await supabase
            .from('anuncios')
            .insert({
                ...adData,
                user_id: userId,
                status: adData.impulsionado ? 'desativado' : 'ativo',
                created_at: new Date(),
            })
            .select('id, titulo, preco, imagens, cidade, estado')
            .single();

        if (insertError) throw insertError;
        return insertData;
    }

    /**
     * Atualiza um anúncio existente.
     */
    async updateAd(userId: string, adId: string, adData: AdDataPayload) {
        const { error: updateError, data: updateData } = await supabase
            .from('anuncios')
            .update(adData)
            .eq('id', adId)
            .eq('user_id', userId)
            .select();

        if (updateError) throw updateError;
        
        if (!updateData || updateData.length === 0) {
            throw new Error('Anúncio não encontrado ou sem permissão para editar.');
        }

        return updateData;
    }

    /**
     * Chama a Edge Function para confirmar o impulsionamento de um anúncio
     */
    async invokeBoostFunction(adId: string, planId: string | null) {
        const { data, error } = await supabase.functions.invoke('boost-ad', {
            body: { ad_id: adId, plan_id: planId }
        });
        
        if (error) throw error;
        return data;
    }
    /**
     * Busca anúncios impulsionados ativos.
     */
    async getBoostedAds(limit?: number) {
        let query = supabase
            .from('anuncios')
            .select('*')
            .eq('status', 'ativo')
            .eq('impulsionado', true)
            .gt('impulsionado_ate', new Date().toISOString())
            .order('created_at', { ascending: false });

        if (limit) {
            query = query.limit(limit);
        }

        const { data, error } = await query;

        if (error) throw error;
        return data;
    }

    /**
     * Busca uma página de anúncios com os filtros especificados.
     */
    async getAds(
        offset: number, 
        limit: number, 
        categoriaId?: string | null, 
        search?: string, 
        filtrosExtra?: any
    ) {
        let query = supabase.from('anuncios').select('*').eq('status', 'ativo');

        if (categoriaId && categoriaId !== 'tudo') {
            query = query.eq('categoria_id', categoriaId);
        }

        if (search && search.trim() !== "") {
            query = query.ilike('titulo', `%${search}%`);
        }

        if (filtrosExtra) {
            if (filtrosExtra.tipo && filtrosExtra.tipo !== 'todos') query = query.eq('tipo', filtrosExtra.tipo);
            if (filtrosExtra.estado) query = query.ilike('estado', `%${filtrosExtra.estado}%`);
            if (filtrosExtra.cidade) query = query.ilike('cidade', `%${filtrosExtra.cidade}%`);
            if (filtrosExtra.precoMin) query = query.gte('preco', parseFloat(filtrosExtra.precoMin));
            if (filtrosExtra.precoMax) query = query.lte('preco', parseFloat(filtrosExtra.precoMax));
        }

        const { data, error } = await query
            .range(offset, limit)
            .order('created_at', { ascending: false });

        if (error) throw error;
        return data;
    }

    /**
     * Busca os anúncios do usuário logado baseado na aba ativa
     */
    async getMyAds(userId: string, activeTab: 'ativos' | 'finalizados') {
        let query = supabase
            .from('anuncios')
            .select('*')
            .eq('user_id', userId);

        if (activeTab === 'ativos') {
            query = query.in('status', ['ativo', 'desativado']);
        } else {
            query = query.in('status', ['vendido', 'inativo']);
        }

        query = query
            .order('impulsionado', { ascending: false })
            .order('created_at', { ascending: false });

        const { data, error } = await query;

        if (error) throw error;
        return data;
    }

    /**
     * Altera o status de um anúncio (ex: 'ativo' -> 'inativo')
     */
    async toggleAdStatus(adId: string, newStatus: string) {
        const { error } = await supabase
            .from('anuncios')
            .update({ status: newStatus })
            .eq('id', adId);

        if (error) throw error;
    }

    /**
     * Exclui um anúncio permanentemente
     */
    async deleteAd(adId: string) {
        const { error } = await supabase
            .from('anuncios')
            .delete()
            .eq('id', adId);

        if (error) throw error;
    }

    /**
     * Busca todas as regiões disponíveis para filtro
     */
    async getRegioes() {
        const { data, error } = await supabase
            .from('localidades_ativas')
            .select('*');
            
        if (error) throw error;
        return data;
    }
    /**
     * Busca os detalhes de um anúncio específico, com os dados básicos do vendedor
     */
    async getAdDetails(adId: string) {
        const { data, error } = await supabase
            .from('anuncios')
            .select(`
                *,
                profile (
                    full_name,
                    avatar_url,
                    rating,
                    phone
                )
            `)
            .eq('id', adId)
            .single();

        if (error) throw error;
        return data;
    }
}

export default new AnunciosService();
