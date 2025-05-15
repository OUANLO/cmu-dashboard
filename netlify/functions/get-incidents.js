// 📁 get-incidents.js — Lit les incidents enregistrés
const fs = require("fs");
const path = "/tmp/incidents.json";

exports.handler = async function() {
  try {
    if (!fs.existsSync(path)) {
      return { statusCode: 200, body: "[]" };
    }
    const content = fs.readFileSync(path, "utf8");
    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: content
    };
  } catch (e) {
    return { statusCode: 500, body: "Erreur : " + e.message };
  }
};