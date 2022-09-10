import logicDefinerNames, { LogicDefinerName } from './logicDefinerNames';
import * as reduxThunks from './reduxThunks';
import * as reduxSagas from './reduxSagas';
import * as xstate from './xstate';
import * as valtio from './valtio';
import * as jotai from './jotai';
import * as effector from './effector';
import * as mobx from './mobx';
import * as rtkQuery from './rtkQuery';
import {
  UsernameInputLogic,
  ToDoListLogic, SingleToDoLogic,
  CreateToDoLogic,
  LogicDefiner,
  ComponentTransformer,
} from './types';
import { FC, PropsWithChildren } from 'react';

const logicDefiners: Record<LogicDefinerName, LogicDefiner> = {
  reduxThunks: reduxThunks.logicDefiner,
  reduxSagas: reduxSagas.logicDefiner,
  xstate: xstate.logicDefiner,
  valtio: valtio.logicDefiner,
  jotai: jotai.logicDefiner,
  effector: effector.logicDefiner,
  mobx: mobx.logicDefiner,
  rtkQuery: rtkQuery.logicDefiner,
};

const storeProviders: Partial<Record<LogicDefinerName, FC<PropsWithChildren>>> = {
  reduxThunks: reduxThunks.Provider,
  reduxSagas: reduxSagas.Provider,
  xstate: xstate.Provider,
  rtkQuery: rtkQuery.Provider,
};

const componentTransformers: Partial<Record<LogicDefinerName, ComponentTransformer>> = {
  mobx: mobx.componentTransformer,
};

export { logicDefinerNames, logicDefiners, storeProviders, componentTransformers };
export type { UsernameInputLogic, ToDoListLogic, SingleToDoLogic, CreateToDoLogic, LogicDefiner, ComponentTransformer };