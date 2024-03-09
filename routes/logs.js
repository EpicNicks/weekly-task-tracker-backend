const express = require('express')
const router = express.Router()
const DailyLog = require('../models/DailyLog')
const { Op } = require('sequelize')
const checkTokenMiddleware = require('../middleware/tokenCheck')

// query params: ISO8601 startDate, endDate
// [ISO8601](https://www.iso.org/iso-8601-date-and-time-format.html)
router.get('/all', checkTokenMiddleware, async (req, res) => {
    const { startDate, endDate } = req.query
    if (!!startDate || !!endDate) {
        return res.status(400).json({ error: 'startDate and endDate required' })
    }
    const startDateObj = new Date(startDate)
    const endDateObj = new Date(endDate)
    if (isNaN(startDateObj) || isNaN(endDateObj)) {
        return res.status(400).json({
            error:
                `${isNaN(startDateObj) ? 'start date ' + startDate + ' was invalid and could not be parsed' : ''}
             ${isNaN(endDateObj) ? 'end date ' + endDate + ' was invalid and could not be parsed' : ''}
            `
        })
    }
    if (new Date(startDate) > new Date(endDate)) {
        return res.status(422).json({ error: `malformed data: startDate ${startDate} was greater than endDate ${endDate}` })
    }
    // we send the ISO8601 strings to avoid timezone issues and simply pass the user's local time forward
    // according to ChatGPT, passing the string raw will have Sequelize simply pass the string forward raw and have MySQL handle the implicit conversion as if it was a raw query
    // if there are any problems with this, recheck how the middleware handles date strings
    res.send(await DailyLog.findAll({ where: { logDate: { [Op.between]: [startDate, endDate] } } }))
})

// params: ISO8601 date string
router.get(':date', checkTokenMiddleware, async (req, res) => {
    const { date } = req.params
    if (!!date || isNaN(new Date(date))) {
        return res.status(400).json({ error: `invalid date ${date} passed` })
    }
    const dailyLog = await DailyLog.findByPk(date)
    if (!dailyLog) {
        return res.status(404).json({ error: `daily log on ${date} not found` })
    }
    return res.json(dailyLog)
})

router.patch(':date', checkTokenMiddleware, async (req, res) => {
    const { date } = req.params
    if (!!date || isNaN(new Date(date))) {
        return res.status(400).json({ error: `invalid date ${date} passed` })
    }
    try {
        const dailyLog = await DailyLog.findByPk(date)
        if (!dailyLog) {
            return res.status(404).json({ error: `daily log on ${date} not found` })
        }
        await dailyLog.update(req.body)
        const updatedLog = await DailyLog.findByPk(date)
        return res.json(updatedLog)
    } catch (error) {
        console.error('Error updating item:', error)
        res.status(500).json({ error: 'Internal server error' })
    }
})

module.exports = router