// pages/index.js
import Head from 'next/head';
import { useState } from 'react';
import Chat from '../components/Chat';
import { Container, Button, Box, Paper, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from '@mui/material';

export default function Home() {
  const [selectedOption, setSelectedOption] = useState(null);
  const [open, setOpen] = useState(false);

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleOptionClick = (option) => {
    setSelectedOption(option);
    handleClose();
  };

  return (
    <div>
      <Head>
        <title>DocuChaty</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Container maxWidth="sm">
        <Box display="flex" flexDirection="column" alignItems="center" mt={4}>
          <Button variant="contained" color="primary" onClick={handleClickOpen}>
            Seleccione una opción
          </Button>
          <Dialog open={open} onClose={handleClose}>
            <DialogTitle>Seleccione una opción</DialogTitle>
            <DialogContent>
              <DialogContentText>
                Por favor, seleccione una de las siguientes opciones para continuar.
              </DialogContentText>
              <Box mt={2}>
                <Button
                  variant="contained"
                  color="primary"
                  fullWidth
                  sx={{ marginBottom: 1 }}
                  onClick={() => handleOptionClick('anexo_a')}
                >
                  Calidad Comercial
                </Button>
                <Button
                  variant="contained"
                  color="primary"
                  fullWidth
                  sx={{ marginBottom: 1 }}
                  onClick={() => handleOptionClick('anexo_b')}
                >
                  Servicio Técnico
                </Button>
                <Button
                  variant="contained"
                  color="primary"
                  fullWidth
                  sx={{ marginBottom: 1 }}
                  onClick={() => handleOptionClick('anexo_c')}
                >
                  Producto Técnico
                </Button>
                <Button
                  variant="contained"
                  color="primary"
                  fullWidth
                  sx={{ marginBottom: 1 }}
                  onClick={() => handleOptionClick('normativa')}
                >
                  Normativa
                </Button>
                <Button
                  variant="contained"
                  color="primary"
                  fullWidth
                  sx={{ marginBottom: 1 }}
                  onClick={() => handleOptionClick('cem')}
                >
                  Campaña de Exactitud de Medidores
                </Button>
              </Box>
            </DialogContent>
            <DialogActions>
              <Button onClick={handleClose} color="secondary">
                Cancelar
              </Button>
            </DialogActions>
          </Dialog>
          {selectedOption && <Chat selectedOption={selectedOption} />}
        </Box>
      </Container>
    </div>
  );
}
