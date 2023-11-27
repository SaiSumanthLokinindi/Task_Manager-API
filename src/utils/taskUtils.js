const filterData = (fields, data) => {
  const filteredData = { ...data };
  if (Array.isArray(fields)) {
    fields.forEach((field) => delete filteredData[field]);
  }
  return filteredData;
};

module.exports = filterData;
