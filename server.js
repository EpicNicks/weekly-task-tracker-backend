const express = require('express')
const bodyParser = require('body-parser')

const userRoutes = require('./routes/users')
const accountRoutes = require('./routes/account')
const taskRoutes = require('./routes/tasks')
const logsRoutes = require('./routes/logs')

const app = express()

app.disable('x-powered-by')

app.use(bodyParser.json())

app.use('/account', accountRoutes)
app.use('/users', userRoutes)
app.use('/tasks', taskRoutes)
app.use('/logs', logsRoutes)

app.listen(3000, () => {
    console.log('Server started on interal port 3000')
})

