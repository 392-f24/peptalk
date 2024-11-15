import Entry from "../models/Entry.js";

export const entryData = async (req, res) => {
    const userId = req.body.userId
    try {
        const entries = await Entry.find({userId: userId})
        if (entries.length===0) {
            return res.status(404).json({success: false, mesage: "No entries found"})
        }
        return res.status(200).json({success: true, entries})
    } catch (error) {
        return res.status(500).json({success: false, message: error.message})
    }
}

export const createEntry = async (req, res) => {
    const { name, date, emoji, description, audio } = req.body 
    const userId = req.body.userId
    try {
        const newEntry = await Entry.create({ userId: userId, date: date, name: name, description: description, emoji: emoji, audio: audio})
        return res.status(201).json({success: true, newEntry})
    } catch (error) {
        return res.status(500).json({success: false, message: error.message})
    }
}

export const updateEntry = async (req, res) => {
    const userId = req.body.userId
    const { entryId, updatedName, updatedDate, updatedEmoji, updatedDescription, updatedAudio } = req.body 
    try {
        const entry = await Entry.findOne({_id: entryId, userId: userId})
        if (!entry) {
            return res.status(404).json({success: false, message: "No entry found"})
        }
        if (updatedName !== undefined) entry.name = updatedName
        if (updatedDate !== undefined) entry.date = updatedDate
        if (updatedEmoji !== undefined) entry.emoji = updatedEmoji
        if (updatedDescription !== undefined) entry.description = updatedDescription
        if (updatedAudio !== undefined) entry.audio = updatedAudio
        await entry.save() 
        return res.status(200).json({success: true, message: "Entry updated succesfully"})

    } catch (error) {
        res.status(500).json({success: false, message: error.message})
    }
}

export const deleteEntry = async (req, res) => {
    const userId = req.body.userId
    const { entryId } = req.body 
    try {
        const entry = await Entry.findOneAndDelete({_id: entryId, userId: userId})
        if (!entry) {
            return res.status(404).json({success: false, message: "Entry not found"})
        }
        return res.status(200).json({success: true, message: "Entry deleted succesfully"})
    } catch (error) {
        res.status(500).json({success: false, message: error.message})

    }
}