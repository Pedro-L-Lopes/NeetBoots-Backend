const db = require("../config/db.js");

const insertBrand = async (req, res) => {
  const { nome, origem } = req.body;

  let logotipo = null;

  if (req.file) {
    logotipo = req.file.filename;
  }

  db.query(
    "INSERT INTO marcas (nome, origem, logotipo) VALUES (?, ?, ?)",
    [nome, origem, logotipo],
    (error, results) => {
      if (error) {
        reject(error);
      } else {
        resolve(results.insertId);
      }
    }
  );

  return res.status(201).json({ message: "Categoria inserida com sucesso!" });
};

const insertCategory = async (req, res) => {};

module.exports = { insertBrand };
