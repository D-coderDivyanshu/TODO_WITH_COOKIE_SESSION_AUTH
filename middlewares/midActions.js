const cookieParser = require("cookie-parser");
const client = require("../db/connect.js");

// ! sign up 
const addUser = async (user) => {
    try {
        const TODO = client.db("TODO");
        const users = TODO.collection("Users");
        const usersCollection = await users.find({}).toArray();
        const username = user.name;
        const exist = usersCollection.some(user => user.name === username);
        if (!exist) {
            await users.insertOne(user);
            await TODO.createCollection(user.name);
            return "Sign up Successful";
        } else {
            return "Username Exist ! Try another"
        }
    } catch (error) {
        return `Error creating document: ${error}`;
    }
}

// ! Add task
const createDoc = async (newList, username) => {
    try {
        const TODO = client.db("TODO");
        const todoList = TODO.collection(username);
        const doc = { Task: newList, Status: "Pending" };
        await todoList.insertOne(doc);
        return `The Task has been inserted Successfully`;
    } catch (error) {
        return `Error creating document : ${error}`;
    }
}

// ! update task
const MarkDone = async (task, username) => {
    try {
        const TODO = client.db("TODO");
        const todoList = TODO.collection(username);
        const query = { Task: task };
        const statusUpdate = {
            $set: {
                Status: "Done",
            }
        };
        await todoList.updateMany(query, statusUpdate);
        return `Nice, you are now one more step closer to success :)`;
    } catch (error) {
        return `Update failed : ${error}`;
    }
}

// ! Get tasks
const list = async (input, userList) => {
    try {
        const TODO = client.db("TODO");
        const todoList = TODO.collection(userList);
        let output;
        if (input === "all") {
            output = await todoList.find().toArray();
        } else {
            const flags = {
                Status: input,
            };
            output = await todoList.find(flags).toArray();
        }
        console.log(`Your List of to-dos : `);
        console.log(output)
        return output
    } catch (error) {
        console.error("Error listing tasks:", error);
        return error
    }
}

// ! Delete all tasks
const delAll = async (confirmation, username) => {
    try {
        const TODO = client.db("TODO");
        const todoList = TODO.collection(username);
        if (confirmation === "yes" || confirmation === 'YES') {
            await todoList.deleteMany();
        }
    } catch (error) {
        return `Error deleting all tasks: ${error}`;
    }
}

// ! Delete task
const del = async (task, username) => {
    try {
        const TODO = client.db("TODO");
        const todoList = TODO.collection(username);
        const query = { Task: task };
        await todoList.deleteOne(query);
    } catch (error) {
        return `Error deleting task: ${error}`;
    }
}

const updateSession = async(session, sessionToken) => {
    try {
        const TODO = client.db("TODO");
        const sessions = TODO.collection("userSessions");
        const cookieData = {
            user: session,
            Token: sessionToken
        }
        await sessions.insertOne(cookieData);
    } catch (error) {
        return `Interrupt in session storage : ${error}`;
    }
}

const cookieAuth = async(cookie) => {

    if (!cookie) {
        return false;
    }

    // We can obtain the session token from the requests cookies, which come with every request
    const sessionToken = cookies['session_token'];
    if (!sessionToken) {
        // If the cookie is not set, return an unauthorized status
        return false;
    }

    // We then get the session of the user from our session map
    // that we set in the signinHandler
    userSession = sessions[sessionToken]
    if (!userSession) {
        // If the session token is not present in session map, return an unauthorized error
        res.status(401).end()
        return
    }
    // if the session has expired, return an unauthorized error, and delete the 
    // session from our map
    if (userSession.isExpired()) {
        delete sessions[sessionToken]
        res.status(401).end()
        return
    }
}

// Exporting the functions
module.exports = { createDoc, MarkDone, del, list, delAll, addUser, updateSession }