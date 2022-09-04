import { FC, memo } from 'react';
import { ComponentTransformer, SingleToDoLogic } from 'logic';
import Button from '../uiKit/Button';
import styles from './SingleToDo.module.scss';
import RenderTracker from '../uiKit/RenderTracker';
import ErrorMessage from '../uiKit/ErrorMessage';

function singleToDoFactory(
  useSingleToDo: SingleToDoLogic,
  componentTransformer: ComponentTransformer
): FC<{ id: number }> {
  return (componentTransformer || memo)(({ id }) => {
    const { toDo, remove, changeDone, isProcessing, error } = useSingleToDo(id);
    return (
      <li className={styles.wrapper}>
        <div className={styles.mainContent}>
          <div>
            <input
              type='checkbox'
              checked={toDo.done}
              disabled={isProcessing}
              onChange={e => changeDone(e.target.checked)}
            />
            <span>{toDo.text}</span>
          </div>
          <div>
            <RenderTracker />
            <Button onClick={remove} disabled={isProcessing} appearance='aggressive'>
              Remove
            </Button>
          </div>
        </div>
        <ErrorMessage error={error} />
      </li>
    );
  });
}

export default singleToDoFactory;