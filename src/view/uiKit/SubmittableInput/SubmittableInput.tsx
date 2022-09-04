import { ReactElement, useState } from 'react';
import Button from '../Button';
import styles from './SubmittableInput.module.scss';
import ErrorMessage from '../ErrorMessage';

type SubmittableInputProps = {
  onSubmit: (inputValue: string) => void,
  error?: string | null,
  buttonText: string,
  isDisabled?: boolean,
};

function SubmittableInput({
  onSubmit,
  isDisabled = true,
  error = null,
  buttonText,
}: SubmittableInputProps): ReactElement | null {
  const [inputValue, setInputValue] = useState<string>('');
  const canSubmit = !isDisabled && !!inputValue;

  return (
    <form
      className={styles.form}
      onSubmit={e => {
        e.preventDefault();
        canSubmit && onSubmit(inputValue);
      }}
    >
      <div className={styles.inputWrapper}>
        <input
          className={styles.input}
          disabled={isDisabled}
          value={inputValue}
          onChange={e => setInputValue(e.target.value)}
        />
        <Button type='submit' disabled={!canSubmit}>
          {error ? 'Retry' : buttonText}
        </Button>
      </div>
      <ErrorMessage error={error} />
    </form>
  );
}

export default SubmittableInput;