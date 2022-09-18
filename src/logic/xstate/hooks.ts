import { useContext } from 'react';
import Context from './reactContext';
import { useActor, useSelector } from '@xstate/react';
import { InterpreterFrom, State } from 'xstate';
import appMachine, {
  AppMachineContext,
  AppMachineEvent,
  AppMachineState,
  AppMachineTypeState,
  ToDoMachine,
} from './appMachine';
import { CreateToDoLogic, SingleToDoLogic, ToDoListLogic, UsernameInputLogic } from '../types';
import { ToDoMachineState } from './toDoMachine';
import isEqual from 'lodash.isequal';

function useXstate<T>(
  selector: (state: State<AppMachineContext, AppMachineEvent, AppMachineTypeState>) => T,
): [T, InterpreterFrom<typeof appMachine>['send']] {
  const service: InterpreterFrom<typeof appMachine> = useContext(Context);
  const data = useSelector(service, selector, isEqual);
  return [data, service.send];
}

const useUsernameInput: UsernameInputLogic = () => {
  const [[currentUsername, isDisabled], send] = useXstate(state => [
    state.context.currentUsername,
    [AppMachineState.FetchingToDos, AppMachineState.CreatingToDo].some(disabledState => state.matches(disabledState)),
  ]);
  return {
    currentUsername,
    setCurrentUsername: newUsername => send({ type: 'CHANGE_CURRENT_USERNAME', newUsername }),
    isDisabled,
  };
};

const useToDoList: ToDoListLogic = () => {
  const [[toDoIds, error, isFetching], send] = useXstate(state => [
    state.context.toDos.map(toDo => +toDo.id),
    state.context.toDosFetchingError,
    state.matches(AppMachineState.FetchingToDos),
  ]);
  return {
    toDoIds,
    isFetching,
    error,
    retryFetching: () => send('FETCH_TODOS'),
  };
};

const useSingleToDo: SingleToDoLogic = id => {
  const [toDoMachine] = useXstate(state => state.context.toDos.find(machine => +machine.id === id) as ToDoMachine);
  const [state, send] = useActor(toDoMachine);
  return {
    toDo: state.context.toDo,
    changeDone: newDoneValue => send({ type: 'CHANGE_DONE', newDoneValue }),
    remove: () => send('REMOVE'),
    isProcessing: [ToDoMachineState.Removing, ToDoMachineState.ChangingDone].some(
      disabledState => state.matches(disabledState),
    ),
    error: state.context.error,
  };
};

const useCreateToDo: CreateToDoLogic = () => {
  const [[error, isDisabled], send] = useXstate(state => [
    state.context.createToDoError,
    [AppMachineState.FetchingToDos, AppMachineState.CreatingToDo].some(disabledState => state.matches(disabledState)),
  ]);
  return {
    createToDo: text => send({ type: 'CREATE_TODO', text }),
    error,
    isDisabled,
  };
};

export { useUsernameInput, useToDoList, useSingleToDo, useCreateToDo };