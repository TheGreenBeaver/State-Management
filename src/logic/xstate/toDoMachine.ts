import { assign, createMachine, sendParent } from 'xstate';
import { ToDo } from '../types';
import api from '../shared/api';

export enum ToDoMachineState {
  Idle = 'Idle',
  ChangingDone = 'ChangingDone',
  Removing = 'Removing',
}

type ToDoMachineContext = {
  toDo: ToDo,
  error: string | null,
};

type ToDoMachineEvent =
  { type: 'CHANGE_DONE', newDoneValue: boolean } |
  { type: 'REMOVE' };

type ToDoMachineTypeState = { value: ToDoMachineState, context: ToDoMachineContext };

function createToDoMachine(toDo: ToDo) {
  return createMachine<ToDoMachineContext, ToDoMachineEvent, ToDoMachineTypeState>({
    preserveActionOrder: true,
    predictableActionArguments: true,
    id: `${toDo.id}`,
    initial: ToDoMachineState.Idle,
    context: {
      toDo,
      error: null,
    },
    states: {
      [ToDoMachineState.Idle]: {
        on: {
          CHANGE_DONE: {
            target: ToDoMachineState.ChangingDone,
          },
          REMOVE: {
            target: ToDoMachineState.Removing,
          },
        },
        exit: assign({ error: null }),
      },
      [ToDoMachineState.ChangingDone]: {
        invoke: {
          id: 'changeDone',
          src: (context, event) => event.type === 'CHANGE_DONE'
            ? api.changeToDoDone({ id: context.toDo.id, newDoneValue: event.newDoneValue })
            : Promise.reject(new Error('Can\'t change ToDo.done this way!')),
          onDone: {
            actions: assign({ toDo: (_, event) => event.data }),
            target: ToDoMachineState.Idle,
          },
          onError: {
            actions: assign({ error: (_, event) => event.data }),
            target: ToDoMachineState.Idle,
          },
        },
      },
      [ToDoMachineState.Removing]: {
        invoke: {
          id: 'remove',
          src: (context, event) => event.type === 'REMOVE'
            ? api.removeToDo(context.toDo.id)
            : Promise.reject(new Error('Can\'t remove a ToDo this way!')),
          onDone: {
            actions: sendParent(context => ({ type: 'TODO.REMOVED', id: context.toDo.id })),
            target: ToDoMachineState.Idle,
          },
          onError: {
            actions: assign({ error: (_, event) => event.data }),
            target: ToDoMachineState.Idle,
          },
        },
      },
    },
  });
}

export type { ToDoMachineEvent, ToDoMachineContext };
export default createToDoMachine;