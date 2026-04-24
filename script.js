const waitingLabel = document.getElementById("waitingLabel");
const completedLabel = document.getElementById("completedLabel");
const conflictLabel = document.getElementById("conflictLabel");
const mechanismSelect = document.getElementById("mechanism");
const threadCountSelect = document.getElementById("threadCount");
const semaphoreLimitSelect = document.getElementById("semaphoreLimit");
const speedInput = document.getElementById("speed");
const speedValue = document.getElementById("speedValue");

const startBtn = document.getElementById("startBtn");
const pauseBtn = document.getElementById("pauseBtn");
const resetBtn = document.getElementById("resetBtn");

const threadsContainer = document.getElementById("threadsContainer");
const resourceBox = document.getElementById("resourceBox");
const logBox = document.getElementById("logBox");
const currentAction = document.getElementById("currentAction");
const recommendation = document.getElementById("recommendation");
const waitingCount = document.getElementById("waitingCount");
const completedCount = document.getElementById("completedCount");

let threads = [];
let paused = false;
let stopSimulation = false;
let waitingEvents = 0;
let completedThreads = 0;
let conflictEvents = 0;
let threadChart = null;
let performanceChart = null;

speedInput.addEventListener("input", () => {
  speedValue.textContent = `${speedInput.value} ms`;
});

function createThreads() {
  threadsContainer.innerHTML = "";
  threads = [];

  const count = parseInt(threadCountSelect.value, 10);

  for (let i = 1; i <= count; i++) {
    const thread = document.createElement("div");
    thread.className = "thread ready";
    thread.id = `thread-${i}`;
    thread.innerHTML = `T${i}<br>Ready`;
    threadsContainer.appendChild(thread);

    threads.push({
      id: i,
      element: thread,
      state: "Ready"
    });
  }
}

function logEvent(message, type = "info") {
  const line = document.createElement("div");
  line.textContent = message;
  line.classList.add(`log-${type}`);
  logBox.appendChild(line);
  logBox.scrollTop = logBox.scrollHeight;
}

function updateThread(thread, state) {
  thread.state = state;
  thread.element.className = `thread ${state.toLowerCase()}`;
  thread.element.innerHTML = `T${thread.id}<br>${state}`;
  updateThreadChart();
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function waitIfPaused() {
  while (paused && !stopSimulation) {
    await sleep(200);
  }
}

function updateRecommendation() {
  const mechanism = mechanismSelect.value;
  const count = parseInt(threadCountSelect.value, 10);
  const semLimit = parseInt(semaphoreLimitSelect.value, 10);

  if (mechanism === "mutex") {
    recommendation.textContent =
      `Mutex is best when only one thread should access the shared resource at a time. Suitable for strict control with ${count} threads.`;
  } else if (mechanism === "semaphore") {
    recommendation.textContent =
      `Semaphore allows controlled concurrent access. With limit ${semLimit}, up to ${semLimit} thread(s) can access the resource together.`;
  } else if (mechanism === "monitor") {
    recommendation.textContent =
      `Monitor provides structured synchronized access, where shared operations are controlled safely one at a time.`;
  } else {
    recommendation.textContent =
      `Without synchronization, multiple threads may enter together and create a race condition or conflict.`;
  }
}

function updateStats() {
  waitingCount.textContent = waitingEvents;
  completedCount.textContent = completedThreads;
  updatePerformanceChart();
}

function initThreadChart() {
  const ctx = document.getElementById("threadChart").getContext("2d");

  if (threadChart) {
    threadChart.destroy();
  }

  threadChart = new Chart(ctx, {
    type: "bar",
    data: {
      labels: ["Ready", "Waiting", "Running", "Critical", "Finished"],
      datasets: [{
        label: "Thread Count",
        data: [0, 0, 0, 0, 0],
        backgroundColor: [
          "#cbd5e1",
          "#fcd34d",
          "#4ade80",
          "#f87171",
          "#60a5fa"
        ],
        borderRadius: 8
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            stepSize: 1
          },
          grid: {
            color: "#e5e7eb"
          }
        },
        x: {
          grid: {
            display: false
          }
        }
      }
    }
  });
}

function initPerformanceChart() {
  const ctx = document.getElementById("performanceChart").getContext("2d");

  if (performanceChart) {
    performanceChart.destroy();
  }

  performanceChart = new Chart(ctx, {
    type: "doughnut",  // 🔥 CHANGED HERE
    data: {
      labels: ["Waiting Events", "Completed Threads", "Conflict Events"],
      datasets: [{
        data: [0, 0, 0],
        backgroundColor: [
          "#fcd34d", // waiting - yellow
          "#60a5fa", // completed - blue
          "#f87171"  // conflict - red
        ],
        borderWidth: 2
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      animation: {
  animateRotate: true,
  animateScale: true
},
      plugins: {
        legend: {
          position: "bottom"
        }
      },
      cutout: "60%" // makes it look modern
    }
  });
}

function updateThreadChart() {
  if (!threadChart) return;

  const counts = {
    Ready: 0,
    Waiting: 0,
    Running: 0,
    Critical: 0,
    Finished: 0
  };

  threads.forEach(thread => {
    if (counts[thread.state] !== undefined) {
      counts[thread.state]++;
    }
  });

  threadChart.data.datasets[0].data = [
    counts.Ready,
    counts.Waiting,
    counts.Running,
    counts.Critical,
    counts.Finished
  ];

  threadChart.update();
}

function updatePerformanceChart() {
  if (!performanceChart) return;

  performanceChart.data.datasets[0].data = [
    waitingEvents,
    completedThreads,
    conflictEvents
  ];

  performanceChart.update();
}

async function simulateSingleThread(thread, mechanismName, speed) {
  if (stopSimulation) return;

  await waitIfPaused();
  if (stopSimulation) return;

  updateThread(thread, "Waiting");
  waitingEvents++;
  updateStats();
  currentAction.textContent = `T${thread.id} is waiting to access the shared resource.`;
  logEvent(`🟡 T${thread.id} is waiting.`, "waiting");
  await sleep(speed);

  await waitIfPaused();
  if (stopSimulation) return;

  updateThread(thread, "Running");
  currentAction.textContent = `T${thread.id} is running using ${mechanismName}.`;
  logEvent(`🟢 T${thread.id} is running with ${mechanismName}.`, "running");
  await sleep(speed);

  await waitIfPaused();
  if (stopSimulation) return;

  updateThread(thread, "Critical");
  resourceBox.textContent = `T${thread.id} using resource`;
  currentAction.textContent = `T${thread.id} entered critical section.`;
  logEvent(`🔴 T${thread.id} entered critical section.`, "critical");
  await sleep(speed);

  await waitIfPaused();
  if (stopSimulation) return;

  updateThread(thread, "Finished");
  completedThreads++;
  updateStats();
  resourceBox.textContent = "Shared Resource";
  currentAction.textContent = `T${thread.id} finished execution.`;
  logEvent(`🔵 T${thread.id} finished execution.`, "finished");
  await sleep(speed);
}

async function runMutex(speed) {
  logEvent("ℹ️ Mutex simulation started.", "info");
  currentAction.textContent = "Only one thread can access the resource at a time using Mutex.";

  for (const thread of threads) {
    if (stopSimulation) return;
    await simulateSingleThread(thread, "Mutex", speed);
  }

  currentAction.textContent = "Mutex simulation completed successfully.";
  logEvent("ℹ️ Mutex simulation completed.", "info");
}

async function runMonitor(speed) {
  logEvent("ℹ️ Monitor simulation started.", "info");
  currentAction.textContent = "Monitor provides synchronized structured access, one thread at a time.";

  for (const thread of threads) {
    if (stopSimulation) return;
    await simulateSingleThread(thread, "Monitor", speed);
  }

  currentAction.textContent = "Monitor simulation completed successfully.";
  logEvent("ℹ️ Monitor simulation completed.", "info");
}

async function runSemaphore(speed) {
  const limit = parseInt(semaphoreLimitSelect.value, 10);
  logEvent(`ℹ️ Semaphore simulation started with limit ${limit}.`, "info");
  currentAction.textContent = `Semaphore allows ${limit} thread(s) to access the resource together.`;

  let index = 0;

  while (index < threads.length) {
    if (stopSimulation) return;

    const batch = threads.slice(index, index + limit);

    for (const thread of batch) {
      updateThread(thread, "Waiting");
      waitingEvents++;
      logEvent(`🟡 T${thread.id} is waiting.`, "waiting");
    }
    updateStats();

    await sleep(speed);
    await waitIfPaused();
    if (stopSimulation) return;

    for (const thread of batch) {
      updateThread(thread, "Running");
      logEvent(`🟢 T${thread.id} is running with Semaphore.`, "running");
    }

    currentAction.textContent = `Semaphore granted access to ${batch.map(t => "T" + t.id).join(", ")}.`;
    await sleep(speed);

    await waitIfPaused();
    if (stopSimulation) return;

    for (const thread of batch) {
      updateThread(thread, "Critical");
    }

    resourceBox.textContent = `${batch.map(t => "T" + t.id).join(", ")} using resource`;
    logEvent(`🔴 ${batch.map(t => "T" + t.id).join(", ")} entered critical section.`, "critical");
    await sleep(speed);

    await waitIfPaused();
    if (stopSimulation) return;

    for (const thread of batch) {
      updateThread(thread, "Finished");
      completedThreads++;
      logEvent(`🔵 T${thread.id} finished execution.`, "finished");
    }
    updateStats();

    resourceBox.textContent = "Shared Resource";
    index += limit;
    await sleep(speed);
  }

  currentAction.textContent = "Semaphore simulation completed successfully.";
  logEvent("ℹ️ Semaphore simulation completed.", "info");
}

async function runWithoutSynchronization(speed) {
  logEvent("ℹ️ Unsynchronized simulation started.", "info");
  currentAction.textContent = "Multiple threads may enter together, causing conflict.";

  for (const thread of threads) {
    updateThread(thread, "Waiting");
    waitingEvents++;
    logEvent(`🟡 T${thread.id} is waiting.`, "waiting");
  }
  updateStats();

  await sleep(speed / 2);
  await waitIfPaused();
  if (stopSimulation) return;

  for (const thread of threads) {
    updateThread(thread, "Running");
    logEvent(`🟢 T${thread.id} is running without synchronization.`, "running");
  }

  await sleep(speed / 2);
  await waitIfPaused();
  if (stopSimulation) return;

  for (const thread of threads) {
    updateThread(thread, "Critical");
  }

  resourceBox.textContent = "Conflict! Multiple threads using resource";
  currentAction.textContent = "Race condition occurred: multiple threads entered critical section together.";
  logEvent("❌ Conflict detected: multiple threads entered critical section together.", "conflict");
  conflictEvents++;
  updatePerformanceChart();

  await sleep(speed);
  await waitIfPaused();
  if (stopSimulation) return;

  for (const thread of threads) {
    updateThread(thread, "Finished");
    completedThreads++;
    logEvent(`🔵 T${thread.id} finished execution.`, "finished");
  }

  updateStats();
  resourceBox.textContent = "Shared Resource";
  currentAction.textContent = "Unsynchronized simulation completed with conflict.";
  logEvent("ℹ️ Unsynchronized simulation completed.", "info");
}

async function runSimulation() {
  stopSimulation = false;
  paused = false;

  const mechanism = mechanismSelect.value;
  const speed = parseInt(speedInput.value, 10);

  updateRecommendation();

  if (mechanism === "mutex") {
    await runMutex(speed);
  } else if (mechanism === "semaphore") {
    await runSemaphore(speed);
  } else if (mechanism === "monitor") {
    await runMonitor(speed);
  } else {
    await runWithoutSynchronization(speed);
  }
}

startBtn.addEventListener("click", () => {
  stopSimulation = false;
  paused = false;
  pauseBtn.textContent = "Pause";

  logBox.innerHTML = "";
  waitingEvents = 0;
  completedThreads = 0;
  conflictEvents = 0;

  createThreads();
  initThreadChart();
  initPerformanceChart();
  updateThreadChart();
  updatePerformanceChart();
  updateStats();

  resourceBox.textContent = "Shared Resource";
  currentAction.textContent = "Simulation started.";
  runSimulation();
});

pauseBtn.addEventListener("click", () => {
  paused = !paused;
  pauseBtn.textContent = paused ? "Resume" : "Pause";
});

resetBtn.addEventListener("click", () => {
  stopSimulation = true;
  paused = false;
  pauseBtn.textContent = "Pause";

  waitingEvents = 0;
  completedThreads = 0;
  conflictEvents = 0;

  currentAction.textContent = "Waiting to start simulation...";
  recommendation.textContent = "Choose a mechanism and start the simulation.";
  resourceBox.textContent = "Shared Resource";
  logBox.innerHTML = "";

  createThreads();
  initThreadChart();
  initPerformanceChart();
  updateThreadChart();
  updatePerformanceChart();
  updateStats();
});

createThreads();
initThreadChart();
initPerformanceChart();
updateThreadChart();
updatePerformanceChart();
updateStats();