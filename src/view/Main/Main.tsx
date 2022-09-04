import { FC, PropsWithChildren } from 'react';
import { ComponentTransformer, LogicDefiner } from 'logic';
import usernameInputFactory from '../UsernameInput';
import toDoListFactory from '../ToDoList';
import createToDoFactory from '../CreateToDo';
import styles from './Main.module.scss';

function mainFactory(
  logicDefiner: LogicDefiner,
  StoreProvider?: FC<PropsWithChildren>,
  componentTransformer?: ComponentTransformer
): FC {
  const Wrapper = StoreProvider ?? (({ children }) => <>{children}</>);
  const transformer = componentTransformer ?? (cmp => cmp);

  const UsernameInput = usernameInputFactory(logicDefiner.useUsernameInput, transformer);
  const CreateToDo = createToDoFactory(logicDefiner.useCreateToDo, transformer);
  const ToDoList = toDoListFactory(logicDefiner.useToDoList, logicDefiner.useSingleToDo, transformer);

  return () => (
    <Wrapper>
      <main className={styles.appMain}>
        <UsernameInput />
        <ToDoList />
        <CreateToDo />
      </main>
    </Wrapper>
  );
}

export default mainFactory;