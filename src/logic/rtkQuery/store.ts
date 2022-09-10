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
} = createApi({
  baseQuery: fetchBaseQuery({ baseUrl: 'http://localhost:8000' }),
  tagTypes: ['ToDo'],
  endpoints: builder => ({
    fetchToDos: builder.query<ToDo[], void>({
      queryFn: (_1, { getState }, _2, baseQuery) => {
        const { currentUsername } = getState() as AppState;
        return baseQuery(`?username=${currentUsername}`) as QueryReturnValue<ToDo[], FetchBaseQueryError>;
      },
      providesTags: result => result?.map(toDo => ({ type: 'ToDo', id: toDo.id })) ?? [],
    }),
    changeToDoDone: builder.mutation<ToDo, { id: number, newDoneValue: boolean }>({
      query: ({ id, newDoneValue }) => ({
        url: `/${id}`,
        method: 'patch',
        body: { done: newDoneValue },
      }),
      invalidatesTags: result => result ? [{ type: 'ToDo', id: result.id }] : [],
    }),
    removeToDo: builder.mutation<unknown, number>({
      query: id => ({ url: `/${id}`, method: 'delete' }),
      invalidatesTags: (_1, _2, id) => [{ type: 'ToDo', id }],
    }),
    createToDo: builder.mutation<ToDo, string>({
      queryFn: (text, { getState }, _2, baseQuery) => {
        const { currentUsername } = getState() as AppState;
        return baseQuery({
          url: '',
          method: 'post',
          body: { username: currentUsername, text, done: false },
        }) as QueryReturnValue<ToDo, FetchBaseQueryError>;
      },
    }),
  }),
});

const changeCurrentUsername = (
  newUsername: string
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