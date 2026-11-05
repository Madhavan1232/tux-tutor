import styles from './Block.module.css';

/**
 * Block — editorial panel, comes in burgundy / black / surface variants.
 * Use burgundy sparingly for high-impact sections only.
 *
 * @param {'burgundy'|'black'|'surface'} [variant='black']
 * @param {string} [className]
 * @param {React.ReactNode} children
 */
export default function Block({ variant = 'black', className = '', children, ...rest }) {
  return (
    <div className={`${styles.block} ${styles[variant]} ${className}`} {...rest}>
      {children}
    </div>
  );
}
