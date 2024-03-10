import { Request, Response, NextFunction } from 'express'
import jwt, { JwtPayload } from 'jsonwebtoken'

export interface TokenRequest extends Request {
    user?: string | JwtPayload
}

export default function checkTokenMiddleware(
    req: TokenRequest,
    res: Response,
    next: NextFunction
) {
    const authHeader = req.headers.authorization
    // expecting 'Bearer {actual token}'
    const token = authHeader && authHeader.split(' ')[1]
    if (!token) {
        // unauthorized
        return res.sendStatus(401)
    }
    jwt.verify(token, process.env.JWT_SECRET!, (err, user) => {
        if (!!err) {
            console.log(err)
            return res.sendStatus(403) // Token authentication failed (Forbidden)
        }
        console.log(user)
        req.user = user // Attach the user object to the request for later use
        next() // Pass control to the next middleware or route handler
    })
}
