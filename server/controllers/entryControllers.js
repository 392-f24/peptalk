import Entry from "../models/Entry.js";

export const entryData = async (req, res) => {
    const userId = req.query.userId
    console.log(userId)
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
    const { name, date, emoji, summary, transcript } = req.body 
    const userId = req.body.userId
    try {
        const newEntry = await Entry.create({ userId: userId, date: date, name: name, transcript: transcript, emoji: emoji, summary: summary})
        return res.status(201).json({success: true, newEntry})
    } catch (error) {
        return res.status(500).json({success: false, message: error.message})
    }
}

export const updateEntry = async (req, res) => {
    const userId = req.body.userId
    const { entryId, updatedSummary } = req.body 
    try {
        const entry = await Entry.findOne({_id: entryId, userId: userId})
        if (!entry) {
            return res.status(404).json({success: false, message: "No entry found"})
        }
        if (updatedSummary !== undefined) entry.summary = updatedSummary
        await entry.save() 
        return res.status(200).json({success: true, message: "Entry updated succesfully"})

    } catch (error) {
        res.status(500).json({success: false, message: error.message})
    }
}

export const deleteEntry = async (req, res) => {
    const userId = req.query.userId; 
    const entryId = req.query.entryId; 
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