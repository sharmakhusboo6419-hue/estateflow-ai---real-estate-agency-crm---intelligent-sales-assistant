import React, { createContext, useContext, useEffect, useState, useMemo } from 'react';
import {
  User,
  signInWithPopup,
  signOut as firebaseSignOut,
  onAuthStateChanged,
} from 'firebase/auth';
import { auth, googleProvider } from './config';
import { FirestoreService } from './firestoreService';

interface FirebaseContextType {
  currentUser: User | null;
  authLoading: boolean;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  authError: string | null;
  isFirebaseReady: boolean;
  syncStatus: 'synced' | 'local' | 'syncing' | 'error';
  setSyncStatus: (status: 'synced' | 'local' | 'syncing' | 'error') => void;
}

const FirebaseContext = createContext<FirebaseContextType>({
  currentUser: null,
  authLoading: true,
  signInWithGoogle: async () => {},
  signOut: async () => {},
  authError: null,
  isFirebaseReady: false,
  syncStatus: 'local',
  setSyncStatus: () => {},
});

export const useFirebase = () => useContext(FirebaseContext);

export const FirebaseProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState<boolean>(true);
  const [authError, setAuthError] = useState<string | null>(null);
  const [syncStatus, setSyncStatus] = useState<'synced' | 'local' | 'syncing' | 'error'>('local');

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(
      auth,
      async (user) => {
        setCurrentUser(user);
        setAuthLoading(false);
        if (user) {
          setSyncStatus('synced');
          // Persist user profile to Firestore
          try {
            await FirestoreService.upsertUserProfile({
              uid: user.uid,
              displayName: user.displayName,
              email: user.email,
              photoURL: user.photoURL,
            });
          } catch (err) {
            console.error('Error saving user profile to Firestore:', err);
          }
        } else {
          setSyncStatus('local');
        }
      },
      (error) => {
        console.error('Auth state error:', error);
        setAuthError(error.message);
        setAuthLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  const signInWithGoogle = async () => {
    setAuthError(null);
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Google sign in failed';
      console.error('Sign-in error:', message);
      setAuthError(message);
      throw err;
    }
  };

  const signOut = async () => {
    try {
      await firebaseSignOut(auth);
      setCurrentUser(null);
      setSyncStatus('local');
    } catch (err) {
      console.error('Sign-out error:', err);
      throw err;
    }
  };

  const value = useMemo(
    () => ({
      currentUser,
      authLoading,
      signInWithGoogle,
      signOut,
      authError,
      isFirebaseReady: true,
      syncStatus,
      setSyncStatus,
    }),
    [currentUser, authLoading, authError, syncStatus]
  );

  return <FirebaseContext.Provider value={value}>{children}</FirebaseContext.Provider>;
};
