import { Sequelize, DataTypes, Model, InferAttributes, InferCreationAttributes, CreationOptional, ForeignKey } from 'sequelize'
import User from './User'

const sequelize = new Sequelize(process.env.DB_NAME!, process.env.DB_USER!, process.env.DB_PASSWORD, {
    host: process.env.DB_HOST,
    dialect: 'mysql'
})

export default class Task extends Model<InferAttributes<Task>, InferCreationAttributes<Task>> {
    declare id: CreationOptional<number>
    declare taskName: string
    declare weeklyTargetMinutes: number
    declare rgbTaskColor: string
    declare isActive: boolean
    declare userId: ForeignKey<number>
}

Task.init({
    id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true
    },
    taskName: {
        type: DataTypes.STRING(100),
        allowNull: false,
    },
    weeklyTargetMinutes: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    rgbTaskColor: {
        type: DataTypes.STRING(8),
        allowNull: false
    },
    isActive: {
        type: DataTypes.BOOLEAN,
        allowNull: false
    },
    userId: {
        type: DataTypes.STRING(50),
        allowNull: false,
        references: {
            model: User,
            key: 'id'
        }
    }
}, {
    sequelize,
    modelName: 'Task',
    indexes: [{
        fields: ['taskName', 'userId'], unique: true
    }]
})
