import express from 'express'
import bodyParser from 'body-parser'
import rateLimit from 'express-rate-limit'
import jwt from 'jsonwebtoken'

import userRoutes from './src/routes/users'
import accountRoutes from './src/routes/account'
import taskRoutes from './src/routes/tasks'
import logsRoutes from './src/routes/logs'

const app = express()

app.disable('x-powered-by')

app.use(bodyParser.json())
app.use(rateLimit({
    skip: (req) => {
        const token = req.headers.authorization?.split(' ')?.[1]
        if (!token){
            return false
        }
        let isValid = false
        jwt.verify(token, process.env.JWT_SECRET!, (err) => {
            isValid = !err
        })
        return isValid
    },
    windowMs: 3 * 1000,
    limit: 1,
    standardHeaders: 'draft-7',
    legacyHeaders: false,
    message: 'Too many requests, please try again later.'
}))
app.use('/api/liveness', async (req, res) => {
        res.send('alive')
})
app.use('/api/account', accountRoutes)
app.use('/api/users', userRoutes)
app.use('/api/tasks', taskRoutes)
app.use('/api/logs', logsRoutes)

app.listen(3000, () => {
    console.log('Server started on interal port 3000')
})

