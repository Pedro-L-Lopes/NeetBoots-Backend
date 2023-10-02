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
        "INSERT INTO clientes (nome, email, senha, telefone, data_nascimento, genero, tipo_conta) VALUES (?, ?, ?, ?, ?, ?, ?)";
      db.query(
        sql,
        [
          nome,
          email,
          passwordHash,
          telefone,
          data_nascimento,
          genero,
          "Cliente",
        ],
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

// Atualizando cliente
const updateClient = async (req, res) => {
  const {
    nome,
    senha,
    email,
    cpf,
    data_nascimento,
    genero,
    telefone,
    endereco,
    cidade,
    estado,
    cep,
  } = req.body;

  let imagem = null;

  if (req.file) {
    imagem = req.file.filename;
  }

  const reqUser = req.user;

  console.log("DEU RUIM + " + reqUser.nome);
  console.log("DEU RUIM + " + reqUser.id_cliente);

  const user = await dbHelpers.findUserByEmail(db, reqUser.email);

  console.log("DEU RUIM 2 " + user.id_cliente);

  if (!req.user) {
    return res.status(400).json({ message: "Usuário não autenticado" });
  }

  if (nome) {
    user.nome = nome;
  }

  if (email) {
    user.email = email;
  }

  if (cpf) {
    user.cpf = cpf;
  }

  if (data_nascimento) {
    user.data_nascimento = data_nascimento;
  }

  if (senha) {
    const salt = await bcrypt.genSalt();
    const senhaHash = await bcrypt.hash(senha, salt);
    user.senha = senhaHash;
  }

  if (imagem) {
    user.imagem = imagem;
  }

  const updateQuery = `
   UPDATE clientes 
   SET nome = ?, email = ?, senha = ?, imagem = ?, cpf = ?, data_nascimento = ?
   WHERE id_cliente = ?
 `;

  const values = [
    user.nome,
    user.email,
    user.senha,
    user.imagem,
    user.cpf,
    data_nascimento,
    user.id_cliente,
  ];

  db.query(updateQuery, values, (err, results) => {
    if (err) {
      console.error("Erro ao atualizar o cliente:", err);
      return res.status(500).json({ message: "Erro ao atualizar o cliente" });
    }

    console.log("Cliente atualizado com sucesso!");
    return res.status(200).json({ message: "Cliente atualizado com sucesso" });
  });
};

module.exports = {
  register,
  login,
  getCurrentUser,
  updateClient,
  getAllClients,
};
