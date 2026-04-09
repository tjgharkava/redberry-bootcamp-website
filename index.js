const API_BASE_URL = "https://api.redclass.redberryinternship.ge/api"; //ჩვენი ბუთქემფის API-ის საბაზისო URL

// და-Login-ების ელემენტები
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

// რეგისტრაციის ელემენტები 
const registerModal = document.getElementById("registerModal");
const registerOverlay = document.getElementById("registerOverlay");
const closeRegisterBtn = document.getElementById("closeRegisterBtn");
const openSignupBtn = document.querySelector(".btn-signup");
const goToLoginLink = document.getElementById("goToLoginLink");

const registerForm = document.getElementById("registerForm");
const registerSteps = document.querySelectorAll(".register-step");
const progressSteps = document.querySelectorAll(".register-progress .step");

const registerEmailInput = document.getElementById("registerEmail");
const registerPasswordInput = document.getElementById("registerPassword");
const registerConfirmPasswordInput = document.getElementById("registerConfirmPassword");
const registerUsernameInput = document.getElementById("registerUsername");
const avatarInput = document.getElementById("avatarInput");
const avatarPreview = document.getElementById("avatarPreview");

const registerEmailError = document.getElementById("registerEmailError");
const registerPasswordError = document.getElementById("registerPasswordError");
const registerConfirmPasswordError = document.getElementById("registerConfirmPasswordError");
const registerUsernameError = document.getElementById("registerUsernameError");
const registerAvatarError = document.getElementById("registerAvatarError");
const registerMessage = document.getElementById("registerMessage");

const step1NextBtn = document.getElementById("step1NextBtn");
const step2NextBtn = document.getElementById("step2NextBtn");
const registerSubmitBtn = document.getElementById("registerSubmitBtn");

const authButtons = document.getElementById("authButtons");
const userMenu = document.getElementById("user");
const userAvatar = document.getElementById("userAvatar");

const progressGrid = document.getElementById("progressGrid");
const progressOverlay = document.getElementById("progressOverlay");
const lockedLoginBtn = document.getElementById("lockedLoginBtn");


let currentRegisterStep = 1;

const registerState = {
    email: "",
    password: "",
    passwordConfirmation: "",
    username: "",
    avatar: null
};


function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// Login მოდალის ფუნქციები
function openLoginModal() {
    loginModal?.classList.remove("hidden");
}

function closeLoginModal() {
    loginModal?.classList.add("hidden");
    clearLoginErrors();
    loginForm?.reset();

    if (passwordInput) {
        passwordInput.type = "password";
    }

    if (togglePassword) {
        togglePassword.innerHTML = '<i class="fa-regular fa-eye"></i>';
    }
}

function clearLoginErrors() {
    if (emailError) emailError.textContent = "";
    if (passwordError) passwordError.textContent = "";
    if (loginMessage) loginMessage.textContent = "";
}

function validateLoginForm(email, password) {
    let isValid = true;
    clearLoginErrors();

    if (email.trim().length < 3) {
        emailError.textContent = "Email must contain at least 3 characters!";
        isValid = false;
    } else if (!isValidEmail(email)) {
        emailError.textContent = "Please enter a valid email address!";
        isValid = false;
    }

    if (password.trim().length < 8) {
        passwordError.textContent = "Password must contain at least 8 characters!";
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

// Register მოდალის ფუნქციები
function openRegisterModal() {
    registerModal?.classList.remove("hidden");
}

function closeRegisterModal() {
    registerModal?.classList.add("hidden");
    clearRegisterErrors();
    registerForm?.reset();
    resetRegisterState();
    goToRegisterStep(1);

    if (avatarPreview) {
        avatarPreview.src = "";
        avatarPreview.classList.add("hidden");
    }

    if (avatarInput) {
        avatarInput.value = "";
    }
}

function clearRegisterErrors() {
    if (registerEmailError) registerEmailError.textContent = "";
    if (registerPasswordError) registerPasswordError.textContent = "";
    if (registerConfirmPasswordError) registerConfirmPasswordError.textContent = "";
    if (registerUsernameError) registerUsernameError.textContent = "";
    if (registerAvatarError) registerAvatarError.textContent = "";
    if (registerMessage) registerMessage.textContent = "";
}

function resetRegisterState() {
    registerState.email = "";
    registerState.password = "";
    registerState.passwordConfirmation = "";
    registerState.username = "";
    registerState.avatar = null;
}

function goToRegisterStep(step) {
    currentRegisterStep = step;

    registerSteps.forEach((stepElement) => {
        stepElement.classList.add("hidden");
    });

    const currentStepElement = document.querySelector(`.register-step[data-step="${step}"]`);
    currentStepElement?.classList.remove("hidden");

    progressSteps.forEach((progressStep, index) => {
        if (index < step) {
            progressStep.classList.add("active");
        } else {
            progressStep.classList.remove("active");
        }
    });
}

function validateStep1() {
    const email = registerEmailInput.value.trim();
    clearRegisterErrors();

    if (email.length < 3) {
        registerEmailError.textContent = "Email must contain at least 3 characters.";
        return false;
    }

    if (!isValidEmail(email)) {
        registerEmailError.textContent = "Please enter a valid email address.";
        return false;
    }

    registerState.email = email;
    return true;
}

function validateStep2() {
    const password = registerPasswordInput.value.trim();
    const confirmPassword = registerConfirmPasswordInput.value.trim();

    clearRegisterErrors();

    if (password.length < 3) {
        registerPasswordError.textContent = "Password must contain at least 3 characters.";
        return false;
    }

    if (confirmPassword.length < 3) {
        registerConfirmPasswordError.textContent = "Confirm password must contain at least 3 characters.";
        return false;
    }

    if (password !== confirmPassword) {
        registerConfirmPasswordError.textContent = "Passwords do not match.";
        return false;
    }

    registerState.password = password;
    registerState.passwordConfirmation = confirmPassword;
    return true;
}

function validateStep3() {
    const username = registerUsernameInput.value.trim();
    clearRegisterErrors();

    if (username.length < 3) {
        registerUsernameError.textContent = "Username must contain at least 3 characters.";
        return false;
    }

    registerState.username = username;
    return true;
}

async function registerUser(registerState) {
    const formData = new FormData();

    formData.append("username", registerState.username);
    formData.append("email", registerState.email);
    formData.append("password", registerState.password);
    formData.append("password_confirmation", registerState.passwordConfirmation);

    if (registerState.avatar) {
        formData.append("avatar", registerState.avatar);
    }

    const response = await fetch(`${API_BASE_URL}/register`, {
        method: "POST",
        body: formData
    });

    const data = await response.json();

    return {
        ok: response.ok,
        status: response.status,
        data
    };
}

// AUTH UI 
function updateAuthUI() {
    const token = localStorage.getItem("token");
    const savedUser = localStorage.getItem("user");
    const user = savedUser ? JSON.parse(savedUser) : null;

    if (token) {
        authButtons?.classList.add("hidden");
        userMenu?.classList.remove("hidden");

        if(userAvatar) {
            userAvatar.src = user?.avatar;
        }

        unlockProgressSection();
        loadIn()
    } else {
        authButtons?.classList.remove("hidden");
    }
}

function lockProgressSection() {
    if (!progressGrid) return;

    progressGrid.classList.add("locked");

    const cards = progressGrid.querySelectorAll(".progress-card");
    cards.forEach(card => card.classList.add("blurred"));

    progressOverlay?.classList.remove("hidden");
}

function unlockProgressSection() {
    if (!progressGrid) return;

    progressGrid.classList.remove("locked");

    const cards = progressGrid.querySelectorAll(".progress-card");
    cards.forEach(card => card.classList.remove("blurred"));

    progressOverlay?.classList.add("hidden");
}

async function getInProgressCourses() {
    const token = localStorage.getItem("token");

    const response = await fetch(`${API_BASE_URL}/enrollments/in-progress`, {
        method: "GET",
        headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json"
        }
    });

    const data = await response.json();

    return {
        ok: response.ok,
        status: response.status,
        data
    };
}

async function loadInProgressCourses() {
    try {
        const result = await getInProgressCourses();

        if (!result.ok) {
            if (result.status === 401) {
                localStorage.removeItem("token");
                localStorage.removeItem("user");
                updateAuthUI();
                return;
            }

            progressGrid.innerHTML = `<p>Failed to load courses.</p>`;
            return;
        }

        const courses = result.data?.data || [];
        renderInProgressCourses(courses);
    } catch (error) {
        console.error("Failed to fetch in-progress courses:", error);
        if (progressGrid) {
            progressGrid.innerHTML = `<p>Network error while loading courses.</p>`;
        }
    }
}

// LOGIN დახურვის და გახსნის ევენთები
openLoginBtn?.addEventListener("click", openLoginModal);
closeLoginBtn?.addEventListener("click", closeLoginModal);
modalOverlay?.addEventListener("click", closeLoginModal);

// Login პაროლის ხილვადობა
togglePassword?.addEventListener("click", () => {
    if (passwordInput.type === "password") {
        passwordInput.type = "text";
        togglePassword.innerHTML = '<i class="fa-regular fa-eye-slash"></i>';
    } else {
        passwordInput.type = "password";
        togglePassword.innerHTML = '<i class="fa-regular fa-eye"></i>';
    }
});

// Login Submit ფორმა
loginForm?.addEventListener("submit", async (event) => {
    event.preventDefault();

    const email = emailInput.value.trim();
    const password = passwordInput.value.trim();

    const isFormValid = validateLoginForm(email, password);

    if (!isFormValid) return;

    try {
        loginSubmitBtn.disabled = true;
        loginSubmitBtn.textContent = "Logging in...";
        loginMessage.textContent = "";

        const result = await loginUser(email, password);

        if (!result.ok) {
            if (result.status === 401) {
                loginMessage.textContent = result.data.message || "Invalid credentials.";
            } else {
                loginMessage.textContent = result.data?.message || "Something went wrong. Please try again.";
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

// რეგისტრაციის გახსნა, დახურვა და სხვა ევენთები
openSignupBtn?.addEventListener("click", openRegisterModal);
closeRegisterBtn?.addEventListener("click", closeRegisterModal);
registerOverlay?.addEventListener("click", closeRegisterModal);

// რეგისტრაციადან Login-ზე გადასვლა
goToLoginLink?.addEventListener("click", (event) => {
    event.preventDefault();
    closeRegisterModal();
    openLoginModal();
});

// პირველი ნაბიჯი რეგისტრაციაში
step1NextBtn?.addEventListener("click", () => {
    if (validateStep1()) {
        goToRegisterStep(2);
    }
});

// მეორე ნაბიჯი რეგისტრაციაში
step2NextBtn?.addEventListener("click", () => {
    if (validateStep2()) {
        goToRegisterStep(3);
    }
});

// ფაილის ატვირთვის ევენთი
avatarInput?.addEventListener("change", () => {
    registerAvatarError.textContent = "";

    const file = avatarInput.files[0];

    if (!file) {
        registerState.avatar = null;
        avatarPreview.src = "";
        avatarPreview.classList.add("hidden");
        return;
    }

    const allowedTypes = ["image/jpeg", "image/png", "image/webp"];

    if (!allowedTypes.includes(file.type)) {
        registerAvatarError.textContent = "Avatar must be JPG, PNG or WebP.";
        avatarInput.value = "";
        registerState.avatar = null;
        avatarPreview.src = "";
        avatarPreview.classList.add("hidden");
        return;
    }

    registerState.avatar = file;

    const imageUrl = URL.createObjectURL(file);
    avatarPreview.src = imageUrl;
    avatarPreview.classList.remove("hidden");
});

// რეგისტრაციის Submit ფორმა
registerForm?.addEventListener("submit", async (event) => {
    event.preventDefault();

    const isStepValid = validateStep3();

    if (!isStepValid) return;

    try {
        registerSubmitBtn.disabled = true;
        registerSubmitBtn.textContent = "Signing up...";
        registerMessage.textContent = "";

        const result = await registerUser(registerState);

        if (!result.ok) {
            if (result.status === 422) {
                const errors = result.data?.errors || {};

                if (errors.email) {
                    registerEmailError.textContent = errors.email[0];
                }

                if (errors.username) {
                    registerUsernameError.textContent = errors.username[0];
                }

                if (errors.password) {
                    registerPasswordError.textContent = errors.password[0];
                }

                if (errors.password_confirmation) {
                    registerConfirmPasswordError.textContent = errors.password_confirmation[0];
                }

                if (errors.avatar) {
                    registerAvatarError.textContent = errors.avatar[0];
                }

                registerMessage.textContent = result.data?.message || "Validation error.";
            } else {
                registerMessage.textContent = result.data?.message || "Something went wrong. Please try again.";
            }

            return;
        }

        const token = result.data?.data?.token;
        const user = result.data?.data?.user;

        if (!token) {
            registerMessage.textContent = "Token was not returned.";
            return;
        }

        localStorage.setItem("token", token);
        localStorage.setItem("user", JSON.stringify(user));

        closeRegisterModal();
        updateAuthUI();

        console.log("Registration successful");
        console.log(user);
    } catch (error) {
        console.error("Register error:", error);
        registerMessage.textContent = "Network error. Please try again.";
    } finally {
        registerSubmitBtn.disabled = false;
        registerSubmitBtn.textContent = "Sign Up";
    }
});

// შედეგი საიტზე რომ მომხმარებელი არის თუ არა ავტორიზებული და რეგისტრაციის პირველი ნაბიჯის ჩვენება
updateAuthUI();
goToRegisterStep(1);