const mysql = require("mysql");
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

// Registrando e logando usuário
const register = async (req, res) => {
  res.send("registro");
};

module.exports = {
  register,
  getAllClients,
};
