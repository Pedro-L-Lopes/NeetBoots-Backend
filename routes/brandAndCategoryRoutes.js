const express = require("express");
const router = express.Router();

// Controller
const {
  insertBrand,
  getAllBrands,
  getBrandById,
  insertCategory,
  getAllCategories,
  getCategoryById,
} = require("../controllers/BrandAndCategoryControllers");

// Middlewares
const {
  createBrandValidation,
  createCategoryValidation,
} = require("../middlewares/BrandAndCategoryValidation.js");
const validate = require("../middlewares/handleValidation");
const { imageUpload } = require("../middlewares/imageUpload");

// Marcas
router.get("/brands", getAllBrands);
router.get("/brand/:id", getBrandById);
router.post(
  "/insertBrand",
  //   createBrandValidation(),
  validate,
  imageUpload.single("logotipo"),
  insertBrand
);

// Categorias
router.get("/categories", getAllCategories);
router.get("/category/:id", getCategoryById);
router.post(
  "/insertCategory",
  createCategoryValidation(),
  validate,
  insertCategory
);

module.exports = router;
