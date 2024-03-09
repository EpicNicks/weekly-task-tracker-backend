const { Sequelize, DataTypes, Model } = require('sequelize')
const sequelize = new Sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASSWORD, {
    host: process.env.DB_HOST,
    dialect: 'mysql'
})
const User = require('./User')

class DailyLog extends Model {}

DailyLog.init({
    logDate: { type: DataTypes.DATEONLY, allowNull: false, primaryKey: true },
    dailyTimeMinutes: { type: DataTypes.INTEGER, allowNull: false },
    username: { type: DataTypes.STRING(50), allowNull: false, references: { model: User, key: 'username' } }
}, {
    sequelize,
    modelName: 'DailyLog'
})

module.exports = DailyLog

