import User from "../models/User.js";

export const signup = async (req, res) => {
    const userId = req.body.userId 
    const { name } = req.body 
    try {
        const user = await User.findOne({ userId: userId })
        if (!user) {
            const user = await User.create({ userId: userId, name: name })
            return res.status(201).json({ success: true, user, message: "User added successfully" })
        }
        return res.status(200).json({ success: true, user, message: "User already exists" });
    } catch (error) {
        res.status(500).json({success: false, message: error.message})
    }
}