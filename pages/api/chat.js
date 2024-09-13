import axios from 'axios';
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

    console.log('Generando respuesta con OpenAI...');
    const response = await axios.post('https://api.openai.com/v1/chat/completions', {
      model: 'gpt-3.5-turbo',
      messages: [
        { role: 'system', content: 'You are an assistant that provides information based on the following documents.' },
        { role: 'system', content: documentContent },
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

    // Devolver la respuesta generada
    res.status(200).json({ message: gptMessage });
  } catch (error) {
    console.error('Error en el handler:', error.message);
    res.status(500).json({ message: 'Server error: ' + error.message });
  }
}
