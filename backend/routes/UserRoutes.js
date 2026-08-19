const express = require("express");
const router = express.Router();

const { createUser,getAllUsers,getUserById,updateUser,deleteUser } = require("../controllers/UserController");


router.post("/create", createUser);
router.get("/", getAllUsers);
router.get("/:id", getUserById);
router.put("/update/:id", updateUser);
router.delete("/delete/:id", deleteUser);
module.exports = router;