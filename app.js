/*
  トリオネラ
  初心者でも改造しやすいように、状態、計算、描画、イベント処理をなるべく分けています。
*/

const STORAGE_KEYS = {
  marketData: "mhe.marketData.v1",
  events: "mhe.events.v1",
  settings: "mhe.settings.v1"
};

const APP_LAST_UPDATED = "2026-05-29 17:45";

const SERIES = {
  nikkei: { label: "日経平均", color: "#2563eb" },
  dow: { label: "NYダウ", color: "#b98928" },
  usdjpy: { label: "ドル円", color: "#0f766e" },
  btc: { label: "ビットコイン", color: "#f97316" }
};

const CATEGORIES = [
  "日本政治",
  "米国政治",
  "金融政策",
  "戦争・紛争",
  "災害",
  "経済危機",
  "バブル",
  "為替",
  "スポーツ・文化",
  "企業・産業",
  "個人イベント",
  "その他"
];

const RANGE_OPTIONS = [
  { key: "1m", label: "1か月", months: 1 },
  { key: "3m", label: "3か月", months: 3 },
  { key: "6m", label: "6か月", months: 6 },
  { key: "1y", label: "1年", months: 12 },
  { key: "3y", label: "3年", months: 36 },
  { key: "5y", label: "5年", months: 60 },
  { key: "10y", label: "10年", months: 120 },
  { key: "all", label: "全期間", months: null }
];

const MODE_OPTIONS = [
  { key: "raw", label: "実数値" },
  { key: "indexed", label: "指数化" },
  { key: "daily", label: "前日比%" },
  { key: "m1", label: "1か月騰落率" },
  { key: "m3", label: "3か月騰落率" },
  { key: "y1", label: "1年騰落率" }
];

const ANALYSIS_OFFSETS = [
  { label: "1年前", days: -365 },
  { label: "6か月前", days: -182 },
  { label: "3か月前", days: -91 },
  { label: "1か月前", days: -30 },
  { label: "1週間前", days: -7 },
  { label: "1日前", days: -1 },
  { label: "イベント日", days: 0 },
  { label: "1日後", days: 1 },
  { label: "1週間後", days: 7 },
  { label: "1か月後", days: 30 },
  { label: "3か月後", days: 91 },
  { label: "6か月後", days: 182 },
  { label: "1年後", days: 365 }
];

// イベント分析の基準日は、休場日やサンプルデータの粗さを考慮して近い市場日を使います。
// ただし何か月も離れたデータを勝手に使うと分析が壊れるため、約3か月以内に限定します。
const EVENT_BASE_TOLERANCE_DAYS = 95;

const state = {
  marketData: [],
  events: [],
  importedData: [],
  selectedEventId: null,
  selectedSeries: ["nikkei", "dow", "usdjpy"],
  mode: "raw",
  range: "1y",
  startDate: "1989-12-01",
  compareIds: []
};

let mainChart = null;
let eventChart = null;

const $ = (id) => document.getElementById(id);

document.addEventListener("DOMContentLoaded", init);

function init() {
  loadState();
  $("appUpdatedLabel").textContent = `最終更新: ${APP_LAST_UPDATED}`;
  buildStaticControls();
  bindEvents();
  syncControlsFromState();
  renderAll();
}

function loadState() {
  state.marketData = readJson(STORAGE_KEYS.marketData, SAMPLE_MARKET_DATA).map(normalizeMarketRow).filter(Boolean);
  backfillBundledSampleRows();
  state.events = readJson(STORAGE_KEYS.events, SAMPLE_EVENTS).map(normalizeEvent).filter(Boolean);
  const saved = readJson(STORAGE_KEYS.settings, {});
  Object.assign(state, {
    selectedEventId: saved.selectedEventId || state.events[0]?.id || null,
    selectedSeries: saved.selectedSeries || state.selectedSeries,
    mode: saved.mode || state.mode,
    range: saved.range || state.range,
    startDate: saved.startDate || state.startDate,
    compareIds: saved.compareIds || state.events.filter((event) => event.importance >= 5).slice(0, 5).map((event) => event.id)
  });
  sortMarketData();
  sortEvents();
}

function backfillBundledSampleRows() {
  // 古いサンプルをlocalStorageに保存済みの場合、新しく追加したサンプル行やBTCなどの追加列を補充します。
  // CSVで本格的なデータを入れている場合は混ぜないよう、少量のプロトタイプデータだけ対象にします。
  if (state.marketData.length > 180) return;
  const existingByDate = new Map(state.marketData.map((row) => [row.date, row]));
  let changed = false;
  SAMPLE_MARKET_DATA.map(normalizeMarketRow).filter(Boolean).forEach((sampleRow) => {
    const existing = existingByDate.get(sampleRow.date);
    if (!existing) {
      state.marketData.push(sampleRow);
      changed = true;
      return;
    }
    Object.keys(SERIES).forEach((key) => {
      if ((existing[key] === null || existing[key] === undefined) && sampleRow[key] !== null && sampleRow[key] !== undefined) {
        existing[key] = sampleRow[key];
        changed = true;
      }
    });
  });
  if (!changed) return;
  sortMarketData();
  localStorage.setItem(STORAGE_KEYS.marketData, JSON.stringify(state.marketData));
}

function readJson(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : structuredClone(fallback);
  } catch {
    return structuredClone(fallback);
  }
}

function saveAll() {
  localStorage.setItem(STORAGE_KEYS.marketData, JSON.stringify(state.marketData));
  localStorage.setItem(STORAGE_KEYS.events, JSON.stringify(state.events));
  localStorage.setItem(
    STORAGE_KEYS.settings,
    JSON.stringify({
      selectedEventId: state.selectedEventId,
      selectedSeries: state.selectedSeries,
      mode: state.mode,
      range: state.range,
      startDate: state.startDate,
      compareIds: state.compareIds
    })
  );
}

function normalizeMarketRow(row) {
  if (!row || !isValidDate(row.date)) return null;
  return {
    date: row.date,
    nikkei: numberOrNull(row.nikkei),
    dow: numberOrNull(row.dow),
    usdjpy: numberOrNull(row.usdjpy),
    btc: numberOrNull(row.btc)
  };
}

function normalizeEvent(event) {
  if (!event || !isValidDate(event.date) || !event.title) return null;
  return {
    id: event.id || `event-${Date.now()}-${Math.random().toString(16).slice(2)}`,
    date: event.date,
    title: event.title,
    category: event.category || "その他",
    importance: Number(event.importance || 3),
    region: event.region || "",
    description: event.description || "",
    memo: event.memo || ""
  };
}

function numberOrNull(value) {
  if (value === "" || value === null || value === undefined) return null;
  const parsed = Number(String(value).replaceAll(",", ""));
  return Number.isFinite(parsed) ? parsed : null;
}

function sortMarketData() {
  state.marketData.sort((a, b) => a.date.localeCompare(b.date));
}

function sortEvents() {
  state.events.sort((a, b) => a.date.localeCompare(b.date));
}

function buildStaticControls() {
  const yearSelect = $("yearSelect");
  const monthSelect = $("monthSelect");
  const years = availableYears();
  yearSelect.innerHTML = years.map((year) => `<option value="${year}">${year}年</option>`).join("");
  monthSelect.innerHTML = Array.from({ length: 12 }, (_, index) => {
    const month = String(index + 1).padStart(2, "0");
    return `<option value="${month}">${index + 1}月</option>`;
  }).join("");

  $("rangeButtons").innerHTML = RANGE_OPTIONS.map((option) => {
    return `<button type="button" data-range="${option.key}">${option.label}</button>`;
  }).join("");

  $("modeButtons").innerHTML = MODE_OPTIONS.map((option) => {
    return `<button type="button" data-mode="${option.key}">${option.label}</button>`;
  }).join("");

  const categoryOptions = eventCategories().map((category) => `<option value="${category}">${category}</option>`).join("");
  $("eventCategory").innerHTML = categoryOptions;
}

function eventCategories() {
  const categories = new Set(CATEGORIES);
  state.events.forEach((event) => {
    if (event.category) categories.add(event.category);
  });
  return Array.from(categories);
}

function bindEvents() {
  document.querySelectorAll(".tab-button").forEach((button) => {
    button.addEventListener("click", () => switchTab(button.dataset.tab));
  });

  $("yearSelect").addEventListener("change", updateDateFromControls);
  $("monthSelect").addEventListener("change", updateDateFromControls);
  $("prevPeriod").addEventListener("click", () => shiftPeriod(-1));
  $("nextPeriod").addEventListener("click", () => shiftPeriod(1));
  $("todayLikePeriod").addEventListener("click", jumpToLatest);

  $("rangeButtons").addEventListener("click", (event) => {
    const button = event.target.closest("button[data-range]");
    if (!button) return;
    state.range = button.dataset.range;
    saveAll();
    syncControlsFromState();
    renderChartArea();
  });

  $("modeButtons").addEventListener("click", (event) => {
    const button = event.target.closest("button[data-mode]");
    if (!button) return;
    state.mode = button.dataset.mode;
    saveAll();
    syncControlsFromState();
    renderChartArea();
  });

  document.querySelectorAll(".big-toggle input").forEach((input) => {
    input.addEventListener("change", () => {
      state.selectedSeries = Array.from(document.querySelectorAll(".big-toggle input:checked")).map((box) => box.value);
      if (state.selectedSeries.length === 0) {
        input.checked = true;
        state.selectedSeries = [input.value];
      }
      saveAll();
      renderCharts();
    });
  });

  $("resetSampleData").addEventListener("click", () => {
    state.marketData = SAMPLE_MARKET_DATA.map(normalizeMarketRow).filter(Boolean);
    state.events = SAMPLE_EVENTS.map(normalizeEvent).filter(Boolean);
    state.selectedEventId = state.events[0]?.id || null;
    state.compareIds = state.events.filter((event) => event.importance >= 5).slice(0, 5).map((event) => event.id);
    sortMarketData();
    sortEvents();
    saveAll();
    buildStaticControls();
    syncControlsFromState();
    renderAll();
  });

  $("eventSearch").addEventListener("input", renderTimeline);
  $("importanceFilter").addEventListener("change", renderTimeline);
  $("eventForm").addEventListener("submit", saveEventFromForm);
  $("clearEventForm").addEventListener("click", clearEventForm);
  $("deleteEvent").addEventListener("click", deleteSelectedEvent);
  $("analysisEventSelect").addEventListener("change", (event) => {
    selectEvent(event.target.value);
  });
  $("selectImportantEvents").addEventListener("click", () => {
    state.compareIds = state.events.filter((event) => event.importance >= 5).map((event) => event.id);
    saveAll();
    renderCompare();
  });
  $("comparePicker").addEventListener("change", (event) => {
    if (!event.target.matches("input[type='checkbox']")) return;
    state.compareIds = Array.from(document.querySelectorAll(".compare-picker input:checked")).map((input) => input.value);
    saveAll();
    renderCompareTable();
  });
  $("csvFile").addEventListener("change", () => {
    const file = $("csvFile").files[0];
    $("importStatus").textContent = file ? `${file.name} を選択しました。` : "まだCSVは読み込まれていません。";
  });
  $("importCsv").addEventListener("click", importCsvFile);
  $("replaceWithImported").addEventListener("click", replaceWithImportedData);
  $("exportEvents").addEventListener("click", exportEvents);
}

function switchTab(tabName) {
  document.querySelectorAll(".tab-button").forEach((button) => {
    button.classList.toggle("active", button.dataset.tab === tabName);
  });
  document.querySelectorAll(".tab-panel").forEach((panel) => {
    panel.classList.toggle("active", panel.id === `tab-${tabName}`);
  });
  if (tabName === "analysis") renderAnalysis();
  if (tabName === "compare") renderCompare();
}

function syncControlsFromState() {
  const start = parseDate(state.startDate);
  $("yearSelect").value = String(start.getFullYear());
  $("monthSelect").value = String(start.getMonth() + 1).padStart(2, "0");

  document.querySelectorAll("[data-range]").forEach((button) => {
    button.classList.toggle("active", button.dataset.range === state.range);
  });
  document.querySelectorAll("[data-mode]").forEach((button) => {
    button.classList.toggle("active", button.dataset.mode === state.mode);
  });
  document.querySelectorAll(".big-toggle input").forEach((input) => {
    input.checked = state.selectedSeries.includes(input.value);
  });
}

function renderAll() {
  renderChartArea();
  renderTimeline();
  renderAnalysisSelector();
  renderAnalysis();
  renderCompare();
  renderDataSummary();
}

function renderChartArea() {
  $("selectedPeriodLabel").textContent = periodLabel();
  renderCharts();
}

function renderCharts() {
  renderMainChart();
  renderEventChart();
}

function renderMainChart() {
  if (!window.Chart) {
    $("chartSubLabel").textContent = "Chart.jsを読み込めませんでした。ネットワーク接続またはCDN設定を確認してください。";
    return;
  }
  const rows = rowsInSelectedPeriod();
  const labels = rows.map((row) => row.date);
  const datasets = state.selectedSeries.map((key) => ({
    label: SERIES[key].label,
    data: transformSeries(rows, key, state.mode),
    borderColor: SERIES[key].color,
    backgroundColor: SERIES[key].color,
    yAxisID: rawAxisFor(key),
    borderWidth: 3,
    pointRadius: rows.length < 40 ? 4 : 2,
    tension: 0.22,
    spanGaps: true
  }));
  const eventDates = labels.length
    ? state.events
        .filter((event) => event.date >= labels[0] && event.date <= labels[labels.length - 1])
        .map((event) => findNearestDateInRows(event.date, rows))
        .filter(Boolean)
    : [];
  $("chartSubLabel").textContent =
    state.mode === "raw" && (state.selectedSeries.includes("usdjpy") || state.selectedSeries.includes("btc"))
      ? "実数値では日経平均・NYダウは左軸、ドル円とビットコインは右軸で表示します。ビットコインは米ドル建て価格です。"
      : "ドル円は数字が上がるほど円安ドル高です。ビットコインは米ドル建て価格です。";
  mainChart = drawLineChart(mainChart, $("mainChart"), labels, datasets, eventDates, chartYAxisLabel(), state.mode === "raw");
}

function rawAxisFor(key) {
  if (state.mode !== "raw") return "y";
  if (key === "usdjpy") return "yFx";
  if (key === "btc") return "yBtc";
  return "y";
}

function renderEventChart() {
  if (!window.Chart) return;
  const event = selectedEvent();
  if (!event) return;
  const baseRow = findNearestMarketRow(event.date, "nearest", EVENT_BASE_TOLERANCE_DAYS);
  const start = formatDate(addDays(parseDate(event.date), -365));
  const end = formatDate(addDays(parseDate(event.date), 365));
  const rows = state.marketData.filter((row) => row.date >= start && row.date <= end);
  const labels = rows.map((row) => row.date);
  const datasets = state.selectedSeries.map((key) => ({
    label: `${SERIES[key].label} 指数`,
    data: transformSeries(rows, key, "indexed"),
    borderColor: SERIES[key].color,
    backgroundColor: SERIES[key].color,
    borderWidth: 3,
    pointRadius: 3,
    tension: 0.2,
    spanGaps: true
  }));
  const eventMarkerDate = baseRow && rows.some((row) => row.date === baseRow.date) ? baseRow.date : null;
  eventChart = drawLineChart(eventChart, $("eventChart"), labels, datasets, [eventMarkerDate].filter(Boolean), "イベント日前後の指数");
}

function drawLineChart(existing, canvas, labels, datasets, eventDates, yLabel, useDualAxis = false) {
  const eventMarkerPlugin = {
    id: "eventMarker",
    afterDatasetsDraw(chart) {
      const xScale = chart.scales.x;
      const area = chart.chartArea;
      const ctx = chart.ctx;
      eventDates.forEach((date) => {
        const index = labels.indexOf(date);
        if (index < 0) return;
        const x = xScale.getPixelForValue(index);
        ctx.save();
        ctx.strokeStyle = "#b42318";
        ctx.lineWidth = 2;
        ctx.setLineDash([6, 6]);
        ctx.beginPath();
        ctx.moveTo(x, area.top);
        ctx.lineTo(x, area.bottom);
        ctx.stroke();
        ctx.setLineDash([]);
        ctx.fillStyle = "#b42318";
        ctx.beginPath();
        ctx.arc(x, area.top + 10, 5, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      });
    }
  };

  if (existing) existing.destroy();
  const scales = {
    x: {
      ticks: {
        maxRotation: 0,
        autoSkip: true,
        maxTicksLimit: 8
      },
      grid: { color: "rgba(20, 33, 61, 0.07)" }
    },
    y: {
      position: "left",
      title: { display: true, text: useDualAxis ? "株価" : yLabel },
      grid: { color: "rgba(20, 33, 61, 0.08)" }
    }
  };
  if (useDualAxis && datasets.some((dataset) => dataset.yAxisID === "yFx")) {
    scales.yFx = {
      position: "right",
      title: { display: true, text: "ドル円" },
      grid: { drawOnChartArea: false },
      ticks: {
        callback(value) {
          return `${value}円`;
        }
      }
    };
  }
  if (useDualAxis && datasets.some((dataset) => dataset.yAxisID === "yBtc")) {
    scales.yBtc = {
      position: "right",
      title: { display: true, text: "ビットコイン USD" },
      grid: { drawOnChartArea: false },
      ticks: {
        callback(value) {
          return `$${Number(value).toLocaleString("ja-JP")}`;
        }
      }
    };
  }
  return new Chart(canvas, {
    type: "line",
    data: { labels, datasets },
    plugins: [eventMarkerPlugin],
    options: {
      responsive: true,
      maintainAspectRatio: false,
      interaction: { mode: "index", intersect: false },
      scales,
      plugins: {
        legend: {
          labels: {
            boxWidth: 18,
            boxHeight: 18,
            font: { size: 15, weight: "bold" }
          }
        },
        tooltip: {
          callbacks: {
            label(context) {
              const value = context.raw;
              return `${context.dataset.label}: ${formatValue(value, isPercentMode(state.mode))}`;
            }
          }
        }
      }
    }
  });
}

// グラフ形式ごとに、元データを表示用の数値へ変換します。
// 指数化は「期間内で最初に値がある日」を100として計算します。
function transformSeries(rows, key, mode) {
  if (mode === "raw") return rows.map((row) => row[key]);
  if (mode === "indexed") {
    const base = rows.find((row) => row[key] !== null)?.[key];
    return rows.map((row) => row[key] !== null && base ? (row[key] / base) * 100 : null);
  }
  if (mode === "daily") {
    return rows.map((row, index) => {
      if (index === 0) return null;
      return percentChange(rows[index - 1]?.[key], row[key]);
    });
  }
  const days = mode === "m1" ? 30 : mode === "m3" ? 91 : 365;
  return rows.map((row) => {
    const base = findNearestMarketRow(formatDate(addDays(parseDate(row.date), -days)), "before");
    return percentChange(base?.[key], row[key]);
  });
}

function chartYAxisLabel() {
  if (state.mode === "raw") return "実数値";
  if (state.mode === "indexed") return "開始日=100";
  return "変化率 %";
}

function isPercentMode(mode) {
  return ["daily", "m1", "m3", "y1"].includes(mode);
}

function rowsInSelectedPeriod() {
  if (state.range === "all") return state.marketData;
  const option = RANGE_OPTIONS.find((item) => item.key === state.range);
  const start = parseDate(state.startDate);
  const end = addMonths(start, option.months);
  return state.marketData.filter((row) => row.date >= formatDate(start) && row.date <= formatDate(end));
}

function periodLabel() {
  const rows = rowsInSelectedPeriod();
  if (!rows.length) return "該当データなし";
  return `${formatJapaneseMonth(rows[0].date)} 〜 ${formatJapaneseMonth(rows[rows.length - 1].date)}`;
}

// 年表の表示は検索語と重要度フィルターを通してから作り直します。
// イベントが増えても、この関数だけを読めば一覧表示の条件が追えます。
function renderTimeline() {
  const query = $("eventSearch").value.trim().toLowerCase();
  const threshold = $("importanceFilter").value;
  const list = state.events.filter((event) => {
    const text = `${event.date} ${event.title} ${event.category} ${event.region} ${event.description} ${event.memo}`.toLowerCase();
    const matchesText = !query || text.includes(query);
    const matchesImportance = threshold === "all" || event.importance >= Number(threshold);
    return matchesText && matchesImportance;
  });

  $("timelineList").innerHTML = list.map(eventCardHtml).join("") || "<p>イベントがありません。</p>";
  document.querySelectorAll(".event-card").forEach((button) => {
    button.addEventListener("click", () => selectEvent(button.dataset.id));
  });
}

function eventCardHtml(event) {
  const selected = event.id === state.selectedEventId ? " selected" : "";
  return `
    <button class="event-card${selected}" type="button" data-id="${event.id}">
      <span class="event-meta">
        <span>${event.date}</span>
        <span class="tag">${event.category}</span>
        <span class="tag">重要度${event.importance}</span>
      </span>
      <strong>${escapeHtml(event.title)}</strong>
      <small>${escapeHtml(event.region || "地域未設定")}</small>
    </button>
  `;
}

function selectEvent(eventId) {
  state.selectedEventId = eventId;
  saveAll();
  fillEventForm(selectedEvent());
  renderTimeline();
  renderAnalysisSelector();
  renderAnalysis();
  switchTab("analysis");
}

function selectedEvent() {
  return state.events.find((event) => event.id === state.selectedEventId) || state.events[0] || null;
}

function renderAnalysisSelector() {
  $("analysisEventSelect").innerHTML = state.events.map((event) => {
    const selected = event.id === state.selectedEventId ? "selected" : "";
    return `<option value="${event.id}" ${selected}>${event.date} ${escapeHtml(event.title)}</option>`;
  }).join("");
}

function renderAnalysis() {
  const event = selectedEvent();
  if (!event) {
    $("selectedEventLabel").textContent = "イベントがありません。";
    $("analysisHead").innerHTML = "";
    $("analysisBody").innerHTML = "";
    return;
  }
  state.selectedEventId = event.id;
  const base = findNearestMarketRow(event.date, "nearest", EVENT_BASE_TOLERANCE_DAYS);
  $("selectedEventLabel").textContent = base
    ? `${event.date} ${event.title} / 基準データ: ${base.date}`
    : `${event.date} ${event.title} / イベント日前後約3か月以内の市場データがありません`;
  $("analysisEventSelect").value = event.id;
  fillEventForm(event);

  const rows = buildAnalysisRows(event);
  $("analysisHead").innerHTML = `
    <tr>
      <th>比較日</th>
      <th>使用日</th>
      <th>日経平均</th>
      <th>NYダウ</th>
      <th>ドル円</th>
      <th>ビットコイン</th>
      <th>日経平均との差</th>
      <th>為替方向</th>
    </tr>
  `;
  $("analysisBody").innerHTML = rows.map((row) => `
    <tr>
      <td>${row.label}</td>
      <td>${row.usedDate || "-"}</td>
      <td class="${valueClass(row.nikkei)}">${formatPercent(row.nikkei)}</td>
      <td class="${valueClass(row.dow)}">${formatPercent(row.dow)}</td>
      <td class="${valueClass(row.usdjpy)}">${formatPercent(row.usdjpy)}</td>
      <td class="${valueClass(row.btc)}">${formatPercent(row.btc)}</td>
      <td class="${valueClass(row.spread)}">${formatPercent(row.spread)}</td>
      <td>${row.fxDirection}</td>
    </tr>
  `).join("");
  renderEventChart();
}

// イベント分析では、イベント当日に市場データがない場合でも近い営業日の値を使います。
// 前の日を見る項目は直近の前データ、後の日を見る項目は直近の後データを優先します。
function buildAnalysisRows(event) {
  const base = findNearestMarketRow(event.date, "nearest", EVENT_BASE_TOLERANCE_DAYS);
  return ANALYSIS_OFFSETS.map((offset) => {
    const targetDate = formatDate(addDays(parseDate(event.date), offset.days));
    const toleranceDays = analysisToleranceDays(offset.days);
    const row = base ? findNearestMarketRow(targetDate, analysisLookupMode(offset.days), toleranceDays) : null;
    const nikkei = percentChange(base?.nikkei, row?.nikkei);
    const dow = percentChange(base?.dow, row?.dow);
    const usdjpy = percentChange(base?.usdjpy, row?.usdjpy);
    const btc = percentChange(base?.btc, row?.btc);
    return {
      label: offset.label,
      usedDate: row?.date || "データなし",
      nikkei,
      dow,
      usdjpy,
      btc,
      spread: nikkei !== null && dow !== null ? nikkei - dow : null,
      fxDirection: fxDirection(usdjpy)
    };
  });
}

function analysisLookupMode(offsetDays) {
  if (offsetDays < 0 && Math.abs(offsetDays) <= 7) return "before";
  if (offsetDays > 0 && Math.abs(offsetDays) <= 7) return "after";
  return "nearest";
}

function analysisToleranceDays(offsetDays) {
  const absoluteDays = Math.abs(offsetDays);
  if (absoluteDays <= 1) return 10;
  if (absoluteDays <= 7) return 14;
  if (absoluteDays <= 30) return 45;
  if (absoluteDays <= 91) return 75;
  if (absoluteDays <= 182) return 120;
  return 180;
}

function renderCompare() {
  $("comparePicker").innerHTML = state.events.map((event) => {
    const checked = state.compareIds.includes(event.id) ? "checked" : "";
    return `
      <label class="compare-option">
        <input type="checkbox" value="${event.id}" ${checked}>
        <strong>${escapeHtml(event.title)}</strong>
        <span>${event.date} / 重要度${event.importance}</span>
      </label>
    `;
  }).join("");
  renderCompareTable();
}

function renderCompareTable() {
  const events = state.events.filter((event) => state.compareIds.includes(event.id));
  $("compareHead").innerHTML = `
    <tr>
      <th>イベント</th>
      <th>日経 1週後</th>
      <th>日経 1か月後</th>
      <th>日経 3か月後</th>
      <th>日経 1年後</th>
      <th>NYダウ 1週後</th>
      <th>ドル円 1か月後</th>
      <th>BTC 1か月後</th>
    </tr>
  `;
  const compareRows = events.map(compareEventMetrics);
  $("compareBody").innerHTML = compareRows.map((row) => `
    <tr>
      <td>${escapeHtml(row.title)}</td>
      <td class="${valueClass(row.nikkei7)}">${formatPercent(row.nikkei7)}</td>
      <td class="${valueClass(row.nikkei30)}">${formatPercent(row.nikkei30)}</td>
      <td class="${valueClass(row.nikkei91)}">${formatPercent(row.nikkei91)}</td>
      <td class="${valueClass(row.nikkei365)}">${formatPercent(row.nikkei365)}</td>
      <td class="${valueClass(row.dow7)}">${formatPercent(row.dow7)}</td>
      <td class="${valueClass(row.usdjpy30)}">${formatPercent(row.usdjpy30)} ${fxDirection(row.usdjpy30)}</td>
      <td class="${valueClass(row.btc30)}">${formatPercent(row.btc30)}</td>
    </tr>
  `).join("");
  renderRankings(compareRows);
}

function compareEventMetrics(event) {
  const base = findNearestMarketRow(event.date, "nearest");
  const after = (days) => findNearestMarketRow(formatDate(addDays(parseDate(event.date), days)), "after");
  return {
    id: event.id,
    title: event.title,
    nikkei7: percentChange(base?.nikkei, after(7)?.nikkei),
    nikkei30: percentChange(base?.nikkei, after(30)?.nikkei),
    nikkei91: percentChange(base?.nikkei, after(91)?.nikkei),
    nikkei365: percentChange(base?.nikkei, after(365)?.nikkei),
    dow7: percentChange(base?.dow, after(7)?.dow),
    usdjpy30: percentChange(base?.usdjpy, after(30)?.usdjpy),
    btc30: percentChange(base?.btc, after(30)?.btc)
  };
}

function renderRankings(rows) {
  const valid = (key) => rows.filter((row) => row[key] !== null);
  const minBy = (key) => valid(key).sort((a, b) => a[key] - b[key])[0];
  const maxBy = (key) => valid(key).sort((a, b) => b[key] - a[key])[0];
  const cards = [
    ["日経平均が一番下がったイベント", minBy("nikkei30"), "nikkei30"],
    ["日経平均が一番上がったイベント", maxBy("nikkei30"), "nikkei30"],
    ["円高が進んだイベント", minBy("usdjpy30"), "usdjpy30"],
    ["NYダウが大きく反応したイベント", maxAbsBy(rows, "dow7"), "dow7"],
    ["ビットコインが大きく反応したイベント", maxAbsBy(rows, "btc30"), "btc30"]
  ];
  $("rankings").innerHTML = cards.map(([title, row, key]) => `
    <div class="ranking-card">
      <strong>${title}</strong>
      <span>${row ? `${escapeHtml(row.title)} / ${formatPercent(row[key])}` : "データ不足"}</span>
    </div>
  `).join("");
}

function maxAbsBy(rows, key) {
  return rows.filter((row) => row[key] !== null).sort((a, b) => Math.abs(b[key]) - Math.abs(a[key]))[0];
}

function saveEventFromForm(event) {
  event.preventDefault();
  const id = $("eventId").value || `event-${Date.now()}`;
  const item = normalizeEvent({
    id,
    date: $("eventDate").value,
    title: $("eventTitle").value.trim(),
    category: $("eventCategory").value,
    importance: $("eventImportance").value,
    region: $("eventRegion").value.trim(),
    description: $("eventDescription").value.trim(),
    memo: $("eventMemo").value.trim()
  });
  if (!item) return;
  const index = state.events.findIndex((eventItem) => eventItem.id === id);
  if (index >= 0) state.events[index] = item;
  else state.events.push(item);
  state.selectedEventId = id;
  if (!state.compareIds.includes(id) && item.importance >= 5) state.compareIds.push(id);
  sortEvents();
  saveAll();
  renderAll();
}

function fillEventForm(event) {
  if (!event) return clearEventForm();
  $("eventFormTitle").textContent = "イベント編集";
  $("eventId").value = event.id;
  $("eventDate").value = event.date;
  $("eventTitle").value = event.title;
  $("eventCategory").value = event.category;
  $("eventImportance").value = String(event.importance);
  $("eventRegion").value = event.region;
  $("eventDescription").value = event.description;
  $("eventMemo").value = event.memo;
  $("deleteEvent").disabled = false;
}

function clearEventForm() {
  $("eventFormTitle").textContent = "イベント登録";
  $("eventForm").reset();
  $("eventId").value = "";
  $("eventCategory").value = "その他";
  $("eventImportance").value = "5";
  $("deleteEvent").disabled = true;
}

function deleteSelectedEvent() {
  const id = $("eventId").value;
  if (!id) return;
  const event = state.events.find((item) => item.id === id);
  const ok = window.confirm(`${event?.title || "このイベント"}を削除しますか？`);
  if (!ok) return;
  state.events = state.events.filter((item) => item.id !== id);
  state.compareIds = state.compareIds.filter((compareId) => compareId !== id);
  state.selectedEventId = state.events[0]?.id || null;
  saveAll();
  clearEventForm();
  renderAll();
}

// CSVはまず「読み込み済みデータ」として保持し、ユーザー操作で現在データと置き換えます。
// 空欄はnullにしておくことで、グラフや分析が止まらないようにしています。
async function importCsvFile() {
  const file = $("csvFile").files[0];
  if (!file) {
    $("importStatus").textContent = "CSVファイルを選択してください。";
    return;
  }
  const text = await file.text();
  const mapping = {
    date: $("mapDate").value.trim(),
    nikkei: $("mapNikkei").value.trim(),
    dow: $("mapDow").value.trim(),
    usdjpy: $("mapUsdjpy").value.trim(),
    btc: $("mapBtc").value.trim()
  };
  state.importedData = parseMarketCsv(text, mapping);
  $("importStatus").textContent = `${state.importedData.length}件のデータを読み込みました。`;
}

function replaceWithImportedData() {
  if (!state.importedData.length) {
    $("importStatus").textContent = "先にCSVを読み込んでください。";
    return;
  }
  state.marketData = state.importedData;
  sortMarketData();
  saveAll();
  buildStaticControls();
  syncControlsFromState();
  renderAll();
  $("importStatus").textContent = `${state.marketData.length}件のデータで置き換えました。`;
}

function parseMarketCsv(text, mapping) {
  const lines = text.replace(/^\uFEFF/, "").split(/\r?\n/).filter((line) => line.trim());
  if (lines.length < 2) return [];
  const headers = splitCsvLine(lines[0]).map((header) => header.trim());
  const headerIndex = (name) => {
    const exact = headers.findIndex((header) => header === name);
    if (exact >= 0) return exact;
    return headers.findIndex((header) => header.toLowerCase() === name.toLowerCase());
  };
  const indexes = {
    date: headerIndex(mapping.date || "date"),
    nikkei: headerIndex(mapping.nikkei || "nikkei"),
    dow: headerIndex(mapping.dow || "dow"),
    usdjpy: headerIndex(mapping.usdjpy || "usdjpy"),
    btc: headerIndex(mapping.btc || "btc")
  };
  if (indexes.date < 0) return [];
  return lines.slice(1).map((line) => {
    const cells = splitCsvLine(line);
    return normalizeMarketRow({
      date: cells[indexes.date]?.trim(),
      nikkei: indexes.nikkei >= 0 ? cells[indexes.nikkei]?.trim() : "",
      dow: indexes.dow >= 0 ? cells[indexes.dow]?.trim() : "",
      usdjpy: indexes.usdjpy >= 0 ? cells[indexes.usdjpy]?.trim() : "",
      btc: indexes.btc >= 0 ? cells[indexes.btc]?.trim() : ""
    });
  }).filter(Boolean).sort((a, b) => a.date.localeCompare(b.date));
}

// 引用符つきCSVにも最低限対応するため、単純なsplit(",")ではなく小さなパーサーにしています。
function splitCsvLine(line) {
  const result = [];
  let current = "";
  let quoted = false;
  for (let index = 0; index < line.length; index += 1) {
    const char = line[index];
    const next = line[index + 1];
    if (char === '"' && quoted && next === '"') {
      current += '"';
      index += 1;
    } else if (char === '"') {
      quoted = !quoted;
    } else if (char === "," && !quoted) {
      result.push(current);
      current = "";
    } else {
      current += char;
    }
  }
  result.push(current);
  return result;
}

function exportEvents() {
  const blob = new Blob([JSON.stringify(state.events, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = "market-history-events.json";
  anchor.click();
  URL.revokeObjectURL(url);
}

function renderDataSummary() {
  const first = state.marketData[0]?.date || "-";
  const last = state.marketData[state.marketData.length - 1]?.date || "-";
  $("dataSummary").innerHTML = `
    <dt>市場データ件数</dt><dd>${state.marketData.length}件</dd>
    <dt>期間</dt><dd>${first} 〜 ${last}</dd>
    <dt>イベント件数</dt><dd>${state.events.length}件</dd>
    <dt>最終更新</dt><dd>${APP_LAST_UPDATED}</dd>
    <dt>保存先</dt><dd>このブラウザのlocalStorage</dd>
  `;
}

function updateDateFromControls() {
  state.startDate = `${$("yearSelect").value}-${$("monthSelect").value}-01`;
  saveAll();
  renderChartArea();
}

function shiftPeriod(direction) {
  const option = RANGE_OPTIONS.find((item) => item.key === state.range);
  const months = option?.months || 12;
  state.startDate = formatDate(addMonths(parseDate(state.startDate), direction * months));
  clampStartDate();
  saveAll();
  syncControlsFromState();
  renderChartArea();
}

function jumpToLatest() {
  const latest = state.marketData[state.marketData.length - 1]?.date;
  if (!latest) return;
  const option = RANGE_OPTIONS.find((item) => item.key === state.range);
  const months = option?.months || 12;
  state.startDate = formatDate(addMonths(parseDate(latest), -months));
  clampStartDate();
  saveAll();
  syncControlsFromState();
  renderChartArea();
}

function clampStartDate() {
  const years = availableYears();
  if (!years.length) return;
  const year = parseDate(state.startDate).getFullYear();
  if (year < years[0]) state.startDate = `${years[0]}-01-01`;
  if (year > years[years.length - 1]) state.startDate = `${years[years.length - 1]}-01-01`;
}

function availableYears() {
  const years = new Set(state.marketData.map((row) => parseDate(row.date).getFullYear()));
  return Array.from(years).sort((a, b) => a - b);
}

// 市場は休場日があるため、指定日にぴったりの行がなくても用途別に近い行を返します。
function findNearestMarketRow(dateString, mode = "nearest", maxDistanceDays = null) {
  if (!state.marketData.length) return null;
  const target = parseDate(dateString).getTime();
  let best = null;
  let bestDistance = Infinity;
  for (const row of state.marketData) {
    const time = parseDate(row.date).getTime();
    if (mode === "before" && time > target) continue;
    if (mode === "after" && time < target) continue;
    const distance = Math.abs(time - target);
    if (distance < bestDistance) {
      best = row;
      bestDistance = distance;
    }
  }
  if (best && maxDistanceDays !== null && bestDistance > maxDistanceDays * 24 * 60 * 60 * 1000) {
    return null;
  }
  if (best) return best;
  if (maxDistanceDays !== null) return null;
  return mode === "before" ? state.marketData[0] : state.marketData[state.marketData.length - 1];
}

function findNearestDateInRows(dateString, rows) {
  if (!rows.length) return null;
  const target = parseDate(dateString).getTime();
  return rows.reduce((best, row) => {
    const bestDistance = Math.abs(parseDate(best.date).getTime() - target);
    const rowDistance = Math.abs(parseDate(row.date).getTime() - target);
    return rowDistance < bestDistance ? row : best;
  }, rows[0]).date;
}

function percentChange(base, value) {
  if (base === null || base === undefined || value === null || value === undefined || base === 0) return null;
  return ((value - base) / base) * 100;
}

function fxDirection(change) {
  if (change === null) return "-";
  if (change > 0.05) return "円安方向";
  if (change < -0.05) return "円高方向";
  return "ほぼ横ばい";
}

function formatValue(value, percent = false) {
  if (value === null || value === undefined || Number.isNaN(value)) return "-";
  return percent ? formatPercent(value) : Number(value).toLocaleString("ja-JP", { maximumFractionDigits: 2 });
}

function formatPercent(value) {
  if (value === null || value === undefined || Number.isNaN(value)) return "-";
  const sign = value > 0 ? "+" : "";
  return `${sign}${value.toFixed(2)}%`;
}

function valueClass(value) {
  if (value === null || Math.abs(value) < 0.005) return "";
  return value > 0 ? "positive" : "negative";
}

function parseDate(dateString) {
  const [year, month, day] = dateString.split("-").map(Number);
  return new Date(year, month - 1, day);
}

function formatDate(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function addDays(date, days) {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

function addMonths(date, months) {
  const next = new Date(date);
  next.setMonth(next.getMonth() + months);
  return next;
}

function isValidDate(dateString) {
  return /^\d{4}-\d{2}-\d{2}$/.test(String(dateString || "")) && !Number.isNaN(parseDate(dateString).getTime());
}

function formatJapaneseMonth(dateString) {
  const date = parseDate(dateString);
  return `${date.getFullYear()}年${date.getMonth() + 1}月`;
}

function escapeHtml(value) {
  return String(value || "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}
