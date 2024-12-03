import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Box,
  Typography,
  Paper,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemButton,
  Collapse,
  Divider,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
} from '@mui/material';
import {
  Folder,
  FolderOpen,
  InsertDriveFile,
  ExpandLess,
  ExpandMore,
  Delete as DeleteIcon,
  Description as DocIcon,
} from '@mui/icons-material';

function FileExplorer({ node, level = 0 }) {
  const [open, setOpen] = useState(true);

  const handleClick = () => {
    if (node.type === 'directory') {
      setOpen(!open);
    }
  };

  const indent = level * 16;

  return (
    <>
      <ListItemButton
        onClick={handleClick}
        sx={{
          pl: indent / 8,
          py: 0.5,
          '&:hover': { bgcolor: 'action.hover' },
        }}
      >
        <ListItemIcon sx={{ minWidth: 40 }}>
          {node.type === 'directory' ? (
            open ? <FolderOpen color="primary" /> : <Folder color="primary" />
          ) : (
            <InsertDriveFile color="action" />
          )}
        </ListItemIcon>
        <ListItemText 
          primary={node.name}
          primaryTypographyProps={{
            variant: 'body2',
            sx: { 
              fontWeight: node.type === 'directory' ? 500 : 400,
              color: node.type === 'directory' ? 'primary.main' : 'text.primary'
            }
          }}
        />
        {node.type === 'directory' && (
          node.children?.length > 0 ? (
            open ? <ExpandLess /> : <ExpandMore />
          ) : null
        )}
      </ListItemButton>
      
      {node.type === 'directory' && node.children && (
        <Collapse in={open} timeout="auto">
          <List disablePadding>
            {node.children.map((child, index) => (
              <FileExplorer 
                key={`${child.name}-${index}`} 
                node={child} 
                level={level + 1} 
              />
            ))}
          </List>
        </Collapse>
      )}
    </>
  );
}

function Projects() {
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState(null);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        setLoading(true);
        const response = await fetch('http://localhost:8000/api/projects');
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.detail || 'Failed to fetch projects');
        }
        const data = await response.json();
        console.log('Projects:', data);
        setProjects(data);
      } catch (error) {
        console.error('Error fetching projects:', error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, []);

  const handleDeleteClick = (project) => {
    setProjectToDelete(project);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!projectToDelete) return;

    try {
      const response = await fetch(`http://localhost:8000/api/projects/${projectToDelete.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete project');
      }

      setProjects(projects.filter(p => p.id !== projectToDelete.id));
    } catch (error) {
      console.error('Error deleting project:', error);
      setError(error.message);
    } finally {
      setDeleteDialogOpen(false);
      setProjectToDelete(null);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setProjectToDelete(null);
  };

  const handleGenerateDoc = async (project) => {
    try {
      if (!project.name) {
        throw new Error('Project name is undefined');
      }

      console.log('Generating documentation for project:', project);

      // If documentation already exists in the project, use it directly
      if (project.info?.documentation) {
        console.log('Using existing documentation');
        navigate(`/documentation/${project.name}`, {
          state: { 
            documentation: project.info.documentation,
            projectName: project.name
          }
        });
        return;
      }

      // Generate new documentation
      const response = await fetch(`http://localhost:8000/api/generate-docs/${encodeURIComponent(project.name)}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to generate documentation');
      }

      const data = await response.json();
      console.log('Documentation generated:', data);
      
      if (data.status === 'success') {
        navigate(`/documentation/${project.name}`, {
          state: { 
            documentation: data.documentation,
            projectName: project.name
          }
        });
      }
    } catch (error) {
      console.error('Error generating documentation:', error);
      setError(error.message);
    }
  };

  return (
    <Container maxWidth="lg">
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Projects ({projects.length})
        </Typography>
      </Box>

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        {projects.map((project, index) => (
          <Paper 
            key={project.name || index}
            elevation={2} 
            sx={{ p: 2 }}
          >
            <Box sx={{ 
              display: 'flex', 
              justifyContent: 'space-between',
              alignItems: 'center',
              mb: 2
            }}>
              <Typography variant="h6">
                {project.name}
              </Typography>
              <Box>
                <IconButton
                  onClick={() => handleGenerateDoc(project)}
                  color="primary"
                  title="Generate Documentation"
                >
                  <DocIcon />
                </IconButton>
                <IconButton
                  onClick={() => handleDeleteClick(project)}
                  color="error"
                  title="Delete Project"
                >
                  <DeleteIcon />
                </IconButton>
              </Box>
            </Box>
            
            {/* Display project info */}
            {project.info && (
              <Box sx={{ mt: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  Status: {project.status}
                </Typography>
                {/* Add more project info display as needed */}
              </Box>
            )}
          </Paper>
        ))}

        {/* Delete Confirmation Dialog */}
        <Dialog
          open={deleteDialogOpen}
          onClose={handleDeleteCancel}
          aria-labelledby="delete-dialog-title"
        >
          <DialogTitle id="delete-dialog-title">
            Delete Project?
          </DialogTitle>
          <DialogContent>
            <Typography>
              Are you sure you want to delete this project? This action cannot be undone.
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleDeleteCancel} color="primary">
              Cancel
            </Button>
            <Button 
              onClick={handleDeleteConfirm} 
              color="error"
              variant="contained"
            >
              Delete
            </Button>
          </DialogActions>
        </Dialog>

        {projects.length === 0 && (
          <Paper elevation={2} sx={{ p: 3, textAlign: 'center' }}>
            <Typography variant="h6" color="text.secondary">
              No projects yet
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Upload a project from the home page to get started
            </Typography>
          </Paper>
        )}
      </Box>
    </Container>
  );
}

export default Projects; 