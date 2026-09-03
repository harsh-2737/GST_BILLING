const userRepository = require("../repositories/UserRepository");

const createUser = async (req, res) => {

    try {

        const user = await userRepository.createUser(req.body);

        res.status(201).json(user);

    } catch (error) {

        res.status(400).json({
            message: error.message
        });

    }

};

const getAllUsers = async (req, res) => {

    try
    {

        const users = await userRepository.getAllUsers();

        res.status(200).json(users);

    }
    catch (error)
    {

        res.status(500).json({
            message: error.message
        });

    }

};

const getUserById = async (req,res) =>

{

    try
    {

        const user = await userRepository.getUserById(req.params.id);

        if (!user) {

            return res.status(404).json({
                message: "User not found"
            });

        }

        res.status(200).json(user);

    }
    catch (error)
    {

        res.status(404).json({
            message: error.message
        });

    }

};

const updateUser = async (req, res) => {

    try {

        const user = await userRepository.updateUser(
            req.params.id,
            req.body
        );

        if (!user) {

            return res.status(404).json({
                message: "User not found"
            });

        }

        res.status(200).json(user);

    }
    catch (error) {

        res.status(400).json({
            message: error.message
        });

    }

};

const deleteUser = async (req, res) => {

    try {

        const user = await userRepository.deleteUser(req.params.id);

        if (!user) {

            return res.status(404).json({
                message: "User not found"
            });

        }

        res.status(200).json(user);

    } catch (error) {

        res.status(400).json({
            message: error.message
        });

    }

};

module.exports = {

    createUser,
    getAllUsers,
    getUserById,
    updateUser,
    deleteUser

};