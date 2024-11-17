import { create } from "zustand";
import axiosInstance from "../utilities/axiosHelper";


const useStore = create((set, get) => ({
  userId: null, 
  entries: [], 
  recaps: [],

  setUserId: (id) => set({ userId: id }),

  fetchEntries: async () => {
    try {
      const userId = get().userId
      const response = await axiosInstance.get('/entry/entry-data', {
        params: { userId },
      });
      set({ entries: response.data.entries });
    } catch (error) {
      console.error('Error fetching entries:', error.response?.data || error.message);
    }
  },
  

  createEntry: async (name, date, emoji, summary, transcript) => {
    try {
        const userId = get().userId 
        const response = await axiosInstance.post('/entry/create-entry', { userId, name, date, emoji, summary, transcript })
        set((state)=>({
            entries: [...state.entries, response.data.newEntry]
        }))
    } catch (error) {
        console.error('Error creating entry:', error.response?.data || error.message);
    }
  }, 

  updateEntry: async (entryId, updatedTranscript) => {
    try {
        const userId = get().userId 
        const response = await axiosInstance.put('/entry/update-entry', { userId, entryId, updatedTranscript })
        set((state)=>{
            const updatedEntries = state.entries.map(entry=>{
                return (entry._id===entryId) ? {...entry, transcript: updatedTranscript} : entry
            })
            return { entries: updatedEntries }
        })
    } catch (error) {
        console.error('Error updating entry:', error.response?.data || error.message);
    }
  }, 


  deleteEntry: async (entryId) => {
    try {
        const userId = get().userId 
        const response = await axiosInstance.delete('/entry/delete-entry', {
            params: { userId, entryId }
        })
        set((state)=>{
            const deleteOneEntry = state.entries.filter(entry => entry._id!==entryId)
            return { entries: deleteOneEntry }
        })
    } catch (error) {
        console.error('Error deleting entry:', error.response?.data || error.message);
    }
  }


}));

export default useStore;
