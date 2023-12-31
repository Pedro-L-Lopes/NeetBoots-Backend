const { body, validationResult } = require("express-validator");

const sellerCreateValidation = () => {
  return [
    body("nome")
      .notEmpty()
      .withMessage("Insira seu nome completo!")
      .isString()
      .withMessage("Insira seu nome completo!")
      .isLength({ min: 3 })
      .withMessage("Insira seu nome completo!"),
    body("nome_loja")
      .notEmpty()
      .withMessage("Insira o nome da loja")
      .isString()
      .withMessage("Insira o nome da loja")
      .isLength({ min: 2 })
      .withMessage("Insira o nome da loja"),
    body("email")
      .isString()
      .withMessage("Insira um email válido!")
      .isEmail()
      .withMessage("Insira um email válido!"),
    body("senha")
      .isString()
      .withMessage("Insira a senha!")
      .isLength({ min: 5 })
      .withMessage("A senha precisa ter no mínimo 5 carcteres."),
    body("confirmacaoSenha")
      .isString()
      .withMessage("Confirme a sua senha!")
      .custom((value, { req }) => {
        if (value != req.body.senha) {
          throw new Error("As senhas precisam ser iguais!");
        }
        return true;
      }),
    body("telefone")
      .notEmpty()
      .withMessage("Insira o número de telefone!")
      .isString()
      .withMessage("Insira o número de telefone!")
      .isLength({ min: 10 })
      .withMessage("Insira um número de telefone válido!"),
    body("genero")
      .notEmpty()
      .withMessage("Selecione o gênero!")
      .isString()
      .withMessage("Selecione o gênero!")
      .isIn(["Masculino", "Feminino", "Outro"])
      .withMessage("Selecione um gênero válido!"),
  ];
};

const loginValidation = () => {
  return [
    body("email")
      .isString()
      .withMessage("Insira um email válido!")
      .isEmail()
      .withMessage("Insira um email válido!"),
    body("senha")
      .isString()
      .withMessage("Insira a senha!")
      .isLength({ min: 5 })
      .withMessage("A senha precisa ter no mínimo 5 carcteres."),
  ];
};

const sellerUpdateValidation = () => {
  return [
    body("nome")
      .optional()
      .isLength({ min: 3 })
      .withMessage("O nome precisa ter no mínimo 3 caracteres!"),
    body("nome_loja")
      .optional()
      .isLength({ min: 3 })
      .withMessage("O nome precisa ter no mínimo 2 caracteres!"),
    body("senha")
      .optional()
      .isLength({ min: 5 })
      .withMessage("A senha precisa ter no mínimo 5 caracteres!"),
    body("confirmacaoSenha")
      .optional()
      .isLength({ min: 5 })
      .withMessage("A senha precisa ter no mínimo 5 caracteres!"),
  ];
};

module.exports = {
  sellerCreateValidation,
  loginValidation,
  sellerUpdateValidation,
};
