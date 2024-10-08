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

  getTaskData: (task) => {
    const { _id: id, createdAt: createdOn, updatedAt: lastUpdatedOn } = task;
    return {
      label: task.label,
      description: task.description,
      scheduleDate: task.scheduleDate,
      dueDate: task.dueDate,
      id,
      createdOn,
      lastUpdatedOn,
      category: task.category,
      priority: task.category,
      status: task.status
        ? {
            completed: task.status?.completed,
            completedOn: task.status?.completedOn,
          }
        : undefined,
    };
  },
};

module.exports = utils;
