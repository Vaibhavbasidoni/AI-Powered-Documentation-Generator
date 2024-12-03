import { useState } from 'react';
import JSZip from 'jszip';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Typography,
  CircularProgress,
  Alert,
} from '@mui/material';
import { UploadFile as UploadIcon } from '@mui/icons-material';

function FileUpload() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleFolderSelect = async (event) => {
    try {
      const files = Array.from(event.target.files);
      console.log('Files to upload:', files.length);

      if (files.length === 0) {
        setError('No files selected');
        return;
      }

      // Get the project name from the first file's path
      const projectPath = files[0].webkitRelativePath;
      const projectName = projectPath.split('/')[0];
      console.log('Project name:', projectName);

      // Create a FormData object
      const formData = new FormData();
      
      // Create a zip file containing all the project files
      const zip = new JSZip();
      
      // Add files to the zip
      for (const file of files) {
        const relativePath = file.webkitRelativePath.replace(projectName + '/', '');
        zip.file(relativePath, file);
      }
      
      // Generate the zip file
      const zipBlob = await zip.generateAsync({ type: 'blob' });
      
      // Add the zip file to FormData
      formData.append('file', zipBlob, `${projectName}.zip`);

      console.log('Sending request to backend...');
      setLoading(true);
      setError(null);

      // Send the request to the correct endpoint
      const response = await fetch('http://localhost:8000/api/projects', {
        method: 'POST',
        body: formData,
      });

      console.log('Response status:', response.status);

      if (!response.ok) {
        throw new Error(`Upload failed: ${response.statusText}`);
      }

      const data = await response.json();
      console.log('Upload response:', data);

      if (data.status === 'success') {
        navigate('/projects');
      } else {
        throw new Error(data.error || 'Upload failed');
      }
    } catch (error) {
      console.error('Error processing folder:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ textAlign: 'center', py: 4 }}>
      <input
        type="file"
        id="folder-input"
        webkitdirectory="true"
        directory="true"
        style={{ display: 'none' }}
        onChange={handleFolderSelect}
      />
      
      <label htmlFor="folder-input">
        <Button
          variant="contained"
          component="span"
          startIcon={<UploadIcon />}
          disabled={loading}
          sx={{ mb: 2 }}
        >
          Upload Project Folder
        </Button>
      </label>

      {loading && (
        <Box sx={{ mt: 2 }}>
          <CircularProgress size={24} />
          <Typography variant="body2" sx={{ mt: 1 }}>
            Processing files...
          </Typography>
        </Box>
      )}

      {error && (
        <Alert severity="error" sx={{ mt: 2 }}>
          {error}
        </Alert>
      )}

      <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
        Select a project folder to generate documentation
      </Typography>
    </Box>
  );
}

export default FileUpload;