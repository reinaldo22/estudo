import { supabase } from './supabase';

class CategoriasService {
    /**
     * Busca categorias ativas no banco de dados.
     */
    async getCategorias() {
        const { data, error } = await supabase
            .from('categorias')
            .select('id, nome')
            .eq('ativo', true)
            .order('nome', { ascending: true });

        if (error) throw error;
        return data;
    }
}

export default new CategoriasService();
