import React, { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Box, Typography, Paper } from '@mui/material';

const ImageUploader = ({ onImageUpload }) => {
  const onDrop = useCallback(acceptedFiles => {
    const file = acceptedFiles[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        onImageUpload(reader.result);
      };
      reader.readAsDataURL(file);
    }
  }, [onImageUpload]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif']
    },
    multiple: false
  });

  return (
    <Paper
      elevation={3}
      sx={{
        p: 2,
        mb: 2,
        textAlign: 'center',
      }}
    >
      <Box
        {...getRootProps()}
        sx={{
          border: '2px dashed #ccc',
          borderRadius: 2,
          p: 3,
          cursor: 'pointer',
          bgcolor: isDragActive ? 'rgba(0, 0, 0, 0.05)' : 'transparent',
          '&:hover': {
            bgcolor: 'rgba(0, 0, 0, 0.05)'
          }
        }}
      >
        <input {...getInputProps()} />
        <Typography variant="body1">
          {isDragActive
            ? 'Déposez l\'image ici...'
            : 'Glissez et déposez une image ici, ou cliquez pour sélectionner une image'}
        </Typography>
      </Box>
    </Paper>
  );
};

export default ImageUploader; 