const isInCurrentWeek = (date: Date) => {
  const WEEK_LENGTH = 604800000;
  let lastMonday = new Date(); // Creating new date object for today
  lastMonday.setDate(lastMonday.getDate() - (lastMonday.getDay()-1)); // Setting date to last monday
  lastMonday.setHours(0,0,0,0); // Setting Hour to 00:00:00:00

  return lastMonday.getTime() <= date.getTime() &&
    date.getTime() < (lastMonday.getTime() + WEEK_LENGTH); // true / false
}

export default isInCurrentWeek
