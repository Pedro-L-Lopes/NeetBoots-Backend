const db = require("../config/db.js");

const util = require("util");
const query = util.promisify(db.query).bind(db);

const createProduct = async (req, res) => {
  const {
    nome,
    preco,
    tamanho,
    descricao,
    em_promocao,
    preco_promocional,
    quant_estoque,
    disponibilidade,
    tags,
    id_marca,
    id_categoria,
  } = req.body;

  try {
    const reqUser = req.user;

    const id_vendedor = reqUser.id_vendedor;

    if (reqUser.tipo_conta != "Vendedor") {
      return res.status(401).json({ errors: ["Acesso negado!"] });
    }

    const sql =
      "INSERT INTO produtos (nome, descricao, preco, tamanho, quant_estoque, tags, disponibilidade, em_promocao, preco_promocional, id_marca, id_categoria, id_vendedor) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";

    const newProduct = await query(sql, [
      nome,
      descricao,
      preco,
      tamanho,
      quant_estoque,
      tags,
      disponibilidade,
      em_promocao,
      preco_promocional,
      id_marca,
      id_categoria,
      id_vendedor,
    ]);

    if (!newProduct) {
      res.status(422).json({
        errors: ["Houve um problema, por favor tente novamente mais tarde."],
      });
      return;
    }

    req.files.forEach(async (file) => {
      const insertImageQuery =
        "INSERT INTO imagens_produtos (id_produto, imagem) VALUES (?, ?)";
      await query(insertImageQuery, [newProduct.insertId, file.filename]);
    });

    const getNewProductQuery = "SELECT * FROM produtos WHERE id_produto = ?";
    const [productDetails] = await query(getNewProductQuery, [
      newProduct.insertId,
    ]);

    if (!productDetails) {
      res.status(422).json({
        errors: ["Detalhes do produto não puderam ser recuperados."],
      });
      return;
    }

    const getImagesQuery =
      "SELECT imagem FROM imagens_produtos WHERE id_produto = ?";
    const images = await query(getImagesQuery, [newProduct.insertId]);

    productDetails.imagens = images;

    res.status(201).json(productDetails);
  } catch (error) {
    console.log("Deu ruim", error);
    return res.status(500).json({ errors: ["Erro interno do servidor"] });
  }
};

const getProductById = async (req, res) => {
  const productId = req.params.id;

  try {
    const getProductQuery = "SELECT * FROM produtos WHERE id_produto = ?";
    const [product] = await query(getProductQuery, [productId]);

    if (!product) {
      return res.status(404).json({ errors: ["Produto não encontrado"] });
    }

    const getImagesQuery =
      "SELECT imagem FROM imagens_produtos WHERE id_produto = ?";
    const images = await query(getImagesQuery, [productId]);

    product.imagens = images;

    return res.status(200).json(product);
  } catch (error) {
    console.error("Erro ao buscar produto:", error);
    return res.status(500).json({ errors: ["Erro interno do servidor"] });
  }
};

const getAllProducts = async (req, res) => {
  try {
    let { limit, offset } = req.query;

    limit = Number(limit) || 16;
    offset = Number(offset) || 0;
    const currentUrl = req.baseUrl;

    // Consulta para contar o número total de produtos
    const countQuery = "SELECT COUNT(id_produto) AS total FROM produtos";
    const [{ total }] = await query(countQuery);

    // Consulta para obter os dados paginados
    const selectQuery =
      "SELECT id_produto, nome, descricao, preco, tamanho, quant_estoque, tags, disponibilidade, em_promocao, preco_promocional, id_marca, id_categoria, id_vendedor FROM produtos WHERE disponibilidade = true ORDER BY data_atualizacao LIMIT ? OFFSET ?";
    const data = await query(selectQuery, [limit, offset]);

    // Calcula URLs para próxima e página anterior
    const next = offset + limit;
    const nextUrl =
      next < total ? `${currentUrl}/?limit=${limit}&offset=${next}` : null;

    const previous = offset - limit < 0 ? null : offset - limit;
    const previousUrl =
      previous != null
        ? `${currentUrl}/?limit=${limit}&offset=${previous}`
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
    console.error("Erro ao buscar produtos: ", error);
    return res.status(500).json({ error: "Erro interno do servidor" });
  }
};

const filterProducts = async (req, res) => {
  try {
    let { limit, offset, inPromotion, minPrice, maxPrice, name, tags, sizes } =
      req.query;

    limit = Number(limit) || 16;
    offset = Number(offset) || 0;
    const currentUrl = req.baseUrl;

    let whereClause = "WHERE disponibilidade = true";

    if (inPromotion) {
      whereClause += " AND em_promocao = true";
    }

    if (minPrice) {
      whereClause += ` AND preco >= ${minPrice}`;
    }

    if (maxPrice) {
      whereClause += ` AND preco <= ${maxPrice}`;
    }

    if (name) {
      whereClause += ` AND nome LIKE '%${name}%'`;
    }

    if (tags) {
      const tagsArray = tags.split(",");
      whereClause += ` AND (tags LIKE '%${tagsArray.join(
        "%' OR tags LIKE '%"
      )}%')`;
    }

    if (sizes) {
      const sizesArray = sizes.split(",");
      whereClause += ` AND (tamanho IN ('${sizesArray.join("','")}')`;
    }

    // Consulta para contar o número total de produtos
    const countQuery = `SELECT COUNT(id_produto) AS total FROM produtos ${whereClause}`;
    const [{ total }] = await query(countQuery);

    // Consulta para obter os dados paginados
    const selectQuery = `SELECT id_produto, nome, descricao, preco, tamanho, quant_estoque, tags, disponibilidade, em_promocao, preco_promocional, id_marca, id_categoria, id_vendedor FROM produtos ${whereClause} ORDER BY data_atualizacao LIMIT ? OFFSET ?`;
    const data = await query(selectQuery, [limit, offset]);

    // Calcula URLs para próxima e página anterior
    const next = offset + limit;
    const nextUrl =
      next < total ? `${currentUrl}/?limit=${limit}&offset=${next}` : null;

    const previous = offset - limit < 0 ? null : offset - limit;
    const previousUrl =
      previous != null
        ? `${currentUrl}/?limit=${limit}&offset=${previous}`
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
    console.error("Erro ao buscar produtos: ", error);
    return res.status(500).json({ error: "Erro interno do servidor" });
  }
};

const promotionProducts = async (req, res) => {
  try {
    const q =
      "SELECT id_produto, nome, descricao, preco, tamanho, quant_estoque, tags, em_promocao, preco_promocional, id_marca, id_categoria, id_vendedor FROM produtos WHERE disponibilidade = 1 AND em_promocao = 1 ORDER BY data_atualizacao LIMIT 16";
    const data = await query(q);
    return res.status(200).json(data);
  } catch (error) {
    console.error("Erro ao buscar clientes:", error);
    return res.status(500).json({ error: "Erro interno do servidor" });
  }
};

const lastProducts = async (req, res) => {
  try {
    const q =
      "SELECT id_produto, nome, descricao, preco, tamanho, quant_estoque, tags, em_promocao, preco_promocional, id_marca, id_categoria, id_vendedor FROM produtos WHERE disponibilidade = 1 ORDER BY data_criacao DESC LIMIT 16";
    const data = await query(q);
    return res.status(200).json(data);
  } catch (error) {
    console.error("Erro ao buscar clientes:", error);
    return res.status(500).json({ error: "Erro interno do servidor" });
  }
};

const categoryProducts = async (req, res) => {
  const { category } = req.query;

  try {
    const q = `SELECT id_produto, produtos.nome, produtos.descricao, preco, tamanho, quant_estoque, tags, em_promocao, preco_promocional, id_marca, produtos.id_categoria, id_vendedor FROM produtos JOIN categorias ON categorias.id_categoria = produtos.id_categoria WHERE disponibilidade = 1 and categorias.nome = '${category}' ORDER BY data_criacao DESC LIMIT 16;`;
    const data = await query(q);
    return res.status(200).json(data);
  } catch (error) {
    console.error("Erro ao buscar clientes:", error);
    return res.status(500).json({ error: "Erro interno do servidor" });
  }
};

module.exports = {
  createProduct,
  getProductById,
  getAllProducts,
  filterProducts,
  promotionProducts,
  lastProducts,
  categoryProducts,
};
