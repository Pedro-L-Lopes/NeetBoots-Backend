const db = require("../config/db.js");
const dbHelpers = require("../utils/dbHelpers.js");

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
    const emailExists = await dbHelpers.findUserByEmail(db, email);

    if (emailExists) {
      return res.status(409).json({ errors: "Email já cadastrado." });
    }

    const passwordHash = await bcrypt.hash(senha, await bcrypt.genSalt());

    const insertedUserId = await new Promise((resolve, reject) => {
      const sql =
        "INSERT INTO clientes (nome, email, senha, telefone, data_nascimento, genero) VALUES (?, ?, ?, ?, ?, ?)";

      db.query(
        sql,
        [nome, email, passwordHash, telefone, data_nascimento, genero],
        (error, results) => {
          if (error) {
            reject(error);
          } else {
            resolve(results.insertId);
          }
        }
      );
    });

    const token = generateToken(insertedUserId);

    return res.status(201).json({
      id: insertedUserId,
      token,
    });
  } catch (error) {
    console.error("Erro ao registrar cliente:", error);
    return res.status(500).json({ error: "Erro interno do servidor" });
  }
};

const login = async (req, res) => {
  const { email, senha } = req.body;

  try {
    const user = await dbHelpers.findUserByEmail(db, email);
    console.log(user);

    if (!user) {
      return res.status(404).json({ errors: ["Usuário não encontrado!"] });
    }

    const isPasswordValid = await bcrypt.compare(senha, user.senha);

    if (!isPasswordValid) {
      return res.status(422).json({ errors: ["Senha inválida!"] });
    }

    const token = generateToken(user.id_cliente);

    return res.status(200).json({
      id: user.id_cliente,
      imagem: user.imagem,
      token,
    });
  } catch (error) {
    console.error("Erro ao fazer login:", error);
    return res.status(500).json({ error: "Erro interno do servidor" });
  }
};

// Pegando usuário atual
const getCurrentUser = async (req, res) => {
  const user = req.user;

  res.status(200).json(user);
};

module.exports = {
  register,
  login,
  getCurrentUser,
  getAllClients,
};
