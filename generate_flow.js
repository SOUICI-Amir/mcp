const axios = require('axios');

module.exports = async (req, res) => {
  const { goal, context, equipment } = req.body;

  const prompt = `
Tu es un assistant intelligent qui génère des flows Node-RED à partir de descriptions d'équipements Web of Things (WoT) et d’un objectif.

But : ${goal}
Contexte : ${context}

Équipements :
${equipment.map(e => `
- ${e.name}
  - TD : ${e.td}
  - Actions : ${e.actions.join(', ')}
  - Propriétés : ${e.properties.join(', ')}
  - Événements : ${e.events.join(', ')}
`).join('\n')}

Consignes :
- Utilise les nœuds de la contribution Node-RED WoT : \`consumed-thing\`, \`invoke-action\`, \`subscribe-event\`, \`read-property\`, \`write-property\`, \`observe-property\`, \`unsubcribe-event\`, \`response\`
- Chaque équipement doit être représenté avec un nœud \`consumed-thing\` contenant la TD complète
- Crée un enchaînement logique entre les nœuds en utilisant \`wires\`
📦 Réponds uniquement par un tableau JSON valide représentant un flow Node-RED. 
❌ N'inclus aucun texte, balise, commentaire, ni Markdown autour.
✅ Ne renvoie que le tableau JSON prêt à importer dans Node-RED.


Ta sortie doit être un tableau JSON contenant tous les nœuds.
`;



  try {
    const response = await axios.post(
      'https://api.deepinfra.com/v1/openai/chat/completions',
      {
        model: 'deepseek-ai/DeepSeek-R1',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.3
      },
      {
        headers: {
          'Authorization': `Bearer ${process.env.DEEPINFRA_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );


    const json = response.data.choices[0].message.content;
    res.send(JSON.parse(json));
  } catch (err) {
    console.error(err.response?.data || err.message);
    res.status(500).json({ error: 'Erreur DeepSeek : ' + err.message });
  }
};
