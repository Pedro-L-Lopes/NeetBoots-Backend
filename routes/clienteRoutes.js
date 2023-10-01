const express = require("express");
const router = express.Router();

const { getAllClients, register } = require("../controllers/ClienteController");

router.get("/", getAllClients);
router.post("/register", register);

module.exports = router;
