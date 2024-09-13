// pages/_app.js
import { CssBaseline, ThemeProvider, createTheme } from '@mui/material';
import '../styles/globals.css';  // Importar el archivo de estilos globalesss
import Script from 'next/script';

const theme = createTheme({
  palette: {
    primary: {
      main: '#0070f3',
    },
  },
});

function MyApp({ Component, pageProps }) {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Script
        id="mathjax-config"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            window.MathJax = {
              tex: {
                inlineMath: [['$', '$'], ['\\(', '\\)']]
              },
              svg: {
                fontCache: 'global'
              }
            };
          `,
        }}
      />
      <Script
        src="https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-mml-chtml.js"
        strategy="afterInteractive"
      />
      <Component {...pageProps} />
    </ThemeProvider>
  );
}

export default MyApp;
