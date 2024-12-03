import { useState } from 'react';
import {
  Box,
  Paper,
  Tabs,
  Tab,
  Typography,
  Divider,
  List,
  ListItem,
  ListItemText,
  Accordion,
  AccordionSummary,
  AccordionDetails
} from '@mui/material';
import {
  ExpandMore,
  Class as ClassIcon,
  Functions as FunctionIcon,
  Api as ApiIcon,
  Description as ModuleIcon
} from '@mui/icons-material';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';

function DocumentationDisplay({ documentation }) {
  const [currentTab, setCurrentTab] = useState(0);

  const renderFunctionDocs = (func) => (
    <Box sx={{ mb: 2 }}>
      <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 1 }}>
        {func.name}
      </Typography>
      <Typography variant="body2" sx={{ mb: 1 }}>
        {func.description}
      </Typography>
      {func.params && (
        <Box sx={{ mb: 1 }}>
          <Typography variant="body2" sx={{ fontWeight: 'bold' }}>Parameters:</Typography>
          <List dense>
            {func.params.map((param, index) => (
              <ListItem key={index}>
                <ListItemText
                  primary={`${param.name}: ${param.type}`}
                  secondary={param.description}
                />
              </ListItem>
            ))}
          </List>
        </Box>
      )}
      {func.returns && (
        <Box sx={{ mb: 1 }}>
          <Typography variant="body2" sx={{ fontWeight: 'bold' }}>Returns:</Typography>
          <Typography variant="body2">
            {`${func.returns.type} - ${func.returns.description}`}
          </Typography>
        </Box>
      )}
      <SyntaxHighlighter
        language="javascript"
        style={vscDarkPlus}
        customStyle={{ fontSize: '0.9em' }}
      >
        {func.example || '// No example available'}
      </SyntaxHighlighter>
    </Box>
  );

  return (
    <Paper sx={{ minHeight: '600px' }}>
      <Tabs
        value={currentTab}
        onChange={(e, newValue) => setCurrentTab(newValue)}
        sx={{ borderBottom: 1, borderColor: 'divider' }}
      >
        <Tab icon={<ModuleIcon />} label="Modules" />
        <Tab icon={<FunctionIcon />} label="Functions" />
        <Tab icon={<ClassIcon />} label="Classes" />
        <Tab icon={<ApiIcon />} label="API" />
      </Tabs>

      <Box sx={{ p: 3 }}>
        {/* Modules Tab */}
        {currentTab === 0 && (
          <Box>
            {documentation?.modules?.map((module, index) => (
              <Accordion key={index} defaultExpanded={index === 0}>
                <AccordionSummary expandIcon={<ExpandMore />}>
                  <Typography variant="h6">{module.name}</Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Typography variant="body1" paragraph>
                    {module.description}
                  </Typography>
                  <Divider sx={{ my: 2 }} />
                  <Typography variant="subtitle2" gutterBottom>
                    Dependencies:
                  </Typography>
                  <List dense>
                    {module.dependencies?.map((dep, idx) => (
                      <ListItem key={idx}>
                        <ListItemText primary={dep} />
                      </ListItem>
                    ))}
                  </List>
                </AccordionDetails>
              </Accordion>
            ))}
          </Box>
        )}

        {/* Functions Tab */}
        {currentTab === 1 && (
          <Box>
            {documentation?.functions?.map((func, index) => (
              <Box key={index}>
                {renderFunctionDocs(func)}
                {index < documentation.functions.length - 1 && (
                  <Divider sx={{ my: 3 }} />
                )}
              </Box>
            ))}
          </Box>
        )}

        {/* Classes Tab */}
        {currentTab === 2 && (
          <Box>
            {documentation?.classes?.map((classDoc, index) => (
              <Accordion key={index} defaultExpanded={index === 0}>
                <AccordionSummary expandIcon={<ExpandMore />}>
                  <Typography variant="h6">{classDoc.name}</Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Typography variant="body1" paragraph>
                    {classDoc.description}
                  </Typography>
                  <Typography variant="subtitle1" gutterBottom>
                    Methods:
                  </Typography>
                  {classDoc.methods?.map((method, idx) => (
                    <Box key={idx} sx={{ ml: 2, mb: 2 }}>
                      {renderFunctionDocs(method)}
                    </Box>
                  ))}
                </AccordionDetails>
              </Accordion>
            ))}
          </Box>
        )}

        {/* API Tab */}
        {currentTab === 3 && (
          <Box>
            {documentation?.apis?.map((api, index) => (
              <Accordion key={index} defaultExpanded={index === 0}>
                <AccordionSummary expandIcon={<ExpandMore />}>
                  <Typography variant="h6">
                    {api.method} {api.endpoint}
                  </Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Typography variant="body1" paragraph>
                    {api.description}
                  </Typography>
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="subtitle2" gutterBottom>
                      Request Parameters:
                    </Typography>
                    <SyntaxHighlighter
                      language="json"
                      style={vscDarkPlus}
                      customStyle={{ fontSize: '0.9em' }}
                    >
                      {JSON.stringify(api.parameters, null, 2)}
                    </SyntaxHighlighter>
                  </Box>
                  <Box>
                    <Typography variant="subtitle2" gutterBottom>
                      Response:
                    </Typography>
                    <SyntaxHighlighter
                      language="json"
                      style={vscDarkPlus}
                      customStyle={{ fontSize: '0.9em' }}
                    >
                      {JSON.stringify(api.response, null, 2)}
                    </SyntaxHighlighter>
                  </Box>
                </AccordionDetails>
              </Accordion>
            ))}
          </Box>
        )}
      </Box>
    </Paper>
  );
}

export default DocumentationDisplay;