import { useState, useEffect } from 'react';
import { Box, Button, CircularProgress, Container, Paper, TextField, Typography } from '@mui/material';
import Image from 'next/image';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import 'katex/dist/katex.min.css';
import { BlockMath, InlineMath } from 'react-katex';

const Chat = ({ selectedOption }) => {
  const [message, setMessage] = useState('');
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(false);
  const [chatHistory, setChatHistory] = useState([]);
  const [useful, setUseful] = useState(false); // Para almacenar si se marcó como útil
  const [responseFetched, setResponseFetched] = useState(false); // Para controlar si ya se recibió una respuesta
  const [originalMessage, setOriginalMessage] = useState(''); // Guardar el mensaje original

  useEffect(() => {
    if (selectedOption) {
      setChatHistory([`Usted está consultando: ${selectedOption.replace('_', ' ')}`]);
    }
  }, [selectedOption]);

  const isMathExpression = (text) => {
    const inlineMathRegex = /\$(.*?)\$/;   // Fórmulas inline
    const blockMathRegex = /\\\[(.*?)\\\]/; // Fórmulas en bloque con \[ \]
    return inlineMathRegex.test(text) || blockMathRegex.test(text);
  };

  const formatResponse = (text) => {
    const blockMathRegex = /\\\[(.*?)\\\]/g;
    const inlineMathRegex = /\$(.*?)\$/g;

    if (blockMathRegex.test(text)) {
      return text.split(blockMathRegex).map((part, index) =>
        index % 2 === 1 ? <BlockMath math={part.trim()} key={index} /> : <span key={index}>{part}</span>
      );
    } else if (inlineMathRegex.test(text)) {
      return text.split(inlineMathRegex).map((part, index) =>
        index % 2 === 1 ? <InlineMath math={part.trim()} key={index} /> : <span key={index}>{part}</span>
      );
    }
    return <span>{text}</span>;
  };

  const sendMessage = async () => {
    if (message.trim() === '') return;
    setLoading(true);
    setResponse('');
    setUseful(false); // Resetear el estado de "útil"
    setResponseFetched(false); // Resetear el estado de "respuesta recibida"

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message,
          document: selectedOption,
        }),
      });

      const data = await res.json();
      setResponse(data.message);
      setResponseFetched(true); // Se marca que ya se recibió una respuesta
      setChatHistory([...chatHistory, `You: ${message}`]);
      setOriginalMessage(message); // Guardar el mensaje original
      setMessage(''); // Limpiar el campo de texto después de enviar
    } catch (error) {
      console.error('Error al enviar mensaje:', error);
    } finally {
      setLoading(false);
    }
  };

  const markAsUseful = async () => {
    if (!originalMessage.trim()) {
      console.error('No message to mark as useful');
      return;
    }
    try {
      await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: originalMessage, // Usar el mensaje original
          document: selectedOption,
          useful: true,
        }),
      });
      setUseful(true); // Marcar la respuesta como útil
    } catch (error) {
      console.error('Error al marcar como útil:', error);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const clearChat = () => {
    setChatHistory([]);
    setResponse('');
  };

  const copyResponse = () => {
    navigator.clipboard.writeText(response).then(() => {
      alert('Respuesta copiada al portapapeles');
    }, (err) => {
      console.error('Error al copiar la respuesta: ', err);
    });
  };

  return (
    <Container maxWidth="sm" sx={{ marginTop: 4 }}>
      <Paper elevation={3} sx={{ padding: 2 }}>
        <Box display="flex" flexDirection="column" alignItems="center">
          <Image
            src="/load.gif"
            alt="Logo"
            width={150}
            height={150}
            style={{ marginBottom: 20 }}
          />
          <TextField
            fullWidth
            multiline
            minRows={4}
            variant="outlined"
            placeholder="Escriba su consulta acá..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            sx={{ marginBottom: 2 }}
          />
          <Box display="flex" justifyContent="space-between" width="100%" sx={{ marginBottom: 2 }}>
            <Button variant="contained" color="primary" onClick={sendMessage} disabled={loading}>
              Consultar
            </Button>
            <Button variant="contained" color="secondary" onClick={clearChat}>
              Vaciar
            </Button>
          </Box>
          {loading && <CircularProgress sx={{ marginTop: 2 }} />}
          {response && (
            <Box width="100%" sx={{ marginBottom: 2 }}>
              <Paper elevation={1} sx={{ padding: 2, marginTop: 2, width: '100%' }}>
                <Typography>
                  {formatResponse(response)}
                </Typography>
              </Paper>
              <Button
                variant="outlined"
                color="primary"
                startIcon={<ContentCopyIcon />}
                onClick={copyResponse}
                sx={{ marginTop: 1 }}
              >
                Copiar Respuesta
              </Button>
              {responseFetched && !useful && (
                <Button
                  variant="outlined"
                  color="primary"
                  sx={{ marginTop: 1 }}
                  onClick={markAsUseful}
                >
                  Marcar como útil
                </Button>
              )}
              {useful && <Typography>Gracias por marcar esta respuesta como útil.</Typography>}
            </Box>
          )}
          <Box width="100%" sx={{ marginTop: 2 }}>
            {chatHistory.map((chat, index) => (
              <Typography key={index} variant="body1" sx={{ marginBottom: 1 }}>
                {chat}
              </Typography>
            ))}
          </Box>
        </Box>
      </Paper>
    </Container>
  );
};

export default Chat;
