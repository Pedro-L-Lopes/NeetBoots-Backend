const db = require("../config/db.js");

const util = require("util");
const query = util.promisify(db.query).bind(db);

const dbHelpers = require("../utils/dbHelpers.js");

const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const path = require("path");
const fs = require("fs");

const jwtSecret = process.env.JWT_SECRET;

// Gerando token de usuário
const generateToken = (id) => {
  return jwt.sign({ id }, jwtSecret, {
    expiresIn: "7d",
  });
};

// Buscando todos os clientes
const getAllClients = async (req, res) => {
  try {
    const q = "SELECT id_cliente, nome, email, cpf, imagem FROM clientes";
    const data = await query(q);
    return res.status(200).json(data);
  } catch (error) {
    console.error("Erro ao buscar clientes:", error);
    return res.status(500).json({ error: "Erro interno do servidor" });
  }
};

// Registrando
const register = async (req, res) => {
  const { nome, email, senha, telefone, data_nascimento, genero } = req.body;

  try {
    const emailExists = await dbHelpers.findClientByEmail(db, email);

    if (emailExists) {
      return res.status(409).json({ errors: "Email já cadastrado." });
    }

    const passwordHash = await bcrypt.hash(senha, await bcrypt.genSalt());

    const sql =
      "INSERT INTO clientes (nome, email, senha, telefone, data_nascimento, genero, tipo_conta) VALUES (?, ?, ?, ?, ?, ?, ?)";
    const insertedUserId = await query(sql, [
      nome,
      email,
      passwordHash,
      telefone,
      data_nascimento,
      genero,
      "Cliente",
    ]);

    const token = generateToken(insertedUserId.insertId);

    return res.status(201).json({
      id: insertedUserId.insertId,
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
    const user = await dbHelpers.findClientByEmail(db, email);

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

  const reqUser = req.user;

  try {
    const user = await dbHelpers.findClientById(db, reqUser.id_cliente);

    if (!req.user) {
      return res.status(400).json({ message: "Usuário não autenticado" });
    }

    let imagem = null;

    if (req.file) {
      imagem = req.file.filename;

      if (user.imagem) {
        const pathToOldImage = path.join(
          __dirname,
          "../uploads/clientes/",
          user.imagem
        );
        console.log(user.imagem);
        try {
          fs.unlinkSync(pathToOldImage);
          console.log("Imagem anterior excluída com sucesso!");
        } catch (err) {
          console.error("Erro ao excluir a imagem anterior:", err);
        }
      }
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

    if (genero) {
      user.genero = genero;
    }

    if (telefone) {
      user.telefone = telefone;
    }

    if (endereco) {
      user.endereco = endereco;
    }

    if (cidade) {
      user.cidade = cidade;
    }

    if (estado) {
      user.estado = estado;
    }

    if (cep) {
      user.cep = cep;
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
   SET nome = ?, email = ?, senha = ?, imagem = ?, cpf = ?, data_nascimento = ?, genero = ?, telefone = ?, endereco = ?, cidade = ?, estado = ?, cep = ?
   WHERE id_cliente = ?
 `;

    const values = [
      user.nome,
      user.email,
      user.senha,
      user.imagem,
      user.cpf,
      user.data_nascimento,
      user.genero,
      user.telefone,
      user.endereco,
      user.cidade,
      user.estado,
      user.cep,
      user.id_cliente,
    ];

    await query(updateQuery, values);

    console.log("Cliente atualizado com sucesso!");
    return res.status(200).json({ message: "Cliente atualizado com sucesso" });
  } catch (error) {
    console.error("Erro ao atualizar o cliente:", error);
    return res.status(500).json({ message: "Erro ao atualizar o cliente" });
  }
};

const getUserById = async (req, res) => {
  const { id } = req.params;

  try {
    const user = await dbHelpers.findClientById(db, id);

    if (!user) {
      return res.status(404).json({ errors: ["Usuário não encontrado!"] });
    }

    return res.status(200).json(user);
  } catch (error) {
    console.error("Erro ao buscar usuário por ID:", error);
    return res.status(500).json({ error: "Erro interno do servidor" });
  }
};

module.exports = {
  register,
  login,
  getCurrentUser,
  updateClient,
  getUserById,
  getAllClients,
};
