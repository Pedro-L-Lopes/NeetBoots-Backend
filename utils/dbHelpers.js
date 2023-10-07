const util = require("util");

const query = (db, sql, params) => {
  return util.promisify(db.query).bind(db)(sql, params);
};

const findClientByEmail = async (db, email) => {
  const queryText =
    "SELECT id_cliente, nome, email, senha, imagem, cpf, data_nascimento, genero, telefone, endereco, cidade, estado, cep, tipo_conta, data_criacao, data_atualizacao FROM clientes WHERE email = ?";

  try {
    const results = await query(db, queryText, [email]);
    return results.length > 0 ? results[0] : null;
  } catch (error) {
    throw error;
  }
};

const findClientById = async (db, id) => {
  const queryText =
    "SELECT id_cliente, nome, email, imagem, cpf, data_nascimento, genero, telefone, endereco, cidade, estado, cep, tipo_conta, data_criacao, data_atualizacao FROM clientes WHERE id_cliente = ?";

  try {
    const results = await query(db, queryText, [id]);
    return results.length > 0 ? results[0] : null;
  } catch (error) {
    throw error;
  }
};

const findSellerByEmail = async (db, email) => {
  const queryText =
    "SELECT id_vendedor, nome, nome_loja, email, senha, cnpj, cpf, genero, telefone, endereco, cidade, estado, cep, tipo_conta, data_criacao, data_atualizacao FROM vendedores WHERE email = ?";

  try {
    const results = await query(db, queryText, [email]);
    return results.length > 0 ? results[0] : null;
  } catch (error) {
    throw error;
  }
};

const findSellerById = async (db, id) => {
  const queryText =
    "SELECT id_vendedor, nome, nome_loja, email, imagem, cnpj, cpf, genero, telefone, endereco, cidade, estado, cep, tipo_conta, data_atualizacao FROM vendedores WHERE id_vendedor = ?";

  try {
    const results = await query(db, queryText, [id]);
    return results.length > 0 ? results[0] : null;
  } catch (error) {
    throw error;
  }
};

module.exports = {
  findClientByEmail,
  findClientById,
  findSellerByEmail,
  findSellerById,
};
