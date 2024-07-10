import { Request, Response } from "express";
import { hashPassword } from "../utils/auth";
import User from "../models/User";

export class AuthController {


    static createAccount = async ( req: Request, res: Response ) => {
        try {
            const { password, email } = req.body

            //Prevenir duplicados
            const userExist = await User.findOne({email})
            if(userExist) {
                const error = new Error('El Usuario ya esta registrado')
                return res.status(409).json({error: error.message})
            }

            //Crear un usuario
            const user = new User(req.body)
            //Hashear un password
            user.password = await hashPassword(password)
            await user.save()
            res.send('Usuario creado correctamente, revisa tu correo para confirmar la cuenta')
        } catch (error) {
            res.status(500).json({error: 'Hubo un error'})
        }
    }
}