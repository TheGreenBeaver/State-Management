import { FC, useEffect, useRef } from 'react';
import styles from './RenderTracker.module.scss';
import cn from '../cn';

type RenderTrackerProps = {
  className?: string | undefined,
};

const RenderTracker: FC<RenderTrackerProps> = ({ className }) => {
  const renderCountRef = useRef(0);
  useEffect(() => {
    renderCountRef.current++;
  });
  return (
    <code className={cn(styles.tracker, className)}>
      Updated {renderCountRef.current} time{renderCountRef.current === 1 ? '' : 's'}
    </code>
  );
};

export default RenderTracker;