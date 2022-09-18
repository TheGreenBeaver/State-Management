import { AnyAction, configureStore, createSlice, PayloadAction, ThunkAction } from '@reduxjs/toolkit';
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { ToDo } from '../types';
import { QueryReturnValue } from '@reduxjs/toolkit/src/query/baseQueryTypes';
import { FetchBaseQueryError } from '@reduxjs/toolkit/dist/query/fetchBaseQuery';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';

const {
  reducer: usernameReducer,
  actions: usernameActions,
} = createSlice({
  name: 'currentUsername',
  initialState: '',
  reducers: { setCurrentUsername: (_, action: PayloadAction<string>) => action.payload },
});

type AppState = { currentUsername: string };

const {
  reducerPath: toDoApiSliceName,
  reducer: toDoApiReducer,
  endpoints: toDoApiEndpoints,
  middleware: toDoApiMiddleware,
  useLazyFetchToDosQuery,
  useChangeToDoDoneMutation,
  useRemoveToDoMutation,
  useCreateToDoMutation,
  util,
} = createApi({
  baseQuery: fetchBaseQuery({ baseUrl: 'http://localhost:8000/todos' }),
  endpoints: builder => ({
    fetchToDos: builder.query<ToDo[], void>({
      queryFn(_1, { getState }, _2, baseQuery) {
        const { currentUsername } = getState() as AppState;
        return baseQuery(`?username=${currentUsername}`) as QueryReturnValue<ToDo[], FetchBaseQueryError>;
      },
    }),
    changeToDoDone: builder.mutation<ToDo, { id: number, newDoneValue: boolean }>({
      query: ({ id, newDoneValue }) => ({
        url: `/${id}`,
        method: 'PATCH',
        body: { done: newDoneValue },
      }),
    }),
    removeToDo: builder.mutation<unknown, number>({
      query: id => ({ url: `/${id}`, method: 'DELETE' }),
      async onQueryStarted(id, { dispatch, queryFulfilled }) {
        try {
          await queryFulfilled;
          dispatch(util.updateQueryData(
            'fetchToDos',
            undefined,
            draft => draft.filter(toDo => toDo.id !==id),
          ));
        } catch {}
      },
    }),
    createToDo: builder.mutation<ToDo, string>({
      queryFn(text, { getState }, _2, baseQuery) {
        const { currentUsername } = getState() as AppState;
        return baseQuery({
          url: '',
          method: 'POST',
          body: { username: currentUsername, text, done: false },
        }) as QueryReturnValue<ToDo, FetchBaseQueryError>;
      },
      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        try {
          const { data: newToDo } = await queryFulfilled;
          dispatch(util.updateQueryData(
            'fetchToDos',
            undefined,
            draft => [...draft, newToDo],
          ));
        } catch {}
      },
    }),
  }),
});

const changeCurrentUsername = (
  newUsername: string,
): ThunkAction<void, AppState, undefined, AnyAction> => (dispatch, getState) => {
  const { currentUsername } = getState();
  if (currentUsername === newUsername) {
    return;
  }
  dispatch(usernameActions.setCurrentUsername(newUsername));
  dispatch(toDoApiEndpoints.fetchToDos.initiate(undefined, { forceRefetch: true }));
};

const store = configureStore({
  reducer: {
    [toDoApiSliceName]: toDoApiReducer,
    currentUsername: usernameReducer,
  },
  middleware: getDefaultMiddleware => getDefaultMiddleware().concat(toDoApiMiddleware),
});
const useAppDispatch = () => useDispatch<typeof store.dispatch>();
function useAppSelector<T>(selector: (state: AppState) => T): T {
  return useSelector(selector, shallowEqual);
}

export default store;
export {
  toDoApiEndpoints,
  changeCurrentUsername,
  useAppDispatch,
  useAppSelector,
  useLazyFetchToDosQuery,
  useChangeToDoDoneMutation,
  useRemoveToDoMutation,
  useCreateToDoMutation,
};