import { useEffect, useState } from "react";
import {
  getAuth,
  GoogleAuthProvider,
  onAuthStateChanged,
  signInWithPopup,
  signOut,
} from "firebase/auth";
import { getDatabase, ref, get, set, remove } from "firebase/database";
import {firebase} from "../firebase";

console.log("Firebase helper initializing..."); // Debug log
const auth = getAuth(firebase);
const db = getDatabase(firebase);
console.log("Auth initialized successfully"); // Debug log

export const signInWithGoogle = () => {
  console.log("Attempting Google sign in..."); // Debug log
  return signInWithPopup(auth, new GoogleAuthProvider());
};

export const handleGoogleLogin = async () => {
  try {
    console.log("Initiating Google login..."); // Debug log
    const result = await signInWithGoogle(); // Calls Firebase to sign in
    const googleUid = result.user.uid; // Get the unique Google ID
    const name = result.user.displayName; // Get user's name
    console.log("Google UID:", googleUid, "Name:", name); // Debug log
    return { googleUid, name };
  } catch (error) {
    console.error("Google Login Failed:", error);
    throw error;
  }
};

const firebaseSignOut = () => {
  console.log("Attempting sign out..."); // Debug log
  return signOut(auth);
};

export { firebaseSignOut as signOut };

export const useAuthState = () => {
  const [user, setUser] = useState();

  useEffect(() => {
    console.log("Setting up auth state listener..."); // Debug log
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      console.log("Auth state changed:", user ? "User logged in" : "No user"); // Debug log
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

// return profile if exsits, else create
export const getProfile = async (uid, name) => {

    try {
        const userRef = ref(db, `${uid}`);
        const userSnapshot = await get(userRef);
        
        if (!userSnapshot.exists()) {
            console.log(name)
            const initialData = {
                recap: {},
                Entries: new Date().toISOString(),
                displayName: name
            };
            await set(userRef, initialData); // Using set instead of update for initial data
            return initialData;
        }
        return userSnapshot.val();
    } catch (error) {
        console.error("Error in getProfile:", error);
        throw error;
    }
}
