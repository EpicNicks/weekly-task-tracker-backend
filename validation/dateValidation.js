const { DateTime } = require('luxon')

const isValidISO8601 = (date) => {
    return !!date && DateTime.fromISO(date).isValid
}

module.exports = isValidISO8601