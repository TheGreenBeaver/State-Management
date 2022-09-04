import { CreateToDoLogic, SingleToDoLogic, ToDoListLogic, UsernameInputLogic } from '../types';
import {
  changeCurrentUsername,
  changeToDoDone,
  createToDo,
  fetchToDos,
  removeToDo,
  useAppDispatch,
  useAppSelector,
} from './store';
import {
  usernameInputSelector,
  toDoListSelector,
  singleToDoSelector,
  createToDoSelector,
} from '../shared/selectors';

const useUsernameInput: UsernameInputLogic = () => {
  const data = useAppSelector(usernameInputSelector);
  const dispatch = useAppDispatch();
  return { ...data, setCurrentUsername: newUsername => dispatch(changeCurrentUsername(newUsername)) };
};

const useToDoList: ToDoListLogic = () => {
  const dispatch = useAppDispatch();
  const data = useAppSelector(toDoListSelector);
  return { ...data, retryFetching: () => dispatch(fetchToDos()) };
};

const useSingleToDo: SingleToDoLogic = id => {
  const data = useAppSelector(state => singleToDoSelector(state, id));
  const dispatch = useAppDispatch();
  return {
    ...data,
    changeDone: newDoneValue => dispatch(changeToDoDone({ id, newDoneValue })),
    remove: () => dispatch(removeToDo(id)),
  };
};

const useCreateToDo: CreateToDoLogic = () => {
  const data = useAppSelector(createToDoSelector);
  const dispatch = useAppDispatch();
  return { ...data, createToDo: text => dispatch(createToDo(text)) };
};

export { useUsernameInput, useToDoList, useSingleToDo, useCreateToDo };