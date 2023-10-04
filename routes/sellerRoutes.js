const express = require("express");
const router = express.Router();

// Controller
const {
  getAllSellers,
  register,
  login,
  getCurrentUser,
  updateSeller,
  getUserById,
} = require("../controllers/sellerController");

// Middlewares
const {
  sellerCreateValidation,
  loginValidation,
  sellerUpdateValidation,
} = require("../middlewares/sellerValidation");
const validate = require("../middlewares/handleValidation");
const { imageUpload } = require("../middlewares/imageUpload");
const authGuard = require("../middlewares/authGuard");

router.get("/", getAllSellers);
router.post("/register", sellerCreateValidation(), validate, register);
router.post("/login", loginValidation(), validate, login);
router.get("/profile-store", authGuard(2), getCurrentUser);
router.put(
  "/",
  authGuard(2),
  sellerUpdateValidation(),
  validate,
  imageUpload.single("imagem"),
  updateSeller
);
router.get("/:id", getUserById);

module.exports = router;
