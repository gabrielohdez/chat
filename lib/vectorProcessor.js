const axios = require('axios');
const fs = require('fs/promises');
const path = require('path');

const getOpenAIEmbedding = async (text) => {
  const response = await axios.post('https://api.openai.com/v1/embeddings', {
    model: 'text-embedding-ada-002',
    input: text,
  }, {
    headers: {
      'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
      'Content-Type': 'application/json',
    },
  });

  return response.data.data[0].embedding;
};

const cosineSimilarity = (vecA, vecB) => {
  const dotProduct = vecA.reduce((sum, a, i) => sum + a * vecB[i], 0);
  const magnitudeA = Math.sqrt(vecA.reduce((sum, a) => sum + a * a, 0));
  const magnitudeB = Math.sqrt(vecB.reduce((sum, b) => sum + b * b, 0));
  return dotProduct / (magnitudeA * magnitudeB);
};

const getDocumentEmbedding = async (document) => {
  const documentPath = path.join(process.cwd(), 'documents', `${document}.txt`);
  const content = await fs.readFile(documentPath, 'utf8');
  const sections = content.split(/\n\n+/); // Dividir el documento en secciones
  const embeddings = await Promise.all(sections.map(getOpenAIEmbedding));
  return embeddings.map((embedding, index) => ({ section: sections[index], embedding }));
};

const getRelevantSections = async (message, documentEmbedding) => {
  const messageEmbedding = await getOpenAIEmbedding(message);
  const similarities = documentEmbedding.map(doc => ({
    section: doc.section,
    similarity: cosineSimilarity(messageEmbedding, doc.embedding),
  }));

  // Ordenar por similitud y devolver las secciones más relevantes
  similarities.sort((a, b) => b.similarity - a.similarity);
  return similarities.slice(0, 3).map(s => s.section); // Devolver las 3 secciones más relevantes
};

module.exports = { getDocumentEmbedding, getRelevantSections };
