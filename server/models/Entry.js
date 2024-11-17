import mongoose from 'mongoose'
const entrySchema = new mongoose.Schema({
    userId: { type: String, required: true },
    name: { type: String, required: true }, 
    date: { type: Date, default: Date.now() }, 
    emoji: { type: String, required: true }, 
    summary: { type: String, required: true }, 
    transcript: { type: String, required: true}
})


const Entry = mongoose.model('Entry', entrySchema)
export default Entry 