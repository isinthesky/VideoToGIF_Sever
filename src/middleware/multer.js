const multer = require("multer");
const path = require("path");

const UPLOAD_FILEDIR = "../../upload";

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, UPLOAD_FILEDIR));
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  },
});

const upload = multer({ storage, limits: { fileSize: 100000000 } });

module.exports = upload;
