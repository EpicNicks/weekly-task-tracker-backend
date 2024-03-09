const { Sequelize, DataTypes, Model } = require('sequelize')
const sequelize = new Sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASSWORD, {
    host: process.env.DB_HOST,
    dialect: 'mysql'
})
const Task = require('./Task')

class DailyLog extends Model {}

DailyLog.init({
    logDate: { type: DataTypes.DATEONLY, allowNull: false, primaryKey: true },
    dailyTimeMinutes: { type: DataTypes.INTEGER, allowNull: false },
    collectedPoints: { typoe: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
    taskId: { type: DataTypes.INTEGER, allowNull: false, primaryKey: true, references: { model: Task, key: 'id' } }
}, {
    sequelize,
    modelName: 'DailyLog',
    indexes: [{
        fields: ['logDate', 'taskId'], unique: true
    }]
})

module.exports = DailyLog

