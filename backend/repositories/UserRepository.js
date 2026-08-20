const User = require("../models/User");

const createUser = async (userData) => {
    try{
    if(!userData.userid || !userData.name || !userData.email || !userData.password || !userData.phone_no)
    {
        throw new Error("Missing required fields");
    }
    const user = await User.insertOne({
        userid: userData.userid,
        name: userData.name,
        email: userData.email,
        password: userData.password,
        phone_no: userData.phone_no
    });
    return user.toJSON();
    }
    catch (error){
        throw new Error("Error creating user: " + error.message);
    }
};

const getAllUsers = async () => {
    try{
    const users = await User.find();
    return users;
    }
    catch (error){
        throw new Error("Error retrieving users: " + error.message);
    }
};

const getUserById = async (id) => {
    try{
    const user1 =await User.findOne({ userid: id });
    if (!user1) {
        throw new Error("User not found");
    }
    return user1;
    }
    catch (error){
        throw new Error("Error retrieving user: " + error.message);     

    }
};

const updateUser = async (id, updateData) =>
{
 try{
    const user = await getUserById(id);
    if (!user)
    {
        throw new Error("User not found");
    }
    if(updateData.userid)
    {
        user.userid = updateData.userid;
    }
    if(updateData.name)
    {
        user.name = updateData.name;
    }
    if(updateData.email)
    {
        user.email = updateData.email;
    }
    if(updateData.password)
    {
        user.password = updateData.password;
    }
    if(updateData.phone_no)
    {
        user.phone_no = updateData.phone_no;
    }
    await user.save();
    return user.toJSON();
}
catch (error)
{
    throw new Error("Error updating user: " + error.message);
}
};

const deleteUser = async (id) => {
    try{
    const user = await getUserById(id);
    if (!user) {
        throw new Error("User not found");
    }   
    else
    {
        await User.deleteOne({ userid: id });
        return { message: "User deleted successfully" };
    }
    }
    catch (error)
    {
        throw new Error("Error deleting user: " + error.message);
    }
};
module.exports = {
    createUser,
    getAllUsers,
    getUserById,
    updateUser,
    deleteUser
};