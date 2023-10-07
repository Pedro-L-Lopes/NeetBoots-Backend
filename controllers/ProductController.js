const db = require("../config/db.js");

const util = require("util");
const query = util.promisify(db.query).bind(db);

const dbHelpers = require("../utils/dbHelpers.js");

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

module.exports = { createProduct, getProductById };
