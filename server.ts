import express from 'express'
import bodyParser from 'body-parser'
import rateLimit from 'express-rate-limit'
import jwt from 'jsonwebtoken'

import userRoutes from './routes/users'
import accountRoutes from './routes/account'
import taskRoutes from './routes/tasks'
import logsRoutes from './routes/logs'

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

app.use('/account', accountRoutes)
app.use('/users', userRoutes)
app.use('/tasks', taskRoutes)
app.use('/logs', logsRoutes)

app.listen(3000, () => {
    console.log('Server started on interal port 3000')
})

