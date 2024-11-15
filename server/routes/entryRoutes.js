import express from 'express'
import { entryData, createEntry, updateEntry, deleteEntry } from '../controllers/entryControllers.js'

const entryRoutes = express.Router() 

entryRoutes.get('/entry-data', entryData)
entryRoutes.post('/create-entry', createEntry)
entryRoutes.put('/update-entry', updateEntry)
entryRoutes.delete('/delete-entry', deleteEntry)

export default entryRoutes 
