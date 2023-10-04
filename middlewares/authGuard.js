const db = require("../config/db.js");
const jwt = require("jsonwebtoken");
const jwtSecret = process.env.JWT_SECRET;

const clienteTable =
  "SELECT id_cliente, nome, email, imagem, cpf, data_nascimento, genero, telefone, endereco, cidade, estado, cep, tipo_conta, data_criacao, data_atualizacao FROM clientes WHERE id_cliente = ?";

const vendedorTable =
  "SELECT id_vendedor, nome, nome_loja, email, imagem_loja, cnpj, cpf, genero, telefone, endereco, cidade, estado, cep, tipo_conta, data_criacao, data_atualizacao FROM vendedores WHERE id_vendedor = ?";

const admTable =
  "SELECT id_vendedores, nome, nome_loja, email, imagem_loja, cnpj, cpf, data_nascimento, genero, telefone, endereco, cidade, estado, cep, tipo_conta, data_criacao, data_atualizacao FROM vendedor WHERE id_vendedor = ?";

const authGuard = (type) => {
  return (req, res, next) => {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];

    if (!token) {
      return res.status(401).json({ errors: ["Acesso negado!"] });
    }

    try {
      // Verificar o token
      const verified = jwt.verify(token, jwtSecret);

      let typeAccount;
      let typeA;
      switch (type) {
        case 1:
          typeAccount = clienteTable;
          typeA = "Cliente";
          break;
        case 2:
          typeAccount = vendedorTable;
          typeA = "Vendedor";
          break;
        case 3:
          typeAccount = admTable;
          typeA = "Administração";
          break;
        default:
          return res.status(400).json({ errors: ["Tipo de conta inválido!"] });
      }

      // Consultar o banco de dados para obter informações do usuário
      db.query(typeAccount, [verified.id], (error, results) => {
        if (error) {
          console.log(error);
          return res.status(500).json({ errors: ["Erro no banco de dados"] });
        }

        if (results.length === 0) {
          return res.status(401).json({ errors: ["Usuário não encontrado"] });
        }

        const user = results[0];

        // Verificar o tipo de conta do usuário
        if (user.tipo_conta !== typeA) {
          return res.status(403).json({ errors: ["Acesso negado!"] });
        }

        // Remover a senha do objeto do usuário
        delete user.senha;

        // Armazenar as informações do usuário na req para uso posterior
        req.user = user;

        next();
      });
    } catch (error) {
      console.log(error);
      res.status(401).json({ errors: ["Token Inválido!"] });
    }
  };
};

module.exports = authGuard;
