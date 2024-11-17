import express from 'express'
import { recapData, createRecap, deleteRecap, generateRecap } from '../controllers/recapControllers.js'

const recapRoutes = express.Router() 

recapRoutes.get('/recap-data', recapData)
recapRoutes.post('/create-recap', createRecap)
recapRoutes.delete('/delete-recap', deleteRecap)
recapRoutes.post('/generate-recap', generateRecap)

export default recapRoutes 
