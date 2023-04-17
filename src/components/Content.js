import * as React from 'react';
import Box from '@mui/material/Box';
import Tab from '@mui/material/Tab';
import TabContext from '@mui/lab/TabContext';
import TabList from '@mui/lab/TabList';
import TabPanel from '@mui/lab/TabPanel';
import { styled } from '@mui/material/styles';
import VisibilityIcon from '@mui/icons-material/Visibility';
import BarChartIcon from '@mui/icons-material/BarChart';
import GeneralTable from './GeneralTable';
import FullTable from './FullTable';

const Content = ({
  open,
  companies,
  drawerWidth,
  selectedCompany,
  selectedDepartment,
  dataTable,
  setDataTable,
  category,
  setCategory,
  year,
  setYear,
}) => {
  const Main = styled('main', { shouldForwardProp: prop => prop !== 'open' })(
    ({ theme, open }) => ({
      flexGrow: 1,
      transition: theme.transitions.create('margin', {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.leavingScreen,
      }),
      marginLeft: `0`,
      ...(open && {
        transition: theme.transitions.create('margin', {
          easing: theme.transitions.easing.easeOut,
          duration: theme.transitions.duration.enteringScreen,
        }),
        marginLeft: `${drawerWidth}px`,
      }),
    })
  );

  const [value, setValue] = React.useState('1');
  const [isChecked, setIsChecked] = React.useState(false);

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  // Getting unique categories
  const categories = [];
  dataTable.forEach(cons => {
    if (
      !categories.some(cat => cat.type === cons.type && cat.unit === cons.unit)
    )
      categories.push({ type: cons.type, unit: cons.unit });
  });

  // Getting years
  const years = [...new Set(dataTable.map(cons => cons.year))];

  return (
    <Main open={open}>
      <Box sx={{ width: '100%', typography: 'body1' }}>
        <TabContext value={value}>
          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <TabList
              onChange={handleChange}
              aria-label='lab API tabs example'
              variant='fullWidth'
              centered
            >
              <Tab icon={<VisibilityIcon />} value='0' />
              <Tab icon={<BarChartIcon />} value='1' />
            </TabList>
          </Box>
          <TabPanel value='0'>
            <GeneralTable
              dataTable={dataTable}
              setDataTable={setDataTable}
              categories={categories}
              years={years}
              category={category}
              setCategory={setCategory}
              year={year}
              setYear={setYear}
              selectedCompany={selectedCompany}
              selectedDepartment={selectedDepartment}
            ></GeneralTable>
          </TabPanel>
          <TabPanel value='1'>
            <FullTable
              isChecked={isChecked}
              setIsChecked={setIsChecked}
              companies={companies}
              selectedCompany={selectedCompany}
              dataTable={dataTable}
              setDataTable={setDataTable}
              years={years}
              year={year}
              setYear={setYear}
            ></FullTable>
          </TabPanel>
        </TabContext>
      </Box>
    </Main>
  );
};

export default Content;
