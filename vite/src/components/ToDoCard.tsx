import { FC, useState } from "react";
import { IToDo } from "..";
import supabase from "../lib/supabaseClient";

interface ToDoCardProps {
  todo: IToDo;
}

const ToDoCard: FC<ToDoCardProps> = ({ todo }) => {
  const [isDone, setIsDone] = useState<boolean>(todo.isdone);

  const onClickIsDone = async () => {
    try {
      const { data } = await supabase.functions.invoke("is-done-to-do", {
        body: {
          toDoId: todo.id,
        },
      });

      setIsDone(data.isdone);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <li
      className={`cursor-pointer ${isDone && "line-through"}`}
      onClick={onClickIsDone}
    >
      {todo.content}
    </li>
  );
};

export default ToDoCard;
