import { HTMLProps, ReactElement } from 'react';
import cn from '../cn';
import styles from './Button.module.scss';

type ButtonProps = HTMLProps<HTMLButtonElement> & {
  type?: 'button' | 'submit' | 'reset',
  appearance?: 'standard' | 'aggressive'
};

function capitalize(str: string): string {
  return `${str[0]?.toUpperCase()}${str.substring(1)}`;
}

function Button({
  children,
  className,
  appearance = 'standard',
  type = 'button',
  ...otherProps
}: ButtonProps): ReactElement | null {
  return (
    <button
      type={type}
      className={cn(styles.buttonBase, styles[`button${capitalize(appearance)}`], className)}
      {...otherProps}
    >
      {children}
    </button>
  );
}
export default Button;