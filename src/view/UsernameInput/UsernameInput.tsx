import { FC } from 'react';
import { ComponentTransformer, UsernameInputLogic } from 'logic';
import SubmittableInput from '../uiKit/SubmittableInput';
import RenderTracker from '../uiKit/RenderTracker';
import styles from './UsernameInput.module.scss';

function usernameInputFactory(
  useUsernameInput: UsernameInputLogic,
  componentTransformer: ComponentTransformer,
): FC {
  return componentTransformer(() => {
    const { currentUsername, setCurrentUsername, isDisabled } = useUsernameInput();
    return (
      <section>
        <div className={styles.info}>
          <h4>
            Current username:{' '}
            <span className={currentUsername ? styles.selectedUsername : styles.noUsername}>
              {currentUsername || 'Not selected'}
            </span>
          </h4>
          <RenderTracker />
        </div>
        <SubmittableInput
          onSubmit={setCurrentUsername}
          buttonText='Select'
          isDisabled={isDisabled}
        />
      </section>
    );
  });
}

export default usernameInputFactory;