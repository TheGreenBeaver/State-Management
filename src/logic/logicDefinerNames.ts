const logicDefinerNames = [
  'reduxThunks',
  'reduxSagas',
  // 'easyPeasy',
  // 'zustand',
  'effector',
  // 'recoil',
  'jotai',
  'mobx',
  'valtio',
  'xstate',
] as const;

export type LogicDefinerName = typeof logicDefinerNames[number];

export default logicDefinerNames;