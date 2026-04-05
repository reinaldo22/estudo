import { supabase } from './supabase';
import { AnuncioProps } from '@/screens/home/HomeScreen'; // Reutilizando a prop se possível ou definindo nova
export interface FavoritoProps {
    id: string;
    ad_id: string;
    user_id: string;
    created_at: string;
    anuncios?: AnuncioProps; // Join com o anúncio
}

class FavoritosService {
    /**
     * Verifica se um anúncio já foi favoritado pelo usuário atual.
     */
    async checkIfFavorited(adId: string): Promise<boolean> {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return false;

        const { data, error } = await supabase
            .from('favoritos')
            .select('id')
            .eq('ad_id', adId)
            .eq('user_id', user.id)
            .single();

        if (error && error.code !== 'PGRST116') {
            console.error('Erro ao verificar favorito:', error.message);
        }

        return !!data;
    }

    /**
     * Adiciona ou remove um anúncio dos favoritos.
     * Retorna o novo estado (true = favoritado, false = não favoritado).
     */
    async toggleFavorite(adId: string, currentStatus: boolean): Promise<boolean> {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('Usuário não logado');

        if (!currentStatus) {
            // Não era favoritado, então adiciona
            const { error } = await supabase
                .from('favoritos')
                .insert({ ad_id: adId, user_id: user.id });

            if (error) throw error;
            return true;
        } else {
            // Era favoritado, então remove
            const { error } = await supabase
                .from('favoritos')
                .delete()
                .eq('ad_id', adId)
                .eq('user_id', user.id);

            if (error) throw error;
            return false;
        }
    }

    /**
     * Busca todos os anúncios favoritados pelo usuário.
     */
    async getMyFavorites(): Promise<FavoritoProps[]> {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return [];

        const { data, error } = await supabase
            .from('favoritos')
            .select(`
                *,
                anuncios (*)
            `)
            .eq('user_id', user.id)
            .order('created_at', { ascending: false });

        if (error) throw error;
        return data as FavoritoProps[];
    }
}

export default new FavoritosService();
