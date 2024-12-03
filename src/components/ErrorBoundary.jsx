import { useRouteError } from 'react-router-dom';
import { Box, Container, Typography, Button } from '@mui/material';
import { Home as HomeIcon } from '@mui/icons-material';

function ErrorBoundary() {
  const error = useRouteError();

  return (
    <Container>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          textAlign: 'center',
        }}
      >
        <Typography variant="h1" color="error" gutterBottom>
          Oops!
        </Typography>
        <Typography variant="h5" color="text.secondary" gutterBottom>
          {error.status === 404
            ? "Page Not Found"
            : "Something went wrong"}
        </Typography>
        <Typography variant="body1" color="text.secondary" paragraph>
          {error.message || "An unexpected error occurred"}
        </Typography>
        <Button
          variant="contained"
          startIcon={<HomeIcon />}
          href="/"
          sx={{ mt: 2 }}
        >
          Back to Home
        </Button>
      </Box>
    </Container>
  );
}

export default ErrorBoundary; 