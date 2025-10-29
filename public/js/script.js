
const taskInput = document.getElementById('taskInput');
const addBtn = document.getElementById('addBtn');
const taskList = document.getElementById('taskList');
const statsElement = document.getElementById('stats');


const API_BASE = '';


function init() {
    updateStats();
    
    
    addBtn.addEventListener('click', addTask);
    taskInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            addTask();
        }
    });
    
    
    document.querySelectorAll('.task-item').forEach(item => {
        addTaskEventListeners(item);
    });
}


function addTaskEventListeners(taskItem) {
    const taskId = taskItem.dataset.taskId;
    const checkbox = taskItem.querySelector('input[type="checkbox"]');
    const deleteBtn = taskItem.querySelector('.delete-btn');
    
    checkbox.addEventListener('change', () => toggleTask(taskId));
    deleteBtn.addEventListener('click', () => deleteTask(taskId));
}


async function addTask() {
    const taskText = taskInput.value.trim();
    
    if (taskText === '') {
        alert('Please enter a task!');
        return;
    }
    
    try {
        addBtn.classList.add('loading');
        addBtn.textContent = 'Adding...';
        
        const response = await fetch('/tasks', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ text: taskText })
        });
        
        if (!response.ok) {
            throw new Error('Failed to add task');
        }
        
        const newTask = await response.json();
        
        
        window.location.reload();
        
    } catch (error) {
        console.error('Error adding task:', error);
        alert('Error adding task. Please try again.');
    } finally {
        addBtn.classList.remove('loading');
        addBtn.textContent = 'Add Task';
    }
}


async function toggleTask(id) {
    try {
        const response = await fetch(`/tasks/${id}/toggle`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            }
        });
        
        if (!response.ok) {
            throw new Error('Failed to update task');
        }
        
        
        window.location.reload();
        
    } catch (error) {
        console.error('Error updating task:', error);
        alert('Error updating task. Please try again.');
    }
}


async function deleteTask(id) {
    if (!confirm('Are you sure you want to delete this task?')) {
        return;
    }
    
    try {
        const response = await fetch(`/tasks/${id}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
            }
        });
        
        if (!response.ok) {
            throw new Error('Failed to delete task');
        }
        
       
        window.location.reload();
        
    } catch (error) {
        console.error('Error deleting task:', error);
        alert('Error deleting task. Please try again.');
    }
}

async function updateStats() {
    try {
        const response = await fetch('/api/tasks');
        const tasks = await response.json();
        
        const totalTasks = tasks.length;
        const completedTasks = tasks.filter(task => task.completed).length;
        const activeTasks = totalTasks - completedTasks;
        
        statsElement.textContent = 
            `Total: ${totalTasks} | Active: ${activeTasks} | Completed: ${completedTasks}`;
    } catch (error) {
        console.error('Error fetching stats:', error);
        statsElement.textContent = 'Error loading statistics';
    }
}


document.addEventListener('DOMContentLoaded', init);