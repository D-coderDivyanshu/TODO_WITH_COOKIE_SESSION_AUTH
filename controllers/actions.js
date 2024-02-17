const uuid = require("uuid");
const bcrypt = require("bcrypt");
const { authenticate, getUsers} = require("../middlewares/auth.js");
const { createDoc, MarkDone, del, list, delAll, addUser, updateSession } = require("../middlewares/midActions.js")
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const express = require("express");
const app = express();

app.use(bodyParser.json())
app.use(cookieParser())

//! Session Constructor
class Session {
    constructor(username, expiresAt) {
        this.username = username
        this.expiresAt = expiresAt
    }

		// we'll use this method later to determine if the session has expired
    isExpired() {
        this.expiresAt < (new Date())
    }
}

// ! user sign up
const signUp = async (req, res) => {
    try {
        const hashedpassword = await bcrypt.hash(req.body.password, 10);
        const user = { name: req.body.name, password: hashedpassword };
        const result = await addUser(user);
        res.status(201).send(result);
    } catch (err) {
        res.status(500).send(err.message);
    }
};


//! Login
const login = async (req, res) => {
    // get users credentials from the JSON body
    const username = req.body.name;

    if (!username) {
        // If the username isn't present, return an HTTP unauthorized code
        res.status(401).send("no name");
        return
    }

    // validate the password against our data
    // if invalid, send an unauthorized code
    const verification = authenticate(req.body);
    if (!verification) {
        res.status(401).send("The combination is wrong !");
    }

    // generate a random UUID as the session token
    const sessionToken = uuid.v4()

    // set the expiry time as 120s after the current time
    const now = new Date()
    const expiresAt = new Date(+now + 120 * 1000)

    // create a session containing information about the user and expiry time
    const session = new Session(username, expiresAt)

    // add the session information to the sessions map
    updateSession(session, sessionToken);

    // In the response, set a cookie on the client with the name "session_cookie"
    // and the value as the UUID we generated. We also set the expiry time
    res.cookie("session_token", sessionToken, { expires: expiresAt })
    res.status(200).send("Successful generation of token :)");
}


/*
? get requests : 
1. to get list of all tasks
2. to get list of completed tasks
3. to get list of pending tasks
? post requests : 
1. creation of to-do
? put req:
1. to update the status
? delete req:
1. to delete specific/all to-do
? head req:
1. to get the head of res
*/


// ! add task
const addTask = async (req, res) => {
    const user = req.query;
    const verification = await authenticate(user);
    if (verification) {
        const output = await createDoc(req.body.task, user.name);
        res.status(201).send(output);
    } else {
        res.status(403).send("Unauthenticated access denied !");
    }
};

//  ! update task status
const update = async (req, res) => {
    const user = req.query;
    const verification = await authenticate(user);
    if (verification) {
        try {
            const output = await MarkDone(req.body.task, user.name);
            // 202 : accepted
            res.status(200).send(output);
        } catch (error) {
            res.status(400).send(error);
        }
    } else {
        res.status(403).send("Unauthenticated access denied !");
    }
};

//  ! Get all tasks
const getList = async (req, res) => {
    const user = req.query;
    const verification = await authenticate(user);
    if (verification) {
        const output = await list(req.params.getP, user.name);
        res.status(200).send(output);
    } else {
        res.status(403).send("Unauthenticated access denied !");
    }
};

// ! Delete all tasks
const remove = async (req, res) => {
    if (req.params.rmP === "all") {
        const user = req.query;
        const verification = await authenticate(user);
        if (verification) {
            try {
                await delAll("yes", user.name);
                res.status(204).end();
            } catch (error) {
                res.status(400).send(error);
            }
        } else {
            res.status(403).send("Unauthenticated access denied ! one");
        }
    } else {
        const user = req.query;
        const verification = await authenticate(user);
        if (verification) {
            try {
                await del(req.params.rmP, user.name);
                // 204 : successful request without any response
                res.status(204).end();
            } catch (error) {
                res.status(400).send(error);
            }
        } else {
            res.status(403).send("Unauthenticated access denied ! two");
        }
    }
};

module.exports = { addTask, update, remove, getList, signUp, login}