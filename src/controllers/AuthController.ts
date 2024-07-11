import { Request, Response } from "express";
import { checkPassword, hashPassword } from "../utils/auth";
import User from "../models/User";
import Token from "../models/Token";
import { generateToken } from "../utils/token";
import { AuthEmail } from "../emails/AuthEmail";
import { generateJWT } from "../utils/jwt";

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

            //Enviar el email
            AuthEmail.sendConfirmationEmail({
                email: user.email,
                name: user.name,
                token: token.token
            })

            await Promise.allSettled([user.save(), token.save()])
            res.send('Usuario creado correctamente, revisa tu correo para confirmar la cuenta')
        } catch (error) {
            res.status(500).json({error: 'Hubo un error'})
        }
    }

    static confirmAccount = async ( req: Request, res: Response ) => {
        try {
            const { token } = req.body
            const tokenExist = await Token.findOne({token})
            if(!tokenExist){
                const error = new Error('Token no válido')
                return res.status(404).json({error: error.message})
            }
            const userToConfirm = await User.findById(tokenExist.user)
            userToConfirm.confirmed = true
            await Promise.allSettled([userToConfirm.save(), tokenExist.deleteOne()])
            res.send('Cuenta Confirmada Correctamente')
        } catch (error) {
            res.status(500).json({error: 'Hubo un error'})
        }
    }

    static login = async ( req: Request, res: Response ) => {
        try {        
            const { email, password } = req.body

            //Ver si el usuario existe
            const user = await User.findOne({email})
            if(!user){
                const error = new Error('Usuario no Encontrado')
                return res.status(404).json({error: error.message})
            }
            
            //Confirmar si el usuario esta confirmado
            if(!user.confirmed){
                //Crear un nuevo token para que el usuario pueda confirmarse
                const token = new Token()
                token.user = user.id
                token.token = generateToken()
                await token.save()

            //Enviar el email 
            AuthEmail.sendConfirmationEmail({
                email: user.email,
                name: user.name,
                token: token.token
            })
                //Mostramos el error
                const error = new Error('La cuenta no ha sido confirmada, hemos enviado un e-mail de confirmación')
                return res.status(401).json({error: error.message})
            }

            //Revisar password 
            const isPasswordCorrect = await checkPassword(password, user.password)

            if(!isPasswordCorrect){
                //Mostramos el error
                const error = new Error('Password Incorrecto')
                return res.status(401).json({error: error.message})
            }

            const token = generateJWT({ id: user.id })

            res.send(token)

            res.send('Usuario encontrado, confirmado y el password es correcto')
        } catch (error) {
            res.status(500).json({error: 'Hubo un error'})
        }
    }

    static requestConfirmationCode = async ( req: Request, res: Response ) => {
        try {
            const { email } = req.body

            //Prevenir duplicados
            const user = await User.findOne({email})
            if(!user) {
                const error = new Error('El Usuario no esta registrado')
                return res.status(404).json({error: error.message})
            }

            if(user.confirmed) {
                const error = new Error('El Usuario ya esta confirmado')
                return res.status(403).json({error: error.message})
            }
            //Generar el Token
            const token = new Token()
            token.token = generateToken()
            token.user = user.id

            //Enviar el email
            AuthEmail.sendConfirmationEmail({
                email: user.email,
                name: user.name,
                token: token.token
            })

            await Promise.allSettled([user.save(), token.save()])
            res.send('Se envió un nuevo token a tu e-mail')
        } catch (error) {
            res.status(500).json({error: 'Hubo un error'})
        }
    }

    static forgotPassword = async ( req: Request, res: Response ) => {
        try {
            const { email } = req.body

            //Prevenir duplicados
            const user = await User.findOne({email})
            if(!user) {
                const error = new Error('El Usuario no esta registrado')
                return res.status(404).json({error: error.message})
            }

            //Generar el Token
            const token = new Token()
            token.token = generateToken()
            token.user = user.id
            await token.save()

            //Enviar el email
            AuthEmail.sendPasswordResetToken({
                email: user.email,
                name: user.name,
                token: token.token
            })

            res.send('Revisa tu e-mail para instrucciones')
        } catch (error) {
            res.status(500).json({error: 'Hubo un error'})
        }
    }

    static validateToken = async ( req: Request, res: Response ) => {
        try {
            const { token } = req.body
            const tokenExist = await Token.findOne({token})
            if(!tokenExist){
                const error = new Error('Token no válido')
                return res.status(404).json({error: error.message})
            }
            res.send('Token válido, define tu nuevo password')
        } catch (error) {
            res.status(500).json({error: 'Hubo un error'})
        }
    }

    static updatePasswordWithToken = async ( req: Request, res: Response ) => {
        try {
            const { token } = req.params
            const tokenExist = await Token.findOne({token})
            if(!tokenExist){
                const error = new Error('Token no válido')
                return res.status(404).json({error: error.message})
            }

            const user = await User.findById(tokenExist.user)
            user.password = await hashPassword(req.body.password)
            await user.save()
            await tokenExist.deleteOne()

            res.send('El password se modificó con correctamente')
        } catch (error) {
            res.status(500).json({error: 'Hubo un error'})
        }
    }
}