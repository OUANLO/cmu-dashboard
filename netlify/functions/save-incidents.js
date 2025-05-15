// 📁 save-incidents.js — Enregistre les incidents dans /tmp/incidents.json (Netlify)
const fs = require("fs");
const path = "/tmp/incidents.json";

exports.handler = async function(event) {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Méthode non autorisée" };
  }

  try {
    const data = JSON.parse(event.body);
    if (!Array.isArray(data)) {
      return { statusCode: 400, body: "Format attendu : tableau JSON" };
    }

    fs.writeFileSync(path, JSON.stringify(data, null, 2));
    return { statusCode: 200, body: "✅ Incidents enregistrés" };
  } catch (e) {
    return { statusCode: 500, body: "Erreur : " + e.message };
  }
};