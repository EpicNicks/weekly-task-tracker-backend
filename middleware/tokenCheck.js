const jwt = require('jsonwebtoken')

const checkTokenMiddleware = (req, res, next) => {
    const authHeader = req.headers['authorization']
    // expecting 'Bearer {actual token}'
    const token = authHeader && authHeader.split(' ')[1]
    if (token === null){
        // unauthorized
        return res.sendStatus(401)
    }
    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) {
            return res.sendStatus(403) // Token authentication failed (Forbidden)
        }
        req.user = user // Attach the user object to the request for later use
        next() // Pass control to the next middleware or route handler
    })
}


module.exports = checkTokenMiddleware