const axios = require("axios");
require("dotenv").config();

module.exports = async (req, res) => {
  const { goal, context, equipment } = req.body;

  try {
    // 🔁 On récupère dynamiquement les TDs à partir des URLs
    const enrichedEquipment = await Promise.all(
      equipment.map(async (e) => {
        const tdResponse = await axios.get(e.td);
        const td = tdResponse.data;

        return {
          name: e.name,
          tdRaw: JSON.stringify(td),
          actions: Object.keys(td.actions || {}),
          properties: Object.keys(td.properties || {}),
          events: Object.keys(td.events || {}),
        };
      })
    );

    // 🧠 Prompt généré dynamiquement
    const prompt = `
Tu es un assistant intelligent qui génère des flows Node-RED à partir de descriptions d'équipements Web of Things (WoT) et d’un objectif.

But : ${goal}
Contexte : ${context}

Équipements :
${enrichedEquipment
  .map(
    (e, i) => `
- ${e.name}
  - TD : ${equipment[i].td}
  - Actions : ${e.actions.join(", ")}
  - Propriétés : ${e.properties.join(", ")}
  - Événements : ${e.events.join(", ")}
`
  )
  .join("\n")}

Consignes :
- Utilise les nœuds de la contribution Node-RED WoT : \`consumed-thing\`, \`invoke-action\`, \`subscribe-event\`, \`read-property\`, \`write-property\`, \`observe-property\`, \`unsubcribe-event\`, \`response\`
- Chaque équipement doit être représenté avec un nœud \`consumed-thing\` contenant la TD complète (en JSON)
- Crée un enchaînement logique entre les nœuds en utilisant \`wires\`
- Réponds uniquement par un tableau JSON valide représentant un flow Node-RED. 
- N'inclus aucun texte, balise, commentaire, ni Markdown autour.`;

    
    const response = await axios.post(
      `https://api-inference.huggingface.co/models/${process.env.HF_MODEL_ID}`,
      {
        inputs: prompt,
        parameters: {
          max_new_tokens: 1024,
          temperature: 0.3,
        },
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.HF_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    const text = response.data?.[0]?.generated_text || "";
    const match = text.match(/\[\s*{[\s\S]*}\s*\]/);
    if (!match) throw new Error("Aucun JSON détecté dans la réponse du LLM.");

    const jsonFlow = JSON.parse(match[0]);
    res.send(jsonFlow);
  } catch (err) {
    console.error("Erreur:", err.response?.data || err.message);
    res.status(500).json({ error: "Erreur serveur : " + err.message });
  }
};
