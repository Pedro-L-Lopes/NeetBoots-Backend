const express = require("express");
const router = express.Router();

// Controller
const {
  register,
  login,
  getAllClients,
  getCurrentUser,
  updateClient,
} = require("../controllers/ClienteController");

// Middlewares
const validate = require("../middlewares/handleValidation");
const {
  clientCreateValidation,
  loginValidation,
  clientUpdateValidation,
} = require("../middlewares/clienteValidations");
const authGuard = require("../middlewares/authGuard");
const { imageUpload } = require("../middlewares/imageUpload");

router.get("/", validate, getAllClients);
router.post("/register", clientCreateValidation(), validate, register);
router.post("/login", loginValidation(), validate, login);
router.get("/profile", authGuard, getCurrentUser);
router.put(
  "/",
  authGuard,
  clientUpdateValidation(),
  validate,
  imageUpload.single("imagem"),
  updateClient
);

module.exports = router;
