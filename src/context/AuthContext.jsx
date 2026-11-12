import { createContext, useContext } from 'react';

/**
 * AuthContext — provides { currentUser, onSignOut, updateCurrentUser } to any descendant.
 * Populated once at the App root; kept synchronized with UserProgressContext.
 */
export const AuthContext = createContext({
  currentUser: null,
  onSignOut: () => {},
  updateCurrentUser: () => {},
});

export function useAuth() {
  return useContext(AuthContext);
}

