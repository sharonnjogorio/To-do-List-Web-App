const API_URL = "http://localhost:5000/auth/login";

document.getElementById("loginForm").addEventListener("submit", async (e) => {
    e.preventDefault();

    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value.trim();
    const message = document.getElementById("message");

    const response = await fetch(API_URL, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ email, password })
    });

    const data = await response.json();

    if (!response.ok) {
        message.textContent = data.msg || "Login failed";
        return;
    }

    // Save token and userId
    localStorage.setItem("token", data.token);
    localStorage.setItem("userId", data.userId);

    // Redirect to todos page
    window.location.href = "todos.html";
});
