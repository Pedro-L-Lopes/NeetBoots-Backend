const express = require("express");
const router = express.Router();

// Controller
const {
  createProduct,
  getProductById,
  getAllProducts,
  filterProducts,
  promotionProducts,
  categoryProducts,
  lastProducts,
  getSellerProducts,
  searchProducts,
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
router.get("/seller/:id", getSellerProducts);
router.get("/searchProducts", searchProducts);
router.get("/promotion", promotionProducts);
router.get("/products-category", categoryProducts);
router.get("/new-products", lastProducts);
router.get("/:id", getProductById);
router.get("/", getAllProducts);

module.exports = router;
