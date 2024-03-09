const express = require('express')
const router = express.Router()
const User = require('../models/User.js')
const checkTokenMiddleware = require('../middleware/tokenCheck.js')

router.get('/points', checkTokenMiddleware, async (req, res) => {
    const pointsUser = await User.findOne({ where: { username: req.user.id } })
    if (!pointsUser) {
        // shouldn't happen since the user is already logged in
        return res.status(404).json({ success: false, error: `No User with username: ${pointsUser} found` })
    }
    return res.json({ success: true, points: pointsUser.points })
})

// called by the client at the end of the week
// the client manages pushing notifications
router.post('/collect-points', checkTokenMiddleware, async (req, res) => {
    // go over all uncollected DailyLogs up to previous Sunday { logDate lte prev Sunday AND collectedPoints: false/0 }
    // calculate vs weekly goal
    // give bonus multiplier for collection of past week { logDate gt prev prev Sunday AND lte prev Sunday }
    // update User points, rollback logDates collected if User points are not updated
})

module.exports = router
