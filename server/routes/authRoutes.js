import express from 'express'
import { signup } from '../controllers/authControllers.js'

const authRoutes = express.Router() 

authRoutes.post('/signup', signup)

export default authRoutes 