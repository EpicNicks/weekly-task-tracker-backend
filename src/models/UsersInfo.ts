import { InferAttributes, InferCreationAttributes, Sequelize, DataTypes, Model, ForeignKey } from 'sequelize'
import User from './User'

const sequelize = new Sequelize(process.env.DB_NAME!, process.env.DB_USER!, process.env.DB_PASSWORD, {
    host: process.env.DB_HOST,
    dialect: 'mysql',
    define: {
        timestamps: false,
    },
})

export default class UsersInfo extends Model<InferAttributes<UsersInfo>, InferCreationAttributes<UsersInfo>> {
    declare userId: ForeignKey<number>
    declare points: number
    declare userRank: string
}

UsersInfo.init({
    userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: User,
            key: 'id'
        }
    },
    points: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    userRank: {
        type: DataTypes.STRING,
        allowNull: false
    }

}, {
    sequelize,
    modelName: 'UsersInfo',
})