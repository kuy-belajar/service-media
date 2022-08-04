const isBase64 = require("is-base64");
const base64Img = require("base64-img");
const fs = require("fs");

const { Media } = require("../models");
const { HOSTNAME, PORT } = process.env;

exports.createMedia = async (req, res) => {
  try {
    const image = req.body.image;

    if (!isBase64(image, { mimeRequired: true })) {
      return res
        .status(400)
        .json({ status: "error", message: "invalid base64" });
    }

    base64Img.img(
      image,
      "./public/images",
      Date.now(),
      async (err, filepath) => {
        if (err) {
          return res
            .status(400)
            .json({ status: "error", message: err.message });
        }

        const filename = filepath.split("/").pop();
        const media = await Media.create({ image: `images/${filename}` });

        return res.json({
          status: "SUCCESS",
          data: {
            id: media.id,
            image: `${HOSTNAME}:${PORT}/images/${filename}`
          }
        });
      }
    );
  } catch (error) {
    res.status(500).json({
      status: "FAILED",
      data: {
        name: error.name,
        message: error.message,
        stack: error.stack
      }
    });
  }
};

exports.getAllMedia = async (req, res) => {
  try {
    const media = await Media.findAll({
      attributes: ["id", "image"]
    });

    const mappedMedia = media.map((m) => {
      m.image = `${HOSTNAME}/${m.image}`;
      return m;
    });

    return res.json({
      status: "success",
      data: mappedMedia
    });
  } catch (error) {
    res.status(500).json({
      status: "FAILED",
      data: {
        name: error.name,
        message: error.message,
        stack: error.stack
      }
    });
  }
};

exports.deleteMedia = async (req, res) => {
  try {
    const id = req.params.id;
    const media = await Media.findByPk(id);

    if (!media) {
      return res
        .status(404)
        .json({ status: "error", message: "media not found" });
    }

    fs.unlink(`./public/${media.image}`, async (err) => {
      if (err) {
        return res.status(400).json({ status: "error", message: err.message });
      }

      await media.destroy();

      return res.json({
        status: "success",
        message: "image deleted"
      });
    });
  } catch (error) {
    res.status(500).json({
      status: "FAILED",
      data: {
        name: error.name,
        message: error.message,
        stack: error.stack
      }
    });
  }
};
