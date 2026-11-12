import { createContext, useContext } from 'react';

export const UserProgressContext = createContext(null);

export function useUserProgress() {
  return useContext(UserProgressContext);
}

