const fs = require("node:fs");

const MAX_WIDTH = 4096;
const MAX_HEIGHT = 2160;
const BMP_HEADER_SIZE = 54;
const PALETTE_SIZE = 256 * 4;

exports.getSrcBmp = (srcPath, filePreset) => {
  return fs.readdirSync(srcPath).filter((file) => {
    return file.indexOf(filePreset) >= 0 ? true : false;
  });
};

exports.makeGif = async (srcPath, files, width, height, outPath, filename) => {
  let p = 0;
  let buf = [];

  p = makeHeader(buf, p, width, height);
  try {
    for (const image of files) {
      const data = await fs.promises.readFile(srcPath + image);

      const palette = new Uint32Array(
        componentizedPaletteToArray(data.slice(BMP_HEADER_SIZE), PALETTE_SIZE),
      );

      p = addFrame(
        buf,
        p,
        width,
        height,
        data.slice(BMP_HEADER_SIZE + PALETTE_SIZE).reverse(),
        palette,
        10,
      );
    }
    p = end(buf, p);

    await fs.promises.writeFile(outPath + filename + ".gif", new Uint8Array(buf));
  } catch (error) {
    console.error("makeGif error:", error);
  }
};

function componentizedPaletteToArray(paletteRGB, length) {
  const paletteArray = [];

  for (let i = 0; i < length; i += 4) {
    const b = paletteRGB[i];
    const g = paletteRGB[i + 1];
    const r = paletteRGB[i + 2];

    paletteArray.push((r << 16) | (g << 8) | b);
  }

  return paletteArray;
}

function makeHeader(buf, p, width, height) {
  if (width < 1 || height < 1 || width > MAX_WIDTH || height > MAX_HEIGHT) return false;

  let loop_count = 0;

  // - Header.
  buf[p++] = 0x47;
  buf[p++] = 0x49;
  buf[p++] = 0x46; // GIF
  buf[p++] = 0x38;
  buf[p++] = 0x39;
  buf[p++] = 0x61; // 89a

  // - Logical Screen Descriptor.
  buf[p++] = width & 0xff;
  buf[p++] = (width >> 8) & 0xff;
  buf[p++] = height & 0xff;
  buf[p++] = (height >> 8) & 0xff;
  // NOTE: Indicates 0-bpp original
  buf[p++] = 0; // Global Color Table Flag.
  buf[p++] = 0; // Background Color Index.
  buf[p++] = 0; // Pixel aspect ratio (unused?).

  if (loop_count !== null) {
    // Netscape block for looping.
    if (loop_count < 0 || loop_count > 65535) throw "Loop count invalid.";

    // Extension code, label, and length.
    buf[p++] = 0x21;
    buf[p++] = 0xff;

    // NETSCAPE2.0
    buf[p++] = 0x0b; //Block Size
    buf[p++] = 0x4e;
    buf[p++] = 0x45;
    buf[p++] = 0x54;
    buf[p++] = 0x53;
    buf[p++] = 0x43;
    buf[p++] = 0x41;
    buf[p++] = 0x50;
    buf[p++] = 0x45;
    buf[p++] = 0x32;
    buf[p++] = 0x2e;
    buf[p++] = 0x30;
    // Sub-block
    buf[p++] = 0x03; //Block size
    buf[p++] = 0x01; //Extension Type
    buf[p++] = loop_count & 0xff;
    buf[p++] = (loop_count >> 8) & 0xff;
    buf[p++] = 0x00; // Terminator.
  }

  return p;
}

function addFrame(buf, p, w, h, indexed_pixels, local_palette, delay) {
  if (indexed_pixels.length < w * h) throw "Not enough pixels for the frame size.";

  if (local_palette === undefined || local_palette === null)
    throw "Must supply either a local or global palette.";

  const using_local_palette = true;
  const palette = local_palette;

  const use_transparency = false;
  let transparent_index = 0;
  let num_colors = check_palette_and_num_colors(palette);

  let min_code_size = 0;
  while ((num_colors >>= 1)) ++min_code_size;

  num_colors = 1 << min_code_size; // Now we can easily get it back.

  let disposal = 2;

  if (disposal !== 0 || delay !== 0) {
    // - Graphics Control Extension
    buf[p++] = 0x21;
    buf[p++] = 0xf9; // Extension / Label.
    buf[p++] = 4; // Byte size.

    buf[p++] = (disposal << 2) | (use_transparency === true ? 1 : 0);
    buf[p++] = delay & 0xff;
    buf[p++] = (delay >> 8) & 0xff;
    buf[p++] = transparent_index;
    buf[p++] = 0; // Block Terminator.
  }

  // - Image Descriptor
  buf[p++] = 0x2c; // Image Seperator.
  buf[p++] = 0 & 0xff;
  buf[p++] = (0 >> 8) & 0xff; // Left.
  buf[p++] = 0 & 0xff;
  buf[p++] = (0 >> 8) & 0xff; // Top.
  buf[p++] = w & 0xff;
  buf[p++] = (w >> 8) & 0xff;
  buf[p++] = h & 0xff;
  buf[p++] = (h >> 8) & 0xff;
  buf[p++] = using_local_palette === true ? 0x80 | (min_code_size - 1) : 0;

  // - Local Color Table
  if (using_local_palette === true) {
    for (let i = 0, il = palette.length; i < il; ++i) {
      const rgb = palette[i];
      buf[p++] = (rgb >> 16) & 0xff;
      buf[p++] = (rgb >> 8) & 0xff;
      buf[p++] = rgb & 0xff;
    }
  }

  p = GifWriterOutputLZWCodeStream(buf, p, min_code_size < 2 ? 2 : min_code_size, indexed_pixels);

  return p;
}

function end(buf, p) {
  buf[p] = 0x3b; // Trailer.
  return p;
}

function check_palette_and_num_colors(palette) {
  const num_colors = palette.length;

  if (num_colors < 2 || num_colors > 256 || num_colors & (num_colors - 1))
    throw "Invalid code/color length, must be power of 2 and 2 .. 256.";
  return num_colors;
}

// Main compression routine, palette indexes -> LZW code stream.
// |index_stream| must have at least one entry.
function GifWriterOutputLZWCodeStream(buf, p, min_code_size, index_stream) {
  buf[p++] = min_code_size;
  var cur_subblock = p++; // Pointing at the length field.

  var clear_code = 1 << min_code_size;
  var code_mask = clear_code - 1;
  var eoi_code = clear_code + 1;
  var next_code = eoi_code + 1;

  var cur_code_size = min_code_size + 1; // Number of bits per code.
  var cur_shift = 0;
  // We have at most 12-bit codes, so we should have to hold a max of 19
  // bits here (and then we would write out).
  var cur = 0;

  function emit_bytes_to_buffer(bit_block_size) {
    while (cur_shift >= bit_block_size) {
      buf[p++] = cur & 0xff;
      cur >>= 8;
      cur_shift -= 8;
      if (p === cur_subblock + 256) {
        // Finished a subblock.
        buf[cur_subblock] = 255;
        cur_subblock = p++;
      }
    }
  }

  function emit_code(c) {
    cur |= c << cur_shift;
    cur_shift += cur_code_size;
    emit_bytes_to_buffer(8);
  }

  // Output code for the current contents of the index buffer.
  var ib_code = index_stream[0] & code_mask; // Load first input index.
  var code_table = {}; // Key'd on our 20-bit "tuple".

  emit_code(clear_code); // Spec says first code should be a clear code.

  // First index already loaded, process the rest of the stream.
  for (var i = 1, il = index_stream.length; i < il; ++i) {
    var k = index_stream[i] & code_mask;
    var cur_key = (ib_code << 8) | k; // (prev, k) unique tuple.
    var cur_code = code_table[cur_key]; // buffer + k.

    // Check if we have to create a new code table entry.
    if (cur_code === undefined) {
      // We don't have buffer + k.
      // Emit index buffer (without k).
      // This is an inline version of emit_code, because this is the core
      // writing routine of the compressor (and V8 cannot inline emit_code
      // because it is a closure here in a different context).  Additionally
      // we can call emit_byte_to_buffer less often, because we can have
      // 30-bits (from our 31-bit signed SMI), and we know our codes will only
      // be 12-bits, so can safely have 18-bits there without overflow.
      // emit_code(ib_code);
      cur |= ib_code << cur_shift;
      cur_shift += cur_code_size;
      while (cur_shift >= 8) {
        buf[p++] = cur & 0xff;
        cur >>= 8;
        cur_shift -= 8;
        if (p === cur_subblock + 256) {
          // Finished a subblock.
          buf[cur_subblock] = 255;
          cur_subblock = p++;
        }
      }

      if (next_code === 4096) {
        // Table full, need a clear.
        emit_code(clear_code);
        next_code = eoi_code + 1;
        cur_code_size = min_code_size + 1;
        code_table = {};
      } else {
        // Table not full, insert a new entry.
        // Increase our variable bit code sizes if necessary.  This is a bit
        // tricky as it is based on "timing" between the encoding and
        // decoder.  From the encoders perspective this should happen after
        // we've already emitted the index buffer and are about to create the
        // first table entry that would overflow our current code bit size.
        if (next_code >= 1 << cur_code_size) ++cur_code_size;
        code_table[cur_key] = next_code++; // Insert into code table.
      }

      ib_code = k; // Index buffer to single input k.
    } else {
      ib_code = cur_code; // Index buffer to sequence in code table.
    }
  }

  emit_code(ib_code); // There will still be something in the index buffer.
  emit_code(eoi_code); // End Of Information.

  // Flush / finalize the sub-blocks stream to the buffer.
  emit_bytes_to_buffer(1);

  // Finish the sub-blocks, writing out any unfinished lengths and
  // terminating with a sub-block of length 0.  If we have already started
  // but not yet used a sub-block it can just become the terminator.
  if (cur_subblock + 1 === p) {
    // Started but unused.
    buf[cur_subblock] = 0;
  } else {
    // Started and used, write length and additional terminator block.
    buf[cur_subblock] = p - cur_subblock - 1;
    buf[p++] = 0;
  }
  return p;
}
