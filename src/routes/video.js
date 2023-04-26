const express = require("express");
const router = express.Router();
const path = require("path");
const upload = require("../middleware/multer");
const { extractBmp } = require("../lib/extractBmp");
const { getSrcBmp, makeGif, removeSrcBmp } = require("../lib/makeGif");

const TEMP_FILEDIR = "../../temp/";
const GIF_FILEDIR = "../../public/images/";
const GIF_DIR_CLIENT = "/images/";
const DELAY_SPEED_WEIGHTS = 5;
const DELAY_FPS_WEIGHTS = 19;

router.put("/", upload.single("file"), function (req, res, next) {
  try {
    const options = JSON.parse(req.body.option);

    const abs = Math.floor(Number(options.width) * (Number(options.Scale) / 100)) % 4;

    const filename = req.file.filename.slice(0, req.file.filename.indexOf("."));
    const width = Math.floor(Number(options.width) * (Number(options.Scale) / 100)) - abs;
    const height = Math.floor(Number(options.height) * (Number(options.Scale) / 1000)) * 10;
    const fps = Number(options.FPS);
    const speed = Number(options.Speed);
    const temp = path.join(__dirname, TEMP_FILEDIR);
    const output = path.join(__dirname, GIF_FILEDIR);
    const delay = (DELAY_SPEED_WEIGHTS / speed) * (DELAY_FPS_WEIGHTS / fps);

    (async () => {
      try {
        if (req.body) {
          const result = await extractBmp(
            req.file.path,
            width,
            height,
            fps,
            temp,
            filename,
            options.Mirror,
            options.Flip,
          );

          if (result) {
            const srcList = getSrcBmp(temp, filename);
            const gifSize = await makeGif(temp, srcList, width, height, delay, output, filename);

            if (gifSize) {
              res.status(200).json({
                ok: true,
                gif: {
                  url: GIF_DIR_CLIENT + filename + ".gif",
                  filename: filename + ".gif",
                  size: gifSize,
                  width: width,
                  height: height,
                },
              });
              removeSrcBmp(temp, filename);
              return true;
            }
          }
        }
      } catch (error) {
        return res.status(500).json(error);
      }
    })();
  } catch (error) {
    console.error("put/video error:", error);
    return res.status(500).json(error);
  }
});

module.exports = router;
