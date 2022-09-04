import { LogicDefiner } from '../types';
import { useCreateToDo, useSingleToDo, useToDoList, useUsernameInput } from './hooks';

const logicDefiner: LogicDefiner = { useUsernameInput, useToDoList, useSingleToDo, useCreateToDo };
export { logicDefiner };