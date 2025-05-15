
const OpenAI = require("openai");
const JSZip = require("jszip");

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

exports.handler = async function(event) {
  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      body: "Méthode non autorisée"
    };
  }

  try {
    const body = JSON.parse(event.body);
    const base64Zip = body.zip;

    if (!base64Zip) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "Aucun fichier zip fourni." })
      };
    }

    const buffer = Buffer.from(base64Zip, "base64");
    const zip = await JSZip.loadAsync(buffer);

    let fullText = "";
    for (const name of Object.keys(zip.files)) {
      if (name.endsWith(".txt")) {
        const content = await zip.files[name].async("string");
        fullText += "\n" + content;
      }
    }

    if (!fullText || fullText.trim().length < 20) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "Le contenu du fichier est vide ou trop court." })
      };
    }

    const prompt = `Vous êtes un assistant chargé d'analyser des exports WhatsApp issus de groupes techniques d'une organisation.\nVotre tâche est d'extraire tous les incidents décrits, même de manière floue ou implicite, à partir des messages WhatsApp bruts.\nPour chaque incident détecté, fournissez les informations suivantes dans un tableau JSON :\n[{{"date":"JJ/MM/AAAA - HH:MM","message":"Résumé","categorie":"Catégorie","auteur":"Déclarant","coordination":"Groupe","urgence":"Élevé|Moyen|Bas","statut":"Résolu|En cours|Nouveau","resolu_par":"Nom","action":"Action"}}...]\nVoici les messages bruts extraits :\n---\n${fullText.slice(0, 14000)}`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        { role: "system", content: "Tu es un agent d’analyse d’incidents WhatsApp pour la CNAM." },
        { role: "user", content: prompt }
      ],
      temperature: 0.3,
      max_tokens: 1500
    });

    const output = completion.choices?.[0]?.message?.content;
    if (!output) {
      console.error("❌ Réponse GPT vide.");
      return {
        statusCode: 500,
        body: JSON.stringify({ error: "Réponse vide de GPT." })
      };
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ incidents: output })
    };

  } catch (e) {
    console.error("❌ Erreur IA complète :", e);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Erreur IA : " + e.message })
    };
  }
};
