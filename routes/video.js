const express = require("express");
const router = express.Router();
const multiparty = require("multiparty");
const { extractBmp } = require("../lib/extractBmp");
const { makeGif } = require("../lib/makeGif");

/* post video listing. */
router.post("/new", function (req, res, next) {
  (async () => {
    try {
      if (req.body.video) {
        if (
          await extractBmp(
            "/Users/jacobjeong/Documents/vanilla_cd/LivePhotoToGIF/LivePhotoToGIF_Sever/public/video/IMG_8592.MOV",
            10,
            "/Users/jacobjeong/",
            "rgb24",
          )
        ) {
          await makeGif("/Users/jacobjeong/", "rgb24");
        }
      }
    } catch (error) {
      return res.status(500).json(error);
    }
  })();

  res.render("preview", { title: "video" });
});

module.exports = router;
