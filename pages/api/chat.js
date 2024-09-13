import axios from 'axios';
import { chunkText } from '../../lib/chunking'; // Función para dividir el texto en chunks
import { getTextEmbedding, getTextEmbeddingsBatch, cosineSimilarity } from '../../lib/embeddings'; // Funciones para embeddings y similaridad
import { readTXTFiles } from '../../lib/documentProcessor'; // Para leer los archivos TXT
import clientPromise from '../../lib/mongoClient';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Only POST requests allowed' });
  }

  const { message, document, useful } = req.body;

  console.log('Datos recibidos:', { message, document, useful });

  if (!message || !document) {
    console.error('Error: Message or document missing');
    return res.status(400).json({ message: 'Message and document are required' });
  }

  try {
    const mongoClient = await clientPromise;
    const db = mongoClient.db('docuchatybd');
    const collection = db.collection(document);

    // Buscar una consulta similar en MongoDB
    const similarQuery = await collection.findOne({ query: message });

    if (similarQuery) {
      console.log('Consulta similar encontrada en MongoDB');
      return res.status(200).json({ message: similarQuery.response });
    }

    // Si no se encuentra en MongoDB, proceder con la lectura de los archivos TXT
    console.log('No se encontró una consulta similar, leyendo archivos TXT...');
    const documents = await readTXTFiles([document]); // Leer los archivos TXT
    const documentContent = documents.map(doc => doc.content).join('\n');

    // Dividir el documento en chunks
    const chunks = chunkText(documentContent);
    console.log(`Documento dividido en ${chunks.length} chunks`);

    // Obtener embeddings de los chunks en batch
    const chunkEmbeddings = await getTextEmbeddingsBatch(chunks);
    console.log('Embeddings de los chunks obtenidos');

    // Obtener embedding de la consulta
    const queryEmbedding = await getTextEmbedding(message);

    // Calcular embeddings de los chunks y seleccionar los más relevantes
    const relevantChunks = [];
    chunkEmbeddings.forEach((chunkEmbedding, idx) => {
      const similarity = cosineSimilarity(queryEmbedding, chunkEmbedding);
      if (similarity > 0.8) { // Umbral de relevancia
        relevantChunks.push(chunks[idx]);
      }
    });

    // Si no hay chunks relevantes, devolver un mensaje genérico
    if (relevantChunks.length === 0) {
      return res.status(200).json({ message: 'No se encontraron secciones relevantes.' });
    }

    // Generar la respuesta usando los chunks más relevantes
    const relevantText = relevantChunks.join('\n');
    console.log(`Se enviarán ${relevantChunks.length} chunks a OpenAI`);

    const response = await axios.post('https://api.openai.com/v1/chat/completions', {
      model: 'gpt-3.5-turbo',
      messages: [
        { role: 'system', content: 'You are an assistant that provides information based on the following sections of a document.' },
        { role: 'system', content: relevantText },
        { role: 'user', content: message },
      ],
    }, {
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
    });

    const gptMessage = response.data.choices[0].message.content;

    // Almacenar en MongoDB si la consulta es marcada como útil
    if (useful) {
      console.log('Guardando la respuesta en MongoDB como útil');
      await collection.insertOne({
        query: message,
        response: gptMessage,
        markedUseful: true,
        createdAt: new Date(),
      });
      console.log('Respuesta guardada en MongoDB');
    }

    res.status(200).json({ message: gptMessage });
  } catch (error) {
    console.error('Error en el handler:', error.message);
    res.status(500).json({ message: 'Server error: ' + error.message });
  }
}
