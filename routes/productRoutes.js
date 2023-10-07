const express = require("express");
const router = express.Router();

// Controller
const {
  createProduct,
  cadeouser,
} = require("../controllers/ProductController");

// Middlewares
const authGuard = require("../middlewares/authGuard");
const validate = require("../middlewares/handleValidation");
const { productCreateValidation } = require("../middlewares/productValidation");
const { productImageUpload } = require("../middlewares/imageUpload");

router.post(
  "/createProduct",
  authGuard(2),
  productImageUpload,
  productCreateValidation(),
  validate,
  createProduct
);
router.get("/cadeocara", authGuard(2), cadeouser);

module.exports = router;
