const REGISTER_URL = "http://localhost:5000/auth/register";

document.getElementById("registerForm").addEventListener("submit", async (e) => {
    e.preventDefault();

    const name = document.getElementById("name").value.trim();
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value.trim();
    const message = document.getElementById("message");

    const response = await fetch(REGISTER_URL, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ name, email, password })
    });

    const data = await response.json();

    if (!response.ok) {
        message.textContent = data.msg || "Registration failed";
        return;
    }

    message.style.color = "green";
    message.textContent = "Registration successful! Redirecting...";

    
    setTimeout(() => {
        window.location.href = "../html/login.html";
    }, 1500);
});
