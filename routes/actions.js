const express = require("express");
const router = express.Router();
const { addTask, update, remove, getList, signUp, login} = require("../controllers/actions.js");

router.route("/").post(signUp);
router.route("/login").post(login);
router.route("/login/todo/add").post(addTask);
router.route("/login/todo/update").put(update);
router.route("/login/todo/list/:getP").get(getList).head(getList);
router.route("/login/todo/delete/:rmP").delete(remove);
module.exports = router; 