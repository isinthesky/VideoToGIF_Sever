const fs = require("node:fs");

exports.makeGif = async (srcPath, filePreset) => {
  try {
    let files = fs.readdirSync(srcPath);
    console.log(files);
  } catch (error) {}
};
