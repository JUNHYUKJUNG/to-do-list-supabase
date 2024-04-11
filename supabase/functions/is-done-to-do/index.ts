import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.8";
import { corsHeaders } from "../_shared/cors.ts";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  const authHeader = req.headers.get("Authorization")!;
  const { toDoId } = await req.json();

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_ANON_KEY") ?? "",
    { global: { headers: { Authorization: authHeader } } },
  );

  const { data: { user } } = await supabase.auth.getUser();

  // 유저 id === todo.userId
  // 현재 수정할 투두 찾기
  // isdone 업데이트

  // isdone false -> true
  // isdone true -> flase
  // 업데이트된 투두 응답

  const { data: existToDoData } = await supabase.from("to_do_list").select().eq(
    "id",
    toDoId,
  ).limit(1).single();

  if (!existToDoData) {
    return new Response(
      JSON.stringify({
        message: "존재하지 않는 할 일입니다.",
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 404, // Not Found
      },
    );
  }

  if (user!.id !== existToDoData.user_id) {
    return new Response(
      JSON.stringify({
        message: "잘못된 사용자입니다.",
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400, // Bad Request
      },
    );
  }

  await supabase.from("to_do_list").update({
    isdone: !existToDoData.isdone,
  }).eq("id", toDoId);

  const { data: updatedToDoData } = await supabase.from("to_do_list").select()
    .eq("id", toDoId).limit(1).single();

  return new Response(JSON.stringify(updatedToDoData), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
});
