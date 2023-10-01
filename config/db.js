const mysql = require("mysql2");
const dotenv = require("dotenv");

dotenv.config();

const host = process.env.HOST;
const user = process.env.USER;
const password = process.env.PASSWORD;
const database = process.env.DATABASE;

let db;

try {
  db = mysql.createConnection({
    host,
    user,
    password,
    database,
  });
  console.log("Conectou ao banco!");
} catch (error) {
  console.error("Erro ao criar a conexão com o banco de dados:", error);
}

module.exports = db;
