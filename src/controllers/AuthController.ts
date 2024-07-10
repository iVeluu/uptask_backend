import { Request, Response } from "express";
import { hashPassword } from "../utils/auth";
import User from "../models/User";
import Token from "../models/Token";
import { generateToken } from "../utils/token";

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

            //Generar el Token
            const token = new Token()
            token.token = generateToken()
            token.user = user.id

            await Promise.allSettled([user.save(), token.save()])
            res.send('Usuario creado correctamente, revisa tu correo para confirmar la cuenta')
        } catch (error) {
            res.status(500).json({error: 'Hubo un error'})
        }
    }
}