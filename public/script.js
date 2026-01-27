const taskList = document.getElementById('tasks');
const newTaskInput = document.getElementById('new-task');

document.getElementById('add-task').onclick = async () => {
	const title = newTaskInput.value;
	if (!title) return;

	const response = await fetch('/api/', {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({ title }),
	});
	const task = await response.json();
	// addTaskToList(task);
	taskList.innerHTML = '';
	task.forEach(addTaskToList);
	newTaskInput.value = '';
};

const addTaskToList = (task) => {
	const li = document.createElement('li');
	li.textContent = task.title;
	li.onclick = () => removeTask(task.id, li);
	taskList.appendChild(li);
};

const removeTask = async (id, li) => {
	await fetch(`/api/${id}`, { method: 'DELETE' });
	taskList.removeChild(li);
};

const loadTasks = async () => {
	const response = await fetch('/api/');
	const tasks = await response.json();
	tasks.forEach(addTaskToList);
};

loadTasks();
