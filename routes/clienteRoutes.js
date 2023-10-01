const express = require("express");
const router = express.Router();

// Controller
const { getAllClients, register } = require("../controllers/ClienteController");

// Middlewares
const validate = require("../middlewares/handleValidation");
const {
  ClientCreateValidation,
  clientCreateValidation,
} = require("../middlewares/clienteValidations");

router.get("/", getAllClients);
router.post("/register", clientCreateValidation(), validate, register);

module.exports = router;
