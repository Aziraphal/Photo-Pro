import React, { useState } from 'react';
import { Container, Typography, Box, CssBaseline, AppBar, Toolbar } from '@mui/material';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import '@fontsource/roboto/300.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';
import ImageUploader from './components/ImageUploader';
import ImageEditor from './components/ImageEditor';

const theme = createTheme({
  palette: {
    primary: {
      main: '#3f51b5',
    },
    secondary: {
      main: '#f50057',
    },
  },
});

function App() {
  const [imageUrl, setImageUrl] = useState('');

  const handleImageUpload = (imageData) => {
    setImageUrl(imageData);
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ flexGrow: 1 }}>
        <AppBar position="static">
          <Toolbar>
            <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
              Photo Pro - Éditeur d'Images
            </Typography>
          </Toolbar>
        </AppBar>
        <Container maxWidth="lg" sx={{ mt: 4 }}>
          <ImageUploader onImageUpload={handleImageUpload} />
          
          {imageUrl ? (
            <ImageEditor imageUrl={imageUrl} />
          ) : (
            <Box sx={{ textAlign: 'center', mt: 8, mb: 8 }}>
              <Typography variant="h5" color="text.secondary">
                Téléchargez une image pour commencer l'édition
              </Typography>
            </Box>
          )}
        </Container>
      </Box>
    </ThemeProvider>
  );
}

export default App;
