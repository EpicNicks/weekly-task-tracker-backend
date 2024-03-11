import { CreationOptional, InferAttributes, InferCreationAttributes, Sequelize, DataTypes, Model } from 'sequelize'
import bcrypt from 'bcrypt'

const sequelize = new Sequelize(process.env.DB_NAME!, process.env.DB_USER!, process.env.DB_PASSWORD, {
    host: process.env.DB_HOST,
    dialect: 'mysql'
})

export default class User extends Model<InferAttributes<User>, InferCreationAttributes<User>> {
    declare id: CreationOptional<number>
    declare username: string
    declare passwordHash: string
    declare points: number
}

User.init({
    id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true
    },
    username: {
        type: DataTypes.STRING(50),
        allowNull: false,
        unique: true
    },
    passwordHash: {
        type: DataTypes.STRING(60),
        allowNull: false
    },
    points: {
        type: DataTypes.INTEGER,
        allowNull: false
    }
}, {
    sequelize,
    modelName: 'User',
    hooks: {
        beforeCreate: async (user: { passwordHash: string }) => {
            const salt = await bcrypt.genSalt()
            user.passwordHash = await bcrypt.hash(user.passwordHash, salt)
        },
        beforeUpdate: async (user) => {
            if (user.changed('passwordHash')){
                const salt = await bcrypt.genSalt()
                user.passwordHash = await bcrypt.hash(user.passwordHash, salt)
            }
        },
    }
})
