import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "@supabase/supabase-js";



const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { email, code, newPassword } = await req.json();

    // 1️⃣ Validações básicas
    if (!email || !code || !newPassword) {
      return new Response(
        JSON.stringify({ erro: "Dados obrigatórios ausentes" }),
        { status: 400, headers: corsHeaders }
      );
    }

    if (newPassword.length < 6) {
      return new Response(
        JSON.stringify({ erro: "Senha muito curta" }),
        { status: 400, headers: corsHeaders }
      );
    }

    // 2️⃣ Cliente admin
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // 3️⃣ Buscar código salvo
    const { data, error } = await supabaseAdmin
      .from("profile")
      .select("reset_code, reset_code_expires_at")
      .eq("email", email)
      .single();

    if (error || !data) {
      return new Response(
        JSON.stringify({ erro: "Código inválido" }),
        { status: 400, headers: corsHeaders }
      );
    }

    // 4️⃣ Validar código
    if (data.reset_code !== code) {
      return new Response(
        JSON.stringify({ erro: "Código inválido" }),
        { status: 400, headers: corsHeaders }
      );
    }

    // 5️⃣ Validar expiração
    if (
      !data.reset_code_expires_at ||
      new Date(data.reset_code_expires_at) < new Date()
    ) {
      return new Response(
        JSON.stringify({ erro: "Código expirado" }),
        { status: 400, headers: corsHeaders }
      );
    }

    // 6️⃣ Buscar usuário pelo email (API NÃO TEM update por email)
    const { data: users, error: listError } =
      await supabaseAdmin.auth.admin.listUsers();

    if (listError) {
      return new Response(
        JSON.stringify({ erro: "Erro ao buscar usuário" }),
        { status: 500, headers: corsHeaders }
      );
    }

    const user = users.users.find((u) => u.email === email);

    if (!user) {
      return new Response(
        JSON.stringify({ erro: "Usuário não encontrado" }),
        { status: 404, headers: corsHeaders }
      );
    }

    // 7️⃣ Atualizar senha (ÚNICO jeito válido)
    const { error: updateError } =
      await supabaseAdmin.auth.admin.updateUserById(user.id, {
        password: newPassword,
      });

    if (updateError) {
      return new Response(
        JSON.stringify({ erro: updateError.message }),
        { status: 400, headers: corsHeaders }
      );
    }

    // 8️⃣ Invalidar código
    await supabaseAdmin
      .from("profile")
      .update({
        reset_code: null,
        reset_code_expires_at: null,
      })
      .eq("email", email);

    return new Response(
      JSON.stringify({ sucesso: true }),
      { headers: corsHeaders }
    );
  } catch (err) {
    console.error(err);
    return new Response(
      JSON.stringify({ erro: "Erro interno" }),
      { status: 500, headers: corsHeaders }
    );
  }
});
