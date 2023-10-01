const express = require("express");
const router = express.Router();

// Controller
const {
  register,
  login,
  getAllClients,
  getCurrentUser,
} = require("../controllers/ClienteController");

// Middlewares
const validate = require("../middlewares/handleValidation");
const {
  clientCreateValidation,
  loginValidation,
} = require("../middlewares/clienteValidations");
const authGuard = require("../middlewares/authGuard");

router.get("/", validate, getAllClients);
router.post("/register", clientCreateValidation(), validate, register);
router.post("/login", loginValidation(), validate, login);
router.get("/profile", authGuard, getCurrentUser);

module.exports = router;
