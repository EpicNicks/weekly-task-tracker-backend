import { Sequelize, DataTypes, Model, InferAttributes, InferCreationAttributes, ForeignKey } from 'sequelize'
import Task from './Task'

const sequelize = new Sequelize(process.env.DB_NAME!, process.env.DB_USER!, process.env.DB_PASSWORD, {
    host: process.env.DB_HOST,
    dialect: 'mysql',
    define: {
        timestamps: false,
    },
})

export default class DailyLog extends Model<InferAttributes<DailyLog>, InferCreationAttributes<DailyLog>> {
    declare logDate: string
    declare dailyTimeMinutes: number
    declare collectedPoints: boolean
    declare taskId: ForeignKey<number>
}

DailyLog.init({
    logDate: { type: DataTypes.DATEONLY, allowNull: false, primaryKey: true },
    dailyTimeMinutes: { type: DataTypes.INTEGER, allowNull: false },
    collectedPoints: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
    taskId: { type: DataTypes.INTEGER, allowNull: false, primaryKey: true, references: { model: Task, key: 'id' } }
}, {
    sequelize,
    modelName: 'DailyLog',
    indexes: [{
        fields: ['logDate', 'taskId'], unique: true
    }]
})
