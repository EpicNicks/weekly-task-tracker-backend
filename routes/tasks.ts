import express from 'express'
const router = express.Router()
import checkTokenMiddleware, { TokenRequest } from '../middleware/tokenCheck'
import Task from '../models/Task'

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

router.get('/', checkTokenMiddleware, async (req: TokenRequest, res) => {
    const { taskName }: { taskName?: string } = req.query
    const { userId }: { userId?: number } = req.body
    if (!userId) {
        return res.status(400).json({ success: false, error: 'userId was not in the request body. userId must be provided to query tasks by name' })
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
    const { newName }: { newName?: string } = req.query
    const { taskId }: { taskId?: number } = req.body
    if (!taskId) {
        return res.status(400).json({ success: false, error: 'taskId not supplied in request body' })
    }
    if (!newName) {
        return res.status(400).json({ success: false, error: 'parameter newName not supplied' })
    }
    if (newName.length > 100) {
        return res.status(400).json({ success: false, error: 'newName max length is 100 characters' })
    }
    const task = await Task.findByPk(taskId)
    if (!task) {
        return res.status(404).json({ success: false, error: `task with id ${taskId} not found` })
    }
    try {
        const updatedTask = await task.update({ taskName: newName })
        return res.json({ success: true, task: updatedTask })
    } catch (error) {
        console.log(error)
        return res.status(500).json({ success: false, error: 'internal server error' })
    }
})

export default router
