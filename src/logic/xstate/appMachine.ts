import { ActorRefFrom, assign, createMachine, spawn, StateMachine, StateSchema } from 'xstate';
import { ToDo } from '../types';
import api from '../shared/api';
import createToDoMachine, { ToDoMachineContext, ToDoMachineEvent } from './toDoMachine';

export enum AppMachineState {
  Idle = 'Idle',
  FetchingToDos = 'FetchingToDos',
  CreatingToDo = 'CreatingToDo',
}

type ToDoMachine = ActorRefFrom<StateMachine<ToDoMachineContext, StateSchema<ToDoMachineContext>, ToDoMachineEvent>>;

type AppMachineContext = {
  toDos: ToDoMachine[],
  currentUsername: string,
  toDosFetchingError: string | null,
  createToDoError: string | null
};

type AppMachineEvent =
  { type: 'CHANGE_CURRENT_USERNAME', newUsername: string } |
  { type: 'CREATE_TODO', text: string } |
  { type: 'TODO.REMOVED', id: number } |
  { type: 'FETCH_TODOS' };

type AppMachineTypeState = { value: AppMachineState, context: AppMachineContext };

const appMachine = createMachine<AppMachineContext, AppMachineEvent, AppMachineTypeState>({
  preserveActionOrder: true,
  predictableActionArguments: true,
  id: 'app',
  initial: AppMachineState.Idle,
  context: {
    toDos: [],
    currentUsername: '',
    toDosFetchingError: null,
    createToDoError: null,
  },
  states: {
    [AppMachineState.Idle]: {
      on: {
        CHANGE_CURRENT_USERNAME: {
          actions: assign({ currentUsername: (_, event) => event.newUsername }),
          target: AppMachineState.FetchingToDos,
        },
        CREATE_TODO: {
          target: AppMachineState.CreatingToDo,
          cond: (context, event) => !!context.currentUsername && !!event.text,
        },
        'TODO.REMOVED': {
          actions: [
            assign({ toDos: (context, event) => context.toDos.filter(toDo => toDo.id !== `${event.id}`) }),
            'persist',
          ],
        },
        FETCH_TODOS: {
          target: AppMachineState.FetchingToDos,
          cond: context => !!context.currentUsername,
        },
      },
    },
    [AppMachineState.FetchingToDos]: {
      entry: assign({ toDosFetchingError: null }),
      invoke: {
        id: 'fetchToDos',
        src: context => api.fetchToDosForUsername(context.currentUsername),
        onDone: {
          actions: assign({
            toDos: (_, event) => event.data.map((toDo: ToDo) => spawn(createToDoMachine(toDo), `${toDo.id}`)),
          }),
          target: AppMachineState.Idle,
        },
        onError: {
          actions: assign({ toDosFetchingError: (_, event) => event.data }),
          target: AppMachineState.Idle,
        },
      },
    },
    [AppMachineState.CreatingToDo]: {
      entry: assign({ createToDoError: null }),
      invoke: {
        id: 'createToDo',
        src: (context, event) => event.type === 'CREATE_TODO'
          ? api.createToDo(event.text, context.currentUsername)
          : Promise.reject(new Error('Can\'t create a ToDo this way!')),
        onDone: {
          actions: assign({
            toDos: (context, event) => [
              ...context.toDos, spawn(createToDoMachine(event.data as ToDo), `${event.data.id}`),
            ],
          }),
          target: AppMachineState.Idle,
        },
        onError: {
          actions: assign({ createToDoError: (_, event) => event.data }),
          target: AppMachineState.Idle,
        },
      },
    },
  },
});

export type { AppMachineContext, AppMachineEvent, AppMachineTypeState, ToDoMachine };
export default appMachine;