import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Typography } from '@mui/material';
import FileUpload from '../components/FileUpload/FileUpload';

function Home() {
  const navigate = useNavigate();
  const [isUploading, setIsUploading] = useState(false);

  const handleUploadStart = () => {
    setIsUploading(true);
  };

  const handleUploadComplete = (data) => {
    setIsUploading(false);
    // Navigate to results page with the project ID or data
    navigate('/results/latest', { state: { projectData: data } });
  };

  return (
    <Container maxWidth="lg">
      <Typography
        variant="h3"
        component="h1"
        align="center"
        gutterBottom
        sx={{ mt: 4 }}
      >
        Documentation Generator
      </Typography>
      
      <FileUpload
        onUploadStart={handleUploadStart}
        onUploadComplete={handleUploadComplete}
      />
    </Container>
  );
}

export default Home;