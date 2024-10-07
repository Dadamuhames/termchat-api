const express = require('express');


const Chat = require("../models/Chat.js");
const sequelize = require("../models/database.js");
const { QueryTypes } = require('sequelize');
const { getChat, getChatByUsers } = require("../models/utils.js");
const User = require('../models/User.js');


const router = express.Router();


router.get("/", async (req, res) => {
    const userId = req.user.id;

    const query = "SELECT c.id, user2.username FROM Chats c JOIN Users u ON u.id = :userId AND (u.id = userOneId OR u.id = userTwoId) JOIN Users user2 ON user2.id != :userId AND (user2.id = userOneId OR user2.id = userTwoId)";

    const chats = await sequelize.query(query, {
        raw: true,
        type: QueryTypes.SELECT,
        replacements: { userId: userId }
    })


    return res.json(chats);
})


router.get("/:id", async (req, res) => {
    const userId = req.user.id;
    const id = req.params.id;

    const chat = await getChat(id, userId);

  
    if(chat === null) {
        return res.status(404).json({"message": "chat not found"})
    }

    const chatData = chat.dataValues;


    let companionId = chatData.userOneId;

    if(companionId == userId) companionId = chatData.userTwoId;

    chatData["companionId"] = companionId

    const companion = await User.findByPk(companionId);

    chatData["companionName"] = `@${companion.username}`;


    const publicKeys = JSON.parse(chatData?.publicKeys);

    chatData["publicKey"] = publicKeys[companionId.toString()]

    delete chatData["publicKeys"];

    return res.json(chatData);
})


router.post("/:id/storeMyPublicKey", async (req, res) => {
    const userId = req.user.id;
    const id = req.params.id;
    
    if(!req.body?.publicKey) {
        return res.status(400).json({"message": "publicKey required"});
    }

    const chat = await getChat(id, userId);

    if(chat === null) {
        return res.status(404).json({"message": "chat not found"})
    }

    const keys = chat.publicKeys ? JSON.parse(chat.publicKeys) : {};

    keys[userId.toString()] = req.body?.publicKey;

    const chatUpdated = await Chat.update({publicKeys: JSON.stringify(keys)}, {where: {id: chat.id}});

    return res.json(chatUpdated);
})



router.post("/", async (req, res) => {
    const chat = await getChatByUsers(req.user.id, req.body?.userId);

    if(!req.body?.userId) {
        return res.status(400).json({"message": "userId required"});
    }

    if(chat != null) {
        return res.status(400).json({"message": "chat exists"});
    }

    try {
        const chatData = {
            userOneId: req.user.id,
            userTwoId: req.body?.userId,
            active: false
        }

        const createdChat = await Chat.create(chatData);

        return res.status(201).json(createdChat)

    } catch(error) {
        const sequelizeErrors = error.errors.map(err => err.message);
        return res.status(400).json({ errors: sequelizeErrors }); 
    }

    return res.status(500).json({ message: "Internal Server Error" });
})



module.exports = router;
