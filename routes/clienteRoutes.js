const express = require("express");
const router = express.Router();

// Controller
const {
  register,
  login,
  getAllClients,
  getCurrentUser,
  updateClient,
  getUserById,
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

router.get("/", getAllClients);
router.post("/register", clientCreateValidation(), validate, register);
router.post("/login", loginValidation(), validate, login);
router.get("/profile", authGuard(1), getCurrentUser);
router.put(
  "/",
  authGuard(1),
  clientUpdateValidation(),
  validate,
  imageUpload.single("imagem"),
  updateClient
);
router.get("/:id", getUserById);

module.exports = router;
