import { createClient } from "@supabase/supabase-js";

// Client는 Prisma와 같은 역할을 함. Vite에서 환경변수는 process.env.VITE가 아닌 import.meta.env.VITE를 사용한다.
const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_KEY,
);

export default supabase;
