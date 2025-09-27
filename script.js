let tasks = JSON.parse(localStorage.getItem("tasks")) || [];
let history = JSON.parse(localStorage.getItem("history")) || [];

function saveData() {
  localStorage.setItem("tasks", JSON.stringify(tasks));
  localStorage.setItem("history", JSON.stringify(history));
}

function renderTasks() {
  let taskList = document.getElementById("taskList");
  taskList.innerHTML = "";
  
  if (tasks.length === 0) {
    taskList.innerHTML = `
      <div style="text-align: center; padding: 40px; color: #a0aec0; font-style: italic;">
        <div style="font-size: 3rem; margin-bottom: 10px;">🎆</div>
        <div>No tasks yet! Add your first task above.</div>
      </div>
    `;
    updateProgress();
    return;
  }
  
  tasks.forEach((task, index) => {
    let div = document.createElement("div");
    div.className = `task ${task.completed ? 'completed' : ''}`;
    
    // Format date and time for better display
    let dateTimeDisplay = '';
    if (task.date || task.time) {
      const date = task.date ? new Date(task.date).toLocaleDateString() : '';
      const time = task.time || '';
      dateTimeDisplay = `<span class="reminder">📅 ${date} ${time}</span>`;
    }
    
    div.innerHTML = `
      <div class="task-text">
        <span class="${task.completed ? 'completed' : ''}">
          ${task.text}
        </span>
        ${dateTimeDisplay}
      </div>
      <div class="task-buttons">
        <button class="complete-btn" onclick="toggleComplete(${index})" title="${task.completed ? 'Mark as incomplete' : 'Mark as complete'}">
          ${task.completed ? '✅' : '✔️'}
        </button>
        <button class="delete-btn" onclick="deleteTask(${index})" title="Delete task">
          🗑️
        </button>
      </div>
    `;
    taskList.appendChild(div);
  });
  updateProgress();
}

function renderHistory() {
  let historyDiv = document.getElementById("taskHistory");
  historyDiv.innerHTML = "";
  
  if (history.length === 0) {
    historyDiv.innerHTML = `
      <div style="text-align: center; padding: 20px; color: #a0aec0; font-style: italic;">
        <div>📜 No history yet</div>
      </div>
    `;
    return;
  }
  
  // Show only the last 5 history items for better UX
  const recentHistory = history.slice(-5).reverse();
  
  recentHistory.forEach(item => {
    let p = document.createElement("p");
    // Add icons based on action type
    if (item.includes('Added:')) {
      p.innerHTML = `➕ ${item}`;
    } else if (item.includes('Completed:')) {
      p.innerHTML = `✅ ${item}`;
    } else if (item.includes('Deleted:')) {
      p.innerHTML = `🗑️ ${item}`;
    } else {
      p.textContent = item;
    }
    historyDiv.appendChild(p);
  });
}

function addTask() {
  let input = document.getElementById("taskInput").value.trim();
  let date = document.getElementById("taskDate").value;
  let time = document.getElementById("taskTime").value;

  if(input === "") {
    // Add a subtle shake animation for empty input
    const inputElement = document.getElementById("taskInput");
    inputElement.style.animation = 'shake 0.5s';
    setTimeout(() => inputElement.style.animation = '', 500);
    return alert("⚠️ Please enter a task!");
  }

  const newTask = { 
    text: input, 
    date, 
    time, 
    completed: false,
    createdAt: new Date().toISOString()
  };
  
  tasks.push(newTask);
  
  // Enhanced history with timestamps
  const timestamp = new Date().toLocaleString();
  history.push(`Added: ${input} ${date ? `on ${new Date(date).toLocaleDateString()}` : ''} ${time ? `at ${time}` : ''} - ${timestamp}`);
  
  saveData();
  renderTasks();
  renderHistory();
  
  // Clear inputs with smooth animation
  document.getElementById("taskInput").value = "";
  document.getElementById("taskDate").value = "";
  document.getElementById("taskTime").value = "";
  
  // Focus back on input for better UX
  document.getElementById("taskInput").focus();
}

function toggleComplete(index) {
  tasks[index].completed = !tasks[index].completed;
  const action = tasks[index].completed ? 'Completed' : 'Marked incomplete';
  const timestamp = new Date().toLocaleString();
  history.push(`${action}: ${tasks[index].text} - ${timestamp}`);
  saveData();
  renderTasks();
  renderHistory();
}

function deleteTask(index) {
  if (confirm(`🗑️ Are you sure you want to delete "${tasks[index].text}"?`)) {
    const timestamp = new Date().toLocaleString();
    history.push(`Deleted: ${tasks[index].text} - ${timestamp}`);
    tasks.splice(index, 1);
    saveData();
    renderTasks();
    renderHistory();
  }
}

function updateProgress() {
  let completed = tasks.filter(task => task.completed).length;
  let total = tasks.length;
  let percent = total ? Math.round((completed / total) * 100) : 0;
  
  const progressFill = document.getElementById("progressFill");
  const progressText = document.getElementById("progressText");
  
  progressFill.style.width = percent + "%";
  
  // Enhanced progress text with emojis
  let emoji = "📈";
  if (percent === 100 && total > 0) emoji = "🎉";
  else if (percent >= 75) emoji = "🎆";
  else if (percent >= 50) emoji = "💪";
  else if (percent >= 25) emoji = "🌱";
  
  progressText.innerHTML = `${emoji} ${percent}% Completed (${completed}/${total} tasks)`;
}

// Initial render
renderTasks();
renderHistory();

// Keyboard shortcuts and UX enhancements
document.getElementById("taskInput").addEventListener("keypress", function(event) {
  if (event.key === "Enter") {
    addTask();
  }
});

// Add shake animation for empty input
const style = document.createElement('style');
style.textContent = `
  @keyframes shake {
    0%, 100% { transform: translateX(0); }
    25% { transform: translateX(-5px); }
    75% { transform: translateX(5px); }
  }
`;
document.head.appendChild(style);

// Auto-focus on task input when page loads
window.addEventListener('load', () => {
  document.getElementById("taskInput").focus();
});

// Enhanced reminder notifications with better UX
function checkReminders() {
  let now = new Date();
  tasks.forEach((task, index) => {
    if (!task.completed && task.date && task.time) {
      let taskTime = new Date(task.date + "T" + task.time);
      let timeDiff = Math.abs(now - taskTime);
      
      // Notify 5 minutes before and at the exact time
      if (timeDiff < 60000) { // Within 1 minute
        showNotification(`⏰ Task Due Now: ${task.text}`, 'urgent');
      } else if (timeDiff < 300000 && timeDiff > 240000) { // 4-5 minutes before
        showNotification(`⚠️ Task Due in 5 minutes: ${task.text}`, 'warning');
      }
    }
  });
}

// Enhanced notification system
function showNotification(message, type = 'info') {
  // Check if browser supports notifications
  if ("Notification" in window && Notification.permission === "granted") {
    new Notification("Task Manager Pro", {
      body: message,
      icon: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Cpath fill='%23667eea' d='M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z'/%3E%3C/svg%3E"
    });
  } else {
    // Fallback to alert
    alert(message);
  }
}

// Request notification permission on first load
if ("Notification" in window && Notification.permission === "default") {
  Notification.requestPermission();
}

// Check reminders every 30 seconds
setInterval(checkReminders, 30000);

// Add statistics tracking
function getTaskStats() {
  const total = tasks.length;
  const completed = tasks.filter(task => task.completed).length;
  const pending = total - completed;
  const overdue = tasks.filter(task => {
    if (!task.date || !task.time || task.completed) return false;
    const taskTime = new Date(task.date + "T" + task.time);
    return taskTime < new Date();
  }).length;
  
  return { total, completed, pending, overdue };
}

// Export tasks as JSON (for backup)
function exportTasks() {
  const data = {
    tasks,
    history,
    exportDate: new Date().toISOString(),
    version: "2.0"
  };
  
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `tasks-backup-${new Date().toISOString().split('T')[0]}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

