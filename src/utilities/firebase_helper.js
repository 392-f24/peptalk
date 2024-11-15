import { useEffect, useState } from "react";
import {
  getAuth,
  GoogleAuthProvider,
  onAuthStateChanged,
  signInWithPopup,
  signOut,
} from "firebase/auth";
import { getDatabase, ref, set } from "firebase/database";
import { firebase } from "./firebase";

console.log('Firebase helper initializing...'); // Debug log
const auth = getAuth(firebase);
const db = getDatabase(firebase);
console.log('Auth initialized successfully'); // Debug log

export const signInWithGoogle = () => {
  console.log('Attempting Google sign in...'); // Debug log
  return signInWithPopup(auth, new GoogleAuthProvider());
};

const firebaseSignOut = () => {
  console.log('Attempting sign out...'); // Debug log
  return signOut(auth);
};

export { firebaseSignOut as signOut };

export const useAuthState = () => {
  const [user, setUser] = useState();

  useEffect(() => {
    console.log('Setting up auth state listener...'); // Debug log
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      console.log('Auth state changed:', user ? 'User logged in' : 'No user'); // Debug log
      setUser(user);
    });
    return () => unsubscribe();
  }, []);

  return [user];
};

export const useUser = () => {
  const [user] = useAuthState();
  return user;
};