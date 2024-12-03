import { useState, useEffect } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import {
  Container,
  Box,
  Typography,
  Paper,
  TreeView,
  TreeItem,
} from '@mui/material';
import {
  ExpandMore,
  ChevronRight,
  InsertDriveFile,
  Folder
} from '@mui/icons-material';

function Results() {
  const { projectId } = useParams();
  const location = useLocation();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  console.log('Results component mounted');
  console.log('Current location:', location.pathname);
  console.log('Project ID from params:', projectId);

  useEffect(() => {
    const fetchProjectDetails = async () => {
      try {
        console.log('Fetching project details...');
        const response = await fetch(`http://localhost:8000/api/projects/${projectId}`);
        
        if (!response.ok) {
          console.error('Response not OK:', response.status);
          throw new Error('Failed to fetch project details');
        }
        
        const data = await response.json();
        console.log('Received project data:', data);
        
        if (!data.project?.structure) {
          console.error('No structure in response:', data);
          throw new Error('Project structure is missing');
        }
        
        setProject(data.project);
      } catch (err) {
        console.error('Error fetching project:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (projectId) {
      console.log('Initiating fetch for project:', projectId);
      fetchProjectDetails();
    } else {
      console.error('No project ID available');
    }
  }, [projectId]);

  const renderTree = (nodes) => {
    console.log('6. Rendering node:', nodes.name);
    return (
      <TreeItem
        key={nodes.name}
        nodeId={nodes.name}
        label={nodes.name}
        icon={nodes.type === 'file' ? <InsertDriveFile /> : <Folder />}
      >
        {Array.isArray(nodes.children)
          ? nodes.children.map((node) => renderTree(node))
          : null}
      </TreeItem>
    );
  };

  if (loading) {
    console.log('7. Component is loading');
    return (
      <Container>
        <Typography>Loading...</Typography>
      </Container>
    );
  }

  if (error) {
    console.log('8. Component has error:', error);
    return (
      <Container>
        <Typography color="error">Error: {error}</Typography>
      </Container>
    );
  }

  console.log('9. Rendering main component with project:', project);

  return (
    <Container maxWidth="lg">
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          Project Structure
        </Typography>
        <Typography variant="subtitle1" color="text.secondary" gutterBottom>
          {project?.name || 'Unnamed Project'}
        </Typography>
      </Box>

      <Paper elevation={2} sx={{ p: 2 }}>
        {project?.structure ? (
          <TreeView
            defaultCollapseIcon={<ExpandMore />}
            defaultExpandIcon={<ChevronRight />}
            defaultExpanded={['root']}
            sx={{ 
              flexGrow: 1,
              maxWidth: '100%',
              overflowY: 'auto'
            }}
          >
            {renderTree(project.structure)}
          </TreeView>
        ) : (
          <Typography>No structure available</Typography>
        )}
      </Paper>
    </Container>
  );
}

export default Results;