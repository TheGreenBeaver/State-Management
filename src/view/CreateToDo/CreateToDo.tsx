import { FC } from 'react';
import { ComponentTransformer, CreateToDoLogic } from 'logic';
import SubmittableInput from '../uiKit/SubmittableInput';
import RenderTracker from '../uiKit/RenderTracker';
import styles from './CreateToDo.module.scss';

function createToDoFactory(useCreateToDo: CreateToDoLogic, componentTransformer: ComponentTransformer): FC {
  return componentTransformer(() => {
    const { createToDo, error, isDisabled } = useCreateToDo();
    return (
      <section>
        <div className={styles.sectionHead}>
          <h4>Create new</h4>
          <RenderTracker />
        </div>
        <SubmittableInput
          onSubmit={createToDo}
          buttonText='Create'
          isDisabled={isDisabled}
          error={error}
        />
      </section>
    );
  });
}

export default createToDoFactory;