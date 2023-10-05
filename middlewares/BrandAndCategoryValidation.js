const { body } = require("express-validator");

const createBrandValidation = () => {
  return [
    body("nome")
      .notEmpty()
      .withMessage("Insira o nome da marca")
      .isString()
      .withMessage("Insira o nome da marca")
      .isLength({ min: 2 })
      .withMessage("O nome precisa ter no mínimo 2 caracteres"),
    body("origem")
      .notEmpty()
      .withMessage("Insira a origem da marca")
      .isString()
      .withMessage("Insira a origem da marca")
      .isLength({ min: 2 })
      .withMessage("A origem precisa ter no mínimo 2 caracteres"),
    body("logotipo").notEmpty().withMessage("Insira o logotipo").isString(),
  ];
};

const createCategoryValidation = () => {
  return [
    body("nome")
      .notEmpty()
      .withMessage("Insira o nome da categoria")
      .isString()
      .withMessage("Insira o nome da categoria")
      .isLength({ min: 2 })
      .withMessage("O nome precisa ter no mínimo 2 caracteres"),
    body("descricao")
      .notEmpty()
      .withMessage("Insira a descrição da categoria")
      .isString()
      .withMessage("Insira a descrição da categoria")
      .isLength({ min: 2 })
      .withMessage("A descrição precisa ter no mínimo 2 caracteres"),
  ];
};

module.exports = {
  createBrandValidation,
  createCategoryValidation,
};
