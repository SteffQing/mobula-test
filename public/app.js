/**
 * MarketDataPoint interface (JS Doc for clarity)
 * @typedef {Object} MarketDataPoint
 * @property {number} timestamp - seconds since epoch (UTC)
 * @property {string} price
 * @property {string} volume
 * @property {string} liquidity
 */

const fromInput = document.getElementById("fromDate");
const toInput = document.getElementById("toDate");
const timeframeSelect = document.getElementById("timeframe");
const fetchBtn = document.getElementById("fetchBtn");
const errorEl = document.getElementById("error");
const activeTimeframeEl = document.getElementById("activeTimeframe");
const tableBody = document.querySelector("#marketTable tbody");
const emptyState = document.getElementById("emptyState");

function parseDate(dateStr) {
  const match = /^(\d{2})-(\d{2})-(\d{4})$/.exec(dateStr.trim());
  if (!match) {
    throw new Error("Invalid date format. Use DD-MM-YYYY.");
  }
  const day = Number(match[1]);
  const month = Number(match[2]);
  const year = Number(match[3]);

  const isLeap = (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
  const daysInMonth = [31, isLeap ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

  if (year < 1970 || year > 9999 || month < 1 || month > 12 || day < 1 || day > daysInMonth[month - 1]) {
    throw new Error("Invalid date: " + dateStr);
  }

  return Math.floor(Date.UTC(year, month - 1, day, 0, 0, 0) / 1000);
}

function formatDate(timestampSeconds) {
  const date = new Date(timestampSeconds * 1000);
  const day = String(date.getUTCDate()).padStart(2, "0");
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  const year = date.getUTCFullYear();
  return `${day}-${month}-${year}`;
}

function formatDateHour(timestampSeconds) {
  const fullDate = formatDate(timestampSeconds);
  const date = new Date(timestampSeconds * 1000);
  const hour = String(date.getUTCHours()).padStart(2, "0");
  return `${fullDate} ${hour}:00`;
}

function startOfDayUtc(seconds) {
  const d = new Date(seconds * 1000);
  return Math.floor(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()) / 1000);
}

const fmtUSD = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 6,
});

const fmtNumber = new Intl.NumberFormat("en-US", {
  maximumFractionDigits: 2,
});

/**
 * Aggregates hourly data into daily timeframe (UTC).
 * - price: daily close (last available point for that day)
 * - volume: daily sum
 * - liquidity: daily average
 * @param {MarketDataPoint[]} hourly
 * @returns {MarketDataPoint[]}
 */
function aggregateHourlyToDaily(hourly) {
  if (!Array.isArray(hourly) || hourly.length === 0) return [];

  const data = [...hourly].sort((a, b) => a.timestamp - b.timestamp);

  /** @type {Map<number, {lastPrice:string, volumeSum:number, liquiditySum:number, count:number}>} */
  const byDay = new Map();

  for (const d of data) {
    const day = startOfDayUtc(d.timestamp);

    const volumeNum = Number(d.volume);
    const liquidityNum = Number(d.liquidity);

    const prev = byDay.get(day) || {
      lastPrice: d.price,
      volumeSum: 0,
      liquiditySum: 0,
      count: 0,
    };

    prev.lastPrice = d.price;

    if (!Number.isNaN(volumeNum)) prev.volumeSum += volumeNum;

    if (!Number.isNaN(liquidityNum)) {
      prev.liquiditySum += liquidityNum;
      prev.count += 1;
    }

    byDay.set(day, prev);
  }

  /** @type {MarketDataPoint[]} */
  const out = [];
  for (const [day, agg] of byDay.entries()) {
    const avgLiquidity = agg.count > 0 ? agg.liquiditySum / agg.count : 0;
    out.push({
      timestamp: day,
      price: agg.lastPrice,
      volume: String(agg.volumeSum),
      liquidity: String(avgLiquidity),
    });
  }

  return out.sort((a, b) => a.timestamp - b.timestamp);
}

function renderTable(rows, displayTf) {
  tableBody.innerHTML = "";
  emptyState.hidden = true;
  if (!rows || rows.length === 0) {
    emptyState.hidden = false;
    return;
  }
  const frag = document.createDocumentFragment();
  for (const r of rows) {
    const tr = document.createElement("tr");
    const tdDate = document.createElement("td");
    tdDate.textContent = displayTf === "hourly" ? formatDateHour(r.timestamp) : formatDate(r.timestamp);
    const priceNum = Number(r.price);
    const tdPrice = document.createElement("td");
    tdPrice.textContent = Number.isFinite(priceNum) ? fmtUSD.format(priceNum) : r.price;
    const volumeNum = Number(r.volume);
    const tdVolume = document.createElement("td");
    tdVolume.textContent = Number.isFinite(volumeNum) ? fmtUSD.format(volumeNum) : r.volume;
    const liqNum = Number(r.liquidity);
    const tdLiquidity = document.createElement("td");
    tdLiquidity.textContent = Number.isFinite(liqNum) ? fmtNumber.format(liqNum) : r.liquidity;
    tr.appendChild(tdDate);
    tr.appendChild(tdPrice);
    tr.appendChild(tdVolume);
    tr.appendChild(tdLiquidity);
    frag.appendChild(tr);
  }
  tableBody.appendChild(frag);
}

function setLoading(loading) {
  fetchBtn.disabled = loading;
  fetchBtn.textContent = loading ? "Fetching..." : "Fetch Data";
}

function setError(msg) {
  if (msg) {
    errorEl.hidden = false;
  } else {
    errorEl.hidden = true;
  }
  errorEl.textContent = msg || "";
}

function chooseDisplayTimeframe(fromTs, toTs, selected) {
  if (selected === "hourly" || selected === "daily") return selected;
  const diff = toTs - fromTs;
  const sevenDays = 7 * 24 * 3600;
  return diff > sevenDays ? "daily" : "hourly";
}

function clampRange(fromTs, toTs, maxDays = 30) {
  const maxRangeSeconds = maxDays * 24 * 3600;
  if (toTs - fromTs > maxRangeSeconds) {
    return {
      fromTs,
      toTs: fromTs + maxRangeSeconds,
      truncated: true,
    };
  }
  return { fromTs, toTs, truncated: false };
}

async function fetchData() {
  setError("");
  setLoading(true);

  try {
    const fromStr = fromInput.value;
    const toStr = toInput.value;

    let fromTs = parseDate(fromStr);
    let toTs = parseDate(toStr);

    if (fromTs > toTs) {
      throw new Error("'From' date must be before 'To' date.");
    }

    const { fromTs: clampedFrom, toTs: clampedTo, truncated } = clampRange(fromTs, toTs, 30);
    fromTs = clampedFrom;
    toTs = clampedTo;

    if (truncated) {
      toInput.value = formatDate(toTs);
      setError("Range truncated to 30 days.");
      setTimeout(() => setError(""), 3000);
    }

    const selectedTf = timeframeSelect.value;
    const displayTf = chooseDisplayTimeframe(fromTs, toTs, selectedTf);
    activeTimeframeEl.textContent = displayTf === "daily" ? "Daily (aggregated from hourly)" : "Hourly";

    const url = `https://mobula-test.onrender.com/all?from=${formatDate(fromTs)}&to=${formatDate(toTs)}`;
    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) {
      throw new Error(`API error: ${res.status} ${res.statusText}`);
    }
    const json = await res.json();
    /** @type {MarketDataPoint[]} */
    const data = Array.isArray(json?.data) ? json.data : [];

    const sanitized = data
      .filter(
        (d) =>
          typeof d?.timestamp === "number" &&
          typeof d?.price === "string" &&
          typeof d?.volume === "string" &&
          typeof d?.liquidity === "string"
      )
      .sort((a, b) => a.timestamp - b.timestamp);

    const toRender = displayTf === "daily" ? aggregateHourlyToDaily(sanitized) : sanitized;

    renderTable(toRender, displayTf);
  } catch (err) {
    setError(err?.message || "Something went wrong.");
    renderTable([], "hourly");
  } finally {
    setLoading(false);
  }
}

fetchBtn.addEventListener("click", fetchData);
[fromInput, toInput].forEach((el) => {
  el.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      fetchData();
    }
  });
});

window.addEventListener("DOMContentLoaded", fetchData);
