import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "@supabase/supabase-js";

const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
    if (req.method === "OPTIONS") {
        return new Response("ok", { headers: corsHeaders });
    }

    try {
        const supabaseClient = createClient(
            Deno.env.get("SUPABASE_URL")!,
            Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
        );

        const { ad_id, plan_id } = await req.json();

        if (!ad_id || !plan_id) {
            throw new Error("ad_id e plan_id são obrigatórios");
        }

        // 1. Buscar a duração do plano
        const { data: plan, error: planError } = await supabaseClient
            .from("boost_plans")
            .select("duration_days")
            .eq("id", plan_id)
            .single();

        if (planError || !plan) {
            throw new Error("Plano não encontrado");
        }

        // 2. Calcular a nova data de expiração
        // Se o anúncio já estiver impulsionado, poderíamos somar à data atual ou à data de expiração futura.
        // Aqui, para simplificar, somamos à data atual (hoje + dias).
        const impulsionado_ate = new Date();
        impulsionado_ate.setDate(impulsionado_ate.getDate() + plan.duration_days);

        // 3. Atualizar o anúncio
        const { error: updateError } = await supabaseClient
            .from("anuncios")
            .update({
                impulsionado: true,
                plan_id: plan_id,
                impulsionado_ate: impulsionado_ate.toISOString(),
            })
            .eq("id", ad_id);

        if (updateError) throw updateError;

        return new Response(
            JSON.stringify({
                success: true,
                impulsionado_ate: impulsionado_ate.toISOString()
            }),
            {
                headers: { ...corsHeaders, "Content-Type": "application/json" },
                status: 200,
            }
        );

    } catch (error: any) {
        return new Response(
            JSON.stringify({ error: error.message }),
            {
                headers: { ...corsHeaders, "Content-Type": "application/json" },
                status: 400,
            }
        );
    }
});
