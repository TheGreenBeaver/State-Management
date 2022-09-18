import mainFactory from './Main';
import Nav from './Nav';
import { logicDefinerNames, logicDefiners, storeProviders, componentTransformers } from 'logic';

const mains = Object.fromEntries(
  logicDefinerNames.map(name => [
    name,
    mainFactory(logicDefiners[name], storeProviders[name], componentTransformers[name]),
  ]),
);

export { Nav, mains };