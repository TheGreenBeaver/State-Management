import { FC, PropsWithChildren, useEffect, useState } from 'react';
import { useInterpret } from '@xstate/react';
import appMachine from './appMachine';
import Context from './reactContext';
import { inspect } from '@xstate/inspect';

const Provider: FC<PropsWithChildren> = ({ children }) => {
  useEffect(() => {
    const inspector = inspect();
    return () => inspector?.disconnect();
  }, []);
  const machine = useInterpret(appMachine, { devTools: true });
  const [isInspectorVisible, setIsInspectorVisible] = useState<boolean>(false);
  return (
    <>
      <Context.Provider value={machine}>
        {children}
      </Context.Provider>
      <button
        onClick={() => setIsInspectorVisible(curr => !curr)}
        style={{ position: 'fixed', right: 16, bottom: 16 }}
      >
        Inspector
      </button>
      <iframe
        data-xstate
        style={{
          position: 'fixed',
          bottom: 32,
          right: 32,
          width: 900,
          height: 600,
          visibility: isInspectorVisible ? 'visible' : 'hidden',
        }}
      />
    </>
  );
};

export default Provider;