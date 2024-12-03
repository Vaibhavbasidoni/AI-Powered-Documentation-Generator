import { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Divider,
  useTheme,
  useMediaQuery
} from '@mui/material';
import {
  Folder,
  InsertDriveFile,
  Code as CodeIcon,
  Description,
  Html,
  Css,
  DataObject,
  Terminal,
  Settings
} from '@mui/icons-material';

const getFileIcon = (filename) => {
  const extension = filename.split('.').pop().toLowerCase();
  
  // Web Development
  if (['js', 'jsx', 'ts', 'tsx', 'vue', 'svelte'].includes(extension)) {
    return <CodeIcon color="warning" />;
  }
  
  // Styling
  if (['css', 'scss', 'sass', 'less', 'styl'].includes(extension)) {
    return <Css color="primary" />;
  }
  
  // Markup & Templates
  if (['html', 'htm', 'xhtml', 'jsp', 'asp', 'aspx', 'ejs', 'hbs', 'pug'].includes(extension)) {
    return <Html color="error" />;
  }
  
  // Configuration & Data
  if (['json', 'yaml', 'yml', 'xml', 'toml', 'ini', 'env', 'config'].includes(extension)) {
    return <Settings color="success" />;
  }
  
  // Documentation
  if (['md', 'mdx', 'txt', 'rst', 'pdf', 'doc', 'docx'].includes(extension)) {
    return <Description />;
  }
  
  // Programming Languages
  if ([
    // Backend Languages
    'py', 'rb', 'php', 'java', 'kt', 'scala', 'go', 'rs', 'cs', 'fs', 'vb',
    // Systems Programming
    'c', 'cpp', 'h', 'hpp', 'cc', 'cxx',
    // Shell Scripts
    'sh', 'bash', 'zsh', 'fish', 'ps1', 'bat', 'cmd',
    // Other Languages
    'swift', 'r', 'dart', 'lua', 'pl', 'pm', 'ex', 'exs', 'erl', 'hrl',
    // Framework-specific
    'spring', 'gradle', 'maven', 'ant', 'django', 'flask', 'rails'
  ].includes(extension)) {
    return <Terminal color="info" />;
  }
  
  // Data & Database
  if (['sql', 'sqlite', 'prisma', 'graphql', 'gql'].includes(extension)) {
    return <DataObject color="secondary" />;
  }

  return <InsertDriveFile />;
};

const shouldShowFile = (filename) => {
  const imageExtensions = ['png', 'jpg', 'jpeg', 'gif', 'bmp', 'svg', 'ico', 'webp', 'tiff'];
  const extension = filename.split('.').pop().toLowerCase();
  return !imageExtensions.includes(extension);
};

function ProjectStructureViewer({ projectStructure = [] }) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const renderStructure = (nodes, level = 0) => {
    return nodes.map((node) => {
      // Skip image files but show everything else
      if (node.type === 'file' && !shouldShowFile(node.name)) {
        return null;
      }

      return (
        <Box key={node.path || `${node.type}-${node.name}`}>
          <Box 
            sx={{ 
              pl: level * 2, 
              display: 'flex', 
              alignItems: 'center', 
              py: 0.5,
              '&:hover': {
                bgcolor: 'action.hover',
                borderRadius: 1
              }
            }}
          >
            {node.type === 'directory' ? (
              <Folder color="primary" sx={{ mr: 1 }} />
            ) : (
              <Box sx={{ mr: 1 }}>{getFileIcon(node.name)}</Box>
            )}
            <Typography variant="body2">{node.name}</Typography>
          </Box>
          {node.children && (
            <Box>
              {renderStructure(node.children, level + 1)}
            </Box>
          )}
        </Box>
      );
    }).filter(Boolean);
  };

  if (!projectStructure || projectStructure.length === 0) {
    return (
      <Paper sx={{ p: 3, textAlign: 'center' }}>
        <Typography variant="h6" color="text.secondary" gutterBottom>
          No Project Files Available
        </Typography>
        <Typography variant="body2" color="text.secondary">
          The project structure is currently empty or still loading.
        </Typography>
      </Paper>
    );
  }

  return (
    <Paper 
      sx={{ 
        height: 'calc(100vh - 200px)',
        overflow: 'auto'
      }}
    >
      <Box sx={{ p: 2 }}>
        <Typography variant="h6" gutterBottom>
          Project Files
        </Typography>
      </Box>
      <Divider />
      <Box sx={{ p: 2 }}>
        {renderStructure(projectStructure)}
      </Box>
    </Paper>
  );
}

export default ProjectStructureViewer;