import mongoose from 'mongoose'
const entrySchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, 
    name: { type: String, required: true }, 
    date: { type: Date, default: Date.now() }, 
    emoji: { type: String, required: true }, 
    description: { type: String, required: true }, 
    bookmarked: { type: Boolean, default: false }, 
    audio: { type: String }
})


const Entry = mongoose.model('Entry', entrySchema)
export default Entry 