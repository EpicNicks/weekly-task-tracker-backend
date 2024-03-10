import express from 'express'
const router = express.Router()
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import User from '../models/User'

router.get('/available', async (req, res) => {
    const { username }: { username?: string } = req.body
    if (!username) {
        return res.status(400).json({ success: false, error: 'username was not provided' })
    }
    if (await User.findOne({ where: { username } })) {
        return res.status(401).json({ success: true, taken: true, error: `username ${username} is already in use` })
    }
    return res.status(200).json({ success: true, taken: false })
})

router.post('/register', async (req, res) => {
    const { username, password }: { username?: string, password?: string } = req.body
    if (!username || !password) {
        return res.status(400).json({ success: false, error: 'username or password not provided' })
    }
    try {
        if (await User.findOne({ where: { username } })) {
            return res.status(401).json({ success: false, error: `Username ${username} is already in use` })
        }
        await User.create({ username, passwordHash: password, points: 0 })
        res.status(201).send({ success: true })
    } catch (error) {
        console.log(error)
        res.status(400).send({ success: false, error: 'Internal server error' })
    }
})

router.post('/login', async (req, res) => {
    const { username, password } = req.body
    const user = await User.findOne({ where: { username } })
    if (!user) {
        return res.status(401).json({ success: false, error: 'Invalid username provided' })
    }
    if (await bcrypt.compare(password, user.passwordHash)) {
        const token = jwt.sign({ _id: user.id }, process.env.JWT_SECRET!)
        return res.json({ success: true, token })
    } else {
        return res.status(401).json({ success: false, error: 'Incorrect password provided' })
    }
})

export default router