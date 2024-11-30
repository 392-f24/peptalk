import { getDatabase, ref, get, update, remove } from "firebase/database";
import firebase from "../firebase";

const database = getDatabase(firebase);

export const firebaseJournalService = {
  // Fetch a single entry by ID
  fetchEntry: async (userId, entryId) => {
    try {
      const db = getDatabase(firebase);
      const entryRef = ref(db, `${userId}/entries/${entryId}`);
      const snapshot = await get(entryRef);

      if (snapshot.exists()) {
        return snapshot.val();
      }
      return null;
    } catch (error) {
      console.error("Error fetching entry:", error);
      throw error;
    }
  },

  // Update entry summary
  updateEntrySummary: async (userId, entryId, summary) => {
    try {
      const db = getDatabase(firebase);
      const entryRef = ref(db, `${userId}/entries/${entryId}`);
      await update(entryRef, { summary });
    } catch (error) {
      console.error("Error updating entry:", error);
      throw error;
    }
  },

  // Delete entry
  deleteEntry: async (userId, entryId) => {
    try {
      const db = getDatabase(firebase);
      const entryRef = ref(db, `${userId}/entries/${entryId}`);
      await remove(entryRef);
    } catch (error) {
      console.error("Error deleting entry:", error);
      throw error;
    }
  },
};
