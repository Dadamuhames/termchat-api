const express = require('express');


const User = require("../models/User.js");
const sequelize = require("../models/database.js");
const { QueryTypes } = require('sequelize');
const { SOCKETS } = require("../socket/handlers.js");

const router = express.Router();


router.get('/', async (req, res, next) => {
    const currentUser = req.user;    
    let search = req.query?.search;


    let query = `SELECT u.id, username, c.id AS chat_id FROM Users u 
                 LEFT JOIN Chats c ON (c.userOneId = u.id AND c.userTwoId = :userId) 
                 OR (c.userTwoId = u.id AND c.userOneId = :userId) WHERE u.id != :userId`


    if(search) {
        query += " AND username LIKE :search"
    }


    const users = await sequelize.query(query, {
        raw: true,
        type: QueryTypes.SELECT,
        replacements: { userId: currentUser.id, search: `%${search}%`}
    });

    return res.json({"result": users});
});


router.get('/me', async (req, res) => {
    return res.json(req.user);
})



router.post('/', async (req, res) => {
    try {
        const user = await User.create({...req.body}, {fields: ['username', 'device_token']});

        return res.status(201).json(user)
    } catch(error) {
        const sequelizeErrors = error.errors.map(err => err.message);
        return res.status(400).json({ errors: sequelizeErrors });
    }
    return res.status(500).json({ message: "Internal Server Error" });   
})


module.exports = router;

