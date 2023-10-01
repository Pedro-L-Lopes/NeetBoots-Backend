const express = require("express");
const router = express();

router.use("/api/clientes", require("./clienteRoutes"));

router.get("/", (req, res) => {
  res.send("Hello World!");
});

module.exports = router;
