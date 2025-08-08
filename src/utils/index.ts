function isValidDate(day: number, month: number, year: number): boolean {
  if (year < 1970 || year > 9999 || month < 1 || month > 12 || day < 1) {
    return false;
  }

  const daysInMonth = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

  if ((year % 4 === 0 && year % 100 !== 0) || year % 400 === 0) {
    daysInMonth[1] = 29;
  }

  return day <= daysInMonth[month - 1];
}

function parseDate(dateStr: string): number {
  const match = /^(\d{2})-(\d{2})-(\d{4})$/.exec(dateStr);
  if (!match) {
    throw new Error(`Invalid date format: ${dateStr}. Use DD-MM-YYYY.`);
  }

  const day = parseInt(match[1], 10);
  const month = parseInt(match[2], 10);
  const year = parseInt(match[3], 10);

  if (!isValidDate(day, month, year)) {
    throw new Error(`Invalid date: ${dateStr}.`);
  }

  const date = new Date(Date.UTC(year, month - 1, day, 0, 0, 0));
  return Math.floor(date.getTime() / 1000);
}

export { parseDate };
