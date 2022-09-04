import { FC } from 'react';

type ToDo = {
  id: number,
  text: string,
  done: boolean,
  username: string,
};

type UsernameInputLogic = () => {
  currentUsername: string,
  setCurrentUsername: (newUsername: string) => void,
  isDisabled: boolean,
};

type ToDoListLogic = () => {
  toDoIds: number[],
  isFetching: boolean,
  error: string | null,
  retryFetching: () => void,
};

type SingleToDoLogic = (id: number) => {
  toDo: ToDo,
  changeDone: (newDoneValue: boolean) => void,
  remove: () => void,
  isProcessing: boolean,
  error: string | null,
};

type CreateToDoLogic = () => {
  createToDo: (toDoText: string) => void,
  isDisabled: boolean,
  error: string | null,
};

type LogicDefiner = {
  useUsernameInput: UsernameInputLogic,
  useToDoList: ToDoListLogic,
  useSingleToDo: SingleToDoLogic,
  useCreateToDo: CreateToDoLogic,
};

type ComponentTransformer = <P>(cmp: FC<P>) => FC<P>;

export type {
  ToDo,
  UsernameInputLogic,
  ToDoListLogic,
  SingleToDoLogic,
  CreateToDoLogic,
  LogicDefiner,
  ComponentTransformer,
};