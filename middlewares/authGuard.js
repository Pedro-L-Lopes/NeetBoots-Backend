const jwt = require("jsonwebtoken");
const jwtSecret = process.env.JWT_SECRET;
const db = require("../config/db.js");

const authGuard = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ errors: ["Acesso negado!"] });
  }

  try {
    // Verificar o token
    const verified = jwt.verify(token, jwtSecret);

    // Consultar o banco de dados para obter informações do usuário
    db.query(
      "SELECT nome, email, cpf, data_nascimento, genero, telefone, endereco, cidade, estado, cep, id_tipo_conta, data_criacao, data_atualizacao FROM clientes WHERE id_cliente = ?",
      [verified.id],
      (error, results) => {
        if (error) {
          console.log(error);
          return res.status(500).json({ errors: ["Erro no banco de dados"] });
        }

        if (results.length === 0) {
          return res.status(401).json({ errors: ["Usuário não encontrado"] });
        }

        const user = results[0];
        // Remover a senha do objeto do usuário
        delete user.password;

        // Armazenar as informações do usuário na req para uso posterior
        req.user = user;

        next();
      }
    );
  } catch (error) {
    console.log(error);
    res.status(401).json({ errors: ["Token Inválido!"] });
  }
};

module.exports = authGuard;
