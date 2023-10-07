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

// Buscando todos os vendores
const getAllSellers = async (req, res) => {
  try {
    const q =
      "SELECT id_vendedor, nome, nome_loja, imagem, email, cnpj FROM vendedores";

    const data = await query(q);

    return res.status(200).json(data);
  } catch (error) {
    console.error("Erro ao buscar vendedores:", err);
    return res.status(500).json({ error: "Erro interno do servidor" });
  }
};

// Registrando
const register = async (req, res) => {
  const { nome, nome_loja, cnpj, cpf, email, senha, telefone, genero } =
    req.body;

  try {
    const emailExists = await dbHelpers.findSellerByEmail(db, email);

    if (emailExists) {
      return res.status(409).json({ errors: "Email já cadastrado." });
    }

    const passwordHash = await bcrypt.hash(senha, await bcrypt.genSalt());

    const sql =
      "INSERT INTO vendedores (nome, nome_loja, cnpj, cpf, email, senha, telefone, genero, tipo_conta) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)";
    const insertedUserId = await query(sql, [
      nome,
      nome_loja,
      cnpj,
      cpf,
      email,
      passwordHash,
      telefone,
      genero,
      "Vendedor",
    ]);

    const token = generateToken(insertedUserId.insertId);

    return res.status(201).json({
      id: insertedUserId.insertId,
      token,
    });
  } catch (error) {
    console.error("Erro ao registrar vendedor:", error);
    return res.status(500).json({ error: "Erro interno do servidor" });
  }
};

const login = async (req, res) => {
  const { email, senha } = req.body;

  try {
    const user = await dbHelpers.findSellerByEmail(db, email);

    if (!user) {
      return res.status(404).json({ errors: ["Usuário não encontrado!"] });
    }

    const isPasswordValid = await bcrypt.compare(senha, user.senha);

    if (!isPasswordValid) {
      return res.status(422).json({ errors: ["Senha inválida!"] });
    }

    const token = generateToken(user.id_vendedor);

    return res.status(200).json({
      id: user.id_vendedor,
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

  if (user.tipo_conta !== "Vendedor") {
    return res.status(403).json({ errors: ["Acesso negado!"] });
  }

  res.status(200).json(user);
};

// Atualizando vendedor
const updateSeller = async (req, res) => {
  const {
    nome,
    nome_loja,
    senha,
    email,
    cpf,
    cnpj,
    genero,
    telefone,
    endereco,
    cidade,
    estado,
    cep,
  } = req.body;

  const reqUser = req.user;

  try {
    const user = await dbHelpers.findSellerById(db, reqUser.id_vendedor);

    if (!req.user) {
      return res.status(400).json({ errors: "Usuário não autenticado" });
    }

    let imagem = null;

    if (req.file) {
      imagem = req.file.filename;

      if (user.imagem) {
        const pathToOldImage = path.join(
          __dirname,
          "../uploads/vendedores/",
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

    if (nome_loja) {
      user.nome_loja = nome_loja;
    }

    if (email) {
      user.email = email;
    }

    if (cpf) {
      user.cpf = cpf;
    }

    if (cnpj) {
      user.cnpj = cnpj;
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

    if (senha) {
      const salt = await bcrypt.genSalt();
      const senhaHash = await bcrypt.hash(senha, salt);
      user.senha = senhaHash;
    }

    if (imagem) {
      user.imagem = imagem;
    }

    const updateQuery = `
   UPDATE vendedores 
   SET nome = ?, nome_loja = ?, email = ?, senha = ?, imagem = ?, cpf = ?, cnpj = ?, genero = ?, telefone = ?, endereco = ?, cidade = ?, estado = ?, cep = ?
   WHERE id_vendedor = ?
 `;

    const values = [
      user.nome,
      user.nome_loja,
      user.email,
      user.senha,
      user.imagem,
      user.cpf,
      user.cnpj,
      user.genero,
      user.telefone,
      user.endereco,
      user.cidade,
      user.estado,
      user.cep,
      user.id_vendedor,
    ];

    await query(updateQuery, values);

    console.log("Vendedor atualizado com sucesso!");
    return res.status(200).json({ message: "Vendedor atualizado com sucesso" });
  } catch (error) {
    console.error("Erro ao atualizar o vendedor:", error);
    return res.status(500).json({ errors: "Erro ao atualizar o vendedor" });
  }
};

const getUserById = async (req, res) => {
  const { id } = req.params;

  let user = null;

  try {
    user = await dbHelpers.findSellerById(db, id);
  } catch (error) {
    res.status(404).json({ errors: ["Loja não encontrada!"] });
    return;
  }

  if (!user) {
    res.status(404).json({ errors: ["Loja não encontrada!"] });
    return;
  }
  return res.status(200).json(user);
};

module.exports = {
  getAllSellers,
  register,
  login,
  getCurrentUser,
  updateSeller,
  getUserById,
};
