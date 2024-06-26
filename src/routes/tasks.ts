import express from 'express'
const router = express.Router()
import checkTokenMiddleware, { TokenRequest } from '../middleware/tokenCheck'
import Task from '../models/Task'
import { validateColorString, validateTaskNameNotTaken } from '../validation/taskValidations'
import DailyLog from '../models/DailyLog'
import { DateTime } from 'luxon'

router.get('/all', checkTokenMiddleware, async (req, res) => {
    res.json({ success: true, value: await Task.findAll() })
})

router.get('/active', checkTokenMiddleware, async (req, res) => {
    res.json({ success: true, value: await Task.findAll({ where: { isActive: true } }) })
})

router.get('/total-progress/:taskId', checkTokenMiddleware, async (req, res) => {
    const { taskId } = req.params
    try {
        const sumMinutes = await DailyLog.sum('dailyTimeMinutes', { where: { taskId } })
        res.json({ success: true, value: sumMinutes })
    } catch (error) {
        console.log(error)
        res.status(500).json({ success: false, error: 'Internal Server Error' })
    }
})

router.get(':id', checkTokenMiddleware, async (req, res) => {
    const { id } = req.params
    const task = await Task.findOne({ where: { id } })
    if (!task) {
        res.status(404).json({ success: false, error: `task with id ${task} not found` })
    }
    else {
        res.json({ success: true, value: task })
    }
})

router.get('/', checkTokenMiddleware, async (req: TokenRequest, res) => {
    const { taskName }: { taskName?: string } = req.query
    const { userId } = req.decodedToken!
    if (!taskName) {
        return res.status(400).json({ success: false, error: 'Query parameter "taskName" was not provided' })
    }
    const task = await Task.findOne({ where: { taskName, userId } })
    if (!task) {
        return res.status(404).json({ success: false, error: `task with name ${taskName} on userId ${userId} not found` })
    }
    else {
        return res.json({ success: true, value: task })
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
    if (weeklyTargetMinutes === undefined) {
        return res.status(400).json({ success: false, error: 'weeklyTargetMinutes was not provided' })
    }
    try {
        const numActiveTasks = await Task.count({ where: { userId, isActive: true } })
        const numTotalTasks = await Task.count({ where: { userId } })
        if (numActiveTasks >= 50) {
            return res.status(400).json({ success: false, error: `User ${userId} has reached the maximum number of active tasks` })
        }
        if (numTotalTasks >= 200) {
            // should always have inactive ones if the total is 200+ but the total active is <= 50
            const inactiveTask = await Task.findOne({ where: { isActive: false } })
            if (inactiveTask) {
                await inactiveTask.destroy()
                const numLogsToDestroy = await DailyLog.destroy({ where: { taskId: inactiveTask.id } })
                console.log(`Destroyed ${numLogsToDestroy} logs`)
            }
        }

        const task = await Task.create({
            userId,
            taskName: taskName!,
            rgbTaskColor,
            weeklyTargetMinutes: weeklyTargetMinutes!,
            createdDate: DateTime.now().toISODate(),
            isActive: true,
        })
        return res.json({ success: true, value: task })
    } catch (error) {
        console.log(error)
        return res.status(500).json({ success: false, error: 'Internal server error' })
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
            res.json({ success: true, value: updatedTask })
        } catch (error) {
            console.log(error)
            res.status(500).json({ success: false, error: 'Internal server error' })
        }
    }
})

router.patch('/deactivate/:taskId', checkTokenMiddleware, async (req, res) => {
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
            res.json({ success: true, value: updatedTask })
        } catch (error) {
            console.log(error)
            res.status(500).json({ success: false, error: 'Internal server error' })
        }
    }
})

router.patch('/update-task/:taskId', checkTokenMiddleware, async (req, res) => {
    const { taskId } = req.params
    const { taskName, rgbTaskColor, weeklyTargetMinutes } = req.body
    if (!taskId || !taskName || !rgbTaskColor || weeklyTargetMinutes === undefined) {
        return res.status(400).json({
            success: false, error: `missing parameters in request. received: 
            taskId: ${taskId}, taskName: ${taskName}, rgbTaskColor: ${rgbTaskColor}, weeklyTargetMinutes: ${weeklyTargetMinutes}`
        })
    }
    if (!validateColorString(rgbTaskColor)) {
        return res.status(400).json({ success: false, error: 'rgbTaskColor did not fit correct format len 8 hex string' })
    }
    try {
        const task = await Task.findByPk(taskId)
        if (!task) {
            return res.status(404).json({ success: false, error: '' })
        }
        const updatedTask = task.update({ taskName, rgbTaskColor, weeklyTargetMinutes })
        return res.json({ success: true, value: updatedTask })
    } catch (error) {
        console.log(error)
        res.status(500).json({ success: false, error: 'Interal server error' })
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
        return res.json({ success: true, value: updatedTask })
    } catch (error) {
        console.log(error)
        return res.status(500).json({ success: false, error: 'internal server error' })
    }
})

export default router
