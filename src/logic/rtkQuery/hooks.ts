import { CreateToDoLogic, SingleToDoLogic, ToDo, ToDoListLogic, UsernameInputLogic } from '../types';
import {
  changeCurrentUsername,
  toDoApiEndpoints,
  useAppDispatch,
  useAppSelector, useChangeToDoDoneMutation, useCreateToDoMutation,
  useLazyFetchToDosQuery, useRemoveToDoMutation,
} from './store';

const useUsernameInput: UsernameInputLogic = () => {
  const currentUsername = useAppSelector(state => state.currentUsername);
  const { isFetchingToDos } = toDoApiEndpoints.fetchToDos.useQueryState(undefined, {
    selectFromResult: state => ({ isFetchingToDos: state.isFetching }),
  });
  const dispatch = useAppDispatch();
  return {
    currentUsername,
    setCurrentUsername: newUsername => dispatch(changeCurrentUsername(newUsername)),
    isDisabled: isFetchingToDos,
  };
};

const useToDoList: ToDoListLogic = () => {
  const [retryFetching, data] = useLazyFetchToDosQuery({
    selectFromResult: state => ({
      toDoIds: state.data?.map(toDo => toDo.id) || [],
      isFetching: state.isFetching,
      error: state.error?.toString() || null,
    }),
  });
  return { ...data, retryFetching };
};

const useSingleToDo: SingleToDoLogic = id => {
  const data = toDoApiEndpoints.fetchToDos.useQueryState(undefined, {
    selectFromResult: state => ({
      toDo: (state.data as ToDo[]).find(toDo => toDo.id === id) as ToDo,
    }),
  });
  const [changeToDoDone, { error: doneChangeError, isLoading: isChangingDone }] = useChangeToDoDoneMutation();
  const [removeToDo, { error: removalError, isLoading: isRemoving }] = useRemoveToDoMutation();
  return {
    ...data,
    changeDone: newDoneValue => changeToDoDone({ id, newDoneValue }),
    remove: () => removeToDo(id),
    error: (removalError || doneChangeError)?.toString() || null,
    isProcessing: isChangingDone || isRemoving,
  };
};

const useCreateToDo: CreateToDoLogic = () => {
  const [createToDo, { isLoading, error }] = useCreateToDoMutation();
  return { createToDo: text => createToDo(text), isDisabled: isLoading, error: error?.toString() || null };
};

export { useUsernameInput, useToDoList, useSingleToDo, useCreateToDo };