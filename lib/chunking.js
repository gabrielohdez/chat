// lib/chunking.js
export function chunkText(text, chunkSize = 300) {
    const words = text.split(' ');
    const chunks = [];
  
    for (let i = 0; i < words.length; i += chunkSize) {
      const chunk = words.slice(i, i + chunkSize).join(' ');
      chunks.push(chunk);
    }
  
    return chunks;
  }
  