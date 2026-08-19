const User = require("../models/User");

const createUser = async (req, res) => {
    try {
        const { userid,name, email, password,role } = req.body;

        const user = await User.create({
            userid,
            name,
            email,
            password,
            role:"User"
        });

        res.status(201).json(user);
    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
};

module.exports = {
    createUser
};