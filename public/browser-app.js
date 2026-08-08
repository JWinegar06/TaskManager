const tasksDOM = document.querySelector(".tasks");
const loadingDOM = document.querySelector(".loading-text");
const formDOM = document.querySelector(".task-form");
const taskInputDOM = document.querySelector(".task-input");
const formAlertDOM = document.querySelector(".form-alert");
const completeQuestBtn = document.querySelector(".complete-quest-btn");
let currentTasks = [];

const showTasks = async () => {
  loadingDOM.style.visibility = "visible";
  try {
    const {
      data: { tasks },
    } = await axios.get("/api/v1/tasks");
    currentTasks = tasks;
    if (tasks.length < 1) {
      tasksDOM.innerHTML =
        '<h5 class="empty-list">No objectives assigned.</h5>';
      completeQuestBtn.disabled = true;
      return;
    }
    tasksDOM.innerHTML = tasks
      .map(
        ({ completed, _id: taskID, name }) => `
      <div class="single-task ${completed ? "task-completed" : ""}">
        <div class="task-main">
          <span class="task-name">${escapeHTML(name)}</span>
          <span class="task-progress">[${completed ? 1 : 0}/1]</span>
          <button type="button" class="complete-btn" data-id="${taskID}" data-completed="${completed}" title="${completed ? "Mark incomplete" : "Complete objective"}">${completed ? "✓" : "+"}</button>
        </div>
        <div class="task-links">
          <a href="task.html?id=${taskID}" class="edit-link" title="Edit"><i class="fas fa-edit"></i></a>
          <button type="button" class="delete-btn" data-id="${taskID}" title="Delete"><i class="fas fa-trash"></i></button>
        </div>
      </div>`,
      )
      .join("");
    completeQuestBtn.disabled = !tasks.every((t) => t.completed);
  } catch (error) {
    tasksDOM.innerHTML =
      '<h5 class="empty-list">System error. Unable to load objectives.</h5>';
  } finally {
    loadingDOM.style.visibility = "hidden";
  }
};

const escapeHTML = (value) =>
  String(value).replace(
    /[&<>'"]/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" })[
        c
      ],
  );

showTasks();

tasksDOM.addEventListener("click", async (e) => {
  const deleteBtn = e.target.closest(".delete-btn");
  const completeBtn = e.target.closest(".complete-btn");
  if (deleteBtn) {
    try {
      await axios.delete(`/api/v1/tasks/${deleteBtn.dataset.id}`);
      await showTasks();
    } catch (error) {
      console.log(error);
    }
  }
  if (completeBtn) {
    const id = completeBtn.dataset.id;
    const completed = completeBtn.dataset.completed === "true";
    const task = currentTasks.find((t) => t._id === id);
    if (!task) return;
    try {
      await axios.patch(`/api/v1/tasks/${id}`, {
        name: task.name,
        completed: !completed,
      });
      await showTasks();
    } catch (error) {
      console.log(error);
    }
  }
});

formDOM.addEventListener("submit", async (e) => {
  e.preventDefault();
  const name = taskInputDOM.value.trim();
  if (!name) return;
  try {
    await axios.post("/api/v1/tasks", { name });
    taskInputDOM.value = "";
    formAlertDOM.textContent = "[Objective added]";
    formAlertDOM.className = "form-alert text-success";
    await showTasks();
  } catch (error) {
    formAlertDOM.textContent = "[System error: objective not added]";
    formAlertDOM.className = "form-alert text-danger";
  }
  setTimeout(() => {
    formAlertDOM.textContent = "";
  }, 2500);
});

completeQuestBtn.addEventListener("click", () => {
  if (!currentTasks.length || !currentTasks.every((t) => t.completed)) return;
  formAlertDOM.textContent = "[Daily Quest Complete — Rewards Available]";
  formAlertDOM.className = "form-alert text-success";
});

function updateTimer() {
  const now = new Date();
  const next = new Date(now);
  next.setHours(24, 0, 0, 0);
  const diff = next - now;
  const h = String(Math.floor(diff / 3600000)).padStart(2, "0");
  const m = String(Math.floor((diff % 3600000) / 60000)).padStart(2, "0");
  const s = String(Math.floor((diff % 60000) / 1000)).padStart(2, "0");
  document.querySelector("#quest-timer").textContent = `${h}:${m}:${s}`;
}
updateTimer();
setInterval(updateTimer, 1000);
