import { Request, Response } from "express";
import Project from "../models/Project";

export class ProjectController {

    static createProject = async ( req: Request, res: Response ) => {

        console.log(req.user)
        //Instanciar el proyecto
        const project = new Project(req.body)
        try {
            await project.save()
            res.send('Proyecto Creado Correctamente')
        } catch (error) {
            console.log(error)
        }
    }


    static getAllProjects = async ( req: Request, res: Response ) => {
        try {
            const projects = await Project.find({})
            res.json(projects)
        } catch (error) {
            console.log(error)
        }
    }

    static getProductById = async ( req: Request, res: Response ) => {
        try {
            const { id } = req.params
            const project = await Project.findById(id).populate('tasks')

            if(!project){
                const error = new Error('Proyecto No Encontrado')
                return res.status(404).json({error : error.message})
            }
            res.json(project)
        } catch (error) {
            console.log(error)
        }
    }

    static updateProject = async ( req: Request, res: Response ) => {
        const { id } = req.params
        try {
            const project = await Project.findById(id)
            if(!project){
                const error = new Error('Proyecto No Encontrado')
                return res.status(404).json({error : error.message})
            }
            project.projectName = req.body.projectName
            project.clientName = req.body.clientName
            project.description = req.body.description
            await project.save()
            res.send('Proyecto Actualizado')
        } catch (error) {
            console.log(error)
        }
    }

    static deleteProject = async ( req: Request, res: Response ) => {
        const { id } = req.params
        try {
            const project = await Project.findById(id)

            if(!project){
                const error = new Error('Proyecto No Encontrado')
                return res.status(404).json({error : error.message})
            }

            await project.deleteOne()
            res.send('Proyecto Eliminado')
        } catch (error) {
            console.log(error)
        }
    }
}