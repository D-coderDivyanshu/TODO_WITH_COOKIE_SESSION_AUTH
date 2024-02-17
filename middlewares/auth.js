const bcrypt = require("bcrypt");
const client = require("../db/connect.js");

const authenticate = async (query) => {
    const UsersColIns = await getUsers();
    const users = await UsersColIns.find({}).toArray();
    const user = users.find((user) => user.name === query.name);
    if (user == null) {
        return false;
    }
    try {
        // comparing the hashed password's equivalent string password to the password coming from user's request 
        if (await bcrypt.compare(query.password, user.password)) {
            return true
        } else {
            return false
        }
    } catch (err) {
        return false
    }
}

// !Get the list of users
const getUsers = async () => {
    try {
        const TODO = client.db("TODO");
        const users = TODO.collection("Users");
        return users;
    } catch (error) {
        console.log("Can't get the users collection !");
    }
}

module.exports = { authenticate, getUsers};