const db = require("../db/dbConfig");
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const JWT_SECRET = process.env.JWT_SECRET;


const registerUser = async(userData) => {
    try {
        const { firstname, lastname, email, username, password, profile_img } = userData;
        
        // check if the the email or username is already registered
        const existingUser = await db.oneOrNone(
            'SELECT * FROM users WHERE email=$1 OR username=$2',
            [email, username]
        );

        // throw error if username or email already exist in db
        if (existingUser) {
            throw new Error('Email or username is already registered');
        }

        // hash user's password before inserting data into db
        const saltRounds = 10;
        console.log('Password before hashing: ', password);

        const hashedPassword = await bcrypt.hash(password, saltRounds);
        console.log('Hashed password: ', hashedPassword);

        // insert user's data to db
        const newUser = await db.one(
            'INSERT INTO users (firstname, lastname, email, username, password, profile_img) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id, firstname, lastname, email, username, profile_img', [firstname, lastname, email, username, hashedPassword, profile_img]
        );

        const token = jwt.sign({ userId: newUser.id }, JWT_SECRET, { expiresIn: '1d'});
        return { newUser, token };

    } catch (error) {
        console.log("Error while registering user: ",  error);
        return error;
    }
};


const loginUser = async(userData) => {
    try {
        const { username, password } = userData;
        console.log("Login request: ", userData);

        const user = await db.oneOrNone('SELECT * FROM users WHERE username=$1', [username]);
        console.log("User Logged in: ", user);

        // check if user provided a valid username and password
        if (!user || !(await bcrypt.compare(password, user.password))) {
            console.log("Invalid username or password");
            throw new Error("Invalid username or password");
        }

        const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: '1d' });
        console.log("Login successful: ", user, token);
        return { user, token };

    } catch (error) {
        console.log("Error during login: ", error);
        return error;
    }
}


module.exports = {
    registerUser,
    loginUser
};