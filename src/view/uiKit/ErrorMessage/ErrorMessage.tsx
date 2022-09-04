import { FC } from 'react';
import styles from './ErrorMessage.module.scss';
import cn from '../cn';

type ErrorMessageProps = {
  error: string | null,
  className?: string
};

const ErrorMessage: FC<ErrorMessageProps> = ({ error, className }) => (
  error ? <span className={cn(styles.message, className)}>Error: {error}; please try again</span> : null
);

export default ErrorMessage;