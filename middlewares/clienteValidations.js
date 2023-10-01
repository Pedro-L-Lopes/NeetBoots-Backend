const { body, validationResult } = require("express-validator");

const clientCreateValidation = () => {
  return [
    body("nome")
      .notEmpty()
      .withMessage("Insira seu nome completo!")
      .isString()
      .withMessage("Insira seu nome completo!")
      .isLength({ min: 5 })
      .withMessage("Insira seu nome completo!"),
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
    body("data_nascimento")
      .notEmpty()
      .withMessage("Insira a data de nascimento!")
      .isString()
      .withMessage("Insira a data de nascimento!")
      .isLength({ min: 10, max: 10 })
      .withMessage(
        "Insira uma data de nascimento válida! (Formato: DD/MM/AAAA)"
      ),
    body("genero")
      .notEmpty()
      .withMessage("Selecione o gênero!")
      .isString()
      .withMessage("Selecione o gênero!")
      .isIn(["Masculino", "Feminino", "Outro"])
      .withMessage("Selecione um gênero válido!"),
  ];
};

module.exports = {
  clientCreateValidation,
};
