const findClientByEmail = (db, email) => {
  return new Promise((resolve, reject) => {
    const query = "SELECT * FROM clientes WHERE email = ?";
    db.query(query, [email], (err, results) => {
      if (err) {
        reject(err);
      } else {
        if (results.length > 0) {
          // Se houver resultados, o email existe, então retornamos o primeiro usuário encontrado
          resolve(results[0]);
        } else {
          // Se não houver resultados, o email não existe
          resolve(null);
        }
      }
    });
  });
};

const findClientById = (db, id) => {
  return new Promise((resolve, reject) => {
    const query = `SELECT id_cliente, nome, email, imagem, cpf, data_nascimento, genero, telefone, endereco, cidade, estado, cep, tipo_conta, data_criacao, data_atualizacao FROM clientes WHERE id_cliente = ?`;
    db.query(query, [id], (err, results) => {
      if (err) {
        reject(err);
      } else {
        if (results.length > 0) {
          // Se houver resultados, o id existe, então retornamos o primeiro usuário encontrado
          resolve(results[0]);
        } else {
          // Se não houver resultados, o id não existe
          resolve(null);
        }
      }
    });
  });
};

module.exports = {
  findClientByEmail,
  findClientById,
};
