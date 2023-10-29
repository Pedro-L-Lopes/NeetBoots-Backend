const db = require("../config/db.js");

const util = require("util");
const query = util.promisify(db.query).bind(db);

// Atualizar produtos
// Excluir produtos
// Editar produtos

// Criar produto
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

// Pegar produto pelo id
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

// Pegar produtos do vendedor/loja
const getSellerProducts = async (req, res) => {
  const { id } = req.params;
  const { limit, offset } = req.query;

  try {
    // Verifique se os parâmetros limit e offset foram fornecidos ou use valores padrão

    const limitValue = Number(limit) || 16;
    const offsetValue = Number(offset) || 0;
    // Consulta para contar o número total de produtos do vendedor
    const countQuery =
      "SELECT COUNT(id_produto) AS total FROM produtos WHERE id_vendedor = ?";
    const [{ total }] = await query(countQuery, [id]);

    // Consulta para obter os dados paginados dos produtos do vendedor
    const selectQuery =
      "SELECT id_produto, nome, descricao, preco FROM produtos WHERE id_vendedor = ? ORDER BY data_atualizacao LIMIT ? OFFSET ?";
    const products = await query(selectQuery, [id, limitValue, offsetValue]);

    // Calcula URLs para próxima e página anterior
    const currentUrl = req.baseUrl;
    const next = offsetValue + limitValue;
    const nextUrl =
      next < total ? `${currentUrl}?limit=${limitValue}&offset=${next}` : null;

    const previous =
      offsetValue - limitValue < 0 ? null : offsetValue - limitValue;
    const previousUrl =
      previous !== null
        ? `${currentUrl}?limit=${limitValue}&offset=${previous}`
        : null;

    return res.status(200).json({
      nextUrl,
      previousUrl,
      limit: limitValue,
      offset: offsetValue,
      total,
      data: products,
    });
  } catch (error) {
    console.error("Erro ao buscar produtos do vendedor: ", error);
    return res.status(500).json({ error: "Erro interno do servidor" });
  }
};

// Pegar todos os produtos
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

// Filtrar produtos por promoção, preço, nome, tags e categoria
const filterProducts = async (req, res) => {
  try {
    let {
      limit,
      offset,
      inPromotion,
      minPrice,
      maxPrice,
      name,
      tags,
      sizes,
      category,
    } = req.query;

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

    if (category) {
      whereClause += ` AND id_categoria = ${category}`;
    }

    if (tags) {
      whereClause += ` AND tags LIKE '%${tags}%'`;
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

const searchProducts = async (req, res) => {
  const { q, limit, offset } = req.query;

  if (typeof q !== "string" || !q.trim()) {
    return res
      .status(400)
      .json({ errors: ['O parâmetro de pesquisa "q" é inválido.'] });
  }

  const limitValue = Number(limit) || 20;
  const offsetValue = Number(offset) || 0;

  const keywords = q.split(" ");

  // Inicializa a lista de condições WHERE vazia
  const conditions = [];

  // Cria a lista de parâmetros para a consulta
  const searchParams = [];

  // Para cada palavra-chave, adicione uma condição à lista
  keywords.forEach((keyword) => {
    conditions.push(
      "(produtos.nome LIKE ? OR categorias.nome LIKE ? OR produtos.tags LIKE ?)"
    );
    searchParams.push(`%${keyword}%`);
    searchParams.push(`%${keyword}%`);
    searchParams.push(`%${keyword}%`);
  });

  // Construa a consulta SQL com base nas condições e use DISTINCT para retornar resultados exclusivos
  let qbd = `
    SELECT DISTINCT produtos.id_produto, produtos.nome, produtos.descricao, produtos.preco, produtos.tamanho, produtos.quant_estoque, produtos.tags, produtos.disponibilidade, produtos.em_promocao, produtos.preco_promocional, produtos.id_marca, produtos.id_categoria, produtos.id_vendedor, produtos.data_criacao, produtos.data_atualizacao, marcas.origem, marcas.logotipo
    FROM produtos
    JOIN categorias ON categorias.id_categoria = produtos.id_categoria
    JOIN marcas ON marcas.id_marca = produtos.id_marca
    WHERE ${conditions.join(
      " OR "
    )} AND produtos.disponibilidade = 1 ORDER BY data_atualizacao LIMIT ? OFFSET ?
  `;

  try {
    // Calcula o total de produtos na pesquisa usando uma subconsulta
    const totalQuery = `
      SELECT COUNT(*) AS total FROM (
        ${qbd}
      ) AS searchResult
    `;

    // Adiciona os valores de limit e offset aos parâmetros da consulta
    searchParams.push(limitValue);
    searchParams.push(offsetValue);

    const [{ total }] = await query(totalQuery, searchParams);

    // Calcula URLs para próxima e página anterior
    const currentUrl = req.baseUrl;
    const next = offsetValue + limitValue;
    const nextUrl =
      next < total
        ? `${currentUrl}/searchProducts?limit=${limitValue}&offset=${next}`
        : null;

    const previous =
      offsetValue - limitValue < 0 ? null : offsetValue - limitValue;
    const previousUrl =
      previous !== null
        ? `${currentUrl}/searchProducts?limit=${limitValue}&offset=${previous}`
        : null;

    const data = await query(qbd, searchParams);

    for (let i = 0; i < data.length; i++) {
      const productId = data[i].id_produto;
      const getImagesQuery =
        "SELECT imagem FROM imagens_produtos WHERE id_produto = ?";
      const images = await query(getImagesQuery, [productId]);
      data[i].imagens = images;
    }

    return res.status(200).json({
      nextUrl,
      previousUrl,
      limit: limitValue,
      offset: offsetValue,
      total,
      data,
    });
  } catch (error) {
    console.error("Erro na pesquisa de produtos:", error);
    res.status(500).json({ errors: ["Erro interno do servidor"] });
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
  getSellerProducts,
  getAllProducts,
  filterProducts,
  searchProducts,
  promotionProducts,
  lastProducts,
  categoryProducts,
};
