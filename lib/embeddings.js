import axios from 'axios';

// Obtener embedding de un solo texto utilizando OpenAI
export async function getTextEmbedding(text) {
  const response = await axios.post('https://api.openai.com/v1/embeddings', {
    model: 'text-embedding-ada-002',
    input: text,
  }, {
    headers: {
      'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
    },
  });

  return response.data.data[0].embedding;
}

// Obtener embeddings de texto en batch utilizando OpenAI
export async function getTextEmbeddingsBatch(textArray) {
  const response = await axios.post('https://api.openai.com/v1/embeddings', {
    model: 'text-embedding-ada-002',
    input: textArray, // Pasar el array completo de chunks
  }, {
    headers: {
      'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
    },
  });

  return response.data.data.map(item => item.embedding); // Retornar los embeddings
}

// Calcular la similaridad coseno entre dos vectores
export function cosineSimilarity(vecA, vecB) {
  const dotProduct = vecA.reduce((acc, val, i) => acc + val * vecB[i], 0);
  const magnitudeA = Math.sqrt(vecA.reduce((acc, val) => acc + val * val, 0));
  const magnitudeB = Math.sqrt(vecB.reduce((acc, val) => acc + val * val, 0));
  return dotProduct / (magnitudeA * magnitudeB);
}
