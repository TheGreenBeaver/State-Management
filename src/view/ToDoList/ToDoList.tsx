import { FC, ReactNode } from 'react';
import { ComponentTransformer, SingleToDoLogic, ToDoListLogic } from 'logic';
import singleToDoFactory from '../SingleToDo';
import styles from './ToDoList.module.scss';
import RenderTracker from '../uiKit/RenderTracker';
import cn from '../uiKit/cn';
import Button from '../uiKit/Button';

function toDoListFactory(
  useToDoList: ToDoListLogic,
  useSingleToDo: SingleToDoLogic,
  componentTransformer: ComponentTransformer
): FC {
  const SingleToDo = singleToDoFactory(useSingleToDo, componentTransformer);
  return componentTransformer(() => {
    const { toDoIds, error, isFetching, retryFetching } = useToDoList();

    function getContent(): ReactNode {
      if (isFetching) {
        return <p>Fetching...</p>;
      }
      if (error) {
        return (
          <div className={styles.error}>
            <span>Error: {error}</span>
            <Button appearance='aggressive' onClick={retryFetching}>Retry</Button>
          </div>
        );
      }
      return toDoIds.length
        ? toDoIds.map(id => <SingleToDo id={id} key={id} />)
        : <p>No ToDos</p>;
    }

    return (
      <ul className={styles.toDoList}>
        <div className={cn(styles.renderTrackerWrapper, (toDoIds.length || error) && styles.withGap)}>
          <RenderTracker />
        </div>
        {getContent()}
      </ul>
    );
  });
}

export default toDoListFactory;