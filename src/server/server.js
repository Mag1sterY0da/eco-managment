const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const app = express();

const CompaniesModel = require('../models/Companies');

app.use(express.json({ limit: '50mb' }));
app.use(cors());

mongoose.connect('mongodb://localhost:27017/express-mongoose', {
  useNewUrlParser: true,
});

app.get('/getCompanies/', async (req, res) => {
  try {
    const companies = await CompaniesModel.find();
    res.send(companies);
  } catch (error) {
    console.log(error);
  }
});

app.get(
  `/getConsumption/:selectedCompany/:selectedDepartment`,
  async (req, res) => {
    const { selectedCompany, selectedDepartment } = req.params;
    const company = await CompaniesModel.findOne({ id: selectedCompany });
    res.send(company.departments[selectedDepartment].consumption);
  }
);

app.post('/insertCompany/', async (req, res) => {
  const { name, id } = req.body;
  const companies = new CompaniesModel({ name, id });

  try {
    await companies.save();
    res.send('Inserted data');
  } catch (error) {
    console.log(error);
  }
});

app.post(/insertDepartment/, async (req, res) => {
  const { idCompany, idDepartment, departmentName, consumption } = req.body;
  const company = await CompaniesModel.findOne({ id: idCompany });

  company.departments.push({
    id: idDepartment,
    departmentName,
    consumption,
  });
  try {
    await company.save();
    res.send('Inserted data');
  } catch (error) {
    console.log(error);
  }
});

app.post(/insertConsumption/, async (req, res) => {
  const { idCompany, idDepartment, consumption } = req.body;
  const company = await CompaniesModel.findOne({ id: idCompany });
  const department = company.departments.find(
    department => department.id === idDepartment
  );
  department.consumption = consumption;
  try {
    await company.save();
    res.send('Inserted data');
  } catch (error) {
    console.log(error);
  }
});

app.get('/', async (req, res) => {
  const types = [
    { type: 'Обсяги споживання електроенергії', unit: 'кВт·год' },
    { type: 'Обсяги виробництва теплової енергії', unit: 'Гкал' },
    { type: 'Обсяги споживання теплової енергії', unit: 'Гкал' },
    { type: 'Обсяги споживання газу', unit: 'тис. м3' },
    { type: 'Обсяги споживання води', unit: 'тис. м3' },
    { type: 'Обсяги споживання бензину', unit: 'тон' },
    { type: 'Обсяги споживання мастильних матеріалів', unit: 'тон' },
    { type: 'Обсяги водовідведення', unit: 'тис. м3' },
    { type: 'Обсяги твердих побутових відходів', unit: 'тис. м3 / тон' },
    { type: 'Температура довкілля', unit: '0С' },
    { type: 'Обсяги виробництва продукції та послуг', unit: 'грн' },
    { type: 'Витрати на електроенергію', unit: 'грн' },
    { type: 'Обсяги продажів теплової енергії', unit: 'грн' },
    { type: 'Витрати на теплову енергію на власні потреби', unit: 'грн' },
    { type: 'Витрати на газ', unit: 'грн' },
    { type: 'Витрати на воду', unit: 'грн' },
    { type: 'Витрати на бензин', unit: 'грн' },
    { type: 'Витрати на мастильні матеріали', unit: 'грн' },
    { type: 'Витрати на водовідведення', unit: 'грн' },
    { type: 'Витрати на утилізацію твердих побутових відходів', unit: 'грн' },
  ];

  const months = [
    'Січень',
    'Лютий',
    'Березень',
    'Квітень',
    'Травень',
    'Червень',
    'Липень',
    'Серпень',
    'Вересень',
    'Жовтень',
    'Листопад',
    'Грудень',
  ];

  // const data = [
  //   {
  //     id: 1,
  //     name: 'Оптима-Фарм',
  //     departments: [
  //       { id: 0, departmentName: 'Бухгалтерія', consumption: [] },
  //       { id: 1, departmentName: 'Відділ закупівлі', consumption: [] },
  //       { id: 2, departmentName: 'Відділ продажів', consumption: [] },
  //       { id: 3, departmentName: 'Відділ перевірки якості', consumption: [] },
  //       {
  //         id: 4,
  //         departmentName: 'Фармацевтичний склад',
  //         consumption: [],
  //       },
  //       { id: 5, departmentName: 'Котельня', consumption: [] },
  //     ],
  //   },
  // ];
  const data = [
    {
      id: 0,
      name: 'ЕкоФарм',
      departments: [
        { id: 0, departmentName: 'Бухгалтерія', consumption: [] },
        { id: 1, departmentName: 'Юридичний відділ', consumption: [] },
        { id: 2, departmentName: 'Відділ кадрів', consumption: [] },
        { id: 3, departmentName: 'Відділ продажів', consumption: [] },
        {
          id: 4,
          departmentName: 'Відділ матеріально-технічного забезпечення',
          consumption: [],
        },
        { id: 5, departmentName: 'Виробнича служба', consumption: [] },
        {
          id: 6,
          departmentName: 'Відділ фасування та пакування',
          consumption: [],
        },
        { id: 7, departmentName: 'Аптечний склад', consumption: [] },
        { id: 8, departmentName: 'Сервісна служба', consumption: [] },
        { id: 9, departmentName: 'Котельня', consumption: [] },
      ],
    },
  ];

  const randomNumber = (min, max, k) =>
    Math.random() * (max - min) + min > k * min
      ? Math.floor(Math.random() * (max - min) + min)
      : 0;

  const fillConsumption = (
    company,
    department,
    typeI,
    yearStart,
    min,
    max,
    k = 1.2
  ) => {
    for (let i = yearStart; i < 2023; i++) {
      const monthsConsumption = months.map(month => ({
        month,
        value: randomNumber(min, max, k),
      }));
      data[company].departments[department].consumption.push({
        ...types[typeI],
        year: i,
        monthsConsumption,
      });
    }
  };

  const fillSpending = (
    company,
    department,
    typeConsumption,
    typeSpending,
    yearStart,
    t
  ) => {
    const monthSpending = data[company].departments[department].consumption
      .filter(cons => cons.type === typeConsumption)
      .map(cons =>
        cons.monthsConsumption.map(m => ({
          month: m.month,
          value: Math.floor(m.value * t),
        }))
      );
    for (let i = yearStart; i < 2023; i++) {
      data[company].departments[department].consumption.push({
        ...types[typeSpending],
        year: i,
        monthsConsumption: monthSpending[i - yearStart],
      });
    }
  };

  // Fill data
  // const fillData = () => {
  //   // Electricity
  //   for (let i = 0; i < 5; i++) {
  //     fillConsumption(0, i, 0, 2011, 1000, 10000);
  //     fillSpending(0, i, types[0].type, 11, 2011, 2);
  //   }
  //
  //   // Heat
  //   fillConsumption(0, 5, 1, 2011, 1000, 10000);
  //   fillSpending(0, 5, types[1].type, 12, 2011, 2);
  //   for (let i = 0; i < 5; i++) {
  //     fillConsumption(0, i, 2, 2011, 1000, 10000);
  //     fillSpending(0, i, types[2].type, 13, 2011, 2);
  //   }
  //
  //   // Gas
  //   for (let i = 0; i < 5; i++) {
  //     fillConsumption(0, i, 3, 2011, 1000, 10000);
  //     fillSpending(0, i, types[3].type, 14, 2011, 2);
  //   }
  //
  //   // Water
  //   for (let i = 0; i < 6; i++) {
  //     fillConsumption(0, i, 4, 2011, 1000, 10000);
  //     fillSpending(0, i, types[4].type, 15, 2011, 2);
  //   }
  //
  //   // Gasoline
  //   fillConsumption(0, 5, 5, 2011, 1000, 10000);
  //   fillSpending(0, 5, types[5].type, 16, 2011, 2);
  //
  //   // Lubricants
  //   fillConsumption(0, 5, 6, 2011, 1000, 10000);
  //   fillSpending(0, 5, types[6].type, 17, 2011, 2);
  //
  //   // Drainage
  //   fillConsumption(0, 3, 7, 2011, 1000, 10000);
  //   fillConsumption(0, 4, 7, 2011, 1000, 10000);
  //   fillSpending(0, 3, types[7].type, 18, 2011, 2);
  //   fillSpending(0, 4, types[7].type, 18, 2011, 2);
  //
  //   // Solid materials
  //   fillConsumption(0, 3, 8, 2011, 1000, 10000);
  //   fillConsumption(0, 5, 8, 2011, 1000, 10000);
  //   fillSpending(0, 3, types[8].type, 19, 2011, 2);
  //   fillSpending(0, 5, types[8].type, 19, 2011, 2);
  //
  //   // Temperature
  //   for (let i = 0; i < 5; i++) {
  //     fillConsumption(0, i, 9, 2011, 15, 23, 1);
  //   }
  //
  //   // Production
  //   for (let i = 0; i < 5; i++) {
  //     fillConsumption(0, i, 10, 2011, 10000, 20000);
  //   }
  // };

  const fillData = () => {
    // Electricity
    for (let i = 0; i < 9; i++) {
      fillConsumption(0, i, 0, 2011, 1000, 10000);
      fillSpending(0, i, types[0].type, 11, 2011, 2);
    }

    // Heat
    fillConsumption(0, 9, 1, 2011, 1000, 10000);
    fillSpending(0, 9, types[1].type, 12, 2011, 2);
    for (let i = 0; i < 8; i++) {
      fillConsumption(0, i, 2, 2011, 1000, 10000);
      fillSpending(0, i, types[2].type, 13, 2011, 2);
    }

    // Gas
    fillConsumption(0, 9, 3, 2011, 1000, 10000);
    fillSpending(0, 9, types[3].type, 14, 2011, 2);

    // Water
    fillConsumption(0, 5, 4, 2011, 1000, 10000);
    fillConsumption(0, 9, 4, 2011, 1000, 10000);
    fillSpending(0, 5, types[4].type, 15, 2011, 2);
    fillSpending(0, 9, types[4].type, 15, 2011, 2);

    // Gasoline
    fillConsumption(0, 4, 5, 2011, 1000, 10000);
    fillSpending(0, 4, types[5].type, 16, 2011, 2);

    // Lubricants
    fillConsumption(0, 4, 6, 2011, 1000, 10000);
    fillConsumption(0, 5, 6, 2011, 1000, 10000);
    fillConsumption(0, 8, 6, 2011, 1000, 10000);
    fillConsumption(0, 9, 6, 2011, 1000, 10000);
    fillSpending(0, 4, types[6].type, 17, 2011, 2);
    fillSpending(0, 5, types[6].type, 17, 2011, 2);
    fillSpending(0, 8, types[6].type, 17, 2011, 2);
    fillSpending(0, 9, types[6].type, 17, 2011, 2);

    // Drainage
    fillConsumption(0, 9, 7, 2011, 1000, 10000);
    fillSpending(0, 9, types[7].type, 18, 2011, 2);

    // Solid materials
    fillConsumption(0, 5, 8, 2011, 1000, 10000);
    fillConsumption(0, 6, 8, 2011, 1000, 10000);
    fillConsumption(0, 7, 8, 2011, 1000, 10000);
    fillSpending(0, 5, types[8].type, 19, 2011, 2);
    fillSpending(0, 6, types[8].type, 19, 2011, 2);
    fillSpending(0, 7, types[8].type, 19, 2011, 2);

    // Temperature
    for (let i = 0; i < 9; i++) {
      fillConsumption(0, i, 9, 2011, 15, 23, 1);
    }

    // Production
    for (let i = 0; i < 9; i++) {
      fillConsumption(0, i, 10, 2011, 10000, 20000);
    }
  };

  fillData();

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

  // Adding working days to each month
  for (let i = 0; i < data[0].departments.length; i++) {
    for (let j = 0; j < data[0].departments[i].consumption.length; j++) {
      for (
        let k = 0;
        k < data[0].departments[i].consumption[j].monthsConsumption.length;
        k++
      ) {
        data[0].departments[i].consumption[j].monthsConsumption[k].workedDays =
          getWorkingDaysInMonth(
            data[0].departments[i].consumption[j].year,
            months.indexOf(
              data[0].departments[i].consumption[j].monthsConsumption[k].month
            )
          );
      }
    }
  }

  const company = new CompaniesModel(data[0]);

  try {
    await company.save();
    res.send('Inserted data');
  } catch (error) {
    console.log(error);
  }
});

app.listen(8080, () => {
  console.log('Server started on port 8080');
});
