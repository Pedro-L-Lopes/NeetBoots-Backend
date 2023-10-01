const express = require("express");
const router = express.Router();

// Controller
const {
  register,
  login,
  getAllClients,
} = require("../controllers/ClienteController");

// Middlewares
const validate = require("../middlewares/handleValidation");
const {
  clientCreateValidation,
  loginValidation,
} = require("../middlewares/clienteValidations");

router.get("/", validate, getAllClients);
router.post("/register", clientCreateValidation(), validate, register);
router.post("/login", loginValidation(), validate, login);

module.exports = router;
