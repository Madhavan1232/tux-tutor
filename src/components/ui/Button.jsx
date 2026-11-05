import styles from './Button.module.css';

/**
 * Button — primary / secondary variants
 *
 * @param {'primary'|'secondary'} variant
 * @param {'button'|'submit'|'reset'} type
 * @param {string} [className]
 * @param {React.ReactNode} children
 */
export default function Button({
  variant = 'primary',
  type = 'button',
  className = '',
  children,
  ...rest
}) {
  return (
    <button
      type={type}
      className={`${styles.btn} ${styles[variant]} ${className}`}
      {...rest}
    >
      {children}
    </button>
  );
}
