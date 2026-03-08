import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "@supabase/supabase-js";

// Token para validar que o webhook vem mesmo do Asaas (configurar no Asaas e no Supabase)
const ASAAS_WEBHOOK_TOKEN = Deno.env.get("ASAAS_WEBHOOK_TOKEN");

Deno.serve(async (req) => {
    try {
        const authHeader = req.headers.get("asaas-access-token");

        // Se configurarmos um token de webhook, validamos aqui
        if (ASAAS_WEBHOOK_TOKEN && authHeader !== ASAAS_WEBHOOK_TOKEN) {
            return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
        }

        const supabaseClient = createClient(
            Deno.env.get("SUPABASE_URL")!,
            Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
        );

        const body = await req.json();
        const { event, payment } = body;

        console.log(`Recebido evento: ${event} para pagamento: ${payment.id}`);

        // Verificar se o evento é de pagamento confirmado ou recebido
        if (event === "PAYMENT_CONFIRMED" || event === "PAYMENT_RECEIVED") {

            // 1. Buscar o registro do pagamento
            const { data: localPayment, error: paymentError } = await supabaseClient
                .from("payments")
                .select("*")
                .eq("external_id", payment.id)
                .single();

            if (paymentError || !localPayment) {
                console.error("Pagamento não encontrado localmente:", payment.id);
                return new Response("Payment not found", { status: 404 });
            }

            // Se já estiver confirmado, não fazemos nada
            if (localPayment.status === "CONFIRMED" || localPayment.status === "RECEIVED") {
                return new Response("OK", { status: 200 });
            }

            // 2. Buscar a duração do plano
            const { data: plan, error: planError } = await supabaseClient
                .from("boost_plans")
                .select("duration_days")
                .eq("id", localPayment.plan_id)
                .single();

            if (planError || !plan) {
                console.error("Plano não encontrado:", localPayment.plan_id);
                return new Response("Plan not found", { status: 404 });
            }

            // 3. Atualizar o status do pagamento
            await supabaseClient
                .from("payments")
                .update({ status: event.replace("PAYMENT_", ""), updated_at: new Date().toISOString() })
                .eq("id", localPayment.id);

            // 4. Ativar o impulsionamento (Lógica do boost-ad)
            const impulsionado_ate = new Date();
            impulsionado_ate.setDate(impulsionado_ate.getDate() + plan.duration_days);

            const { error: updateError } = await supabaseClient
                .from("anuncios")
                .update({
                    status: 'ativo',
                    impulsionado: true,
                    plan_id: localPayment.plan_id,
                    impulsionado_ate: impulsionado_ate.toISOString(),
                })
                .eq("id", localPayment.ad_id);

            if (updateError) {
                console.error("Erro ao atualizar anúncio:", updateError);
                return new Response("Error updating ad", { status: 500 });
            }

            console.log(`Anúncio ${localPayment.ad_id} impulsionado com sucesso até ${impulsionado_ate.toISOString()}`);
        }

        return new Response(JSON.stringify({ success: true }), {
            headers: { "Content-Type": "application/json" },
            status: 200,
        });

    } catch (error: any) {
        console.error("Erro no Webhook:", error.message);
        return new Response(JSON.stringify({ error: error.message }), {
            headers: { "Content-Type": "application/json" },
            status: 400,
        });
    }
});
