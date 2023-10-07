const db = require("../config/db.js");
const util = require("util");
const query = util.promisify(db.query).bind(db);

const insertBrand = async (req, res) => {
  const { nome, origem } = req.body;

  let logotipo = null;

  if (req.file) {
    logotipo = req.file.filename;
  }

  try {
    const q = "INSERT INTO marcas (nome, origem, logotipo) VALUES (?, ?, ?)";
    const result = await query(q, [nome, origem, logotipo]);

    return res.status(201).json({
      message: "Marca inserida com sucesso!",
      insertId: result.insertId,
    });
  } catch (error) {
    console.error("Erro ao inserir marca: ", error);
    return res.status(500).json({ error: "Erro interno do servidor" });
  }
};

const getAllBrands = async (req, res) => {
  try {
    let { limit, offset } = req.query;
    limit = Number(limit) || 1;
    offset = Number(offset) || 0;
    const currentUrl = req.baseUrl;

    // Consulta para contar o número total de marcas
    const countQuery = "SELECT COUNT(id_marca) AS total FROM marcas";
    const [{ total }] = await query(countQuery);

    // Consulta para obter os dados paginados
    const selectQuery =
      "SELECT id_marca, nome, origem, logotipo FROM marcas ORDER BY nome LIMIT ? OFFSET ?";
    const data = await query(selectQuery, [limit, offset]);

    // Calcula URLs para próxima e página anterior
    const next = offset + limit;
    const nextUrl =
      next < total
        ? `${currentUrl}/brands?limit=${limit}&offset=${next}`
        : null;

    const previous = offset - limit < 0 ? null : offset - limit;
    const previousUrl =
      previous != null
        ? `${currentUrl}?limit=${limit}&offset=${previous}`
        : null;

    return res.status(200).json({
      nextUrl,
      previousUrl,
      limit,
      offset,
      total,
      data,
    });
  } catch (error) {
    console.error("Erro ao buscar marcas: ", error);
    return res.status(500).json({ error: "Erro interno do servidor" });
  }
};

const getBrandById = async (req, res) => {
  const { id } = req.params;

  const q = `SELECT id_marca, nome, origem, logotipo FROM marcas WHERE id_marca = ${id}`;

  try {
    db.query(q, (err, data) => {
      return res.status(200).json(data);
    });
  } catch (error) {
    res.status(404).json({ errors: ["Marca não encontrada!"] });
    return;
  }
};

const insertCategory = async (req, res) => {
  const { nome, descricao } = req.body;

  try {
    const q = "INSERT INTO categorias (nome, descricao) VALUES (?, ?)";
    const result = await query(q, [nome, descricao]);

    return res.status(201).json({
      message: "Categoria inserida com sucesso!",
      insertId: result.insertId,
    });
  } catch (error) {
    console.error("Erro ao inserir categoria: ", error);
    return res.status(500).json({ error: "Erro interno do servidor" });
  }
};

const getAllCategories = async (req, res) => {
  const q = "SELECT id_categoria, nome, descricao FROM categorias";

  const data = await query(q);

  return res.status(200).json(data);
};

const getCategoryById = async (req, res) => {
  const { id } = req.params;

  const q = `SELECT id_categoria, nome, descricao FROM categorias WHERE id_categoria = ?`;

  try {
    const data = await query(q, [id]);

    if (data.length === 0) {
      return res.status(404).json({ errors: ["Categoria não encontrada!"] });
    }

    return res.status(200).json(data);
  } catch (error) {
    console.error("Erro ao buscar categoria por ID: ", error);
    return res.status(500).json({ error: "Erro interno do servidor" });
  }
};

module.exports = {
  insertBrand,
  getAllBrands,
  getBrandById,
  insertCategory,
  getAllCategories,
  getCategoryById,
};
