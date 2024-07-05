import { CorsOptions } from "cors"


//Permitir conexiones 
export const corsConfig : CorsOptions = {
    origin: function( origin, callback ) {
        if( origin === process.env.FRONTEND_URL || 'http://localhost:4000'){
            callback(null, true)
        } else {
            callback(new Error('Error de CORS'))
        }
    }
}