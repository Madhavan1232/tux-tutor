import { createContext, useContext } from 'react';

/**
 * AuthContext — provides { currentUser, onSignOut } to any descendant.
 * Populated once at the App root; consumed by Sidebar without prop-drilling.
 */
export const AuthContext = createContext({
  currentUser: null,
  onSignOut: () => {},
});

export function useAuth() {
  return useContext(AuthContext);
}

