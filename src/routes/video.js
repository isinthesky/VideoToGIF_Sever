const express = require("express");
const router = express.Router();
const path = require("path");
const upload = require("../middleware/multer");
const { extractBmp } = require("../lib/extractBmp");
const { getSrcBmp, makeGif } = require("../lib/makeGif");

const TEMP_FILEDIR = "./../../temp/";
const GIF_FILEDIR = "./../../gif/";

router.post("/", function (req, res, next) {
  try {
    console.info("option", req.body);
  } catch {}
});

router.put("/", upload.single("file"), function (req, res, next) {
  try {
    const filename = req.file.filename.slice(0, req.file.filename.indexOf("."));
    const width = 400;
    const height = 400;
    const fps = 6;
    const temp = path.join(__dirname, TEMP_FILEDIR);
    const output = path.join(__dirname, GIF_FILEDIR);

    (async () => {
      try {
        if (req.body) {
          const res = await extractBmp(req.file.path, width, height, fps, temp, filename);
          if (res.ok) {
            const srcList = getSrcBmp(temp, filename);
            await makeGif(temp, srcList, width, height, output, filename);
          }
        }
      } catch (error) {
        return res.status(500).json(error);
      }
    })();

    res.status(200).json({ ok: false });
  } catch (error) {
    console.error("put/video error:", error);
    return res.status(500).json(error);
  }
});

module.exports = router;
