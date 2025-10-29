const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;


app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));


app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));


const dataPath = path.join(__dirname, 'data', 'tasks.json');


function readTasks() {
    try {
        if (!fs.existsSync(dataPath)) {
            return [];
        }
        const data = fs.readFileSync(dataPath, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        console.error('Error reading tasks:', error);
        return [];
    }
}

function writeTasks(tasks) {
    try {
        
        const dataDir = path.dirname(dataPath);
        if (!fs.existsSync(dataDir)) {
            fs.mkdirSync(dataDir, { recursive: true });
        }
        fs.writeFileSync(dataPath, JSON.stringify(tasks, null, 2));
        return true;
    } catch (error) {
        console.error('Error writing tasks:', error);
        return false;
    }
}


app.get('/', (req, res) => {
    const tasks = readTasks();
    res.render('index', { tasks, filter: 'all' });
});

app.post('/tasks', (req, res) => {
    const { text } = req.body;
    
    if (!text || text.trim() === '') {
        return res.status(400).json({ error: 'Task text is required' });
    }

    const tasks = readTasks();
    const newTask = {
        id: Date.now(),
        text: text.trim(),
        completed: false,
        createdAt: new Date().toISOString()
    };

    tasks.push(newTask);
    
    if (writeTasks(tasks)) {
        res.json(newTask);
    } else {
        res.status(500).json({ error: 'Failed to save task' });
    }
});

app.put('/tasks/:id/toggle', (req, res) => {
    const taskId = parseInt(req.params.id);
    const tasks = readTasks();
    
    const taskIndex = tasks.findIndex(task => task.id === taskId);
    if (taskIndex === -1) {
        return res.status(404).json({ error: 'Task not found' });
    }

    tasks[taskIndex].completed = !tasks[taskIndex].completed;
    
    if (writeTasks(tasks)) {
        res.json(tasks[taskIndex]);
    } else {
        res.status(500).json({ error: 'Failed to update task' });
    }
});

app.delete('/tasks/:id', (req, res) => {
    const taskId = parseInt(req.params.id);
    const tasks = readTasks();
    
    const filteredTasks = tasks.filter(task => task.id !== taskId);
    
    if (writeTasks(filteredTasks)) {
        res.json({ success: true });
    } else {
        res.status(500).json({ error: 'Failed to delete task' });
    }
});

app.get('/tasks/filter/:filter', (req, res) => {
    const filter = req.params.filter;
    const tasks = readTasks();
    
    let filteredTasks = tasks;
    if (filter === 'active') {
        filteredTasks = tasks.filter(task => !task.completed);
    } else if (filter === 'completed') {
        filteredTasks = tasks.filter(task => task.completed);
    }
    
    res.render('index', { tasks: filteredTasks, filter });
});


app.get('/api/tasks', (req, res) => {
    const tasks = readTasks();
    res.json(tasks);
});


app.listen(PORT, () => {
    console.log(`Task Manager app running on http://localhost:${PORT}`);
    console.log('Press Ctrl+C to stop the server');
});