const express = require('express')
const router = express.Router()
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const User = require('../models/User.js')
const rateLimitMiddleware = require('../middleware/rateLimit.js')

router.get('/available', rateLimitMiddleware, async (req, res) => {
    const { username } = req
    if (await User.findOne({ where: { username } })) {
        return res.status(401).json({ success: true, taken: true, error: `Username ${username} is already in use` })
    }
    return res.status(200).json({ success: true, taken: false })
})

router.post('/register', rateLimitMiddleware, async (req, res) => {
    const { username, password } = req
    try {
        if (await User.findOne({ where: { username } })) {
            return res.status(401).json({ success: false, error: `Username ${username} is already in use` })
        }
        await User.create({ username, passwordHash: password, points: 0 })
        res.status(201).send({ success: true })
    } catch (error) {
        res.status(400).send({ success: false, error })
    }
})

router.post('/login', rateLimitMiddleware, async (req, res) => {
    const { username, password } = req.body
    const user = await User.findOne({ where: { username } })
    if (!user) {
        return res.status(401).json({ success: false, error: 'Invalid username provided' })
    }
    if (await bcrypt.compare(password, user.passwordHash)) {
        const token = jwt.sign({ _id: user.id }, process.env.JWT_SECRET)
        return res.json({ success: true, token })
    } else {
        return res.status(401).json({ success: false, error: 'Incorrect password provided' })
    }
})

module.exports = router