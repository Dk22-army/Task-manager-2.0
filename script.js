let tasks = JSON.parse(localStorage.getItem("tasks")) || [];
let history = JSON.parse(localStorage.getItem("history")) || [];

function saveData() {
  localStorage.setItem("tasks", JSON.stringify(tasks));
  localStorage.setItem("history", JSON.stringify(history));
}

function renderTasks() {
  let taskList = document.getElementById("taskList");
  taskList.innerHTML = "";
  tasks.forEach((task, index) => {
    let div = document.createElement("div");
    div.className = "task";
    div.innerHTML = `
      <span class="${task.completed ? 'completed' : ''}">
        ${task.text} 
        <span class="reminder">(${task.date} ${task.time})</span>
      </span>
      <div>
        <button onclick="toggleComplete(${index})">✔</button>
        <button onclick="deleteTask(${index})">🗑</button>
      </div>
    `;
    taskList.appendChild(div);
  });
  updateProgress();
}

function renderHistory() {
  let historyDiv = document.getElementById("taskHistory");
  historyDiv.innerHTML = "";
  history.forEach(item => {
    let p = document.createElement("p");
    p.textContent = item;
    historyDiv.appendChild(p);
  });
}

function addTask() {
  let input = document.getElementById("taskInput").value;
  let date = document.getElementById("taskDate").value;
  let time = document.getElementById("taskTime").value;

  if(input.trim() === "") return alert("Enter a task!");

  tasks.push({ text: input, date, time, completed: false });
  history.push(Added: ${input} (${date} ${time}));
  saveData();
  renderTasks();
  renderHistory();
  document.getElementById("taskInput").value = "";
}

function toggleComplete(index) {
  tasks[index].completed = !tasks[index].completed;
  history.push(Completed: ${tasks[index].text});
  saveData();
  renderTasks();
  renderHistory();
}

function deleteTask(index) {
  history.push(Deleted: ${tasks[index].text});
  tasks.splice(index, 1);
  saveData();
  renderTasks();
  renderHistory();
}

function updateProgress() {
  let completed = tasks.filter(task => task.completed).length;
  let total = tasks.length;
  let percent = total ? Math.round((completed / total) * 100) : 0;
  
  document.getElementById("progressFill").style.width = percent + "%";
  document.getElementById("progressText").textContent = percent + "% Completed";
}

// Initial render
renderTasks();
renderHistory();

// Reminder Notifications
setInterval(() => {
  let now = new Date();
  tasks.forEach(task => {
    if (!task.completed && task.date && task.time) {
      let taskTime = new Date(task.date + "T" + task.time);
      if (Math.abs(now - taskTime) < 60000) { 
        alert("⏰ Reminder: " + task.text);
      }
    }
  });
}, 30000);