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
        if (!user) {
            console.log("User not found: ", username);
            throw new Error("Invalid username or password");
        }
        
        console.log("User found: ", user);

        const passwordMatch = await bcrypt.compare(password, user.password);
        if (!passwordMatch) {
            console.log("Password does not match for user: ", username);
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


const getAllUsers = async(userData) => {
    try {
        const users = await db.any('SELECT * FROM users');
        return users;
    } catch (error) {
        console.error('Error getting users: ', error);
        return error;
    }
}


const getUserById = async(userId) => {
    try {
        const user = await db.one('SELECT * FROM users WHERE id=$1', userId);
        return user;
    } catch (error) {
        console.error('Error getting user details: ', error);
        return error;
    }
}

const updateUser = async(userId, { firstname, lastname, email, username, password, profile_img}) => {
    try {
        // check if user exists in db
        const existingUser = await db.oneOrNone('SELECT * FROM users WHERE id=$1', userId);
        if (!existingUser) {
            throw new Error('User not found');
        }

        // because I am using multer, user can make changes to one column such as profile_img and not rest of the columns
        // this can cause errors because many of the 'users' columns cannot be NULL
        // so I handle sign up to include all required columns, so that the first time I get data from user to store in each column
        // and use existing values if new ones are not provided during profile update
        firstname = firstname || existingUser.firstname;
        lastname = lastname || existingUser.lastname;
        email = email || existingUser.email;
        username = username || existingUser.username;
        profile_img = profile_img || existingUser.profile_img;

        // hash new password if the new provided is different from the one in db
        if (password) {
            const saltRounds = 10;
            password = await bcrypt.hash(password, saltRounds);
        } else {
            password = existingUser.password;
        }

        // update the user data if user is found
        const userToUpdate = await db.one(
            'UPDATE users SET firstname=$1, lastname=$2, email=$3, username=$4, password=$5, profile_img=$6 WHERE id=$7 RETURNING *', 
            [firstname, lastname, email, username, password, profile_img, userId]);

            console.table(userToUpdate);
            return userToUpdate;
    } catch (error) {
        console.error('Error updating user: ', error);
        return error;
    }
}

const deleteUser = async(userId) => {
    try {
        // check if the user exists before attempting to delete the user
        const existingUser = await db.oneOrNone('SELECT * FROM users WHERE id=$1', userId);
        if (!existingUser) {
            throw new Error('User not found');
        }

        // delete the user data from db
        const deletedUser = await db.none('DELETE FROM users WHERE id=$1', userId);
        return deleteUser;
    } catch (error) {
        console.error('Error deleting user data: ', error);
        return error;
    }
};


module.exports = {
    registerUser,
    loginUser,
    getAllUsers,
    getUserById,
    updateUser,
    deleteUser
};