const API_BASE_URL = "https://api.redclass.redberryinternship.ge/api";

const loginModal = document.getElementById("loginModal");
const modalOverlay = document.getElementById("modalOverlay");
const closeLoginBtn = document.getElementById("closeLoginBtn");
const loginForm = document.getElementById("loginForm");
const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");
const togglePassword = document.getElementById("togglePassword");
const openLoginBtn = document.getElementById("openLoginBtn");
const emailError = document.getElementById("emailError");
const passwordError = document.getElementById("passwordError");
const loginMessage = document.getElementById("loginMessage");
const loginSubmitBtn = document.getElementById("loginSubmitBtn");

function openLoginModal() {
    loginModal.classList.remove("hidden");
}

function closeLoginModal() {
    loginModal.classList.add("hidden");
    clearErrors();
    loginForm.reset();
    passwordInput.type = "password";
    togglePassword.innerHTML = '<i class="fa-regular fa-eye"></i>';
}

function clearErrors() {
    emailError.textContent = "";
    passwordError.textContent = "";
    loginMessage.textContent = "";
}

function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

function validateLoginForm(email, password) {
    let isValid = true;
    clearErrors();

    if (email.trim().length < 3) {
        emailError.textContent = "Email must contain at least 3 characters!";
        isValid = false;
    } else if (!isValidEmail(email)) {
        emailError.textContent = "Please enter a valid email address!";
        isValid = false;
    }

    if (password.trim().length < 3) {
        passwordError.textContent = "Password must contain at least 3 characters!";
        isValid = false;
    }

    return isValid;
}

async function loginUser(email, password) {
    const response = await fetch(`${API_BASE_URL}/login`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ email, password })
    });

    const data = await response.json();

    return {
        ok: response.ok,
        status: response.status,
        data: data
    };
}

function updateAuthUI() {
    const token = localStorage.getItem("token");
    const authButtons = document.querySelector(".auth-buttons");

    if (token) {
        authButtons?.classList.add("hidden");
    } else {
        authButtons?.classList.remove("hidden");
    }
}

// listeners გარეთ უნდა იყოს
openLoginBtn?.addEventListener("click", openLoginModal);
closeLoginBtn?.addEventListener("click", closeLoginModal);
modalOverlay?.addEventListener("click", closeLoginModal);

togglePassword?.addEventListener("click", () => {
    if (passwordInput.type === "password") {
        passwordInput.type = "text";
        togglePassword.innerHTML = '<i class="fa-regular fa-eye-slash"></i>';
    } else {
        passwordInput.type = "password";
        togglePassword.innerHTML = '<i class="fa-regular fa-eye"></i>';
    }
});

loginForm?.addEventListener("submit", async (event) => {
    event.preventDefault();

    const email = emailInput.value.trim();
    const password = passwordInput.value.trim();

    const isFormValid = validateLoginForm(email, password);

    if (!isFormValid) {
        return;
    }

    try {
        loginSubmitBtn.disabled = true;
        loginSubmitBtn.textContent = "Logging in...";
        loginMessage.textContent = "";

        const result = await loginUser(email, password);

        if (!result.ok) {
            if (result.status === 401) {
                loginMessage.textContent = result.data.message || "Invalid credentials.";
            } else {
                loginMessage.textContent = "Something went wrong. Please try again.";
            }
            return;
        }

        const token = result.data?.data?.token;
        const user = result.data?.data?.user;

        if (!token) {
            loginMessage.textContent = "Token was not returned.";
            return;
        }

        localStorage.setItem("token", token);
        localStorage.setItem("user", JSON.stringify(user));

        closeLoginModal();
        updateAuthUI();

        console.log("Login successful");
        console.log(user);

    } catch (error) {
        console.error("Login error:", error);
        loginMessage.textContent = "Network error. Please try again.";
    } finally {
        loginSubmitBtn.disabled = false;
        loginSubmitBtn.textContent = "Log In";
    }
});

updateAuthUI();