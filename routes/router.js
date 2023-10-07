const express = require("express");
const router = express();

router.use("/api/clientes", require("./clienteRoutes"));
router.use("/api/vendedores", require("./sellerRoutes"));
router.use("/api/bc", require("./brandAndCategoryRoutes"));
router.use("/api/produtos", require("./productRoutes"));

router.get("/", (req, res) => {
  res.send("Hello World!");
});

module.exports = router;
