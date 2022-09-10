import { ActionCreatorWithPayload, configureStore, createAction, createReducer } from '@reduxjs/toolkit';
import createSagaMiddleware from 'redux-saga';
import { all, call, put, select, takeEvery, takeLeading } from 'redux-saga/effects';
import { ToDo } from '../types';
import api from '../shared/api';
import { useDispatch, useSelector, shallowEqual } from 'react-redux';
import { AppState, initialAppState } from '../shared/appState';
import messages from '../shared/messages';

type Meta<OwnType, MetaType> = { data: OwnType, meta: MetaType };
type ActionCreatorWithMeta<OwnType, MetaType> = ActionCreatorWithPayload<Meta<OwnType, MetaType>>;
type AsyncSaga<Returned, SagaArg> = ActionCreatorWithPayload<SagaArg> & {
  pending: ActionCreatorWithPayload<SagaArg>,
  fulfilled: ActionCreatorWithMeta<Returned, SagaArg>,
  rejected: ActionCreatorWithMeta<string, SagaArg>
};

const allWatcherSagas: Generator[] = [];

function createAsyncSaga<Returned, SagaArg>(
  typePrefix: string, performWork: (arg: SagaArg) => (Promise<Returned> | Generator)
): AsyncSaga<Returned, SagaArg> {
  const mainActionCreator = createAction<SagaArg>(`${typePrefix}/pending`);
  const fulfilled = createAction<Meta<Returned, SagaArg>>(`${typePrefix}/fulfilled`);
  const rejected = createAction<Meta<string, SagaArg>>(`${typePrefix}/rejected`);

  function* worker({ payload }: ReturnType<typeof mainActionCreator>) {
    try {
      const result: Returned = yield call(performWork, payload);
      yield put(fulfilled({ data: result, meta: payload }));
    } catch (e) {
      yield put(rejected({ data: e as string, meta: payload }));
    }
  }

  function* watcher() {
    yield takeLeading(mainActionCreator.type, worker);
  }

  allWatcherSagas.push(watcher());

  return Object.assign(mainActionCreator as AsyncSaga<Returned, SagaArg>, {
    pending: mainActionCreator,
    fulfilled,
    rejected,
  });
}

const setCurrentUsername = createAction<string>('setCurrentUsername');
const changeCurrentUsername = createAction<string>('changeCurrentUsername');

const fetchToDos = createAsyncSaga<ToDo[], void>(
  'fetchToDos',
  function* () {
    const currentUsername: string = yield select(state => state.currentUsername);
    if (!currentUsername) {
      return yield call(() => Promise.reject(messages.noUsername));
    }
    return yield call(api.fetchToDosForUsername, currentUsername);
  }
);

function* changeCurrentUsernameWorker({ payload }: ReturnType<typeof setCurrentUsername>) {
  const currentUsername: string = yield select(state => state.currentUsername);
  if (currentUsername === payload) {
    return;
  }
  yield put(setCurrentUsername(payload));
  yield put(fetchToDos());
}

function* changeCurrentUsernameWatcher() {
  yield takeEvery(changeCurrentUsername.type, changeCurrentUsernameWorker);
}
allWatcherSagas.push(changeCurrentUsernameWatcher());

const changeToDoDone = createAsyncSaga<ToDo, { id: number, newDoneValue: boolean }>(
  'changeToDoDone', api.changeToDoDone
);

const removeToDo = createAsyncSaga<unknown, number>('removeToDo', api.removeToDo);

const createToDo = createAsyncSaga<ToDo, string>(
  'createToDo',
  function* (text) {
    if (!text) {
      return yield call(() => Promise.reject(messages.noText));
    }
    const currentUsername: string = yield select(state => state.currentUsername);
    if (!currentUsername) {
      return yield call(() => Promise.reject(messages.noUsername));
    }
    return yield call(api.createToDo, text, currentUsername);
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
      state.toDos = action.payload.data;
    })
    .addCase(fetchToDos.rejected, (state, action) => {
      state.isFetchingToDos = false;
      state.toDosFetchingError = action.payload.data ?? null;
    })
    // ToDos "done" changing
    .addCase(changeToDoDone.pending, (state, action) => {
      const { id: changedId } = action.payload;
      state.processingToDoIds.push(changedId);
      state.toDoErrors = state.toDoErrors.filter(error => error.id !== changedId);
    })
    .addCase(changeToDoDone.fulfilled, (state, action) => {
      const { id: changedId } = action.payload.meta;
      state.processingToDoIds = state.processingToDoIds.filter(id => id !== changedId);
      state.toDos = state.toDos.map(toDo => toDo.id === changedId ? action.payload.data : toDo);
    })
    .addCase(changeToDoDone.rejected, (state, action) => {
      const { id: changedId } = action.payload.meta;
      state.processingToDoIds = state.processingToDoIds.filter(id => id !== changedId);
      state.toDoErrors.push({ id: changedId, error: action.payload.data });
    })
    // ToDos removal
    .addCase(removeToDo.pending, (state, action) => {
      const removedId = action.payload;
      state.processingToDoIds.push(removedId);
      state.toDoErrors = state.toDoErrors.filter(error => error.id !== removedId);
    })
    .addCase(removeToDo.fulfilled, (state, action) => {
      const removedId = action.payload.meta;
      state.processingToDoIds = state.processingToDoIds.filter(id => id !== removedId);
      state.toDos = state.toDos.filter(toDo => toDo.id !== removedId);
    })
    .addCase(removeToDo.rejected, (state, action) => {
      const removedId = action.payload.meta;
      state.processingToDoIds = state.processingToDoIds.filter(id => id !== removedId);
      state.toDoErrors.push({ id: removedId, error: action.payload.data });
    })
    // ToDos creation
    .addCase(createToDo.pending, state => {
      state.isCreatingToDo = true;
      state.createToDoError = null;
    })
    .addCase(createToDo.fulfilled, (state, action) => {
      state.isCreatingToDo = false;
      state.toDos.push(action.payload.data);
    })
    .addCase(createToDo.rejected, (state, action) => {
      state.isCreatingToDo = false;
      state.createToDoError = action.payload.data;
    });
});

function* rootSaga() {
  yield all(allWatcherSagas);
}
const sagaMiddleware = createSagaMiddleware();
const store = configureStore({
  reducer,
  middleware: getDefaultMiddleware => getDefaultMiddleware({ thunk: false }).concat(sagaMiddleware),
});
sagaMiddleware.run(rootSaga);

const useAppDispatch = () => useDispatch<typeof store.dispatch>();
function useAppSelector<T>(selector: (state: AppState) => T): T {
  return useSelector(selector, shallowEqual);
}

export default store;
export { changeCurrentUsername, useAppDispatch, useAppSelector, changeToDoDone, removeToDo, createToDo, fetchToDos };