import './App.css';
import * as React from 'react';
import Box from '@mui/material/Box';
import Bar from './components/Bar';
import CssBaseline from '@mui/material/CssBaseline';
import SideMenu from './components/SideMenu';
import Content from './components/Content';

const drawerWidth = 320;
const App = () => {
  const [openDrawer, setOpenDrawer] = React.useState(false);

  const handleDrawerOpen = () => {
    setOpenDrawer(true);
  };

  const handleDrawerClose = () => {
    setOpenDrawer(false);
  };

  const [selectedCompany, setSelectedCompany] = React.useState(0);
  const [selectedDepartment, setSelectedDepartment] = React.useState(0);
  const getCompanies = async () => {
    const response = await fetch('http://localhost:8080/getCompanies');
    return await response.json();
  };

  const [companies, setCompanies] = React.useState([]);
  const [dataTable, setDataTable] = React.useState([]);

  React.useEffect(() => {
    (async () => {
      const data = await getCompanies();
      setCompanies(data);
      setDataTable(
        data[selectedCompany].departments[selectedDepartment].consumption
      );
    })();
  }, [selectedCompany, selectedDepartment]);

  const [category, setCategory] = React.useState('');
  const [year, setYear] = React.useState('');

  return (
    <React.StrictMode>
      <Box sx={{ display: 'flex', flexDirection: 'column' }}>
        <Bar
          open={openDrawer}
          handleOpen={handleDrawerOpen}
          drawerWidth={drawerWidth}
        ></Bar>
        <CssBaseline />
        <SideMenu
          companies={companies}
          setCompanies={setCompanies}
          openDrawer={openDrawer}
          handleDrawerClose={handleDrawerClose}
          drawerWidth={drawerWidth}
          selectedDepartment={selectedDepartment}
          selectedCompany={selectedCompany}
          setSelectedCompany={setSelectedCompany}
          setSelectedDepartment={setSelectedDepartment}
          setDataTable={setDataTable}
          setCategory={setCategory}
          setYear={setYear}
        ></SideMenu>
        <Content
          open={openDrawer}
          companies={companies}
          drawerWidth={drawerWidth}
          dataTable={dataTable}
          setDataTable={setDataTable}
          selectedCompany={selectedCompany}
          selectedDepartment={selectedDepartment}
          category={category}
          setCategory={setCategory}
          year={year}
          setYear={setYear}
        ></Content>
      </Box>
    </React.StrictMode>
  );
};

export default App;
