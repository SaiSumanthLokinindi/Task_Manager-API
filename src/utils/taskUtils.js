const utils = {
  filterData: (fields, data) => {
    const filteredData = { ...data };
    if (Array.isArray(fields)) {
      fields.forEach((field) => delete filteredData[field]);
    }
    return filteredData;
  },
  getTodayDate: () => {
    const date = new Date();
    return new Date(
      `${date.getFullYear()}/${date.getMonth() + 1}/${date.getDate()}`
    ).toISOString();
  },
};

module.exports = utils;
