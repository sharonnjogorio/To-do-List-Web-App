const API_URL = "http://localhost:5000/todos";
const token = localStorage.getItem("token");

if (!token) {
    alert("You must log in first");
    window.location.href = "login.html";
}

const todoList = document.getElementById("todoList");
const addBtn = document.getElementById("addBtn");
const createMessage = document.getElementById("createMessage");


async function loadTodos() {
    todoList.innerHTML = "<p>Loading...</p>";

    const res = await fetch(API_URL, {
        headers: { "Authorization": token }
    });

    const todos = await res.json();
    checkDueNotifications(todos);
    renderTodos(todos);
    
}

loadTodos();


function renderTodos(todos) {
    todoList.innerHTML = "";

    todos.forEach(todo => {
        const li = document.createElement("li");
        li.className = "todo-item";

        const info = document.createElement("div");
        info.className = "todo-info";

        
        const date = new Date(todo.dueDate);
        const formatted = date.toLocaleString([], {
            hour: "numeric",
            minute: "2-digit",
            month: "numeric",
            day: "numeric",
            year: "numeric"
        });

    
        const isOverdue = date < new Date();
        const overdueClass = (!todo.completed && isOverdue) ? "overdue" : "";
        const completedClass = todo.completed ? "completed" : "";

        
        info.innerHTML = `
            <strong class="${completedClass} ${overdueClass}">${todo.title}</strong><br>
            <small>${todo.description || ""}</small><br>
            <small>Due: ${formatted}</small>
        `;

        
        const btns = document.createElement("div");

        const completeBtn = document.createElement("button");
        completeBtn.textContent = todo.completed ? "Undo" : "Done";
        completeBtn.className = "small-btn";
        completeBtn.onclick = () => toggleComplete(todo);

        const editBtn = document.createElement("button");
        editBtn.textContent = "Edit";
        editBtn.className = "small-btn";
        editBtn.onclick = () => loadForEdit(todo);

        const deleteBtn = document.createElement("button");
        deleteBtn.textContent = "Delete";
        deleteBtn.className = "small-btn";
        deleteBtn.onclick = () => deleteTodo(todo._id);

        btns.appendChild(completeBtn);
        btns.appendChild(editBtn);
        btns.appendChild(deleteBtn);

        li.appendChild(info);
        li.appendChild(btns);
        todoList.appendChild(li);
    });
}


addBtn.addEventListener("click", async () => {
    const title = document.getElementById("title").value.trim();
    const description = document.getElementById("description").value.trim();
    const dueDate = document.getElementById("dueDate").value;

    if (!title || !dueDate) {
        createMessage.textContent = "Please enter a title and due date.";
        return;
    }

    createMessage.textContent = "Saving...";

    if (editMode) {
        await fetch(`${API_URL}/${editId}`, {
            method: "PUT",
            headers: {
                "Authorization": token,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ title, description, dueDate })
        });

        createMessage.textContent = "Task updated!";
        editMode = false;
        editId = null;
        addBtn.textContent = "Add Task"; 
    } 
    else {
        
        await fetch(API_URL, {
            method: "POST",
            headers: {
                "Authorization": token,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ title, description, dueDate })
        });

        createMessage.textContent = "Task added!";
    }

    document.getElementById("title").value = "";
    document.getElementById("description").value = "";
    document.getElementById("dueDate").value = "";

    loadTodos();
});


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

let editMode = false;
let editId = null;

 
function loadForEdit(todo) {
    editMode = true;
    editId = todo._id;


    document.getElementById("title").value = todo.title;
    document.getElementById("description").value = todo.description;
    const d = new Date(todo.dueDate);


    const local = new Date(d.getTime() - (d.getTimezoneOffset() * 60000))
    .toISOString()
    .slice(0, 16);

    document.getElementById("dueDate").value = local;


    

    addBtn.textContent = "Update Task";
}


async function deleteTodo(id) {
    if (!confirm("Do you want to delete this task?")) return;

    await fetch(`${API_URL}/${id}`, {
        method: "DELETE",
        headers: { "Authorization": token }
    });

    loadTodos();
} let notifiedTasks = new Set();

function checkDueNotifications(todos) {
    const now = new Date();

    todos.forEach(todo => {
        const due = new Date(todo.dueDate);

        if (
            now >= due &&
            !todo.completed &&
            !notifiedTasks.has(todo._id)
        ) {
            showToast(`"${todo.title}" is now due!`);
            notifiedTasks.add(todo._id);
        }
    });
}


function showToast(message) {
    const toastContainer = document.getElementById("toast");
    const toast = document.createElement("div");

    toast.className = "toast-message";
    toast.textContent = message;

    toastContainer.appendChild(toast);

    setTimeout(() => {
        toast.remove();
    }, 5000);
}

setInterval(async () => {
    const res = await fetch(API_URL, {
        headers: { "Authorization": token }
    });

    const todos = await res.json();
    checkDueNotifications(todos);
}, 10000);

