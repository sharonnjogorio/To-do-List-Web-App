const API_URL = "http://localhost:5000/todos";
const token = localStorage.getItem("token");

if (!token) {
    alert("You must log in first");
    window.location.href = "login.html";
}

// UI Elements
const todoList = document.getElementById("todoList");
const addBtn = document.getElementById("addBtn");
const createMessage = document.getElementById("createMessage");


// ----------------- FETCH TODOS -----------------
async function loadTodos() {
    todoList.innerHTML = "<p>Loading...</p>";

    const res = await fetch(API_URL, {
        headers: { "Authorization": token }
    });

    const todos = await res.json();
    renderTodos(todos);
}

loadTodos();


// ----------------- RENDER TODOS -----------------
function renderTodos(todos) {
    todoList.innerHTML = "";

    todos.forEach(todo => {
        const li = document.createElement("li");
        li.className = "todo-item";

        const info = document.createElement("div");
        info.className = "todo-info";

        const isOverdue = new Date(todo.dueDate) < new Date();
        const completedClass = todo.completed ? "completed" : "";

        info.innerHTML = `
            <strong class="${completedClass}">${todo.title}</strong><br>
            <small>${todo.description || ""}</small><br>
            <small>Due: ${new Date(todo.dueDate).toLocaleString()}</small>
            ${isOverdue && !todo.completed ? "<span style='color:red'> (Overdue)</span>" : ""}
        `;

        // Buttons
        const btns = document.createElement("div");

        // Toggle Complete
        const completeBtn = document.createElement("button");
        completeBtn.textContent = todo.completed ? "Undo" : "Done";
        completeBtn.className = "small-btn";
        completeBtn.onclick = () => toggleComplete(todo);

        // Delete
        const deleteBtn = document.createElement("button");
        deleteBtn.textContent = "Delete";
        deleteBtn.className = "small-btn";
        deleteBtn.onclick = () => deleteTodo(todo._id);

        btns.appendChild(completeBtn);
        btns.appendChild(deleteBtn);

        li.appendChild(info);
        li.appendChild(btns);
        todoList.appendChild(li);
    });
}


// ----------------- ADD TODO -----------------
addBtn.addEventListener("click", async () => {
    const title = document.getElementById("title").value.trim();
    const description = document.getElementById("description").value.trim();
    const dueDate = document.getElementById("dueDate").value;

    if (!title || !dueDate) {
        createMessage.textContent = "Please enter a title and due date.";
        return;
    }

    createMessage.textContent = "Saving...";

    await fetch(API_URL, {
        method: "POST",
        headers: {
            "Authorization": token,
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ title, description, dueDate })
    });

    createMessage.textContent = "Task added!";
    loadTodos();
});


// ----------------- TOGGLE COMPLETE -----------------
async function toggleComplete(todo) {
    await fetch(`${API_URL}/${todo._id}`, {
        method: "PUT",
        headers: {
            "Authorization": token,
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            completed: !todo.completed
        })
    });

    loadTodos();
}


// ----------------- DELETE TODO -----------------
async function deleteTodo(id) {
    if (!confirm("Delete this task?")) return;

    await fetch(`${API_URL}/${id}`, {
        method: "DELETE",
        headers: { "Authorization": token }
    });

    loadTodos();
}
