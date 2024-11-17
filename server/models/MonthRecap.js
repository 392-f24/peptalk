import mongoose from "mongoose";

const monthRecapSchema = new mongoose.Schema({
    userId: { type: String, required: true },
    recapName: { type: String, required: true },
    month: { type: Date, required: true },
    moodSummary: { type: Map, of: Number }, // Emoji summary, e.g., { 😊: 10, 😔: 5 }
    summary: { type: String, required: true }, 
    favoriteDay: {
        date: { type: Date, required: false },
        description: { type: String, required: false }
    },
    totalEntries: { type: Number, required: true } 
});

const monthRecap = mongoose.model('MonthRecap', monthRecapSchema)
export default monthRecap