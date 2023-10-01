const db = require("../config/db.js");

const jwt = require("jsonwebtoken");
const jwtSecret = process.env.JWT_SECRET;

const authGuard = async (req, res, next) => {
  try {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];

    if (!token) return res.status(401).json({ errors: ["Acesso negado!"] });

    // Verificar o token
    const verified = jwt.verify(token, jwtSecret);

    // Consultar o banco de dados para obter o usuário
    const [rows] = await db.query("SELECT * FROM users WHERE id = ?", [
      verified.id,
    ]);

    if (rows.length === 0) {
      return res.status(401).json({ errors: ["Usuário não encontrado!"] });
    }

    // Armazenar o usuário na requisição
    req.user = rows[0];

    next();
  } catch (error) {
    res.status(401).json({ errors: ["Token Inválido!"] });
  }
};

module.exports = authGuard;
