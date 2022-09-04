import { ToDo } from '../types';

export type AppState = {
  currentUsername: string,
  isFetchingToDos: boolean,
  toDos: ToDo[],
  toDosFetchingError: string | null,
  processingToDoIds: number[],
  toDoErrors: { id: number, error: string }[],
  createToDoError: string | null,
  isCreatingToDo: boolean,
};

export const initialAppState: AppState = {
  currentUsername: '',
  isFetchingToDos: false,
  toDos: [],
  toDosFetchingError: null,
  processingToDoIds: [],
  toDoErrors: [],
  createToDoError: null,
  isCreatingToDo: false,
};