import { useState } from 'react';
import {
  Box,
  Paper,
  Tabs,
  Tab,
  Typography,
  Divider,
  Chip,
  IconButton,
  Tooltip,
  Grid,
  List,
  ListItem,
  ListItemText,
  ListItemIcon
} from '@mui/material';
import {
  Description,
  Code,
  AutoAwesome,
  FileCopy,
  Link as LinkIcon,
  BugReport,
  Architecture,
  Speed
} from '@mui/icons-material';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';

function DocumentationPreview({ documentation }) {
  const [currentTab, setCurrentTab] = useState(0);
  const [selectedSection, setSelectedSection] = useState('overview');

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
  };

  const sections = {
    overview: {
      title: 'Project Overview',
      icon: <Description />,
      content: documentation?.overview
    },
    architecture: {
      title: 'Architecture',
      icon: <Architecture />,
      content: documentation?.architecture
    },
    dependencies: {
      title: 'Dependencies',
      icon: <LinkIcon />,
      content: documentation?.dependencies
    },
    performance: {
      title: 'Performance Insights',
      icon: <Speed />,
      content: documentation?.performance
    },
    issues: {
      title: 'Potential Issues',
      icon: <BugReport />,
      content: documentation?.issues
    }
  };

  return (
    <Paper sx={{ height: 'calc(100vh - 200px)' }}>
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={currentTab} onChange={(e, newValue) => setCurrentTab(newValue)}>
          <Tab icon={<Description />} label="Documentation" />
          <Tab icon={<Code />} label="Code Analysis" />
          <Tab icon={<AutoAwesome />} label="AI Insights" />
        </Tabs>
      </Box>

      <Grid container sx={{ height: 'calc(100% - 48px)' }}>
        {/* Navigation Sidebar */}
        <Grid item xs={3} sx={{ borderRight: 1, borderColor: 'divider' }}>
          <List component="nav">
            {Object.entries(sections).map(([key, section]) => (
              <ListItem
                button
                key={key}
                selected={selectedSection === key}
                onClick={() => setSelectedSection(key)}
              >
                <ListItemIcon>{section.icon}</ListItemIcon>
                <ListItemText primary={section.title} />
              </ListItem>
            ))}
          </List>
        </Grid>

        {/* Main Content Area */}
        <Grid item xs={9} sx={{ height: '100%', overflow: 'auto' }}>
          <Box sx={{ p: 3 }}>
            {currentTab === 0 && (
              <Box>
                <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Typography variant="h5">
                    {sections[selectedSection].title}
                  </Typography>
                  <Chip
                    label="AI Generated"
                    color="primary"
                    size="small"
                    icon={<AutoAwesome />}
                  />
                </Box>
                <Divider sx={{ mb: 3 }} />
                
                <Typography variant="body1">
                  {sections[selectedSection].content}
                </Typography>

                {selectedSection === 'dependencies' && documentation?.dependencyList && (
                  <Box sx={{ mt: 3 }}>
                    <Typography variant="h6" gutterBottom>
                      Package Dependencies
                    </Typography>
                    <SyntaxHighlighter
                      language="json"
                      style={vscDarkPlus}
                      customStyle={{ padding: '16px' }}
                    >
                      {JSON.stringify(documentation.dependencyList, null, 2)}
                    </SyntaxHighlighter>
                  </Box>
                )}
              </Box>
            )}

            {currentTab === 1 && (
              <Box>
                <Typography variant="h6" gutterBottom>
                  Code Quality Analysis
                </Typography>
                {documentation?.codeAnalysis?.map((analysis, index) => (
                  <Paper key={index} sx={{ p: 2, mb: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <Typography variant="subtitle1">
                        {analysis.file}
                      </Typography>
                      <Tooltip title="Copy Path">
                        <IconButton size="small" onClick={() => handleCopy(analysis.file)}>
                          <FileCopy fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Box>
                    <Typography variant="body2" color="text.secondary">
                      {analysis.summary}
                    </Typography>
                  </Paper>
                ))}
              </Box>
            )}

            {currentTab === 2 && (
              <Box>
                <Typography variant="h6" gutterBottom>
                  AI Insights
                </Typography>
                {documentation?.aiInsights?.map((insight, index) => (
                  <Paper key={index} sx={{ p: 2, mb: 2 }}>
                    <Typography variant="subtitle1" gutterBottom>
                      {insight.title}
                    </Typography>
                    <Typography variant="body2">
                      {insight.description}
                    </Typography>
                  </Paper>
                ))}
              </Box>
            )}
          </Box>
        </Grid>
      </Grid>
    </Paper>
  );
}

export default DocumentationPreview;