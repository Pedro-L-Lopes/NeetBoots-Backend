// Servirá para todas as validações
const { validationResult } = require("express-validator");

const validate = (req, res, next) => {
  const errors = validationResult(req); // Pegando os erros que vem da requisição

  if (errors.isEmpty()) {
    return next(); // Se os erros estiverem vazios prossegue
  }

  const extractedErros = []; // Erros extraidos

  // Tranforma em array, faz um loop chamando cada erro de err e pega a msg de cada um e coloca no extractedErros
  errors.array().map((err) => extractedErros.push(err.msg));

  // Mandar um array de objetos chamado errors o extracted erros para consumir no front end
  return res.status(422).json({
    errors: extractedErros,
  });
};

module.exports = validate;
