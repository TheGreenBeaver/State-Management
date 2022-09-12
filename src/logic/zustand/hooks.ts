import { CreateToDoLogic, SingleToDoLogic, ToDo, ToDoListLogic, UsernameInputLogic } from '../types';
import useToDosStore from './store';
import isEqual from 'lodash.isequal';

function skipMethods(obj: Record<string, unknown>): Record<string, unknown> {
  return Object.fromEntries(Object.entries(obj).filter(([, val]) => typeof val !== 'function'));
}

function areFieldsEqual(a: Record<string, unknown>, b: Record<string, unknown>): boolean {
  return isEqual(skipMethods(a), skipMethods(b));
}

const useUsernameInput: UsernameInputLogic = () => useToDosStore(state => ({
  currentUsername: state.currentUsername,
  setCurrentUsername: state.changeCurrentUsername,
  isDisabled: state.isFetchingToDos || state.isCreatingToDo,
}), areFieldsEqual);

const useToDoList: ToDoListLogic = () => useToDosStore(state => ({
  toDoIds: state.toDos.map(toDo => toDo.id),
  isFetching: state.isFetchingToDos,
  error: state.toDosFetchingError,
  retryFetching: state.fetchToDos,
}), areFieldsEqual);

const useSingleToDo: SingleToDoLogic = id => useToDosStore(state => ({
  toDo: state.toDos.find(toDo => toDo.id === id) as ToDo,
  changeDone: (newDoneValue: boolean) => state.changeToDoDone({ id, newDoneValue }),
  remove: () => state.removeToDo(id),
  error: state.toDoErrors.find(err => err.id === id)?.error ?? null,
  isProcessing: state.processingToDoIds.includes(id),
}), areFieldsEqual);

const useCreateToDo: CreateToDoLogic = () => useToDosStore(state => ({
  isDisabled: state.isFetchingToDos || state.isCreatingToDo,
  error: state.createToDoError,
  createToDo: state.createToDo,
}), areFieldsEqual);

export { useUsernameInput, useToDoList, useSingleToDo, useCreateToDo };