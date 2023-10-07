const { body } = require("express-validator");

const productCreateValidation = () => {
  return [
    body("nome")
      .notEmpty()
      .withMessage("Insira o nome do produto")
      .isString()
      .withMessage("Insira o nome do produto")
      .isLength({ min: 2 })
      .withMessage("O nome deve ter no mínimo 2 caracteres"),
    body("preco")
      .notEmpty()
      .withMessage("Insira o preço do produto")
      .isNumeric()
      .withMessage("Insira o preço do produto"),
    body("tamanho")
      .notEmpty()
      .withMessage("Insira o(s) tamanho(s) ao produto")
      .isString()
      .withMessage("Insira o(s) tamanho(s) ao produto"),
    body("descricao")
      .notEmpty()
      .withMessage("Insira a descrição do produto")
      .isString()
      .withMessage("Insira a descrição do produto"),
    body("em_promocao")
      .isBoolean()
      .withMessage("Informe se o produto está ou não em promoção"),
    body("preco_promocional")
      .optional()
      .isNumeric()
      .withMessage("O preço promocional deve ser numérico quando fornecido"),
    body("quant_estoque")
      .notEmpty()
      .withMessage("Informe a quantidade do estoque")
      .isInt()
      .withMessage("Informe a quantidade do estoque"),
    body("disponibilidade")
      .isBoolean()
      .withMessage("Informe a disponibilidade"),
    body("tags")
      .notEmpty()
      .isString()
      .withMessage("Informe pelo menos uma as tag do produto"),
    body("id_marca")
      .notEmpty()
      .withMessage("Insira a marca do produto")
      .isInt()
      .withMessage("Insira a marca do produto"),
    body("id_categoria")
      .notEmpty()
      .withMessage("Insira a categoria do produto")
      .isInt()
      .withMessage("Insira a categoria do produto"),
  ];
};

module.exports = {
  productCreateValidation,
};
