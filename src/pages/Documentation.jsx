import { useState, useEffect } from 'react';
import { useLocation, useParams } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Paper,
  List,
  ListItem,
  ListItemText,
  Divider,
  Chip,
  Grid,
  Card,
  CardContent,
  Stack,
  Link,
  IconButton,
  Tooltip
} from '@mui/material';
import ReactMarkdown from 'react-markdown';
import {
  Language as WebIcon,
  Storage as DatabaseIcon,
  Code as CodeIcon,
  Build as ToolIcon,
  Architecture as FrameworkIcon
} from '@mui/icons-material';

function Documentation() {
  const location = useLocation();
  const { projectName } = useParams();
  const [documentation, setDocumentation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (location.state?.documentation) {
      setDocumentation(location.state.documentation);
      setLoading(false);
      return;
    }

    const fetchDocumentation = async () => {
      try {
        setLoading(true);
        const response = await fetch(`http://localhost:8000/api/generate-docs/${projectName}`);
        const data = await response.json();
        setDocumentation(data.documentation);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchDocumentation();
  }, [projectName, location.state]);

  if (loading) return <Typography>Loading documentation...</Typography>;
  if (error) return <Typography color="error">{error}</Typography>;
  if (!documentation) return <Typography>No documentation available</Typography>;

  // Helper function to categorize technologies
  const categorizeTech = (tech) => {
    const categories = {
      languages: ['Python', 'JavaScript', 'TypeScript', 'Java', 'C++', 'Go', 'Rust'],
      frameworks: ['React', 'Vue.js', 'Angular', 'Django', 'Flask', 'FastAPI', 'Spring'],
      databases: ['MongoDB', 'PostgreSQL', 'MySQL', 'Redis', 'SQLite'],
      tools: ['Docker', 'Kubernetes', 'Git', 'Jenkins', 'Streamlit', 'Jupyter'],
      libraries: ['Pandas', 'NumPy', 'TensorFlow', 'PyTorch', 'scikit-learn']
    };

    for (const [category, items] of Object.entries(categories)) {
      if (items.includes(tech)) return category;
    }
    return 'other';
  };

  // Helper function to get icon for technology category
  const getTechIcon = (category) => {
    switch (category) {
      case 'languages':
        return <CodeIcon />;
      case 'frameworks':
        return <FrameworkIcon />;
      case 'databases':
        return <DatabaseIcon />;
      case 'tools':
        return <ToolIcon />;
      default:
        return <WebIcon />;
    }
  };

  return (
    <Container 
      maxWidth="lg" 
      sx={{ 
        py: 4,
        height: 'calc(100vh - 64px)', // Subtract header height
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column'
      }}
    >
      <Typography variant="h4" gutterBottom sx={{ position: 'sticky', top: 0, bgcolor: 'background.default', zIndex: 1 }}>
        Documentation: {documentation.project_name}
      </Typography>

      <Box sx={{ 
        overflow: 'auto', 
        flex: 1,
        '&::-webkit-scrollbar': {
          width: '8px',
        },
        '&::-webkit-scrollbar-track': {
          background: '#f1f1f1',
          borderRadius: '4px',
        },
        '&::-webkit-scrollbar-thumb': {
          background: '#888',
          borderRadius: '4px',
          '&:hover': {
            background: '#555',
          },
        },
      }}>
        {/* Project Overview */}
        <Paper sx={{ p: 3, mb: 3 }}>
          <Typography variant="h5" gutterBottom>Project Overview</Typography>
          <ReactMarkdown>{documentation.project_info.description || 'No description available'}</ReactMarkdown>
        </Paper>

        {/* Technologies Used */}
        <Paper sx={{ p: 3, mb: 3 }}>
          <Typography variant="h5" gutterBottom>Technologies Used</Typography>
          <Grid container spacing={2}>
            {['languages', 'frameworks', 'databases', 'tools', 'libraries'].map(category => {
              const techsInCategory = documentation.project_info.technologies?.filter(
                tech => categorizeTech(tech) === category
              ) || [];

              return techsInCategory.length > 0 && (
                <Grid item xs={12} md={4} key={category}>
                  <Card variant="outlined">
                    <CardContent>
                      <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
                        {getTechIcon(category)}
                        <Typography variant="subtitle1" sx={{ textTransform: 'capitalize' }}>
                          {category}
                        </Typography>
                      </Stack>
                      <Stack direction="row" flexWrap="wrap" gap={1}>
                        {techsInCategory.map((tech, index) => (
                          <Chip
                            key={index}
                            label={tech}
                            color="primary"
                            variant="outlined"
                            size="small"
                          />
                        ))}
                      </Stack>
                    </CardContent>
                  </Card>
                </Grid>
              );
            })}
          </Grid>
        </Paper>

        {/* Dependencies */}
        <Paper sx={{ p: 3, mb: 3 }}>
          <Typography variant="h5" gutterBottom>Dependencies</Typography>
          <Grid container spacing={2}>
            {documentation.project_info.dependencies?.map((dep, index) => (
              <Grid item xs={12} sm={6} md={4} key={index}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="body2" color="text.secondary">
                      {dep}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
            {(!documentation.project_info.dependencies || documentation.project_info.dependencies.length === 0) && (
              <Grid item xs={12}>
                <Typography color="text.secondary">No dependencies found</Typography>
              </Grid>
            )}
          </Grid>
        </Paper>

        {/* Components Analysis */}
        <Paper sx={{ p: 3, mb: 3 }}>
          <Typography variant="h5" gutterBottom>Components Analysis</Typography>
          {documentation.analysis.components?.map((component, index) => (
            <Box key={index} sx={{ mb: 3 }}>
              <Typography variant="h6" color="primary">{component.file}</Typography>
              <Typography variant="body1" sx={{ mb: 1 }}>{component.description}</Typography>
              
              {/* Functions */}
              {component.functions?.length > 0 && (
                <>
                  <Typography variant="subtitle1" sx={{ mt: 2 }}>Functions:</Typography>
                  <List dense>
                    {component.functions.map((func, fIndex) => (
                      <ListItem key={fIndex}>
                        <ListItemText
                          primary={func.name}
                          secondary={
                            <>
                              <Typography variant="body2">
                                Arguments: {func.args.join(', ') || 'None'}
                              </Typography>
                              <Typography variant="body2">
                                {func.docstring}
                              </Typography>
                            </>
                          }
                        />
                      </ListItem>
                    ))}
                  </List>
                </>
              )}

              {/* Classes */}
              {component.classes?.length > 0 && (
                <>
                  <Typography variant="subtitle1" sx={{ mt: 2 }}>Classes:</Typography>
                  <List dense>
                    {component.classes.map((cls, cIndex) => (
                      <ListItem key={cIndex}>
                        <ListItemText
                          primary={cls.name}
                          secondary={
                            <>
                              <Typography variant="body2">{cls.docstring}</Typography>
                              <Typography variant="body2">
                                Methods: {cls.methods.join(', ')}
                              </Typography>
                            </>
                          }
                        />
                      </ListItem>
                    ))}
                  </List>
                </>
              )}
              <Divider sx={{ my: 2 }} />
            </Box>
          ))}
        </Paper>

        {/* Code Quality */}
        <Paper sx={{ p: 3 }}>
          <Typography variant="h5" gutterBottom>Code Quality Analysis</Typography>
          <List>
            <ListItem>
              <ListItemText primary="Total Lines" secondary={documentation.analysis.code_quality.total_lines} />
            </ListItem>
            <ListItem>
              <ListItemText primary="Code Lines" secondary={documentation.analysis.code_quality.code_lines} />
            </ListItem>
            <ListItem>
              <ListItemText primary="Comment Lines" secondary={documentation.analysis.code_quality.comment_lines} />
            </ListItem>
            <ListItem>
              <ListItemText 
                primary="Documentation Coverage" 
                secondary={`${documentation.analysis.code_quality.docstring_coverage.toFixed(1)}%`} 
              />
            </ListItem>
          </List>
          {documentation.analysis.code_quality.recommendations && (
            <>
              <Typography variant="h6" sx={{ mt: 2 }}>Recommendations</Typography>
              <ReactMarkdown>{documentation.analysis.code_quality.recommendations}</ReactMarkdown>
            </>
          )}
        </Paper>
      </Box>
    </Container>
  );
}

export default Documentation;