import { useContext } from 'react';
import { VMContext } from './VMProvider';

export function useLinuxVM() {
  const ctx = useContext(VMContext);
  if (!ctx) {
    throw new Error('useLinuxVM must be used within a VMProvider');
  }
  return ctx;
}
