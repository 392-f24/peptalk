import React, { useContext, useState, useEffect } from 'react';
import { ref, set, get, getDatabase } from 'firebase/database';
import firebase from '../firebase';
import axios from 'axios';
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
  const [recaps, setRecaps] = useState([])
  
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

  const fetchEntries = async () => {
    if (!user) return;
    try {
      const entriesRef = ref(db, `${user.uid}/entries`);
      const snapshot = await get(entriesRef);
      if (snapshot.exists()) {
        const entriesArray = Object.entries(snapshot.val())
          .map(([id, entry]) => ({
            id,
            ...entry
          }))
          .sort((a, b) => new Date(b.date) - new Date(a.date));
        setUserEntries(entriesArray);
      }
    } catch (err) {
      setError(err.message);
    }
  };

  const fetchRecaps = async () => {
    if (!user) return
    try {
      const recapsRef = ref(db, `${user.uid}/recap`)
      const snapshot = await get(recapsRef)
      if (snapshot.exists()) {
        const recapData = snapshot.val()
        const recapArray = [
          {
            title: recapData.title,
            month: recapData.month,
            summary: recapData.summary,
            totalEntries: recapData.totalEntries,
            faveDay: recapData.faveDay,
            mood: recapData.mood
          }
        ]
        setRecaps(recapArray)
      }
    } catch (err) {
      setError(err.message)
    }
  }
  
  const deleteRecap = async () => {
    if (!user) return
    try {
      const recapRef = ref(db, `${user.uid}/recap`)
      await remove(recapRef)
      setRecaps([]) // Clear recaps state after deletion
      console.log("Recap deleted successfully")
    } catch (err) {
      setError(err.message)
    }
  }
  
  const createRecap = async (monthEntries, recapMonth) => {
    try {
      const userId = user?.uid 
      if (!userId) throw new Error("User not authenticated")
    
      console.log("Generating recap...")
      const apiKey = import.meta.env.VITE_OPENAI_API_KEY
      console.log(apiKey)
      const response = await axios.post(
        "https://api.openai.com/v1/chat/completions",
        {
          model: "gpt-4",
          messages: [
            {
              role: "user",
              content: `You are a helpful assistant. Your task is to process journal entry data and return a structured JSON object based on the provided schema. 
    
  Here is the array of journal entry objects:
  ${JSON.stringify(monthEntries)}
  
  This array contains journal entries for the month of ${recapMonth}. Your task is to create a monthly recap in the context of an emotional journal app. 
  
  ### Instructions:
  1. **ONLY** return the JSON object. Do not include any additional text, explanations, or comments. 
  2. The JSON should strictly match this schema:
     {
        "recapName": "string",
        "month": "Date",
        "moodSummary": { "😊": number, "😔": number }, //<-Example, give me the ACTUAL emoji count of the input
        "summary": "string",
        "favoriteDay": { "date": "Date", "description": "string" },
        "totalEntries": number
     }
  3. Ensure all fields in the JSON object are valid and formatted properly.
  4. If you encounter any missing or ambiguous data in the input, make reasonable assumptions but adhere to the schema.
  
  ### Example Output:
  {
    "recapName": "Your Monthly Reflection",
    "month": "2024-11-01T00:00:00.000Z",
    "moodSummary": { "😊": 5, "😔": 2, "🤣": 3 },
    "summary": "...", (this should be the bulk of the text)
    "favoriteDay": { "date": "2024-11-05T00:00:00.000Z", "description": "..." },
    "totalEntries": 10
  }
  
  Return only the JSON object as shown above. Use language like "you...", do NOT say "user...", that is too cold. Almost you should be talking about the month recap in PAST tense`,
            },
          ],
        },
        {
          headers: {
            Authorization: `Bearer ${apiKey}`,
            "Content-Type": "application/json",
          },
        }
      )
    
      const content = response.data.choices?.[0]?.message?.content
      if (!content) throw new Error("No valid response from OpenAI")
    
      const recapData = JSON.parse(content)
    
      const recapsRef = ref(db, `${userId}/recap`)
      await set(recapsRef, recapData)
    
      setRecaps((prevRecaps) => [...prevRecaps, recapData])
      console.log("Recap created successfully:", recapData)
    } catch (error) {
      console.error("Error creating recap:", error.message)
      setError(error.message)
    }
  }
  

  const value = {
    user,
    userProfile,
    userEntries,
    loading,
    error,
    login,
    logout,
    fetchEntries,
    recaps, 
    deleteRecap, 
    fetchRecaps, 
    createRecap
  };

  return (
    <PepContext.Provider value={value}>
      {!loading && children}
    </PepContext.Provider>
  );
}