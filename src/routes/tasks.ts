import express from 'express'
const router = express.Router()
import checkTokenMiddleware, { TokenRequest } from '../middleware/tokenCheck'
import Task from '../models/Task'
import { validateColorString, validateTaskNameNotTaken } from '../validation/taskValidations'

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
    const { userId } = req.decodedToken!
    if (!taskName){
        return res.status(400).json({ success: false, error: 'Query parameter "taskName" was not provided'})
    }
    const task = await Task.findOne({ where: { taskName, userId } })
    if (!task) {
        return res.status(404).json({ success: false, error: `task with name ${taskName} on userId ${userId} not found` })
    }
    else {
        return res.json({ success: true, task })
    }
})

router.post('/create', checkTokenMiddleware, async (req: TokenRequest, res) => {
    const { taskName, rgbTaskColor, weeklyTargetMinutes }: { taskName?: string, rgbTaskColor?: string, weeklyTargetMinutes?: number } = req.body
    // decodedToken is guaranteed by the middleware to be valid or else next would not be called
    const { userId } = req.decodedToken!
    if (!validateColorString(rgbTaskColor)) {
        return res.status(400).json({ success: false, error: `rgbTaskColor provided ${rgbTaskColor} was invalid. format should be a valid hexadecimal RGBA string (length 8)` })
    }
    if (!(await validateTaskNameNotTaken(taskName))) {
        return res.status(400).json({ success: false, error: `taskName ${taskName} was taken by an existing task` })
    }
    if (!weeklyTargetMinutes) {
        // otherwise would simply set to 0 silently (do not like silently failing/default behaviour where it can be easily specified)
        return res.status(400).json({ success: false, error: 'weeklyTargetMinutes was not provided' })
    }
    try {
        const task = await Task.create({
            userId,
            taskName: taskName!,
            rgbTaskColor,
            weeklyTargetMinutes: weeklyTargetMinutes!,
            isActive: true,
        })
        return res.json({ success: true, task })
    } catch (error) {
        console.log(error)
        return res.status(500).json({ success: false, error: 'Internal server error' })
    }
})

router.patch('deactivate/:taskId', checkTokenMiddleware, async (req, res) => {
    const { taskId } = req.params
    const task = await Task.findByPk(Number(taskId))
    if (!task) {
        return res.status(404).json({ success: false, error: `Task with id ${taskId} does not exist` })
    }
    else {
        try {
            const updatedTask = await task.update({
                isActive: false
            })
            res.json({ success: true, task: updatedTask })
        } catch (error) {
            console.log(error)
            res.status(500).json({ success: false, error: 'Internal server error' })
        }
    }
})

router.patch('/deactivate/', checkTokenMiddleware, async (req: TokenRequest, res) => {
    const { taskName }: { taskName?: string } = req.query
    const { userId } = req.decodedToken!
    if (!taskName) {
        return res.status(400).json({ success: false, error: 'Query parameter "taskName" was not provided' })
    }
    const task = await Task.findOne({ where: { taskName, userId } })
    if (!task) {
        return res.status(404).json({ success: false, error: `Task with taskName ${taskName} does not exist` })
    }
    else {
        try {
            const updatedTask = await task.update({
                isActive: false
            })
            res.json({ success: true, task: updatedTask })
        } catch (error) {
            console.log(error)
            res.status(500).json({ success: false, error: 'Internal server error' })
        }
    }
})

router.patch('/change-name', checkTokenMiddleware, async (req, res) => {
    const { newName }: { newName?: string } = req.query
    const { taskId }: { taskId?: number } = req.body
    if (!taskId) {
        return res.status(400).json({ success: false, error: '"taskId" not provided in request body' })
    }
    if (!newName) {
        return res.status(400).json({ success: false, error: 'Query parameter "newName" was not provided' })
    }
    if (newName.length > 100) {
        return res.status(400).json({ success: false, error: 'newName max length is 100 characters' })
    }
    const task = await Task.findByPk(taskId)
    if (!task) {
        return res.status(404).json({ success: false, error: `task with id ${taskId} not found` })
    }
    if (task.taskName === newName) {
        return res.status(400).json({ success: false, error: `new task name ${newName} is already taken by task with id ${task.id}` })
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
