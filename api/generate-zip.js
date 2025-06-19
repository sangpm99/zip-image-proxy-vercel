const axios = require("axios");
const JSZip = require("jszip");

module.exports = async (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end(); // CORS preflight
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Only POST allowed" });
  }

  let body = "";
  for await (const chunk of req) {
    body += chunk;
  }

  const { folders } = JSON.parse(body);
  const zip = new JSZip();

  for (const folder of folders) {
    const zipFolder = zip.folder(folder.name);
    for (let i = 0; i < folder.images.length; i++) {
      try {
        const imageRes = await axios.get(folder.images[i], {
          responseType: "arraybuffer",
        });
        zipFolder.file(`image_${i + 1}.jpg`, imageRes.data);
      } catch (err) {
        console.error("Image error:", folder.images[i]);
      }
    }
  }

  const buffer = await zip.generateAsync({ type: "nodebuffer" });

  res.setHeader("Content-Type", "application/zip");
  res.setHeader("Content-Disposition", "attachment; filename=designs.zip");
  res.end(buffer);
};
