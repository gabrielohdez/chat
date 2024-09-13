const fs = require('fs');
const path = require('path');

const readTXTFiles = async (files) => {
  try {
    const documentsDir = path.join(process.cwd(), 'documents');
    const documents = [];
    for (const fileName of files) {
      const filePath = path.join(documentsDir, `${fileName}.txt`);
      const data = fs.readFileSync(filePath, 'utf8');
      documents.push({ fileName, content: data });
    }

    return documents;
  } catch (error) {
    console.error('Error reading TXT files:', error.message);
    throw new Error('Error reading TXT documents');
  }
};

module.exports = { readTXTFiles };
