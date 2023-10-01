const express = require("express");
const router = express.Router();

// Controller
const { getAllClients, register } = require("../controllers/ClienteController");

// Middlewares
const validate = require("../middlewares/handleValidation");

router.get("/", getAllClients);
router.post("/register", validate, register);

module.exports = router;
