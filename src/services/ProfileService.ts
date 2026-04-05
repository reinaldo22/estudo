import { supabase } from './supabase';

export interface ProfileData {
    id: string;
    email: string;
    full_name: string | null;
    avatar_url: string | null;
    phone: string | null;
    rating: number | null;
    endereco: string | null;
    cpf: string | null;
    rg: string | null;
    updated_at: string | null;
    created_at: string | null;
    is_cnpj: boolean | null;
    anuncios?: any[];
}

class ProfileService {
    /**
     * Busca os dados do perfil atual logado.
     */
    async getCurrentProfile(): Promise<ProfileData | null> {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return null;

        const { data, error } = await supabase
            .from('profile')
            .select('*')
            .eq('id', user.id)
            .single();

        if (error) {
            console.error('Erro ao buscar perfil:', error.message);
            return null;
        }

        return data;
    }

    /**
     * Busca o perfil de um usuário específico pelo ID.
     */
    async getProfileById(userId: string): Promise<ProfileData | null> {
        const { data, error } = await supabase
            .from('profile')
            .select('*')
            .eq('id', userId)
            .single();

        if (error) {
            console.error('Erro ao buscar perfil por ID:', error);
            return null;
        }

        return data;
    }

    /**
     * Atualiza os dados do perfil do usuário atual.
     */
    async updateProfile(updates: Partial<ProfileData>) {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('Usuário não autenticado');

        const { error, data } = await supabase
            .from('profile')
            .update(updates)
            .eq('id', user.id)
            .select();

        if (error) throw error;
        return data;
    }

    /**
     * Faz upload de uma nova foto de perfil (avatar).
     */
    async uploadAvatar(uri: string): Promise<string> {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('Usuário não autenticado');

        const fileExt = uri.split('.').pop();
        const fileName = `${user.id}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

        const formData = new FormData();
        formData.append('file', {
            uri,
            name: fileName,
            type: `image/${fileExt === 'jpg' ? 'jpeg' : fileExt}`
        } as any);

        const { error: uploadError } = await supabase.storage
            .from('avatars')
            .upload(fileName, formData, { upsert: true });

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
            .from('avatars')
            .getPublicUrl(fileName);

        return publicUrl;
    }
    /**
     * Busca os dados do perfil atual logado junto com as estatísticas de anúncios.
     */
    async getProfileWithStats() {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return null;

        const { data, error } = await supabase
            .from('profile')
            .select(`*, anuncios (peso, status)`)
            .eq('id', user.id)
            .eq('anuncios.status', 'ativo')
            .single();

        if (error) {
            console.error('Erro ao buscar perfil com estatísticas:', error.message);
            return null;
        }

        return data;
    }

    /**
     * Exclui a conta do usuário atual chamando a edge function.
     */
    async deleteUser(accessToken: string) {
        const { data, error } = await supabase.functions.invoke('delete-user', {
            headers: {
                'Authorization': `Bearer ${accessToken}`
            }
        });

        if (error) throw error;
        return data;
    }

    /**
     * Remove um arquivo da storage baseado na URL pública
     */
    async removeAvatar(url: string) {
        try {
            const urlWithoutQuery = url.split('?')[0];
            const fileName = urlWithoutQuery.split('/').pop();
            
            if (fileName && !fileName.includes('placeholder')) {
                const { error } = await supabase.storage
                    .from('avatars')
                    .remove([fileName]);
                
                if (error) throw error;
            }
        } catch (error) {
            console.error('Erro ao remover avatar antigo:', error);
        }
    }

    /**
     * Busca o código de reset e expiração pelo e-mail
     */
    async getResetCodeByEmail(email: string) {
        const { data, error } = await supabase
            .from('profile')
            .select('reset_code, reset_code_expires_at')
            .eq('email', email)
            .single();

        if (error) throw error;
        return data;
    }

    /**
     * Verifica se um e-mail existe na base de perfis
     */
    async checkEmailExists(email: string): Promise<boolean> {
        const { data, error } = await supabase
            .from('profile')
            .select('email')
            .eq('email', email.trim().toLowerCase())
            .single();

        if (error && error.code !== 'PGRST116') throw error;
        return !!data;
    }

    /**
     * Chama a Edge Function para enviar o código de reset
     */
    async sendResetCode(email: string) {
        const { data, error } = await supabase.functions.invoke('send-reset-code', {
            body: { to: email.trim().toLowerCase() },
        });

        if (error) throw error;
        return data;
    }

    /**
     * Autentica o usuário com e-mail e senha
     */
    async signIn(email: string, password: string) {
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password
        });

        if (error) throw error;
        return data;
    }

    /**
     * Verifica se o perfil do usuário está ativo
     */
    async isProfileActive(userId: string): Promise<boolean> {
        const { data, error } = await supabase
            .from('profile')
            .select('is_active')
            .eq('id', userId)
            .single();

        if (error) return false;
        return data?.is_active !== false;
    }

    /**
     * Desloga o usuário
     */
    async signOut() {
        await supabase.auth.signOut();
    }
}

export default new ProfileService();
