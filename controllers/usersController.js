const { Router } = require("express");
const {
    registerUser,
    loginUser
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
        console.log("Controller successfully logged user in: ", loginReturningUser);
        res.status(200).json(loginReturningUser);
    } catch (error) {
        console.log("Error login user in: ", error);
        res.status(400).json({ error: error.message });
    }
})


module.exports =  users;
