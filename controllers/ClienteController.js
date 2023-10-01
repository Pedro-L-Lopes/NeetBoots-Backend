const db = require("../config/db.js");

const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const jwtSecret = process.env.JWT_SECRET;

// Gerando token de usuário
const generateToken = (id) => {
  return jwt.sign({ id }, jwtSecret, {
    expiresIn: "7d",
  });
};

// Buscando todos os clientes
const getAllClients = (req, res) => {
  const q = "SELECT * FROM clientes";

  db.query(q, (err, data) => {
    if (err) {
      console.error("Erro ao buscar clientes:", err);
      return res.status(500).json({ error: "Erro interno do servidor" });
    }

    return res.status(200).json(data);
  });
};

// Registrando
const register = async (req, res) => {
  const { nome, email, senha, telefone, data_nascimento, genero } = req.body;

  try {
    // Checando se o cliente existe
    const query = "SELECT * FROM clientes WHERE email = ?";
    db.query(query, [email], async (err, results) => {
      if (err) {
        console.error("Erro ao verificar cliente:", err);
        return res.status(500).json({ error: "Erro interno do servidor" });
      }

      if (results.length > 0) {
        return res.status(409).json({ error: "Email já cadastrado." });
      }

      try {
        // Gerando senha criptografada
        const salt = await bcrypt.genSalt();
        const passwordHash = await bcrypt.hash(senha, salt);

        // Inserindo o novo cliente no banco de dados
        const inserirUsuarioSQL =
          "INSERT INTO clientes (nome, email, senha, telefone, data_nascimento, genero) VALUES (?, ?, ?, ?, ?, ?)";
        const values = [
          nome,
          email,
          passwordHash,
          telefone,
          data_nascimento,
          genero,
        ];

        db.query(inserirUsuarioSQL, values, (err, results) => {
          if (err) {
            console.error("Erro ao inserir cliente:", err);
            return res.status(500).json({ error: "Erro interno do servidor" });
          }

          return res.status(201).json({
            id: results.insertId,
            token: generateToken(results.insertId),
          });
        });
      } catch (error) {
        console.error("Erro ao gerar senha criptografada:", error);
        return res.status(500).json({ error: "Erro interno do servidor" });
      }
    });
  } catch (error) {
    console.error("Erro ao verificar cliente:", error);
    return res.status(500).json({ error: "Erro interno do servidor" });
  }
};

module.exports = {
  register,
  getAllClients,
};
