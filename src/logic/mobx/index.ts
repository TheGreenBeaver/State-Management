import { LogicDefiner } from '../types';
import { useCreateToDo, useSingleToDo, useToDoList, useUsernameInput } from './hooks';
import componentTransformer from './componentTransformer';

const logicDefiner: LogicDefiner = { useUsernameInput, useToDoList, useSingleToDo, useCreateToDo };
export { logicDefiner, componentTransformer };