import express from 'express'
import dotenv from 'dotenv';
import morgan from 'morgan';
import cors from 'cors'
import { connectDB } from './config/db';
import authRoutes from './routes/authRoutes'
import projectRoutes from './routes/projectRoutes'
import { corsConfig } from './config/cors';

dotenv.config()

connectDB()

const app = express();

//Habilitar las opciones del cors
app.use(cors(corsConfig))

//loggin
app.use(morgan('dev'))

//Habilitar la lectura de json
app.use(express.json())

///routes
app.use('/api/auth', authRoutes)
app.use('/api/projects', projectRoutes)

export default app

//DESDE PC