import mongoose from "mongoose";
const userSchema = new mongoose.Schema({
    userId: { type: String, required: true, unique: true},
    name: { type: String, required: true }, 
})

const User = mongoose.model('User', userSchema)
export default User