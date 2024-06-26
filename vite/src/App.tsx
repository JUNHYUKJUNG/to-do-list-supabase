import { Auth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import { Session } from "@supabase/supabase-js";
import { FC, useEffect, useState } from "react";
import CreateToDo from "./components/CreateToDo";
import supabase from "./lib/supabaseClient";
import { IToDo } from ".";
import ToDoCard from "./components/ToDoCard";

const App: FC = () => {
  // token 정보를 담고 있는 session을 useState로 생성
  const [session, setSession] = useState<Session | null>(null);
  const [toDos, setToDos] = useState<IToDo[]>([]);

  // App component가 불러와질 때, 기본적으로 한 번 실행됨. Dependency가 만족되면 한 번 더 실행됨. 비워두면 App component 불러올 때만 실행됨.
  // getSession() 실행 후 then()으로 넘어옴.
  // React App이 실행되면 Session을 검사해줌.
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
    });

    supabase.functions.invoke("get-all-to-do").then(({ data }) => {
      setToDos(data);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe(); // 메모리가 쌓이는 걸 방지함.
  }, []);

  // React 내에서 console.log를 찍는다면 useEffect 내에서 찍을 것
  useEffect(() => console.log(session), [session]);

  // 웹에서 보이는 부분은 return 안에 있고, 이 return을 if문으로 대체할 수 있음.
  // Session이 없는 상태 (미로그인) 상태에선 상단 return이 보이고, Session이 있는 상태 (로그인) 상태에선 하단 return이 보인다.
  if (!session) {
    return <Auth supabaseClient={supabase} appearance={{ theme: ThemeSupa }} />;
  } else {
    return (
      <div>
        <div>
          Hello, {session.user.email}
          <button onClick={() => supabase.auth.signOut()}>Sign Out</button>
        </div>
        <CreateToDo />
        <ul>
          {toDos?.map((v) => (
            <ToDoCard key={v.id} todo={v} />
          ))}
        </ul>
      </div>
    );
  }
};

export default App;
