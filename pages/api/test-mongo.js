// pages/api/test-mongo.js
import clientPromise from '../../lib/mongoClient';

export default async function handler(req, res) {
  try {
    // Conectar con MongoDB
    const mongoClient = await clientPromise;
    const db = mongoClient.db('docuchatybd'); // Nombre de la base de datos

    // Insertar un documento de prueba en una colección de prueba
    const testCollection = db.collection('testCollection');
    const testDocument = {
      name: 'Test Document',
      createdAt: new Date(),
    };

    const insertResult = await testCollection.insertOne(testDocument);
    console.log('Documento insertado:', insertResult);

    // Leer el documento insertado
    const document = await testCollection.findOne({ _id: insertResult.insertedId });
    console.log('Documento encontrado:', document);

    // Responder con el documento insertado
    res.status(200).json({ message: 'MongoDB test successful', document });
  } catch (error) {
    console.error('Error al probar MongoDB:', error.message);
    res.status(500).json({ message: 'MongoDB test failed', error: error.message });
  }
}
