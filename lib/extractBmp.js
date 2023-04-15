const ffmpegPath = require("@ffmpeg-installer/ffmpeg").path;
const execFile = require("child_process").spawn;

exports.extractBmp = async (videopath, fps, outPath, outPreset) => {
  try {
    const ffmpeg = execFile(ffmpegPath, [
      "-i",
      videopath, // input format is raw video data
      "-r",
      fps,
      "-vframes",
      10,
      "-pix_fmt",
      "rgb24",
      "-intra",
      "-y",
      `${outPath}${outPreset}%03d.bmp`,
    ]);

    ffmpeg.stdout.on("data", (data) => {
      console.log("stdout / ", `stdout: ${data}`);
    });

    ffmpeg.stderr.on("data", (data) => {
      console.error("stderr // ", `stderr: ${data}`);
    });
    ffmpeg.on("close", (code) => {
      console.log("ffmpeg close", code);
      return true;
    });
  } catch (error) {
    console.error("extractBmp", error);
    let errorCode = error.code;
    let errorMessage = error.message;
    if (errorCode == "auth/weak-password") {
      return res.status(500).json({ error: errorMessage });
    } else {
      return res.status(500).json({ error: errorMessage });
    }
  }
};
