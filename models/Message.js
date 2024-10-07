const { Sequelize, DataTypes, Model } = require('sequelize');
const sequelize = require('./database.js');

const Chat = require("./Chat.js");
const User = require("./User.js");


const Message = sequelize.define('Message',     {
    fromUserId: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    chatId: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    message: {
        type: DataTypes.STRING(5000),
        allowNull: false
    }
}, {});



Message.belongsTo(User, {foreignKey: "fromUserId", as: "fromUser"}),
Message.belongsTo(Chat, {foreignKey: "chatId", as: "chat"})


module.exports = Message;
