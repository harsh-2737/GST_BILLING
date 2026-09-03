const User = require("../models/User");
const Counter = require("../models/Counter");

const getNextUserId = async () => {

    const counter = await Counter.findOneAndUpdate(
        { _id: "userid" },
        { $inc: { seq: 1 } },
        {
            new: true,
            upsert: true
        }
    );

    return counter.seq;
};


const createUser = async (userData) => {

    try {

        if (
            !userData.name ||
            !userData.email ||
            !userData.password ||
            !userData.phone_no
        ) {
            throw new Error("Missing required fields");
        }

        const existingEmail = await User.findOne({
            email: userData.email
        });

        if (existingEmail) {
            throw new Error("Email already exists");
        }

        const existingPhone = await User.findOne({
            phone_no: userData.phone_no
        });

        if (existingPhone) {
            throw new Error("Phone number already exists");
        }

        const userid = await getNextUserId();

        const user = await User.create({
            userid: userid,
            name: userData.name,
            email: userData.email,
            password: userData.password,
            phone_no: userData.phone_no,
            role: userData.role || "User"
        });

        return user.toJSON();

    }
    catch (error) {

        throw new Error(
            "Error creating user: " + error.message
        );

    }

};


const getAllUsers = async () => {

    try {

        const users = await User.find();

        return users;

    }
    catch (error) {

        throw new Error(
            "Error retrieving users: " + error.message
        );

    }

};


const getUserById = async (id) => {

    try {

        const user = await User.findOne({
            userid: Number(id)
        });

        if (!user) {

            throw new Error("User not found");

        }

        return user;

    }
    catch (error) {

        throw new Error(
            "Error retrieving user: " + error.message
        );

    }

};


const updateUser = async (id, updateData) => {

    try {

        const user = await User.findOne({
            userid: Number(id)
        });

        if (!user) {

            throw new Error("User not found");

        }

        if (updateData.name !== undefined) {

            user.name = updateData.name;

        }

        if (updateData.email !== undefined) {

            const existingEmail = await User.findOne({
                email: updateData.email,
                userid: { $ne: user.userid }
            });

            if (existingEmail) {

                throw new Error("Email already exists");

            }

            user.email = updateData.email;

        }

        if (updateData.password !== undefined) {

            user.password = updateData.password;

        }

        if (updateData.phone_no !== undefined) {

            const existingPhone = await User.findOne({
                phone_no: updateData.phone_no,
                userid: { $ne: user.userid }
            });

            if (existingPhone) {

                throw new Error("Phone number already exists");

            }

            user.phone_no = updateData.phone_no;

        }

        if (updateData.role !== undefined) {

            user.role = updateData.role;

        }

        await user.save();

        return user.toJSON();

    }
    catch (error) {

        throw new Error(
            "Error updating user: " + error.message
        );

    }

};


const deleteUser = async (id) => {

    try {

        const user = await User.findOneAndDelete({
            userid: Number(id)
        });

        if (!user) {

            throw new Error("User not found");

        }

        return {
            message: "User deleted successfully"
        };

    }
    catch (error) {

        throw new Error(
            "Error deleting user: " + error.message
        );

    }

};


module.exports = {

    createUser,
    getAllUsers,
    getUserById,
    updateUser,
    deleteUser

};