// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.8";
import { corsHeaders } from "../_shared/cors.ts";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  // JWT Token 상태
  // 사용자가 보낸 Header로부터 Authorization을 꺼내옴.
  const authHeader = req.headers.get("Authorization")!; // 값이 null일 수도 있다는 타입에러를 해결하기 위해 값이 확실히 존재한다는 걸 적어주기 위해 뒤에 !를 붙힌다.

  // Content 생성
  const { content } = await req.json();

  // Content 응답
  // from에는 DB table 이름 (to-do-list)이 들어감.
  // await supabase.from("to_do_list").insert({
  //   content,
  //   user_id: user?.id, // user의 타입이 null일 수도 있다는 타입 오류가 뜨기 때문에 ?로 처리함. user가 존재하면 id라는 뜻
  // });

  // authHeader안의 내용을 확인
  // console.log(authHeader);

  // SUPABASE_URL와 SUPABASE_ANON_KEY가 없는 경우 타입스크립트에서 타입 에러 방지를 위해 ?? "" 작성
  // Deno의 .env는 Node.js와의 형식이 다르다.
  // Vite는 로컬에서 실행되기 때문에 따로 .env를 작성해 줬던 반면에 SUPABASE는 서버에서 실행되기 때문에 아래처럼 작성하여 SUPABASE 웹페이지에서 가져오면 된다.
  const supabase = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_ANON_KEY") ?? "",
    { global: { headers: { Authorization: authHeader } } }, // 값이 null일 수도 있다는 타입 에러가 뜨기 때문에 authHeader 뒤에 또는 상단 Authorization에 !를 붙혀 확실히 값이 존재한다는 걸 적어준다.
  );

  // UUID, E-MAIL
  // 비동기 함수를 사용하여 auth 데이터베이스 조회를 해 준다.
  // data에 많은 정보가 담겨있기 때문에 따로 const user를 만들어 준다.
  // getUser()롤 통해 이메일 등의 유저 정보들을 가져온다.
  const { data: { user } } = await supabase.auth.getUser();

  await supabase.from("to_do_list").insert({
    content,
    user_id: user?.id,
  });

  // ("*")은 전부 가져온다는 뜻
  const { data } = await supabase.from("to_do_list").select().eq(
    "user_id",
    user?.id,
  ).order("id", { ascending: false }).limit(1).single();

  // 테스트지만 return은 존재해야함. 응답에 headers를 넣고 headers 안에 응답하는 데이터 형태를 넣어준다.
  return new Response(JSON.stringify(data), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
});

/* To invoke locally:

  1. Run `supabase start` (see: https://supabase.com/docs/reference/cli/supabase-start)
  2. Make an HTTP request:

  curl -i --location --request POST 'http://127.0.0.1:54321/functions/v1/create-to-do' \
    --header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0' \
    --header 'Content-Type: application/json' \
    --data '{"name":"Functions"}'

*/
