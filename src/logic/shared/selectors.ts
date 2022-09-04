import { AppState } from './appState';
import { createSelector } from '@reduxjs/toolkit';
import isEqual from 'lodash.isequal';
import { ToDo } from '../types';

const usernameInputSelector = createSelector([
  (state: AppState) => state.currentUsername,
  (state: AppState) => state.isFetchingToDos || state.isCreatingToDo,
], (currentUsername, isDisabled) => ({ currentUsername, isDisabled }),
{ memoizeOptions: { equalityCheck: isEqual } }
);

const toDoListSelector = createSelector([
  (state: AppState) => state.toDos.map(toDo => toDo.id),
  (state: AppState) => state.toDosFetchingError,
  (state: AppState) => state.isFetchingToDos,
], (toDoIds, error, isFetching) => ({ toDoIds, isFetching, error }), {
  memoizeOptions: { equalityCheck: isEqual },
});

const singleToDoSelector = createSelector([
  (state: AppState, id: number) => state.toDos.find(toDo => toDo.id === id) as ToDo,
  (state: AppState, id: number) => state.processingToDoIds.includes(id),
  (state: AppState, id: number) => state.toDoErrors.find(err => err.id === id)?.error ?? null,
], (toDo, isProcessing, error) => ({ toDo, isProcessing, error }), {
  memoizeOptions: { equalityCheck: isEqual },
});

const createToDoSelector = createSelector([
  (state: AppState) => state.isCreatingToDo || state.isFetchingToDos,
  (state: AppState) => state.createToDoError,
], (isDisabled, error) => ({ isDisabled, error }), {
  memoizeOptions: { equalityCheck: isEqual },
});

export {
  usernameInputSelector,
  toDoListSelector,
  singleToDoSelector,
  createToDoSelector,
};