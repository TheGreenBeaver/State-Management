import { CreateToDoLogic, SingleToDoLogic, ToDo, ToDoListLogic, UsernameInputLogic } from '../types';
import {
  changeCurrentUsername,
  toDoApiEndpoints,
  useAppDispatch,
  useAppSelector, useChangeToDoDoneMutation, useCreateToDoMutation,
  useLazyFetchToDosQuery, useRemoveToDoMutation,
} from './store';
import { createSelector, SerializedError } from '@reduxjs/toolkit';
import isEqual from 'lodash.isequal';
import { FetchBaseQueryError } from '@reduxjs/toolkit/dist/query/fetchBaseQuery';

const creationCacheKey = 'create-to-do-mutation';

type ApiError = FetchBaseQueryError & { data: { message: string } };
type FetchError = FetchBaseQueryError & { error: string };

function isObject(val: unknown): val is Record<string, unknown> {
  return typeof val === 'object' && val != null;
}

function isApiError(e: unknown): e is ApiError {
  return isObject(e) && typeof e.status === 'number';
}

function isFetchError(e: unknown): e is FetchError {
  return isObject(e) && typeof e.status === 'string';
}

function getErrorMessage(e: unknown): string | null {
  if (!e) {
    return null;
  }
  if (isApiError(e)) {
    return e.data.message;
  }
  if (isFetchError(e)) {
    return e.error;
  }
  return (e as SerializedError).message || 'Unknown error';
}

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
    (state: ApiState) => getErrorMessage(state.error),
  ],
  (toDoIds, isFetching, error) => ({ toDoIds, isFetching, error }),
  { memoizeOptions: { equalityCheck: isEqual } },
);

const useToDoList: ToDoListLogic = () => {
  const data = toDoApiEndpoints.fetchToDos.useQueryState(undefined, { selectFromResult: selectToDoList });
  const [retryFetching] = useLazyFetchToDosQuery();
  return { ...data, retryFetching: () => retryFetching() };
};

const useSingleToDo: SingleToDoLogic = id => {
  const { staleToDo } = toDoApiEndpoints.fetchToDos.useQueryState(undefined, {
    selectFromResult: state => ({
      staleToDo: (state.data as ToDo[]).find(toDo => toDo.id === id) as ToDo,
    }),
  });
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
    error: getErrorMessage(doneChangeError || removalError),
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
    error: getErrorMessage(error),
  };
};

export { useUsernameInput, useToDoList, useSingleToDo, useCreateToDo };