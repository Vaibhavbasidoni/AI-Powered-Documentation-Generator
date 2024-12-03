import {
    Drawer,
    List,
    ListItem,
    ListItemIcon,
    ListItemText,
    Toolbar
  } from '@mui/material';
  import { Home, Description, Folder } from '@mui/icons-material';
  import { useNavigate } from 'react-router-dom';
  
  function Sidebar() {
    const navigate = useNavigate();
    const drawerWidth = 240;
  
    const menuItems = [
      { text: 'Home', icon: <Home />, path: '/' },
      { text: 'Projects', icon: <Folder />, path: '/projects' },
      { text: 'Documentation', icon: <Description />, path: '/documentation' }
    ];
  
    return (
      <Drawer
        variant="permanent"
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          [`& .MuiDrawer-paper`]: { width: drawerWidth, boxSizing: 'border-box' }
        }}
      >
        <Toolbar />
        <List>
          {menuItems.map((item) => (
            <ListItem
              button
              key={item.text}
              onClick={() => navigate(item.path)}
            >
              <ListItemIcon>{item.icon}</ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItem>
          ))}
        </List>
      </Drawer>
    );
  }
  
  export default Sidebar;