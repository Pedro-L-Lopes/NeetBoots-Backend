const multer = require("multer");
const path = require("path");

// Destino da imagem
const imageStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    let folder = "";

    if (req.baseUrl.includes("clientes")) {
      folder = "clientes";
    } else if (req.baseUrl.includes("vendedores")) {
      folder = "vendedores";
    } else if (req.baseUrl.includes("produtos")) {
      folder = "produtos";
    } else if (req.baseUrl.includes("bc")) {
      folder = "marcas";
    }

    cb(null, `uploads/${folder}/`);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const imageUpload = multer({
  storage: imageStorage,
  fileFilter: (req, file, cb) => {
    if (!file.originalname.match(/\.(png|jpg|jpeg|gif|webp)$/)) {
      return cb(
        new Error("Por favor, envie apenas png, jpg, jpeg, gif ou WebP!")
      );
    }
    cb(null, true);
  },
});

const productImageUpload = multer({
  storage: imageStorage,
  fileFilter: (req, file, cb) => {
    if (!file.originalname.match(/\.(png|jpg|jpeg|gif|webp)$/)) {
      return cb(
        new Error("Por favor, envie apenas png, jpg, jpeg, gif ou WebP!")
      );
    }
    cb(null, true);
  },
}).array("imagens", 5);

module.exports = { imageUpload, productImageUpload };
