const express = require("express");
const router = express.Router();

// Controller
const {
  createProduct,
  cadeouser,
} = require("../controllers/ProductController");

// Middlewares
const authGuard = require("../middlewares/authGuard");
const { productCreateValidation } = require("../middlewares/productValidation");

router.post(
  "/createProduct",
  authGuard(2),
  productCreateValidation(),
  createProduct
);
router.get("/cadeocara", authGuard(2), cadeouser);

module.exports = router;
