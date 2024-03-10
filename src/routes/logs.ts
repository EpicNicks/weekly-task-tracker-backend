import express from 'express'
const router = express.Router()
import { DateTime } from 'luxon'
import { Op } from 'sequelize'
import DailyLog from '../models/DailyLog'
import checkTokenMiddleware from '../middleware/tokenCheck'
import isValidISO8601 from '../validation/dateValidation'

// query params: ISO8601 startDate, endDate
// [ISO8601](https://www.iso.org/iso-8601-date-and-time-format.html)
router.get('/all', checkTokenMiddleware, async (req, res) => {
    const { startDate, endDate }: { startDate?: string, endDate?: string } = req.query

    if (!!startDate && !!endDate) {
        return res.json({ success: true, dailyLogs: await DailyLog.findAll() })
    }
    if (startDate) {
        if (!isValidISO8601(endDate!)) {
            return res.status(400).json({ success: false, error: `endDate ${endDate} is not valid (must be in format: YYYY-MM-DD)` })
        }
        return res.json({ success: true, dailyLogs: await DailyLog.findAll({ where: { logDate: { lte: endDate } } }) })
    }
    if (endDate) {
        if (!isValidISO8601(startDate!)) {
            return res.status(400).json({ success: false, error: `startDate ${startDate} is not valid (must be in format: YYYY-MM-DD)` })
        }
        return res.json({ success: true, dailyLogs: await DailyLog.findAll({ where: { logDate: { gte: startDate } } }) })
    }
    // both are provided and valid
    if (DateTime.fromISO(startDate!) > DateTime.fromISO(endDate!)) {
        return res.status(400).json({ success: false, error: `startDate (${startDate}) was greater than endDate (${endDate}). startDate must be less than or equal to endDate` })
    }
    // we send the ISO8601 strings to avoid timezone issues and simply pass the user's local time forward
    // according to ChatGPT, passing the string raw will have Sequelize simply pass the string forward raw and have MySQL handle the implicit conversion as if it was a raw query
    // if there are any problems with this, recheck how the middleware handles date strings
    const logs = await DailyLog.findAll({ where: { logDate: { [Op.between]: [startDate!, endDate!] } } })
    res.json({ success: true, dailyLogs: logs })
})

// params: ISO8601 date string
router.get('/:date', checkTokenMiddleware, async (req, res) => {
    const { date } = req.params
    const { taskId } = req.body
    if (!taskId) {
        return res.status(400).json({ success: false, error: 'taskId not provided' })
    }
    if (!isValidISO8601(date)) {
        return res.status(400).json({ success: false, error: `invalid date ${date} passed` })
    }
    const dailyLog = await DailyLog.findOne({ where: { logDate: date, taskId } })
    if (!dailyLog) {
        return res.status(404).json({ success: false, error: `daily log on ${date} not found` })
    }
    return res.json({ success: true, dailyLog })
})

router.post('/create', async (req, res) => {
    const { logDate, dailyTimeMinutes, taskId } = req.body
    if (!taskId) {
        return res.status(400).json({ success: false, error: 'taskId not provided' })
    }
    if (!isValidISO8601(logDate)) {
        return res.status(400).json({ success: false, error: `invalid date ${logDate} passed, ensure the format passed is string of YYYY-MM-DD` })
    }
    if (await DailyLog.findOne({ where: { logDate, taskId } })) {
        return res.status(400).json({ success: false, error: `record at date ${logDate} already exists for taskId ${taskId}` })
    }
    try {
        const log = await DailyLog.create({
            logDate,
            taskId,
            dailyTimeMinutes,
            collectedPoints: false
        })
        res.json({ success: true, dailyLog: log })
    } catch (error) {
        console.log('error updating item', error)
        res.status(500).json({ success: false, error: 'Internal server error' })
    }
})

router.patch('/change-date/:date', async (req, res) => {
    const { date } = req.params
    const { logDate, taskId } = req.body
    if (!taskId) {
        return res.status(400).json({ success: false, error: 'taskId not provided' })
    }
    if (!isValidISO8601(date)) {
        return res.status(400).json({ success: false, error: `invalid date ${date} passed, ensure the format passed is string of YYYY-MM-DD` })
    }
    if (!isValidISO8601(logDate)) {
        return res.status(400).json({ success: false, error: `invalid date ${date} passed, ensure the format passed is string of YYYY-MM-DD` })
    }
    try {
        const dailyLog = await DailyLog.findOne({ where: { logDate: date, taskId } })
        if (!dailyLog) {
            return res.status(404).json({ success: false, error: `daily log on ${date} with taskId ${taskId} not found` })
        }
        // modifying a log date that has already had its points collected will not reenable point collection on that log
        // frontend client should WARN on forms of requests to modify dailyLog items that have dailyLog.collectedPoints = true
        await dailyLog.update({
            logDate,
        })
        const updatedLog = await DailyLog.findOne({ where: { logDate, taskId } })
        return res.json({ success: true, dailyLog: updatedLog })
    } catch (error) {
        console.error('Error updating item:', error)
        res.status(500).json({ success: false, error: 'Internal server error' })
    }
})

router.patch('/change-daily-minutes/:date', async (req, res) => {
    const { date } = req.params
    const { dailyTimeMinutes, taskId } = req.body
    if (isValidISO8601(date)) {
        return res.status(400).json({ success: false, error: `invalid date ${date} passed, ensure the format passed is string of YYYY-MM-DD` })
    }
    if (!taskId) {
        return res.status(400).json({ success: false, error: 'taskId not provided' })
    }
    try {
        const dailyLog = await DailyLog.findOne({ where: { logDate: date, taskId } })
        if (!dailyLog) {
            return res.status(404).json({ success: false, error: `daily log on ${date} with taskId ${taskId} not found` })
        }
        // modifying a log date that has already had its points collected will not reenable point collection on that log
        // frontend client should WARN on forms of requests to modify dailyLog items that have dailyLog.collectedPoints = true
        await dailyLog.update({
            dailyTimeMinutes,
        })
        const updatedLog = await DailyLog.findOne({ where: { logDate: date, taskId } })
        return res.json({ success: true, dailyLog: updatedLog })
    } catch (error) {
        console.error('Error updating item:', error)
        res.status(500).json({ success: false, error: 'Internal server error' })
    }
})

export default router