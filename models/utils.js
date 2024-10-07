const Chat = require("./Chat.js");
const Sequelize = require('sequelize');
const Op = Sequelize.Op;

const getChat = (chatId, userId) => {
    const chat = Chat.findOne({
        where: {id: chatId, [Op.or]: {userOneId: userId, userTwoId: userId}}
    });

    return chat;
}


const getChatByUsers = (userOneId, userTwoId) => {
    const chat = Chat.findOne({
        where: {
            [Op.or]: [
                {[Op.and]: [{userOneId: userOneId}, {userTwoId: userTwoId}]},
                {[Op.and]: [{userTwoId: userOneId}, {userOneId: userTwoId}]}
            ]
        }
    })

    return chat;
}


module.exports = {getChat, getChatByUsers}
