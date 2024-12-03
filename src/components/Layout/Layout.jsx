import { Link as RouterLink, Outlet } from 'react-router-dom';
import {
  Box,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  AppBar,
  Toolbar,
  Typography
} from '@mui/material';
import {
  Home as HomeIcon,
  Folder as ProjectsIcon,
  Description as DocumentationIcon
} from '@mui/icons-material';

const drawerWidth = 240;

function Layout() {
  return (
    <Box sx={{ display: 'flex' }}>
      <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
        <Toolbar>
          <Typography variant="h6" noWrap component="div">
            Documentation Generator
          </Typography>
        </Toolbar>
      </AppBar>

      <Drawer
        variant="permanent"
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: drawerWidth,
            boxSizing: 'border-box',
          },
        }}
      >
        <Toolbar /> {/* This creates space for the AppBar */}
        <Box sx={{ overflow: 'auto' }}>
          <List>
            <ListItem button component={RouterLink} to="/">
              <ListItemIcon>
                <HomeIcon />
              </ListItemIcon>
              <ListItemText primary="Home" />
            </ListItem>
            <ListItem button component={RouterLink} to="/projects">
              <ListItemIcon>
                <ProjectsIcon />
              </ListItemIcon>
              <ListItemText primary="Projects" />
            </ListItem>
            <ListItem button component={RouterLink} to="/documentation">
              <ListItemIcon>
                <DocumentationIcon />
              </ListItemIcon>
              <ListItemText primary="Documentation" />
            </ListItem>
          </List>
        </Box>
      </Drawer>

      <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
        <Toolbar /> {/* This creates space for the AppBar */}
        <Outlet />
      </Box>
    </Box>
  );
}

export default Layout;