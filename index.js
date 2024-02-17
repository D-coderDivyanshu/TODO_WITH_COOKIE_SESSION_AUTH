const express = require("express");
const app = express();
const actions = require("./routes/actions.js");
const client = require("./db/connect.js");

app.use(express.json());
app.use("/users", actions);

(async function () {
    try {
        await client.connect();
        await client.db("TODO").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } catch (error) {
        console.error("The database connection failed!", error);
    }
})()

app.listen(8080, () => { console.log("Server is listening on 8080...") });
