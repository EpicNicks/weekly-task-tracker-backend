import express from 'express'
const router = express.Router()
import checkTokenMiddleware from '../middleware/tokenCheck'
import User from '../models/User'
import Task from '../models/Task'
import DailyLog from '../models/DailyLog'

router.get('/points/:userId', checkTokenMiddleware, async (req, res) => {
    const { userId } = req.params
    const pointsUser = await User.findByPk(userId)
    if (!pointsUser) {
        // shouldn't happen since the user is already logged in
        return res.status(404).json({ success: false, error: `No User with username: ${pointsUser} found` })
    }
    return res.json({ success: true, value: pointsUser.points })
})

// called by the client at the end of the week
// the client manages pushing notifications
router.post('/collect-points/:userId', checkTokenMiddleware, async (req, res) => {
    const { userId } = req.params
    // go over all uncollected DailyLogs up to previous Sunday { logDate lte prev Sunday AND collectedPoints: false/0 }
    // calculate vs weekly goal (no points on tasks that had no goal)
    // give bonus multiplier for collection of past week { logDate gt prev prev Sunday AND lte prev Sunday }
    // update User points, rollback logDates collected if User points are not updated
    const tasks = await Task.findAll({ where: { userId } })
    const taskIds = tasks.map(task => task.id)
    const uncollected = await DailyLog.findAll({ where: { collectedPoints: false, taskId: { in: taskIds } } })
    // split the minutes into weeks and evaluate each week into points
    
})

export default router
