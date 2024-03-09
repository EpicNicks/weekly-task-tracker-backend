const express = require('express')
const router = express.Router()
const Task = require('../models/Task')
const checkTokenMiddleware = require('../middleware/tokenCheck')

router.get('/all', checkTokenMiddleware, async (req, res) => {
    res.send(await Task.findAll())
})

router.get(':id', checkTokenMiddleware, async (req, res) => {
    const { id } = req.params
    const task = await Task.findOne({ where: { id } })
    if (!task) {
        res.status(404).json({ error: `task with id ${task} not found` })
    }
    else {
        res.json(task)
    }
})

// expects query param taskName
router.get('/', checkTokenMiddleware, async (req, res) => {
    const { taskName } = req.query
    const task = await Task.findOne({ where: { taskName } })
    if (!task) {
        res.status(404).json({ error: `task with name ${taskName} not found` })
    }
    else {
        res.json(task)
    }
})

module.exports = router
