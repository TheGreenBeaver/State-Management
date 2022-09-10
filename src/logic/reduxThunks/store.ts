import {
  AnyAction,
  configureStore,
  createAction,
  createAsyncThunk,
  createReducer,
  ThunkAction,
} from '@reduxjs/toolkit';
import { ToDo } from '../types';
import api from '../shared/api';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';
import { AppState, initialAppState } from '../shared/appState';
import messages from '../shared/messages';

const setCurrentUsername = createAction<string>('setCurrentUsername');

const fetchToDos = createAsyncThunk<ToDo[], undefined, { state: AppState }>('fetchToDos', (_, { getState }) => {
  const { currentUsername } = getState();
  if (!currentUsername) {
    return Promise.reject(messages.noUsername);
  }
  return api.fetchToDosForUsername(currentUsername);
});

const changeCurrentUsername = (
  newUsername: string
): ThunkAction<void, AppState, undefined, AnyAction> => (dispatch, getState) => {
  const { currentUsername } = getState();
  if (currentUsername === newUsername) {
    return;
  }
  dispatch(setCurrentUsername(newUsername));
  dispatch(fetchToDos());
};

const changeToDoDone = createAsyncThunk<ToDo, { id: number, newDoneValue: boolean }>(
  'changeToDoDone', api.changeToDoDone
);

const removeToDo = createAsyncThunk<unknown, number>('removeToDo', api.removeToDo);

const createToDo = createAsyncThunk<ToDo, string, { state: AppState }>(
  'createToDo',
  (text, { getState }) => {
    if (!text) {
      return Promise.reject(messages.noText);
    }
    const { currentUsername } = getState();
    if (!currentUsername) {
      return Promise.reject(messages.noUsername);
    }
    return api.createToDo(text, currentUsername);
  }
);

const reducer = createReducer(initialAppState, builder => {
  builder
    .addCase(setCurrentUsername, (state, { payload }) => {
      state.currentUsername = payload;
    })
    // ToDos fetching
    .addCase(fetchToDos.pending, state => {
      state.toDosFetchingError = null;
      state.isFetchingToDos = true;
    })
    .addCase(fetchToDos.fulfilled, (state, action) => {
      state.isFetchingToDos = false;
      state.toDos = action.payload;
    })
    .addCase(fetchToDos.rejected, (state, action) => {
      state.isFetchingToDos = false;
      state.toDosFetchingError = action.error.message ?? null;
    })
    // ToDos "done" changing
    .addCase(changeToDoDone.pending, (state, action) => {
      const { id: changedId } = action.meta.arg;
      state.processingToDoIds.push(changedId);
      state.toDoErrors = state.toDoErrors.filter(error => error.id !== changedId);
    })
    .addCase(changeToDoDone.fulfilled, (state, action) => {
      const { id: changedId } = action.meta.arg;
      state.processingToDoIds = state.processingToDoIds.filter(id => id !== changedId);
      state.toDos = state.toDos.map(toDo => toDo.id === changedId ? action.payload : toDo);
    })
    .addCase(changeToDoDone.rejected, (state, action) => {
      const { id: changedId } = action.meta.arg;
      state.processingToDoIds = state.processingToDoIds.filter(id => id !== changedId);
      state.toDoErrors.push({ id: changedId, error: action.error.message as string });
    })
    // ToDos removal
    .addCase(removeToDo.pending, (state, action) => {
      const removedId = action.meta.arg;
      state.processingToDoIds.push(removedId);
      state.toDoErrors = state.toDoErrors.filter(error => error.id !== removedId);
    })
    .addCase(removeToDo.fulfilled, (state, action) => {
      const removedId = action.meta.arg;
      state.processingToDoIds = state.processingToDoIds.filter(id => id !== removedId);
      state.toDos = state.toDos.filter(toDo => toDo.id !== removedId);
    })
    .addCase(removeToDo.rejected, (state, action) => {
      const removedId = action.meta.arg;
      state.processingToDoIds = state.processingToDoIds.filter(id => id !== removedId);
      state.toDoErrors.push({ id: removedId, error: action.error.message as string });
    })
    // ToDos creation
    .addCase(createToDo.pending, state => {
      state.isCreatingToDo = true;
      state.createToDoError = null;
    })
    .addCase(createToDo.fulfilled, (state, action) => {
      state.isCreatingToDo = false;
      state.toDos.push(action.payload);
    })
    .addCase(createToDo.rejected, (state, action) => {
      state.isCreatingToDo = false;
      state.createToDoError = action.error.message ?? null;
    });
});

const store = configureStore({ reducer });
const useAppDispatch = () => useDispatch<typeof store.dispatch>();
function useAppSelector<T>(selector: (state: AppState) => T): T {
  return useSelector(selector, shallowEqual);
}

export default store;
export { changeCurrentUsername, useAppDispatch, useAppSelector, changeToDoDone, removeToDo, createToDo, fetchToDos };