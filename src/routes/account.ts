import express from 'express'
const router = express.Router()
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import User from '../models/User'
import checkTokenMiddleware, { TokenRequest } from '../middleware/tokenCheck'

router.get('/available/:username', async (req, res) => {
    const { username }: { username: string } = req.params
    if (!username) {
        return res.status(400).json({ success: false, error: 'username was not provided' })
    }
    if (await User.findOne({ where: { username } })) {
        return res.status(200).json({ success: true, value: true, error: `username ${username} is already in use` })
    }
    return res.status(200).json({ success: true, value: false })
})

router.get('/userInfo', checkTokenMiddleware, async (req: TokenRequest, res) => {
    const { userId } = req.decodedToken!
    try {
        const user = await User.findByPk(userId)
        return res.json({ success: true, value: { id: user!.id, username: user!.username, points: user!.points } })
    } catch (error) {
        console.log(error)
        return res.status(500).json({ success: false, error: 'Internal server error' })
    }
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
        const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET!)
        return res.json({ success: true, value: token })
    } else {
        return res.status(401).json({ success: false, error: 'Incorrect password provided' })
    }
})

router.patch('/change-password', checkTokenMiddleware, async (req: TokenRequest, res) => {
    const { newPassword }: { newPassword?: string } = req.body
    const { userId } = req.decodedToken!
    if (!newPassword) {
        return res.status(400).json({ success: false, error: 'Required parameter newPassword was not provided in request body' })
    }
    try {
        const user = await User.findByPk(userId)

        bcrypt.compare(newPassword, user!.passwordHash, async (err, passwordsMatch) => {
            if (err) {
                return res.status(500).json({ success: false, error: 'Internal server error' })
            }
            if (passwordsMatch) {
                return res.status(400).json({ success: false, error: 'Password is same as old password' })
            }
            else {
                try {
                    await user!.update({
                        passwordHash: newPassword
                    })
                    return res.json({ success: true })
                } catch (error) {
                    res.status(500).json({ success: false, error: 'Internal server error' })
                }
            }
        })

    } catch (error) {
        console.log(error)
        res.status(500).json({ success: false, error: 'Internal server error' })
    }

})

export default router
