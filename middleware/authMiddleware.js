const User = require('../models/User.js');


const authMiddleware = async (req, res, next) => {
    console.log(req.headers);
    

    if(req.path == "/api/users" && req.method == 'POST') {
        next();
        return;
    }

    const tokenHeader = req.header('Authorization');

    
    if(tokenHeader == null || !tokenHeader.startsWith("Device ")) {
        return res.status(401).json({"message": "Unauthorized"});
    }

    const token = tokenHeader.substring(7);

    console.log(token);

    const user = await User.findOne({where: {device_token: token}});

    if(user === null) {
        return res.status(401).json({"message": "Unauthorized"});
    }

    console.log(user);

    req.user = user;

    next();
}


module.exports = authMiddleware;

