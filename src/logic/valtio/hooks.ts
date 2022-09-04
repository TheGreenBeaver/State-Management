import { CreateToDoLogic, SingleToDoLogic, ToDoListLogic, UsernameInputLogic } from '../types';
import { snapshot, subscribe } from 'valtio';
import store, { actions } from './store';
import { AppState } from '../shared/appState';
import { useCallback, useEffect, useRef, useState } from 'react';
import isEqual from 'lodash.isequal';
import { createToDoSelector, singleToDoSelector, toDoListSelector, usernameInputSelector } from '../shared/selectors';

function useValtioSelector<T>(selector: (appState: AppState) => T): T {
  const prevValueRef = useRef<T>(selector(store));
  const [value, setValue] = useState<T>(selector(store));
  useEffect(() => subscribe(store, () => {
    const state = snapshot(store);
    const newValue = selector(state as AppState);
    if (!isEqual(newValue, prevValueRef.current)) {
      prevValueRef.current = newValue;
      setValue(newValue);
    }
  }), [selector]);
  return value;
}

const useUsernameInput: UsernameInputLogic = () => {
  const data = useValtioSelector(usernameInputSelector);
  return { ...data, setCurrentUsername: actions.changeCurrentUsername };
};

const useToDoList: ToDoListLogic = () => {
  const data = useValtioSelector(toDoListSelector);
  return { ...data, retryFetching: actions.fetchToDos };
};

const useSingleToDo: SingleToDoLogic = id => {
  const memoizedSelector = useCallback((appState: AppState) => singleToDoSelector(appState, id), [id]);
  const data = useValtioSelector(memoizedSelector);
  return {
    ...data,
    remove: () => actions.removeToDo(id),
    changeDone: newDoneValue => actions.changeToDoDone(id, newDoneValue),
  };
};

const useCreateToDo: CreateToDoLogic = () => {
  const data = useValtioSelector(createToDoSelector);
  return { ...data, createToDo: actions.createToDo };
};

export { useCreateToDo, useToDoList, useSingleToDo, useUsernameInput };