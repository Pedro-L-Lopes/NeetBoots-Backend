const db = require("../config/db.js");

const insertBrand = async (req, res) => {
  const { nome, origem } = req.body;

  let logotipo = null;

  if (req.file) {
    logotipo = req.file.filename;
  }

  const q = "INSERT INTO marcas (nome, origem, logotipo) VALUES (?, ?, ?)";

  db.query(q, [nome, origem, logotipo], (error, results) => {
    if (error) {
      reject(error);
    } else {
      resolve(results.insertId);
    }
  });

  return res.status(201).json({ message: "Marca inserida com sucesso!" });
};

const getAllBrands = async (req, res) => {
  const q = "SELECT id_marca, nome, origem, logotipo FROM marcas";

  db.query(q, (err, data) => {
    if (err) {
      console.log("Erro ao buscar marcas: ", err);
      return res.status(500).json({ error: "Erro interno do servidor" });
    }

    return res.status(200).json(data);
  });
};

const getBrandById = async (req, res) => {
  const { id } = req.params;

  const q = `SELECT id_marca, nome, origem, logotipo FROM marcas WHERE id_marca = ${id}`;

  try {
    db.query(q, (err, data) => {
      return res.status(200).json(data);
    });
  } catch (error) {
    res.status(404).json({ errors: ["Usuário não encontrado!"] });
    return;
  }
};

const insertCategory = async (req, res) => {
  const { nome, descricao } = req.body;

  const q = "INSERT INTO categorias (nome, descricao) VALUES (?, ?)";

  db.query(q, [nome, descricao], (error, results) => {
    if (error) {
      console.log("Erro ao inserir categoria: ", error); // Registre o erro no console para depuração
      return res.status(500).json({ error: "Erro interno do servidor" });
    } else {
      return res
        .status(201)
        .json({ message: "Categoria inserida com sucesso!" });
    }
  });
};

module.exports = { insertBrand, getAllBrands, getBrandById, insertCategory };
