const express = require("express");
const router = express.Router();

// Controller
const {
  insertBrand,
  getAllBrands,
  getBrandById,
  insertCategory,
} = require("../controllers/BrandAndCategoryControllers");

// Middlewares
const {
  createBrandValidation,
  createCategoryValidation,
} = require("../middlewares/BrandAndCategoryValidation.js");
const validate = require("../middlewares/handleValidation");
const { imageUpload } = require("../middlewares/imageUpload");

// Categorias
router.post(
  "/insertCategory",
  createCategoryValidation(),
  validate,
  insertCategory
);

// Marcas
router.get("/brands", getAllBrands);
router.get("/:id", getBrandById);
router.post(
  "/insertBrand",
  //   createBrandValidation(),
  validate,
  imageUpload.single("logotipo"),
  insertBrand
);

module.exports = router;
