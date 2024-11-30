import React, { useContext, useState, useEffect } from 'react';
import { ref, get, getDatabase } from 'firebase/database';
import firebase from '../firebase';
import {
  handleGoogleLogin,
  signOut,
  useAuthState,
  getProfile
} from '../utilities/firebase_helper'; // Adjust path as needed

const PepContext = React.createContext();

export function usePepContext() {
  return useContext(PepContext);
}

export function PepProvider({ children }) {
  const [user] = useAuthState(); 
  const [userProfile, setUserProfile] = useState(null);
  const [userEntries, setUserEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const db = getDatabase(firebase);

  // Fetch user profile and entries when user changes
  useEffect(() => {
    const initializeUserData = async () => {
      if (!user) {
        setUserProfile(null);
        setUserEntries([]);
        setLoading(false);
        return;
      }

      try {
        setError(null);
        // Get or create user profile
        const profile = await getProfile(user.uid, user.displayName);
        setUserProfile(profile);

        // Fetch entries
        const entriesRef = ref(db, `${user.uid}/entries`);
        const snapshot = await get(entriesRef);

        if (snapshot.exists()) {
          const entriesArray = Object.entries(snapshot.val()).map(([id, entry]) => ({
            id,
            ...entry
          })).sort((a, b) => new Date(b.date) - new Date(a.date));
          
          setUserEntries(entriesArray);
        } else {
          setUserEntries([]);
        }
      } catch (err) {
        setError(err.message);
        console.error('Error fetching user data:', err);
      } finally {
        setLoading(false);
      }
    };

    initializeUserData();
  }, [user, db]);

  // Login with Google
  const login = async () => {
    try {
      const { googleUid, name } = await handleGoogleLogin();
      // Profile will be automatically fetched by the useEffect above
      return { googleUid, name };
    } catch (error) {
      setError(error.message);
      throw error;
    }
  };

  // Logout
  const logout = async () => {
    try {
      await signOut();
      setUserProfile(null);
      setUserEntries([]);
    } catch (error) {
      setError(error.message);
      throw error;
    }
  };

  const value = {
    user,
    userProfile,
    userEntries,
    loading,
    error,
    login,
    logout,
  };

  return (
    <PepContext.Provider value={value}>
      {!loading && children}
    </PepContext.Provider>
  );
}