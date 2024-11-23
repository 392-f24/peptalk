import { create } from "zustand";
import axiosInstance from "../utilities/axiosHelper";

const useStore = create((set, get) => ({
  //unique googleID (saved at login to this state + local storage)
  userId: null,
  name: null,
  setUserId: (id) => set({ userId: id }),
  setName: (name) => set({ name: name }),

  //Global state
  entries: [],
  recaps: [],

  //Put googleUid into mongoDB and then populates userId state, doesn't create new User in mongo if googleUID already exists

  login: async (handleGoogleLogin, navigate) => {
    try {
      const { googleUid, name } = await handleGoogleLogin();

      console.log(import.meta.env.VITE_API_BASE_URL);

      const response = await axiosInstance.post("/auth/signup", {
        userId: googleUid,
        name,
      });

      if (response.status === 200) {
        set({ userId: googleUid, name: name });
        localStorage.setItem("userId", googleUid);
        localStorage.setItem("name", name);
        navigate("/dashboard");
      } else {
        console.error("Failed to add user to MongoDB:", response.data.message);
      }
    } catch (error) {
      console.error(
        "Error during login process:",
        error.response?.data || error.message
      ); // Improved error handling
    }
  },

  //fetchAll, create, update, delete for entries state

  fetchEntries: async () => {
    try {
      const userId = get().userId;
      const response = await axiosInstance.get("/entry/entry-data", {
        params: { userId },
      });
      set({ entries: response.data.entries });
    } catch (error) {
      console.error(
        "Error fetching entries:",
        error.response?.data || error.message
      );
    }
  },

  createEntry: async (name, date, emoji, summary, transcript) => {
    try {
      const userId = get().userId;
      const response = await axiosInstance.post("/entry/create-entry", {
        userId,
        name,
        date,
        emoji,
        summary,
        transcript,
      });
      set((state) => ({
        entries: [...state.entries, response.data.newEntry],
      }));
    } catch (error) {
      console.error(
        "Error creating entry:",
        error.response?.data || error.message
      );
    }
  },

  updateEntry: async (entryId, updatedTranscript) => {
    try {
      const userId = get().userId;
      const response = await axiosInstance.put("/entry/update-entry", {
        userId,
        entryId,
        updatedTranscript,
      });
      set((state) => {
        const updatedEntries = state.entries.map((entry) => {
          return entry._id === entryId
            ? { ...entry, transcript: updatedTranscript }
            : entry;
        });
        return { entries: updatedEntries };
      });
    } catch (error) {
      console.error(
        "Error updating entry:",
        error.response?.data || error.message
      );
    }
  },

  deleteEntry: async (entryId) => {
    try {
      const userId = get().userId;
      const response = await axiosInstance.delete("/entry/delete-entry", {
        params: { userId, entryId },
      });
      set((state) => {
        const deleteOneEntry = state.entries.filter(
          (entry) => entry._id !== entryId
        );
        return { entries: deleteOneEntry };
      });
    } catch (error) {
      console.error(
        "Error deleting entry:",
        error.response?.data || error.message
      );
    }
  },

  //fetchAll, create, delete for recaps state

  fetchRecaps: async () => {
    try {
      const userId = get().userId;
      const response = await axiosInstance.get("/recap/recap-data", {
        params: { userId },
      });
      set({ recaps: response.data.recaps });
    } catch (error) {
      console.error(
        "Error fetching recaps:",
        error.response?.data || error.message
      );
    }
  },

  deleteRecap: async (recapId) => {
    try {
      const userId = get().userId;
      const response = await axiosInstance.delete("/recap/delete-recap", {
        params: { userId, recapId },
      });
      set((state) => {
        const deleteOneRecap = state.recaps.filter(
          (recap) => recap._id !== recapId
        );
        return { recaps: deleteOneRecap };
      });
    } catch (error) {
      console.error(
        "Error deleting recap:",
        error.response?.data || error.message
      );
    }
  },

  createRecap: async (monthEntries, recapMonth) => {
    try {
      const userId = get().userId;

      //First do openAI call to generate the recap, then create (state+backend) with create-recap
      console.log("Pressed button");
      const responseGenAI = await axiosInstance.post("/recap/generate-recap", {
        monthEntries,
        recapMonth,
      });
      console.log(responseGenAI);
      const {
        recapName,
        month,
        moodSummary,
        summary,
        favoriteDay,
        totalEntries,
      } = responseGenAI.data.recap;
      const responseCreate = await axiosInstance.post("/recap/create-recap", {
        userId,
        recapName,
        month,
        moodSummary,
        summary,
        favoriteDay,
        totalEntries,
      });
      set((state) => {
        return { recaps: [...state.recaps, responseCreate.data.newRecap] };
      });
    } catch (error) {
      console.error(
        "Error creating recap:",
        error.response?.data || error.message
      );
    }
  },
}));

export default useStore;
