const db = require("../config/db.js");

const util = require("util");
const query = util.promisify(db.query).bind(db);

const dbHelpers = require("../utils/dbHelpers.js");

const cadeouser = async (req, res) => {
  const user = req.user;

  return res.status(200).json([user, "sumiu"]);
};

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

    console.log("REQUSER " + reqUser);
    console.log("VENDEDOR " + id_vendedor);

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

    // Consulta para obter os detalhes do novo produto
    const getNewProductQuery = "SELECT * FROM produtos WHERE id_produto = ?";
    const [productDetails] = await query(getNewProductQuery, [
      newProduct.insertId,
    ]);

    if (!productDetails) {
      // Handle the case where product details could not be retrieved
      res.status(422).json({
        errors: ["Detalhes do produto não puderam ser recuperados."],
      });
      return;
    }

    // const imagens = req.files.map((file) => ({ filename: file.filename }));

    res.status(201).json(productDetails);
  } catch (error) {
    console.log("Deu ruim", error);
    return res.status(500).json({ errors: ["Erro interno do servidor"] });
  }
};

module.exports = { createProduct, cadeouser };
