const bcrypt = require('bcrypt')
const { Sequelize, DataTypes, Model } = require('sequelize')
const sequelize = new Sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASSWORD, {
    host: process.env.DB_HOST,
    dialect: 'mysql'
})

class User extends Model {}

User.init({
    id: { type: DataTypes.INTEGER, allowNull: false, primaryKey: true, autoIncrement: true},
    username: { type: DataTypes.STRING(50), allowNull: false, unique: true },
    passSha256: { type: DataTypes.STRING(64), allowNull: false },
    points: { type: DataTypes.INTEGER, allowNull: false }
}, {
    sequelize,
    modelName: 'User',
    hooks: {
        beforeCreate: async (user) => {
            const salt = await bcrypt.genSalt()
            user.passSha256 = await bcrypt.hash(user.passSha256, salt)
        }
    }
})

module.exports = User

