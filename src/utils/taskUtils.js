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
    date.setHours(0, 0, 0, 0);
    return date;
  },

  getEndOfToday: () => {
    const date = new Date();
    date.setHours(23, 59, 59, 999);
    return date;
  },

  getDateAfterAWeek: () => {
    const date = new Date();
    date.setDate(date.getDate() + 7);
    date.setHours(23, 59, 59, 999);
    return date;
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
      tags: task.tags,
      priority: task.priority,
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
