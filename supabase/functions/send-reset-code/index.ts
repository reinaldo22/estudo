import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "@supabase/supabase-js";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { to } = await req.json();

    if (!to) {
      return new Response(
        JSON.stringify({ erro: 'Email obrigatório' }),
        { status: 400, headers: corsHeaders }
      );
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    const code = Math.random().toString(36).substring(2, 8).toUpperCase();
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000).toISOString();

    const { error } = await supabase
      .from('profile')
      .update({
        reset_code: code,
        reset_code_expires_at: expiresAt
      })
      .eq('email', to);

    if (error) {
      console.error(error);
      return new Response(
        JSON.stringify({ erro: 'Erro ao salvar código' }),
        { status: 500, headers: corsHeaders }
      );
    }

    // 3. Enviar E-mail
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${RESEND_API_KEY}`,
      },


      body: JSON.stringify({
        from: "onboarding@resend.dev",
        to: to,
        subject: "Código de Verificação",
        html: `<strong>Seu código é: ${code}</strong>`
      })
    });

    return new Response(
      JSON.stringify({ sucesso: true }),
      { status: 200, headers: corsHeaders }
    );

  } catch (err) {
    console.error(err);
    return new Response(
      JSON.stringify({ erro: 'Erro inesperado' }),
      { status: 500, headers: corsHeaders }
    );
  }
});
