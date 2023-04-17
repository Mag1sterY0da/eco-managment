import * as React from 'react';
import Box from '@mui/material/Box';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';
import { DataGrid } from '@mui/x-data-grid';
import { months } from '../data';
import { FormControlLabel } from '@mui/material';
import { Checkbox } from '@mui/joy';

const FullTable = ({
  companies,
  selectedCompany,
  dataTable,
  setDataTable,
  years,
  year,
  setYear,
  isChecked,
  setIsChecked,
}) => {
  const isWeekend = date => {
    const day = date.getDay();
    return day === 5 || day === 6;
  };

  const getWorkingDaysInMonth = (year, month) => {
    let count = 0;
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    for (let i = 1; i <= daysInMonth; i++) {
      const date = new Date(year, month, i);
      if (!isWeekend(date)) {
        count++;
      }
    }

    return count;
  };

  const dataForMonth = months
    .map(month => [
      {
        field: month,
        headerName: month[0],
        type: 'string',
        width: 60,
      },
      !isChecked
        ? {
            field: `WorkDays${month}`,
            headerName: 'РД',
            type: 'string',
            width: 30,
          }
        : null,
      !isChecked
        ? {
            field: `AveragePer${month}`,
            headerName: `СД`,
            type: 'string',
            width: 40,
          }
        : null,
    ])
    .flat()
    .filter(Boolean); // filter out null values

  const [columns, setColumns] = React.useState(
    [
      {
        field: 'type',
        headerName: 'Показник',
        type: 'string',
        width: 320,
      },
      ...dataForMonth,
      {
        field: 'overall',
        headerName: 'Усього за рік',
        type: 'number',
        width: 100,
      },
      !isChecked
        ? {
            field: 'averagePerYear',
            headerName: 'Сер. за рік',
            type: 'number',
            width: 100,
          }
        : null,
      !isChecked
        ? {
            field: 'min',
            headerName: 'Мін. знач',
            type: 'number',
            width: 80,
          }
        : null,
      !isChecked
        ? {
            field: 'minMonth',
            headerName: 'Місяць',
            type: 'number',
            width: 100,
          }
        : null,
      !isChecked
        ? {
            field: 'max',
            headerName: 'Макс. знач',
            type: 'number',
            width: 90,
          }
        : null,
      !isChecked
        ? {
            field: 'maxMonth',
            headerName: 'Місяць',
            type: 'number',
            width: 100,
          }
        : null,
      !isChecked
        ? {
            field: 'k',
            headerName: 'КН',
            type: 'number',
            width: 60,
          }
        : null,
    ].filter(Boolean)
  );

  const [rows, setRows] = React.useState([
    ...dataTable
      .filter(cons => cons.year === year)
      .filter(cons => (year ? cons.year === year : cons))
      .map((cons, i) => {
        const consumptionByMonth = cons.monthsConsumption.reduce(
          (acc, month) => ({ ...acc, [month.month]: month.value }),
          {}
        );
        const overall = cons.monthsConsumption.reduce(
          (acc, month) => acc + month.value,
          0
        );
        if (isChecked) {
          return {
            id: i,
            // year: cons.year,
            type: cons.type,
            ...consumptionByMonth,
            overall,
          };
        } else {
          const workDaysByMonth = cons.monthsConsumption.reduce(
            (acc, month) => ({
              ...acc,
              [`WorkDays${month.month}`]: getWorkingDaysInMonth(
                year,
                months.indexOf(month.month)
              ),
            }),
            {}
          );
          const averagePerMonth = cons.monthsConsumption.reduce(
            (acc, month) => ({
              ...acc,
              [`AveragePer${month.month}`]: Math.round(
                month.value /
                  getWorkingDaysInMonth(year, months.indexOf(month.month))
              ),
            }),
            {}
          );
          let workedMonths = 0;
          for (const month in consumptionByMonth) {
            if (consumptionByMonth[month] === 0) {
              workDaysByMonth[`WorkDays${month}`] = 0;
            } else {
              workedMonths++;
            }
          }
          console.log(workedMonths);
          const averagePerYear = Math.round(overall / workedMonths);
          const min = Math.min(
            ...Object.values(consumptionByMonth).filter(val => val !== 0)
          );

          const minMonth = Object.keys(consumptionByMonth).find(
            key => consumptionByMonth[key] === min
          );
          const max = Math.max(...Object.values(consumptionByMonth));
          const maxMonth = Object.keys(consumptionByMonth).find(
            key => consumptionByMonth[key] === max
          );
          const k = max / min;

          return {
            id: i,
            // year: cons.year,
            type: cons.type,
            ...consumptionByMonth,
            ...workDaysByMonth,
            ...averagePerMonth,
            overall,
            averagePerYear,
            min,
            minMonth,
            max,
            maxMonth,
            k,
          };
        }
      }),
  ]);

  const handleCheckboxChange = e => {
    e.preventDefault();
    setIsChecked(!isChecked);
    // Acculate all consumptions from all departments
    const allConsumptions = companies[selectedCompany].departments
      .map(dep => dep.consumption)
      .map(cons =>
        cons.filter(
          cons => cons.year === year && cons.type !== 'Температура довкілля'
        )
      )
      .flat()
      .reduce((acc, cur) => {
        const type = cur.type;
        const monthsConsumption = cur.monthsConsumption;
        const index = acc.findIndex(el => el.type === type);
        console.log(index);
        if (index !== -1) {
          // console.log(index);
          console.log(acc[index].monthsConsumption);
          acc[index].monthsConsumption = acc[index].monthsConsumption.map(
            cons => {
              return {
                month: cons.month,
                value:
                  cons.value +
                  monthsConsumption[
                    monthsConsumption.findIndex(el => el.month === cons.month)
                  ].value,
              };
            }
          );
        } else {
          acc.push({ type, monthsConsumption, year });
          // acc[type] = monthsConsumption;
        }
        return acc;
      }, []);

    setDataTable(allConsumptions);

    const dataForMonth = months
      .map(month => [
        {
          field: month,
          headerName: month[0],
          type: 'string',
          flex: 1,
        },
      ])
      .flat();

    setColumns([
      {
        field: 'type',
        headerName: 'Показник',
        type: 'string',
        flex: 5,
      },
      ...dataForMonth,
      {
        field: 'overall',
        headerName: 'Усього',
        type: 'number',
        flex: 2,
      },
    ]);

    setRows([
      ...dataTable
        .filter(cons => cons.year === year)
        .filter(cons => (year ? cons.year === year : cons))
        .map((cons, i) => {
          const consumptionByMonth = cons.monthsConsumption.reduce(
            (acc, month) => ({ ...acc, [month.month]: month.value }),
            {}
          );

          const overall = cons.monthsConsumption.reduce(
            (acc, month) => acc + month.value,
            0
          );

          return {
            id: i,
            // year: cons.year,
            type: cons.type,
            ...consumptionByMonth,
            overall,
          };
        }),
    ]);

    console.log(dataTable);
    console.log(allConsumptions);
  };

  return (
    <Box sx={{ width: '100%', typography: 'body1' }}>
      <form
        onSubmit={e => e.preventDefault()}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'start',
          gap: '2rem',
          marginBottom: '1.2rem',
        }}
      >
        <FormControl sx={{ width: '10%' }} size='small'>
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
        <FormControlLabel
          control={
            <Checkbox
              checked={isChecked}
              sx={{ marginRight: '0.5rem' }}
              onChange={handleCheckboxChange}
            />
          }
          label='Зведена таблиця'
        />
      </form>
      <div style={{ height: '75vh', width: '100%' }}>
        <DataGrid
          rows={rows}
          columns={columns}
          pageSizeOptions={[10, 25, 50, 100]}
          scrollbarSize={100}
          autoWidth
        />
      </div>
    </Box>
  );
};

export default FullTable;
