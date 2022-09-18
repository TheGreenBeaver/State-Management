import { CreateToDoLogic, SingleToDoLogic, ToDoListLogic, UsernameInputLogic } from '../types';
import appStore, { ToDoStore } from './store';
import { computed } from 'mobx';

const useUsernameInput: UsernameInputLogic = () => ({
  currentUsername: appStore.currentUsername,
  isDisabled: appStore.areInputsDisabled,
  setCurrentUsername: appStore.changeCurrentUsername,
});

const useToDoList: ToDoListLogic = () => ({
  toDoIds: appStore.toDoIds,
  error: appStore.toDosFetchingError,
  isFetching: appStore.isFetchingToDos,
  retryFetching: appStore.fetchToDos,
});

const useSingleToDo: SingleToDoLogic = id => computed(
  () => appStore.toDos.find(store => store.toDo.id === id) as ToDoStore,
).get();

const useCreateToDo: CreateToDoLogic = () => ({
  isDisabled: appStore.areInputsDisabled,
  error: appStore.createToDoError,
  createToDo: appStore.createToDo,
});

export { useUsernameInput, useToDoList, useSingleToDo, useCreateToDo };