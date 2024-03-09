const express = require('express')
const router = express.Router()
const User = require('../models/User.js')
const checkTokenMiddleware = require('../middleware/tokenCheck.js')

router.get('/points', checkTokenMiddleware, async (req, res) => {
    const pointsUser = await User.findOne({ where: { id: req.user._id } })
    if (!pointsUser) {
        // shouldn't happen since the user is already logged in
        return res.status().json({ success: false, error: `No User with username: ${pointsUser} found` })
    }
    return res.json({ success: true, points: pointsUser.points })
})

module.exports = router
