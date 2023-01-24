const userRepo = require('../models/User.js');
const jwt = require('jsonwebtoken');

const authenticateUser = async(req, res, next) => {
    try {
        const { user_id: userId } = jwt.verify(req.headers['x-token'], process.env.TOKEN_KEY);
        const user = await userRepo.findOne({ _id: userId }, { __v : 0, password: 0 }).lean();
        if (user.token.includes(req.headers['x-token'])) {
            req.user = user;
            next();
        } else {
            res.status(403).json({ message: "Invalid token" });
        }

    } catch(err) {
        res.status(403).json({ message: "Invalid token" });
    }
}

module.exports = authenticateUser;