import { CreateToDoLogic, SingleToDoLogic, ToDo, ToDoListLogic, UsernameInputLogic } from '../types';
import {
  changeCurrentUsername,
  toDoApiEndpoints,
  useAppDispatch,
  useAppSelector, useChangeToDoDoneMutation, useCreateToDoMutation,
  useLazyFetchToDosQuery, useRemoveToDoMutation,
} from './store';
import { createSelector } from '@reduxjs/toolkit';
import isEqual from 'lodash.isequal';
import { useMemo } from 'react';

const creationCacheKey = 'create-to-do-mutation';

const useUsernameInput: UsernameInputLogic = () => {
  const currentUsername = useAppSelector(state => state.currentUsername);
  const { isFetchingToDos } = toDoApiEndpoints.fetchToDos.useQueryState(undefined, {
    selectFromResult: state => ({ isFetchingToDos: state.isFetching }),
  });
  const [, { isLoading: isCreatingToDo }] = useCreateToDoMutation({ fixedCacheKey: creationCacheKey });
  const dispatch = useAppDispatch();
  return {
    currentUsername,
    setCurrentUsername: newUsername => dispatch(changeCurrentUsername(newUsername)),
    isDisabled: isFetchingToDos || isCreatingToDo,
  };
};

type ApiState = ReturnType<typeof toDoApiEndpoints.fetchToDos.useQueryState>;
const selectToDoList = createSelector(
  [
    (state: ApiState) => state.data ? (state.data as ToDo[]).map(toDo => toDo.id) : [],
    (state: ApiState) => state.isFetching,
    (state: ApiState) => state.error,
  ],
  (toDoIds, isFetching, error) => ({ toDoIds, isFetching, error }),
  { memoizeOptions: { equalityCheck: isEqual } }
);

const useToDoList: ToDoListLogic = () => {
  const data = toDoApiEndpoints.fetchToDos.useQueryState(undefined, { selectFromResult: selectToDoList });
  const [retryFetching] = useLazyFetchToDosQuery();
  return { ...data, retryFetching };
};

const useSingleToDo: SingleToDoLogic = id => {
  const selectFromResult = useMemo(() => createSelector(
    (state: ApiState) => state.data as ToDo[],
    toDos => ({ staleToDo: toDos.find(toDo => toDo.id === id) as ToDo }),
    { memoizeOptions: { resultEqualityCheck: isEqual, equalityCheck: isEqual } }
  ), [id]);
  const { staleToDo } = toDoApiEndpoints.fetchToDos.useQueryState(undefined, { selectFromResult });
  const [changeToDoDone, {
    error: doneChangeError,
    isLoading: isChangingDone,
    data: updatedToDo,
  }] = useChangeToDoDoneMutation();
  const [removeToDo, { error: removalError, isLoading: isRemoving }] = useRemoveToDoMutation();
  return {
    toDo: updatedToDo || staleToDo,
    changeDone: newDoneValue => changeToDoDone({ id, newDoneValue }),
    remove: () => removeToDo(id),
    error: (removalError || doneChangeError)?.toString() || null,
    isProcessing: isChangingDone || isRemoving,
  };
};

const useCreateToDo: CreateToDoLogic = () => {
  const { isFetchingToDos } = toDoApiEndpoints.fetchToDos.useQueryState(undefined, {
    selectFromResult: state => ({ isFetchingToDos: state.isFetching }),
  });
  const [createToDo, { isLoading, error }] = useCreateToDoMutation({ fixedCacheKey: creationCacheKey });
  return {
    createToDo,
    isDisabled: isLoading || isFetchingToDos,
    error: error?.toString() || null,
  };
};

export { useUsernameInput, useToDoList, useSingleToDo, useCreateToDo };