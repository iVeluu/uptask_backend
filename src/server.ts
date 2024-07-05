import express from 'express'
import dotenv from 'dotenv';
import cors from 'cors'
import { connectDB } from './config/db';
import projectRoutes from './routes/projectRoutes'
import { corsConfig } from './config/cors';

dotenv.config()

connectDB()

const app = express();

//Habilitar las opciones del cors
app.use(cors(corsConfig))
//Habilitar la lectura de json
app.use(express.json())

///routes
app.use('/api/projects', projectRoutes)

export default app

//DESDE PC