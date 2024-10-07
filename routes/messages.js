const express = require('express');


const User = require("../models/User.js");
const Chat = require("../models/Chat.js");
const Message = require("../models/Message.js");
const sequelize = require("../models/database.js");
const { QueryTypes } = require('sequelize');

const router = express.Router();



router.get("/:chatId", async (req, res) => {
    const userId = req.user.id;
    const chatId = req.params.chatId;


    const query = "SELECT * FROM Chats WHERE (userOneId = :userId OR userTwoid = :userId) AND id = :id ORDER BY id DESC";

    const chat = await sequelize.query(query, {
        model: Chat,
        plain: true,
        type: QueryTypes.SELECT,
        replacements: { userId: userId, id: chatId }
    })

    if(chat === null) {
        return res.status(404).json({"message": "Chat not found"});
    }
        
    const messages = await Message.findAll({where: {chatId: chat.id}});

    const mappedMessages = [];

    for(msg of messages) {
        let messageValues = msg.dataValues;

        const messageTextJson = JSON.parse(messageValues?.message);

        messageValues["message"] = messageTextJson[userId];

        mappedMessages.push({...messageValues, myMessage: msg.dataValues.fromUserId == userId})
    }

 
    const response = {
        "messages": mappedMessages
    }

    return res.json(response);
})



module.exports = router;
