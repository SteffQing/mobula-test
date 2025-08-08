const db = require("../dst/db/neon");

function parseDate(dateStr) {
  const match = /^(\d{2})-(\d{2})-(\d{4})$/.exec(dateStr);
  if (!match) {
    throw new Error("Invalid date format. Use DD-MM-YYYY.");
  }
  const day = parseInt(match[1], 10);
  const month = parseInt(match[2], 10);
  const year = parseInt(match[3], 10);
  const daysInMonth = [
    31,
    (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0 ? 29 : 28,
    31,
    30,
    31,
    30,
    31,
    31,
    30,
    31,
    30,
    31,
  ];
  if (year < 1970 || year > 9999 || month < 1 || month > 12 || day < 1 || day > daysInMonth[month - 1]) {
    throw new Error("Invalid date: " + dateStr);
  }
  return Math.floor(Date.UTC(year, month - 1, day, 0, 0, 0) / 1000);
}

function formatDate(timestamp) {
  const date = new Date(timestamp * 1000);
  const day = String(date.getUTCDate()).padStart(2, "0");
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  const year = date.getUTCFullYear();
  return `${day}-${month}-${year}`;
}

async function fetchData() {
  const errorEl = document.getElementById("error");
  errorEl.textContent = "";
  try {
    const from = document.getElementById("fromDate").value;
    const to = document.getElementById("toDate").value;
    const fromTimestamp = parseDate(from);
    let toTimestamp = parseDate(to);
    if (fromTimestamp > toTimestamp) {
      throw new Error("'From' date must be before 'To' date.");
    }
    const maxRangeSeconds = 30 * 24 * 3600; // 1 month
    if (toTimestamp - fromTimestamp > maxRangeSeconds) {
      toTimestamp = fromTimestamp + maxRangeSeconds;
      document.getElementById("toDate").value = formatDate(toTimestamp);
      errorEl.textContent = "Range truncated to 1 month.";
    }
    const data = await db.default.getAll("0x43C3EBaFdF32909aC60E80ee34aE46637E743d65", from, to);
    updateTable("priceTable", data.priceHistory);
    updateTable("volumeTable", data.volumeHistory);
    updateTable("liquidityTable", data.liquidityHistory);
  } catch (error) {
    errorEl.textContent = error.message;
  }
}

function updateTable(tableId, history) {
  const tbody = document.getElementById(tableId).querySelector("tbody");
  tbody.innerHTML = "";
  history.forEach(([timestamp, value]) => {
    const row = document.createElement("tr");
    const dateCell = document.createElement("td");
    dateCell.textContent = formatDate(timestamp);
    const valueCell = document.createElement("td");
    valueCell.textContent = value;
    row.appendChild(dateCell);
    row.appendChild(valueCell);
    tbody.appendChild(row);
  });
}

// Fetch data on page load
fetchData();
