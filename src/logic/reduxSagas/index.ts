import { LogicDefiner } from '../types';
import { useCreateToDo, useSingleToDo, useToDoList, useUsernameInput } from './hooks';
import Provider from './provider';

const logicDefiner: LogicDefiner = { useUsernameInput, useToDoList, useSingleToDo, useCreateToDo };
export { logicDefiner, Provider };