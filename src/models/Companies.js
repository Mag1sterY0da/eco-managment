const mongoose = require('mongoose');

const CompaniesSchema = new mongoose.Schema({
  id: {
    type: Number,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  departments: [
    {
      id: {
        type: Number,
        required: true,
      },
      departmentName: {
        type: String,
        required: true,
      },
      consumption: [
        {
          type: {
            type: String,
            required: true,
          },
          unit: {
            type: String,
            required: true,
          },
          year: {
            type: Number,
            required: true,
          },
          monthsConsumption: [
            {
              month: {
                type: String,
                required: true,
              },
              value: {
                type: Number,
                required: true,
              },
              workedDays: {
                type: Number,
                required: true,
              },
            },
          ],
        },
      ],
    },
  ],
});

const Companies = mongoose.model('Companies', CompaniesSchema);
module.exports = Companies;
