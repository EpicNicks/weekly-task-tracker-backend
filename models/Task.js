const { Sequelize, DataTypes, Model } = require('sequelize')
const sequelize = new Sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASSWORD, {
    host: process.env.DB_HOST,
    dialect: 'mysql'
})
const User = require('./User')

class Task extends Model {}

Task.init({
    id: { type: DataTypes.INTEGER, allowNull: false, primaryKey: true, autoIncrement: true},
    taskName: { type: DataTypes.STRING(100), allowNull: false },
    weeklyTargetMinutes: { type: DataTypes.INTEGER, allowNull: false },
    rgbTaskColor: { type: DataTypes.STRING(8) },
    userId: { type: DataTypes.STRING(50), allowNull: false, references: { model: User, key: 'id' } }
}, {
    sequelize,
    modelName: 'Task',
    indexes: [{
        fields: ['taskName', 'userId'], unique: true
    }]
})

module.exports = Task

