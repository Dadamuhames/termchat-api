const { Sequelize, DataTypes, Model } = require('sequelize');
const sequelize = require('./database.js');

const User = require("./User.js")


const Chat = sequelize.define('Chat',     {
    userOneId: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    userTwoId: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    active: DataTypes.BOOLEAN,

    publicKeys: {
        type: DataTypes.STRING(6000),
        allowNull: true
    }
}, {});



Chat.belongsTo(User, {foreignKey: "userOneId", as: "userOne"}),
Chat.belongsTo(User, {foreignKey: "userTwoId", as: "userTwo"})


module.exports = Chat;

