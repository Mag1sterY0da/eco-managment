import Drawer from '@mui/material/Drawer';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import Divider from '@mui/material/Divider';
import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import BusinessIcon from '@mui/icons-material/Business';
import ListItemText from '@mui/material/ListItemText';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { Collapse } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import * as React from 'react';
import { styled, useTheme } from '@mui/material/styles';
import FormControl from '@mui/joy/FormControl';
import Input from '@mui/joy/Input';
import Axios from 'axios';

const DrawerHeader = styled('div')(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  padding: theme.spacing(0, 1),
  ...theme.mixins.toolbar,
  justifyContent: 'space-between',
}));

const SideMenu = ({
  companies,
  setCompanies,
  openDrawer,
  handleDrawerClose,
  drawerWidth,
  selectedCompany,
  selectedDepartment,
  setSelectedCompany,
  setSelectedDepartment,
  setDataTable,
  setCategory,
  setYear,
}) => {
  const theme = useTheme();

  const [openList, setOpenList] = React.useState({ 0: false, 1: false });
  const handleCompanyClick = i => {
    setOpenList({ ...openList, [i]: !openList[i] });
    setDataTable(companies[i].departments[selectedDepartment].consumption);
    setSelectedCompany(i);
    setCategory('');
    setYear('');
  };

  const handleDepartmentClick = i => {
    setSelectedDepartment(i);
    setDataTable(companies[selectedCompany].departments[i].consumption);
    handleDrawerClose();
    setCategory('');
    setYear('');
  };

  const [companyName, setCompanyName] = React.useState('');
  const [departmentName, setDepartmentName] = React.useState('');

  const addDepartment = (e, i) => {
    e.preventDefault();
    const newCompanies = [...companies];
    const consumption = [];

    newCompanies[i] = {
      ...newCompanies[i],
      departments: [
        ...newCompanies[i].departments,
        {
          id: companies[selectedCompany].departments.length,
          departmentName,
          consumption,
        },
      ],
    };
    setCompanies(newCompanies);
    setDepartmentName('');
    Axios.post('http://localhost:8080/insertDepartment', {
      idCompany: selectedCompany,
      idDepartment: companies[selectedCompany].departments.length,
      departmentName,
      consumption,
    });
  };

  const addCompany = e => {
    e.preventDefault();

    setSelectedCompany(companies.length);
    setCompanyName('');
    Axios.post('http://localhost:8080/insertCompany', {
      id: companies.length,
      name: companyName,
      departments: [],
    });
    setCompanies([
      ...companies,
      {
        id: companies.length,
        name: companyName,
        departments: [],
      },
    ]);
  };

  return (
    <Drawer
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: drawerWidth,
          boxSizing: 'border-box',
        },
      }}
      variant='persistent'
      anchor='left'
      open={openDrawer}
    >
      <DrawerHeader>
        <Typography variant='h6' text-align='center' margin='auto'>
          Список компаній
        </Typography>
        <IconButton onClick={handleDrawerClose}>
          {theme.direction === 'ltr' ? (
            <ChevronLeftIcon />
          ) : (
            <ChevronRightIcon />
          )}
        </IconButton>
      </DrawerHeader>
      <Divider />
      {companies.map((comp, i) => (
        <List key={`comp-${i}`}>
          <ListItemButton onClick={() => handleCompanyClick(i)} key={comp.id}>
            <ListItemIcon>
              <BusinessIcon />
            </ListItemIcon>
            <ListItemText
              primary={<Typography variant='body1'>{comp.name}</Typography>}
            />
            {openList[i] ? <ExpandLessIcon /> : <ExpandMoreIcon />}
          </ListItemButton>
          <Collapse in={openList[i]} timeout='auto' unmountOnExit>
            <List component='div' disablePadding>
              {comp.departments?.map((dep, j) => (
                <ListItemButton
                  sx={{ pl: 5 }}
                  key={`comp-${i}-dep-${j}`}
                  onClick={() => handleDepartmentClick(j)}
                >
                  <ListItemText primary={dep.departmentName} />
                </ListItemButton>
              ))}
              <ListItemButton sx={{ pl: 5 }} key={`comp-${i}-add-department`}>
                <form
                  onSubmit={e => addDepartment(e, comp.id)}
                  style={{ display: 'flex', alignItems: 'center' }}
                >
                  <IconButton variant='solid' type='submit'>
                    <AddIcon />
                  </IconButton>
                  <FormControl>
                    <Input
                      fullWidth={true}
                      size='md'
                      variant='plain'
                      placeholder='Назва відділу'
                      type='text'
                      required
                      value={departmentName}
                      onChange={event => setDepartmentName(event.target.value)}
                    />
                  </FormControl>
                </form>
              </ListItemButton>
            </List>
          </Collapse>
          {i === companies.length - 1 && (
            <ListItemButton key={`comp-${i}-add-company`}>
              <form
                onSubmit={addCompany}
                style={{ display: 'flex', alignItems: 'center' }}
              >
                <IconButton variant='solid' type='submit'>
                  <AddIcon />
                </IconButton>
                <FormControl>
                  <Input
                    fullWidth={true}
                    size='md'
                    variant='plain'
                    placeholder='Назва компанії'
                    type='text'
                    required
                    value={companyName}
                    onChange={event => setCompanyName(event.target.value)}
                  />
                </FormControl>
              </form>
            </ListItemButton>
          )}
        </List>
      ))}
    </Drawer>
  );
};

export default SideMenu;
