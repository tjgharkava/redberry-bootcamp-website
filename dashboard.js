// hero slider
const slides = document.querySelectorAll(".slide");
const prevBtn = document.getElementById("previousSlide");
const nextBtn = document.getElementById("nextSlide");
const carousels = document.querySelectorAll(".carousel");

let currentSlide = 0;
let sliderInterval;

function updateSlider() {
    slides.forEach((slide, index) => {
        slide.classList.toggle("active", index === currentSlide);
    });

    carousels.forEach((dot, index) => {
        dot.classList.toggle("active", index === currentSlide);
    });
}

function showNextSlide() {
    if (!slides.length) return;
    currentSlide = (currentSlide + 1) % slides.length;
    updateSlider();
}

function showPrevSlide() {
    if (!slides.length) return;
    currentSlide = (currentSlide - 1 + slides.length) % slides.length;
    updateSlider();
}

function startSlider() {
    if (!slides.length) return;
    sliderInterval = setInterval(showNextSlide, 5000);
}

function resetSlider() {
    clearInterval(sliderInterval);
    startSlider();
}

nextBtn?.addEventListener("click", () => {
    showNextSlide();
    resetSlider();
});

prevBtn?.addEventListener("click", () => {
    showPrevSlide();
    resetSlider();
});

carousels.forEach((dot, index) => {
    dot.addEventListener("click", () => {
        currentSlide = index;
        updateSlider();
        resetSlider();
    });
});

// profile მოდალი
const profileModal = document.getElementById("profileModal");
const profileOverlay = document.getElementById("profileOverlay");
const closeProfileBtn = document.getElementById("closeProfileBtn");
const openProfileBtn = document.getElementById("openProfileBtn");

function openProfileModal() {
    profileModal?.classList.remove("hidden");
}

function closeProfileModal() {
    profileModal?.classList.add("hidden");
}

openProfileBtn?.addEventListener("click", openProfileModal);
closeProfileBtn?.addEventListener("click", closeProfileModal);
profileOverlay?.addEventListener("click", closeProfileModal);


// profile
const profileAvatar = document.querySelector(".profile-avatar");
const profileUsername = document.querySelector(".profile-user-info h3");

const profileFullName = document.getElementById("profileFullName");
const profileEmail = document.getElementById("profileEmail");
const profilePhone = document.getElementById("profilePhone");
const profileAge = document.getElementById("profileAge");

const uploadBox = document.getElementById("uploadBox");
const profileAvatarInput = document.getElementById("profileAvatarInput");

const headerProfileImage = document.getElementById("headerProfileImage");
const headerProfileIcon = document.getElementById("headerProfileIcon");

// ასაკების options-ის დინამიურად შექმნა 16-დან 80-მდე
function renderAgeOptions() {
    if (!profileAge) return;

    profileAge.innerHTML = '<option value="">Select age</option>';

    for (let age = 16; age <= 80; age++) {
        const option = document.createElement("option");
        option.value = age;
        option.textContent = age;
        profileAge.appendChild(option);
    }
}

// upload box click => input open
uploadBox?.addEventListener("click", () => {
    profileAvatarInput?.click();
});

// პროფილის ფოტოს არჩევა და შენახვა localStorage-ში
profileAvatarInput?.addEventListener("change", () => {
    const file = profileAvatarInput.files?.[0];
    if (!file) return;

    const allowedTypes = ["image/jpeg", "image/png", "image/webp"];

    if (!allowedTypes.includes(file.type)) {
        alert("Please upload JPG, PNG, or WEBP image.");
        profileAvatarInput.value = "";
        return;
    }

    const reader = new FileReader();

    reader.onload = function (event) {
        const imageDataUrl = event.target?.result;
        if (!imageDataUrl) return;

        if (profileAvatar) {
            profileAvatar.src = imageDataUrl;
        }

        if (headerProfileImage && headerProfileIcon) {
            headerProfileImage.src = imageDataUrl;
            headerProfileImage.classList.remove("hidden");
            headerProfileIcon.classList.add("hidden");
        }

        localStorage.setItem("profileAvatar", imageDataUrl);
    };

    reader.readAsDataURL(file);
});

// ჩატვირთული პროფილის სურათის შენახვა და აჩვენება header-ში და პროფილის გვერდზე
function loadSavedProfileAvatar() {
    const savedAvatar = localStorage.getItem("profileAvatar");

    if (savedAvatar && headerProfileImage && headerProfileIcon) {
        headerProfileImage.src = savedAvatar;
        headerProfileImage.classList.remove("hidden");
        headerProfileIcon.classList.add("hidden");
    }

    if (savedAvatar && profileAvatar) {
        profileAvatar.src = savedAvatar;
    }
}

// user ინფორმაციის შენახვა
function loadSavedUserInfo() {
    const savedUser = localStorage.getItem("user");

    if (!savedUser) return;

    try {
        const user = JSON.parse(savedUser);

        if (profileUsername && user.username) {
            profileUsername.textContent = user.username;
        }

        if (profileFullName && user.username) {
            profileFullName.value = user.username;
        }

        if (profileEmail && user.email) {
            profileEmail.value = user.email;
        }
    } catch (error) {
        console.error("Failed to parse saved user:", error);
    }
}

// ფუნქციების გამოძახება
renderAgeOptions();
loadSavedProfileAvatar();
loadSavedUserInfo();
updateSlider();
startSlider();
closeProfileModal();