import { createStore, createEvent, createEffect, guard, sample } from 'effector';
import { AppState, initialAppState } from '../shared/appState';
import { ToDo } from '../types';
import api from '../shared/api';

const $appStore = createStore<AppState>(initialAppState);
const $currentUsernameStore = $appStore.map(state => state.currentUsername);

const setCurrentUsername = createEvent<string>();

const fetchToDos = createEvent();

const createToDo = createEvent<string>();

const fetchToDosFx = createEffect<string, ToDo[], string>(api.fetchToDosForUsername);

const changeToDoDoneFx = createEffect<{ id: number, newDoneValue: boolean }, ToDo, string>(api.changeToDoDone);

const removeToDoFx = createEffect<number, unknown, string>(api.removeToDo);

const createToDoFx = createEffect<[string, string], ToDo, string>(args => api.createToDo(...args));

$appStore
  .on(setCurrentUsername, (state, newUsername) => ({ ...state, currentUsername: newUsername }))
  // fetchToDos
  .on(fetchToDosFx.pending, (state, pending) => ({
    ...state,
    isFetchingToDos: pending,
    toDosFetchingError: pending ? null : state.toDosFetchingError,
  }))
  .on(fetchToDosFx.doneData, (state, toDos) => ({ ...state, toDos }))
  .on(fetchToDosFx.failData, (state, error) => ({ ...state, toDosFetchingError: error }))
  // changeToDoDone
  .on(changeToDoDoneFx, (state, { id }) => ({
    ...state,
    processingToDoIds: [...state.processingToDoIds, id],
    toDoErrors: state.toDoErrors.filter(err => err.id !== id),
  }))
  .on(changeToDoDoneFx.doneData, (state, updatedToDo) => ({
    ...state,
    toDos: state.toDos.map(toDo => toDo.id === updatedToDo.id ? updatedToDo : toDo),
  }))
  .on(changeToDoDoneFx.fail, (state, { error, params: { id } }) => ({
    ...state,
    toDoErrors: [...state.toDoErrors, { id, error }],
  }))
  .on(changeToDoDoneFx.finally, (state, { params: { id } }) => ({
    ...state,
    processingToDoIds: state.processingToDoIds.filter(processedId => processedId !== id),
  }))
  // removeToDo
  .on(removeToDoFx, (state, id) => ({
    ...state,
    processingToDoIds: [...state.processingToDoIds, id],
    toDoErrors: state.toDoErrors.filter(err => err.id !== id),
  }))
  .on(removeToDoFx.done, (state, { params }) => ({ ...state, toDos: state.toDos.filter(toDo => toDo.id !== params) }))
  .on(removeToDoFx.fail, (state, { error, params }) => ({
    ...state,
    toDoErrors: [...state.toDoErrors, { id: params, error }],
  }))
  .on(removeToDoFx.finally, (state, { params }) => ({
    ...state,
    processingToDoIds: state.processingToDoIds.filter(id => id !== params),
  }))
  // createToDo
  .on(createToDo, state => ({ ...state, isCreatingToDo: true, createToDoError: null }))
  .on(createToDoFx.doneData, (state, newToDo) => ({ ...state, toDos: [...state.toDos, newToDo] }))
  .on(createToDoFx.failData, (state, error) => ({ ...state, createToDoError: error }))
  .on(createToDoFx.finally, state => ({ ...state, isCreatingToDo: false }));

guard({
  source: $currentUsernameStore,
  filter: currentUsername => !!currentUsername,
  target: fetchToDosFx,
});

guard({
  clock: fetchToDos,
  source: $currentUsernameStore,
  filter: currentUsername => !!currentUsername,
  target: fetchToDosFx,
});

sample({
  clock: createToDo,
  source: $currentUsernameStore,
  filter: (currentUsername, text) => !!currentUsername && !!text,
  fn: (currentUsername, text) => [text, currentUsername] as [string, string],
  target: createToDoFx,
});

export default $appStore;
export { setCurrentUsername, fetchToDos, changeToDoDoneFx, removeToDoFx, createToDo };