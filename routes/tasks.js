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
        res.status(404).json({ success: false, error: `task with id ${task} not found` })
    }
    else {
        res.json({ success: true, task })
    }
})

router.get('/', checkTokenMiddleware, async (req, res) => {
    const { taskName } = req.query
    const { userId } = req.body
    if (!userId){
        return res.status(400).json({success: false, error: "userId was not in the request body. userId must be provided to query tasks by name"})
    }
    const task = await Task.findOne({ where: { taskName, userId } })
    if (!task) {
        res.status(404).json({ success: false, error: `task with name ${taskName} on userId ${userId} not found` })
    }
    else {
        res.json({ success: true, task })
    }
})

router.patch('/change-name', checkTokenMiddleware, async (req, res) => {
    const { oldName, newName } = req.query
    const { taskId } = req.body
    if (!taskId){
        return res.status(400).json({success: false, error: 'taskId not supplied in request body'})
    }
    if (!oldName || !newName) {
        return res.status(400).json({
            success: false, error: `
            ${!oldName ? 'parameter oldName not supplied' : ''}
            ${!newName ? 'parameter newName not supplied' : ''}
        ` })
    }
    if (newName.length > 100){
        return res.status(400).json({ success: false, error: 'newName max length is 100 characters'})
    }
    const task = await Task.findByPk({taskId})
    if (!task) {
        return res.status(404).json({ success: false, error: `taskName ${taskName} not found` })
    }
    task.update({
        taskName: newName
    })
})

module.exports = router
