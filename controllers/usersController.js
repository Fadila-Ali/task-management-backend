const { Router } = require("express");
// use multipart form for uploading profile image
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });
const {
    registerUser,
    loginUser,
    getAllUsers,
    getUserById,
    updateUser,
    deleteUser
} = require("../queries/users");

const users = Router();


// register new user
users.post("/register", async (req, res) => {
    try {
        const addNewUser = await registerUser(req.body);
        console.log("Controller successfully register new user: ", addNewUser);
        res.status(201).json(addNewUser);
    } catch (error) {
        console.log("Error registering new user: ", error);
        res.status(500).json({ error: error.message });
    }
});

// login user
users.post("/login", async(req, res) => {
    try {
        const loginReturningUser = await loginUser(req.body);
        if (loginReturningUser.error) {
            throw new Error(loginReturningUser.error);
        }
        console.table(loginReturningUser);
        res.status(200).json(loginReturningUser);
    } catch (error) {
        console.log("Error login user in: ", error);
        res.status(400).json({ error: error.message });
    }
});

// get all users
users.get("/", async(req, res) => {
    try {
        const allUsers = await getAllUsers(req.body);
        console.table(allUsers);
        res.status(200).json(allUsers);
    } catch (error) {
        console.error("Error getting users: ", error);
        res.status(500).json({ error: 'Internal server error. Cannot get users!' });
    }
});

// get user with a giving id
users.get("/:id", async(req, res) => {
    try {
        const userId = req.params.id;

        const userWithThisId = await getUserById(userId);
        console.table(userWithThisId);
        res.status(200).json(userWithThisId);
    } catch (error) {
        console.error('Error getting user: ', error);
        res.status(500).json({ error: 'Internal server error. Cannot get user!' });
    }
});

// update user's data
users.patch("/:id", upload.single('profile_img'), async(req, res) => {
    try {
        const userId = req.params.id;
        const { firstname, lastname, email, username, password } = req.body;
        const profile_img = req.file.filename;
        // const profile_img = req.file ? req.file.filename : undefined;
        console.log(req.get('file'));

        // Validate required fields
        if (!firstname || !lastname || !email || !username || !password) {
            return res.status(400).json({ error: "All fields are required" });
        }

        const userToUpdate = await updateUser(userId, { firstname, lastname, email, username, password, profile_img });
        console.table(userToUpdate);
        res.status(200).json(userToUpdate);
    } catch (error) {
        console.error('Error updating user data: ', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// delete user's data from db
users.delete("/:id", async(req, res) => {
    try {
        const userId = req.params.id;

        await deleteUser(userId);
        console.log(`User with id ${userId} has been deleted`);
        res.status(204).json(); // No need to return anything
    } catch (error) {
        console.error('Error deleting user: ', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});


module.exports =  users;
