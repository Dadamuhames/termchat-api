const { Sequelize, DataTypes, Model } = require('sequelize');
const sequelize = require('./database');



const User = sequelize.define('User',  {
    username: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
    },
    device_token: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    }
}, {});



module.exports = User;

