const SOCKETS = {};
const USER_ID_BY_IP = {};
const WAITLIST = [];

const User = require("../models/User.js");
const Chat = require("../models/Chat.js");
const Message = require("../models/Message.js");
const { getChat } = require("../models/utils.js");


const onDataWrapped = (sock) => {
    return async (data) => {
        let messageData;

        try {
            messageData = JSON.parse(data.toString())
        } catch (error) {
            console.log(error)
            return;
        }

        // authenticate user
        let deviceToken = messageData?.deviceToken;
        
        const user = await User.findOne({where: {device_token: deviceToken}});

        if(user===null) {  //|| user.ip_address != sock.remoteAddress) {
            sock.destroy();
            return;
        }

        
        if(!SOCKETS.hasOwnProperty(user.id)) {
            SOCKETS[user.id] = sock;
            let socketKey = `${sock.remoteAddress}:${sock.remotePort}`;

            USER_ID_BY_IP[socketKey] = user.id;
            
            let socketWaitIndex = WAITLIST.indexOf(socketKey);

            if(socketWaitIndex >= 0) {
                WAITLIST.splice(socketWaitIndex, 1);
            }
        }

        if(messageData?.type == "AUTH") return;


        // get chat
        let chatId = messageData?.chatId;

        let chat = await getChat(chatId, user.id);

        if(chat === null) {
            let message = {
                message: "error",
                details: "reciever not found"
            }

            sock.write(JSON.stringify(message));
            return;
        };

 
        // get reviecer
        let recieverId = chat.userOneId;

        if(recieverId == user.id) {
            recieverId = chat.userTwoId;
        }

        const reciever = await User.findOne({where: {id: recieverId}});

        const recieverSocket = SOCKETS[`${reciever.id}`];


        // confirm chat
        if(messageData?.type == "CONFIRM_CHAT" && recieverSocket != null) {
            let confirmChatMessage = {
                type: messageData?.type,
                chatId: chatId,
                publicKey: messageData?.publicKey
            };

            recieverSocket.write(JSON.stringify(confirmChatMessage));
            return;
        }


        if(messageData?.type != "MESSAGE") return;

         
        if(!chat.active) {
            await Chat.update({active: true}, {where: {id: chatId}})
        }

        // send message to reciever
        const sentMessageData = {fromUserId: user.id, chatId: chatId, message: messageData?.message};
 
        const message = await Message.create({...sentMessageData}, {fields: ["fromUserId", "chatId", "message"]});    


        if(recieverSocket != null) {
            const messageDataToSend = message.dataValues;


            const jsonMessage = JSON.parse(messageData?.message);

            const message_text = jsonMessage[recieverId.toString()]

            messageDataToSend["chat"] = {id: chat.id, name: `${user.username}`}
            messageDataToSend["type"] = "MESSAGE"
            messageDataToSend["message"] = message_text

            recieverSocket.write(JSON.stringify(messageDataToSend));
        }
    }
}


const onClosedWrapped = (sock) => {
    return (data) => {
        let key = `${sock.remoteAddress}:${sock.remotePort}`;

        if(USER_ID_BY_IP.hasOwnProperty(key)) {
            let userId = USER_ID_BY_IP[key];

            delete USER_ID_BY_IP[key];
            delete SOCKETS[userId];
        }

        console.log('CLOSED: ' + sock.remoteAddress + ' ' + sock.remotePort);
    }
}


const onConnection = (sock) => {
    console.log('CONNECTED: ' + sock.remoteAddress + ':' + sock.remotePort);

    let socketKey = `${sock.remoteAddress}:${sock.remotePort}`;

    WAITLIST.push(socketKey);

    setTimeout(() => {
        if(WAITLIST.includes(socketKey)) {
            sock.destroy();
            console.log("Connection closed as no TOKEN provided!");
        }
    }, 20000)

    sock.on('data', onDataWrapped(sock)); 

    // Add a 'close' event handler to this instance of socket
    sock.on('close', onClosedWrapped(sock));
}


module.exports = {onConnection};

