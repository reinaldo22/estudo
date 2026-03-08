import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "@supabase/supabase-js";

const ASAAS_API_URL = "https://sandbox.asaas.com/api/v3";
// O token deve ser configurado como secret no Supabase: supabase secrets set ASAAS_API_KEY=...
const ASAAS_API_KEY = Deno.env.get("ASAAS_API_KEY");

const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
    if (req.method === "OPTIONS") {
        return new Response("ok", { headers: corsHeaders });
    }

    try {
        if (!ASAAS_API_KEY) {
            throw new Error("ASAAS_API_KEY não configurada");
        }

        const supabaseClient = createClient(
            Deno.env.get("SUPABASE_URL")!,
            Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
        );

        const { ad_id, plan_id } = await req.json();

        if (!ad_id || !plan_id) {
            throw new Error("ad_id e plan_id são obrigatórios");
        }

        // 1. Buscar o anúncio e o perfil do usuário
        const { data: ad, error: adError } = await supabaseClient
            .from("anuncios")
            .select("*, profile:user_id(full_name, email, cpf, phone)")
            .eq("id", ad_id)
            .single();

        if (adError || !ad) throw new Error("Anúncio não encontrado");

        // 2. Buscar detalhes do plano
        const { data: plan, error: planError } = await supabaseClient
            .from("boost_plans")
            .select("*")
            .eq("id", plan_id)
            .single();

        if (planError || !plan) throw new Error("Plano não encontrado");

        const userProfile = ad.profile;

        // 3. Verificar se já existe um pagamento PENDENTE para este anúncio e plano
        console.log(`[asaas-checkout] Verificando pagamentos pendentes para ad_id: ${ad_id}, plan_id: ${plan_id}`);
        const { data: existingPayment } = await supabaseClient
            .from("payments")
            .select("*")
            .eq("ad_id", ad_id)
            .eq("plan_id", plan_id)
            .eq("status", "PENDING")
            .maybeSingle();

        let paymentId: string;
        let paymentData: any = null;

        if (existingPayment) {
            paymentId = existingPayment.external_id;
            paymentData = existingPayment.payload;
            console.log(`[asaas-checkout] Pagamento pendente encontrado: ${paymentId}. Reutilizando...`);
        } else {
            // 4. Criar ou buscar cliente no Asaas
            let customerId;
            console.log(`[asaas-checkout] Buscando cliente com email: ${userProfile.email}`);

            const customerSearchRes = await fetch(`${ASAAS_API_URL}/customers?email=${userProfile.email}`, {
                headers: {
                    "access_token": ASAAS_API_KEY,
                    "Content-Type": "application/json"
                }
            });

            if (!customerSearchRes.ok) {
                const errorText = await customerSearchRes.text();
                console.error(`[asaas-checkout] Erro ao buscar cliente (${customerSearchRes.status}): ${errorText}`);
                throw new Error(`Erro ao buscar cliente no Asaas: ${customerSearchRes.status}`);
            }

            const customerSearchData = await customerSearchRes.json();

            if (customerSearchData.data && customerSearchData.data.length > 0) {
                customerId = customerSearchData.data[0].id;
                console.log(`[asaas-checkout] Cliente encontrado: ${customerId}`);
            } else {
                console.log("[asaas-checkout] Criando novo cliente no Asaas...");
                const customerCreateRes = await fetch(`${ASAAS_API_URL}/customers`, {
                    method: "POST",
                    headers: {
                        "access_token": ASAAS_API_KEY,
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        name: userProfile.full_name || "Cliente Recicla",
                        email: userProfile.email,
                        cpfCnpj: userProfile.cpf?.replace(/\D/g, "") || "00000000000",
                        phone: userProfile.phone || ""
                    })
                });

                if (!customerCreateRes.ok) {
                    const errorText = await customerCreateRes.text();
                    console.error(`[asaas-checkout] Erro ao criar cliente (${customerCreateRes.status}): ${errorText}`);
                    throw new Error(`Erro ao criar cliente no Asaas: ${customerCreateRes.status}`);
                }

                const customerCreateData = await customerCreateRes.json();
                customerId = customerCreateData.id;
                console.log(`[asaas-checkout] Novo cliente criado: ${customerId}`);
            }

            // 5. Criar a cobrança PIX
            console.log(`[asaas-checkout] Criando cobrança para ${customerId} no valor de ${plan.price}`);
            const paymentRes = await fetch(`${ASAAS_API_URL}/payments`, {
                method: "POST",
                headers: {
                    "access_token": ASAAS_API_KEY,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    customer: customerId,
                    billingType: "PIX",
                    value: plan.price,
                    dueDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                    description: `Impulsionamento do anúncio: ${ad.titulo}`,
                    externalReference: ad.id
                })
            });

            if (!paymentRes.ok) {
                const errorText = await paymentRes.text();
                console.error(`[asaas-checkout] Erro ao criar cobrança (${paymentRes.status}): ${errorText}`);
                throw new Error(`Erro ao criar cobrança no Asaas: ${paymentRes.status}`);
            }

            paymentData = await paymentRes.json();
            paymentId = paymentData.id;
            console.log(`[asaas-checkout] Cobrança criada com sucesso. ID: ${paymentId}`);
        }

        // 6. Obter QR Code e Código PIX
        console.log(`[asaas-checkout] Obtendo QR Code para o pagamento: ${paymentId}`);
        const pixRes = await fetch(`${ASAAS_API_URL}/payments/${paymentId}/pixQrCode`, {
            headers: {
                "access_token": ASAAS_API_KEY,
                "Content-Type": "application/json"
            }
        });

        if (!pixRes.ok) {
            const errorText = await pixRes.text();
            console.error(`[asaas-checkout] Erro ao obter QR Code (${pixRes.status}): ${errorText}`);
            throw new Error(`Erro ao obter QR Code do Asaas: ${pixRes.status}`);
        }

        const pixData = await pixRes.json();

        // 7. Salvar ou atualizar registro local de pagamento
        if (!existingPayment) {
            console.log(`[asaas-checkout] Salvando registro de pagamento no banco de dados local...`);
            const { error: insertError } = await supabaseClient
                .from("payments")
                .insert({
                    external_id: paymentId,
                    ad_id: ad_id,
                    plan_id: plan_id,
                    status: "PENDING",
                    amount: plan.price,
                    pix_code: pixData.payload,
                    payload: paymentData
                });

            if (insertError) {
                console.error("[asaas-checkout] Erro ao salvar registro local de pagamento:", insertError);
            }
        }


        console.log(`[asaas-checkout] Finalizado com sucesso para ad_id: ${ad_id}`);
        return new Response(
            JSON.stringify({
                success: true,
                paymentId: paymentId,
                pixCode: pixData.payload,
                encodedImage: pixData.encodedImage,
                expirationDate: pixData.expirationDate
            }),
            {
                headers: { ...corsHeaders, "Content-Type": "application/json" },
                status: 200,
            }
        );

    } catch (error: any) {
        console.error("[asaas-checkout] Erro capturado no catch final:", error.message);
        return new Response(
            JSON.stringify({
                error: error.message,
                details: error.stack
            }),
            {
                headers: { ...corsHeaders, "Content-Type": "application/json" },
                status: 400,
            }
        );
    }
});
