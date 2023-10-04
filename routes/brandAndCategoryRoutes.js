const express = require("express");
const router = express.Router();

// Controller
const { insertBrand } = require("../controllers/BrandAndCategoryControllers");

// Middlewares
const {
  createBrandValidation,
} = require("../middlewares/BrandAndCategoryValidation.js");
const validate = require("../middlewares/handleValidation");
const { imageUpload } = require("../middlewares/imageUpload");

router.post(
  "/insertBrand",
  //   createBrandValidation(),
  validate,
  imageUpload.single("logotipo"),
  insertBrand
);

module.exports = router;
