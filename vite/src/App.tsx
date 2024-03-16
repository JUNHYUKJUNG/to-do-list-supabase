import { Auth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import { Session, createClient } from "@supabase/supabase-js";
import { FC, useEffect, useState } from "react";

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_KEY
);

const App: FC = () => {
  const [session, setSession] = useState<Session | null>(null);

  // getSession() 실행 후 then()으로 넘어옴.
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe(); // 메모리가 쌓이는 걸 방지함.
  }, []);
  // React 앱이 실행되면 Session을 검사해줌.

  useEffect(() => console.log(session), [session]); // React 내에서 console.log를 찍는다면 useEffect 내에서 찍을 것

  // 웹에서 보이는 부분은 return 안에 있고, 이 return을 if문으로 대체할 수 있음.
  if (!session) {
    return <Auth supabaseClient={supabase} appearance={{ theme: ThemeSupa }} />;
  } else {
    return <div className="bg-red-100">세션 있음</div>;
  }
};

export default App;
