const ffmpegPath = require("@ffmpeg-installer/ffmpeg").path;
const execFile = require("child_process").spawn;

exports.extractBmp = async (videopath, width, height, fps, outPath, outPreset, hflip, vflip) => {
  try {
    const ffmpeg = execFile(ffmpegPath, [
      "-i",
      videopath,
      "-vf",
      `scale=${width}:${height} ${vflip ? ", vflip" : ""} ${!hflip ? ", hflip" : ""}`,
      "-r",
      fps,
      "-pix_fmt",
      "bgr8", //gif bitmap format
      "-y",
      `${outPath}${outPreset}%04d.bmp`,
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
          return true;
        });
      },
      (reject) => {
        console.error("extractBmp error:", reject);
        return false;
      },
    );
  } catch (error) {
    console.error("extractBmp error:", error);
    return false;
  }
};
