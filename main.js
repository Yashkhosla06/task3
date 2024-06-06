import './style.css';
import axios from 'axios';

let tasks = [];
let editMode = false;
let editTaskId = null;

const API_BASE_URL = 'https://task1-rx2r.onrender.com/tasks';

document.querySelector('#app').innerHTML = `
<div class="container">
  <h1>CRUD Application</h1>
  <div class="search-bar">
    <input type="text" id="searchInput" placeholder="Search tasks">
    <input type="text" id="searchInputassignee" placeholder="Search tasks assignee">
  </div>
  <div class="form-group">
    <input type="text" id="taskIdInput" placeholder="Task ID">
    <input type="text" id="taskNameInput" placeholder="Task Name">
    <input type="text" id="assigneeInput" placeholder="Assignee">
    <input type="text" id="projectInput" placeholder="Project">
    <input type="datetime-local" id="startTimeInput">
    <button id="addTaskButton">Add Task</button>
    <button id="updateTaskButton" style="display: none;">Update Task</button>
  </div>
  <table>
    <thead>
      <tr>
        <th>ID</th>
        <th>Task Name</th>
        <th>Assignee</th>
        <th>Project</th>
        <th>Start Time</th>
        <th>Special Property</th>
        <th>Actions</th>
      </tr>
    </thead>
    <tbody id="taskTableBody">
      <!-- Task records will be inserted here -->
    </tbody>
  </table>
</div>
`;

function generateSpecialProperty() {
  const sourceString = 'YashKhosla';
  let result = '';
  for (let i = 0; i < 5; i++) {
    result += sourceString.charAt(Math.floor(Math.random() * sourceString.length));
  }
  return result;
}

document.getElementById('addTaskButton').addEventListener('click', () => {
  const taskId = document.getElementById('taskIdInput').value.trim();
  const taskName = document.getElementById('taskNameInput').value.trim();
  const assignee = document.getElementById('assigneeInput').value.trim();
  const project = document.getElementById('projectInput').value.trim();
  const startTime = document.getElementById('startTimeInput').value;

  if (taskId && taskName && assignee && project && startTime) {
    addTask({
      name: taskName,
      taskID: taskId,
      assignee,
      project,
      startTime: new Date(startTime).toISOString(),
      yashKhoslaProperty: generateSpecialProperty(),
    });
  } else {
    alert('Please fill in all fields.');
  }
});

document.getElementById('updateTaskButton').addEventListener('click', () => {
  const taskId = document.getElementById('taskIdInput').value.trim();
  const taskName = document.getElementById('taskNameInput').value.trim();
  const assignee = document.getElementById('assigneeInput').value.trim();
  const project = document.getElementById('projectInput').value.trim();
  const startTime = document.getElementById('startTimeInput').value;

  if (taskId && taskName && assignee && project && startTime) {
    updateTask({
      name: taskName,
      taskID: taskId,
      assignee,
      project,
      startTime: new Date(startTime).toISOString(),
    });
  } else {
    alert('Please fill in all fields.');
  }
});

document.getElementById('searchInput').addEventListener('input', (e) => {
  const searchTerm = e.target.value.trim().toLowerCase();
  if (searchTerm !== '') {
    searchTasks(searchTerm);
  } else {
    fetchTasks(); // If search term is empty, fetch all tasks
  }
});
document.getElementById('searchInputassignee').addEventListener('input', (e) => {
  const searchTerm = e.target.value.trim().toLowerCase();
  if (searchTerm !== '') {
    fetchTasksByAssignee(searchTerm);
  } else {
    fetchTasks(); // If search term is empty, fetch all tasks
  }
});

function fetchTasks() {
  axios.get(API_BASE_URL)
    .then(response => {
      tasks = response.data;
      displayTasks(tasks);
    })
    .catch(error => console.error('Error fetching tasks:', error));
}

function addTask(task) {
  axios.put(API_BASE_URL, task)
    .then(response => {
      tasks.push(response.data);
      displayTasks(tasks);
      clearForm();
    })
    .catch(error => console.error('Error adding task:', error));
}

function updateTask(updatedTask) {
  axios.put(API_BASE_URL, updatedTask)
    .then(response => {
      // Find the index of the task being updated
      const index = tasks.findIndex(task => task.taskID === updatedTask.taskID);
      // If the task is found, update it in the tasks array
      if (index !== -1) {
        tasks[index] = response.data;
        // Display the updated tasks
        displayTasks(tasks);
        // Clear the form and reset edit mode
        clearForm();
        editMode = false;
        editTaskId = null;
        document.getElementById('taskIdInput').disabled = false;
        document.getElementById('addTaskButton').style.display = 'inline-block';
        document.getElementById('updateTaskButton').style.display = 'none';
      } else {
        console.error('Task not found for update:', updatedTask.taskID);
      }
    })
    .catch(error => console.error('Error updating task:', error));
}

function deleteTask(id) {
  axios.delete(`${API_BASE_URL}/${id}`)
    .then(() => {
      tasks = tasks.filter(task => task.taskID !== id);
      displayTasks(tasks);
    })
    .catch(error => console.error('Error deleting task:', error));
  fetchTasks();
}

function editTask(id) {
  const task = tasks.find(task => task.taskID === id);
  if (task) {
    document.getElementById('taskIdInput').value = task.taskID;
    document.getElementById('taskNameInput').value = task.name;
    document.getElementById('assigneeInput').value = task.assignee;
    document.getElementById('projectInput').value = task.project;
    // Convert ISO string to local time format
    document.getElementById('startTimeInput').value = new Date(task.startTime).toISOString().slice(0, 16);
    // Enable edit mode
    editMode = true;
    editTaskId =  task.taskID;
    // Disable taskId input field to prevent editing
    document.getElementById('taskIdInput').disabled = true;
    // Hide addTaskButton and show updateTaskButton
    document.getElementById('addTaskButton').style.display = 'none';
    document.getElementById('updateTaskButton').style.display = 'inline-block';
  }
}

function searchTasks(name) {
  axios.get(`${API_BASE_URL}/search?name=${name}`)
    .then(response => {
      displayTasks(response.data);
    })
    .catch(error => console.error('Error searching tasks:', error));
}

function fetchTasksByAssignee(assignee) {
  axios.get(`${API_BASE_URL}/assignee?assignee=${assignee}`)
    .then(response => {
      displayTasks(response.data);
    })
    .catch(error => console.error('Error fetching tasks by assignee:', error));
}

function displayTasks(tasks) {
  const taskTableBody = document.getElementById('taskTableBody');
  tasks.forEach(task => {
    const existingRow = document.getElementById(task.taskID);
    if (existingRow) {
      // If the row already exists, update its content
      existingRow.innerHTML = `
        <td>${task.taskID}</td>
        <td>${task.name}</td>
        <td>${task.assignee}</td>
        <td>${task.project}</td>
        <td>${new Date(task.startTime).toLocaleString()}</td>
        <td>${task.yashKhoslaProperty}</td>
        <td class="actions">
          <button class="delete-task-button" data-id="${task.taskID}">Delete</button>
          <button class="edit-task-button" data-id="${task.taskID}">Edit</button>
        </td>
      `;
    } else {
      // If the row doesn't exist, create a new row
      const row = document.createElement('tr');
      row.id = task.taskID;
      row.innerHTML = `
        <td>${task.taskID}</td>
        <td>${task.name}</td>
        <td>${task.assignee}</td>
        <td>${task.project}</td>
        <td>${new Date(task.startTime).toLocaleString()}</td>
        <td>${task.yashKhoslaProperty}</td>
        <td class="actions">
          <button class="delete-task-button" data-id="${task.taskID}">Delete</button>
          <button class="edit-task-button" data-id="${task.taskID}">Edit</button>
        </td>
      `;
      taskTableBody.appendChild(row);
      fetchTasks();
    }
  });

  document.querySelectorAll('.delete-task-button').forEach(button => {
    button.addEventListener('click', (e) => {
      const taskId = e.target.dataset.id;
      deleteTask(taskId);
    });
  });

  document.querySelectorAll('.edit-task-button').forEach(button => {
    button.addEventListener('click', (e) => {
      const taskId = e.target.dataset.id;
      editTask(taskId);
    });
  });
}


function clearForm() {
  document.getElementById('taskIdInput').value = '';
  document.getElementById('taskNameInput').value = '';
  document.getElementById('assigneeInput').value = '';
  document.getElementById('projectInput').value = '';
  document.getElementById('startTimeInput').value = '';
  document.getElementById('taskIdInput').disabled = false;
}

// Initial fetch of tasks
fetchTasks();

