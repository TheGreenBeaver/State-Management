import store from './store';
import { Provider as ReduxProvider } from 'react-redux';
import { FC, PropsWithChildren } from 'react';

const Provider: FC<PropsWithChildren> = ({ children }) => (
  <ReduxProvider store={store}>
    {children}
  </ReduxProvider>
);

export default Provider;
