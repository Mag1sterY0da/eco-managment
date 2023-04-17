import * as React from 'react';
import Box from '@mui/material/Box';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';
import AddIcon from '@mui/icons-material/Add';
import RefreshIcon from '@mui/icons-material/Refresh';
import IconButton from '@mui/material/IconButton';
import SaveIcon from '@mui/icons-material/Save';
import DeleteIcon from '@mui/icons-material/Delete';
import { DataGrid } from '@mui/x-data-grid';
import { months, randomNumber, types } from '../data';
import Axios from 'axios';

const GeneralTable = ({
  dataTable,
  setDataTable,
  categories,
  years,
  category,
  setCategory,
  year,
  setYear,
  selectedDepartment,
  selectedCompany,
}) => {
  const columns = [
    {
      field: 'year',
      headerName: 'Рік',
      type: 'number',
      renderCell: params =>
        params.value.toLocaleString('en-US', { useGrouping: false }),
      flex: 1,
      editable: true,
    },
    ...months.map(month => ({
      field: month,
      headerName: month,
      type: 'string',
      flex: 1,
      editable: true,
    })),
    {
      field: 'delete',
      headerName: 'Видалення',
      width: 100,
      renderCell: params => (
        <IconButton onClick={() => deleteRecord(params)}>
          <DeleteIcon />
        </IconButton>
      ),
    },
  ];

  const [rows, setRows] = React.useState([]);

  React.useEffect(() => {
    const rows = [
      ...dataTable
        .filter(cons => cons.type === category)
        .filter(cons => (year ? cons.year === year : cons))
        .map((cons, i) => ({
          id: i,
          year: cons.year,
          ...cons.monthsConsumption.reduce(
            (acc, month) => ({ ...acc, [month.month]: month.value }),
            {}
          ),
        })),
    ];
    setRows(rows);
  }, []);

  const deleteRecord = async params => {
    const newTable = dataTable.filter(
      cons =>
        cons.type !== category ||
        (cons.type === category && cons.year !== params.row.year)
    );

    setDataTable(newTable);
    await recordChanges(newTable);
  };

  const addRecord = async e => {
    e.preventDefault();
    const monthsConsumption = months.map(month => ({
      month,
      value: randomNumber(1000, 10000, 1.1),
    }));

    const categoryIndex =
      types.findIndex(type => type.type === category) === -1
        ? 0
        : types.findIndex(type => type.type === category);

    const newTable = [
      ...dataTable,
      {
        ...types[categoryIndex],
        year: 2023,
        monthsConsumption,
      },
    ];

    setDataTable(newTable);
    await recordChanges(newTable);
  };

  const recordChanges = React.useCallback(
    async data => {
      // BackEnd
      await Axios.post('http://localhost:8080/insertConsumption/', {
        idCompany: selectedCompany,
        idDepartment: selectedDepartment,
        consumption: data,
      });
    },
    [selectedCompany, selectedDepartment]
  );

  const handleProcessRowUpdateError = (error, details) => {
    // Handle the error here
    // console.error(error, details);
  };

  const refreshTable = async e => {
    e?.preventDefault();
    const response = await Axios.get(
      `http://localhost:8080/getConsumption/${selectedCompany}/${selectedDepartment}`
    );
    setDataTable(response.data);
  };

  const processRowUpdate = React.useCallback(async row => {
    const editRecord = async row => {
      for (const key in row) {
        row[key] = +row[key];
      }

      const indexOfRow = dataTable.findIndex(
        cons => cons.type === category && cons.year === row.year
      );

      const newTable = [...dataTable];
      newTable[indexOfRow].monthsConsumption = dataTable[
        indexOfRow
      ].monthsConsumption.map(month => ({
        ...month,
        value: row[month.month],
      }));

      setDataTable(newTable);
      await recordChanges(newTable);
    };

    await editRecord(row);
  }, []);

  return (
    <Box sx={{ width: '100%', typography: 'body1' }}>
      <form
        onSubmit={e => e.preventDefault()}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '1.2rem',
        }}
      >
        <FormControl sx={{ width: '40%' }} size='small'>
          <InputLabel id='demo-simple-select-label'>Категорія</InputLabel>
          <Select
            labelId='demo-simple-select-label'
            id='demo-simple-select'
            value={category}
            label='Категорія'
            onChange={e => setCategory(e.target.value.split('(')[0])}
          >
            {categories.map((cat, i) => (
              <MenuItem key={i} value={cat.type}>
                {cat.type} ({cat.unit})
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <FormControl sx={{ width: '40%' }} size='small'>
          <InputLabel id='demo-simple-select-label'>Рік</InputLabel>
          <Select
            labelId='demo-simple-select-label'
            id='demo-simple-select'
            value={year}
            label='Рік'
            onChange={e => setYear(e.target.value)}
          >
            {years.map((year, i) => (
              <MenuItem key={i} value={year}>
                {year}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <IconButton variant='solid' type='submit' onClick={addRecord}>
          <AddIcon />
        </IconButton>
        <IconButton variant='solid' type='submit' onClick={refreshTable}>
          <RefreshIcon />
        </IconButton>
        <IconButton
          variant='solid'
          type='submit'
          onClick={async e => await recordChanges(dataTable, e)}
        >
          <SaveIcon />
        </IconButton>
      </form>
      <div style={{ height: '75vh', width: '100%' }}>
        <DataGrid
          rows={rows || []}
          columns={columns}
          processRowUpdate={processRowUpdate}
          onProcessRowUpdateError={handleProcessRowUpdateError}
          pageSizeOptions={[10, 25, 50, 100]}
        />
      </div>
    </Box>
  );
};

export default GeneralTable;
