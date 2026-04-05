import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "@supabase/supabase-js";

Deno.serve(async (req) => {
    try {
        console.log("Iniciando limpeza de anúncios expirados...");
        // Inicializa o cliente Supabase com a Service Role Key para ter acesso total e ignorar RLS
        const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
        const supabaseServiceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';

        if (!supabaseUrl || !supabaseServiceRoleKey) {
             console.error("Variáveis de ambiente SUPABASE_URL ou SUPABASE_SERVICE_ROLE_KEY ausentes.");
        }

        const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

        // Atualiza anúncios cujo tempo de impulsionamento acabou
        // 'impulsionado_ate' deve ser menor que a data/hora atual (UTC)
        const now = new Date().toISOString();
        console.log(`Buscando anúncios com impulsionado_ate < ${now}`);

        const { data, error, count } = await supabase
            .from('anuncios')
            .update({
                impulsionado: false,
                impulsionado_ate: null
            })
            .eq('impulsionado', true)
            .lt('impulsionado_ate', now)
            .select('*');

        if (error) {
            console.error('Erro ao atualizar anúncios expirados:', error);
            return new Response(JSON.stringify({ error: error.message }), {
                headers: { "Content-Type": "application/json" },
                status: 500
            });
        }

        console.log(`Sucesso: ${data?.length || 0} anúncios tiveram o impulsionamento expirado.`);
        
        return new Response(JSON.stringify({ 
            success: true, 
            message: `${data?.length || 0} ads updated`,
            updated_ads: data
        }), {
            headers: { "Content-Type": "application/json" },
            status: 200
        });

    } catch (err) {
        console.error('Erro inesperado na Edge Function:', err);
        return new Response(JSON.stringify({ error: 'Internal Server Error' }), {
            headers: { "Content-Type": "application/json" },
            status: 500
        });
    }
});
