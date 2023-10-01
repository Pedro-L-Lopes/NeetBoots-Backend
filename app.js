const express = require("express");
const path = require("path");
const cors = require("cors");
const dotenv = require("dotenv").config();

const port = process.env.PORT;

const app = express();

// Configurando JSON e form data
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use(cors({ credentials: true, origin: "http://localhost:3000" }));

// Diretorio de upload
app.use("/uploads", express.static(path.join(__dirname, "/uploads")));

// Conexão com banco
require("./config/db.js");

// Rotas
const router = require("./routes/router.js");

app.use(router);

app.listen(port, () => {
  console.log(`App rodando na porta ${port}`);
});
