const ffmpegPath = require("@ffmpeg-installer/ffmpeg").path;
const execFile = require("child_process").spawn;

exports.extractBmp = async (videopath, width, height, fps, outPath, outPreset, hflip, vflip) => {
  try {
    const ffmpeg = execFile(ffmpegPath, [
      "-i",
      videopath,
      "-vf",
      //`scale=${width}:${height} ${vflip ? ", vflip" : ""}, ${hflip ? ", hflip" : ""}`,
      `scale=${width}:${height}`,
      "-r",
      fps,
      "-pix_fmt",
      "bgr8", //gif bitmap format
      "-y",
      `${outPath}${outPreset}%03d.bmp`,
    ]);

    return new Promise(
      (resolve) => {
        ffmpeg.stdout.on("data", (x) => {
          process.stdout.write(x.toString());
        });
        ffmpeg.stderr.on("data", (x) => {
          process.stderr.write(x.toString());
        });
        ffmpeg.on("close", (code) => {
          resolve({ ok: true, code: code });
        });
      },
      (reject) => {
        console.error("extractBmp error:", reject);
      },
    );
  } catch (error) {
    console.error("extractBmp error:", error);
    let errorCode = error.code;
    let errorMessage = error.message;
    if (errorCode == "auth/weak-password") {
      return res.status(500).json({ error: errorMessage });
    } else {
      return res.status(500).json({ error: errorMessage });
    }
  }
};
