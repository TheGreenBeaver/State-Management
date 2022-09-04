import { createContext } from 'react';
import { InterpreterFrom } from 'xstate';
import appMachine from './appMachine';

const Context = createContext({} as InterpreterFrom<typeof appMachine>);

export default Context;