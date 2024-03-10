import { Request, Response } from 'express'
import jwt from 'jsonwebtoken'

interface DecodedToken {
    userId: number
}

export interface TokenRequest extends Request {
    decodedToken?: DecodedToken
}

export default function checkTokenMiddleware(req: TokenRequest, res: Response<any, Record<string, any>>, next: () => void) {
    const authHeader = req.headers.authorization
    // expecting 'Bearer {actual token}'
    const token = authHeader && authHeader.split(' ')[1]
    if (!token) {
        // unauthorized
        return res.sendStatus(401)
    }
    jwt.verify(token, process.env.JWT_SECRET!, (err, decodedToken) => {
        if (err) {
            console.log(err)
            return res.sendStatus(403) // Token authentication failed (Forbidden)
        }
        console.log(decodedToken)
        req.decodedToken = decodedToken as DecodedToken // Attach the user object to the request for later use
        next() // Pass control to the next middleware or route handler
    })
}
