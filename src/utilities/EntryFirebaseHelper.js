import { getDatabase, ref, get, update, remove } from "firebase/database";
import firebase from "../firebase";

const database = getDatabase(firebase);

export const firebaseJournalService = {
  // Fetch a single entry by ID
  fetchEntry: async (userId, entryId) => {
    try {
      console.log("Fetching entry with:", { userId, entryId }); // Debug log

      const entryRef = ref(database, `${userId}/entries/${entryId}`);
      console.log("Database path:", `${userId}/entries/${entryId}`); // Debug log

      const snapshot = await get(entryRef);

      if (snapshot.exists()) {
        console.log("Entry found:", snapshot.val()); // Debug log
        return {
          id: entryId,
          ...snapshot.val(),
        };
      }
      console.log("No entry found"); // Debug log
      return null;
    } catch (error) {
      console.error("Error fetching entry:", error);
      throw error;
    }
  },

  // Update entry summary
  updateEntrySummary: async (userId, entryId, summary) => {
    try {
      const entryRef = ref(database, `${userId}/entries/${entryId}`);
      await update(entryRef, { summary });
    } catch (error) {
      console.error("Error updating entry:", error);
      throw error;
    }
  },

  // Delete entry
  deleteEntry: async (userId, entryId) => {
    try {
      const entryRef = ref(database, `${userId}/entries/${entryId}`);
      await remove(entryRef);
    } catch (error) {
      console.error("Error deleting entry:", error);
      throw error;
    }
  },
};
