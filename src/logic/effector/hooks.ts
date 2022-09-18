import { CreateToDoLogic, SingleToDoLogic, ToDo, ToDoListLogic, UsernameInputLogic } from '../types';
import { AppState } from '../shared/appState';
import { useStoreMap, useEvent } from 'effector-react';
import $appStore, { fetchToDos, setCurrentUsername, changeToDoDoneFx, removeToDoFx, createToDo } from './store';
import isEqual from 'lodash.isequal';

function useEffector<Result, Keys extends unknown[] = []>(
  selector: (state: AppState, keys: Keys) => Result,
  keys: Keys = [] as unknown as Keys,
): Result {
  return useStoreMap({
    store: $appStore,
    keys,
    fn: selector,
    updateFilter: (update, current) => !isEqual(update, current),
  });
}

const useUsernameInput: UsernameInputLogic = () => {
  const data = useEffector(state => ({
    currentUsername: state.currentUsername,
    isDisabled: state.isFetchingToDos || state.isCreatingToDo,
  }));
  return { ...data, setCurrentUsername };
};

const useToDoList: ToDoListLogic = () => {
  const data = useEffector(state => ({
    toDoIds: state.toDos.map(toDo => toDo.id),
    isFetching: state.isFetchingToDos,
    error: state.toDosFetchingError,
  }));
  return { ...data, retryFetching: fetchToDos };
};

const useSingleToDo: SingleToDoLogic = id => {
  const data = useEffector<{ toDo: ToDo, error: string | null, isProcessing: boolean, }, [number]>
  ((state, [currentId]) => ({
    toDo: state.toDos.find(toDo => toDo.id === currentId) as ToDo,
    error: state.toDoErrors.find(err => err.id === currentId)?.error ?? null,
    isProcessing: state.processingToDoIds.includes(currentId),
  }), [id]);
  const changeToDoDone = useEvent(changeToDoDoneFx);
  const removeToDo = useEvent(removeToDoFx);
  return {
    ...data,
    changeDone: newDoneValue => changeToDoDone({ id, newDoneValue }),
    remove: () => removeToDo(id),
  };
};

const useCreateToDo: CreateToDoLogic = () => {
  const data = useEffector(state => ({
    error: state.createToDoError,
    isDisabled: state.isFetchingToDos || state.isCreatingToDo,
  }));
  return { ...data, createToDo };
};

export { useUsernameInput, useToDoList, useSingleToDo, useCreateToDo };