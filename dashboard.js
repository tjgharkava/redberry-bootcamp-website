const API_BASE_URL = "https://api.redclass.redberryinternship.ge/api";

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

const openEnrolledSidebarBtn = document.getElementById("openEnrolledSidebar");
const enrolledSidebar = document.getElementById("enrolledSidebar");
const closeEnrolledSidebarBtn = document.getElementById("closeEnrolledSidebar");
const enrolledSidebarBackdrop = document.getElementById("enrolledSidebarBackdrop");
const enrolledSidebarList = document.querySelector(".enrolled-sidebar-list");
const openSeeAllLink = document.getElementById("openEnrolledFromProgress");

function getToken() {
    return localStorage.getItem("token");
}

function getAuthHeaders() {
    const token = getToken();

    return {
        Accept: "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {})
    };
}

function openSidebar() {
    enrolledSidebar?.classList.add("active");
    enrolledSidebarBackdrop?.classList.add("active");
    document.body.classList.add("sidebar-open");
}

function closeSidebar() {
    enrolledSidebar?.classList.remove("active");
    enrolledSidebarBackdrop?.classList.remove("active");
    document.body.classList.remove("sidebar-open");
}

function formatPrice(value) {
    return `$${Number(value || 0).toFixed(0)}`;
}

function escapeHtml(value) {
    return String(value ?? "")
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}

async function fetchEnrollments() {
    const response = await fetch(`${API_BASE_URL}/enrollments`, {
        headers: getAuthHeaders()
    });

    const result = await response.json();

    if (!response.ok) {
        throw {
            status: response.status,
            message: result?.message || "Failed to fetch enrollments"
        };
    }

    return result.data || [];
}

function renderEnrollmentsSummary(enrollments) {
    const headerRight = document.querySelector(".enrolled-header-right span");

    if (!headerRight) return;

    const totalEnrollments = enrollments.reduce(
        (sum, item) => sum + Number(item.quantity || 0),
        0
    );

    const totalPrice = enrollments.reduce(
        (sum, item) => sum + Number(item.totalPrice || 0),
        0
    );

    headerRight.innerHTML = `
        Total Enrollments <strong>${totalEnrollments}</strong> · Total Price <strong>${formatPrice(totalPrice)}</strong>
    `;
}

function createEnrollmentCard(enrollment) {
    const course = enrollment.course || {};
    const schedule = enrollment.schedule || {};
    const weekly = schedule.weeklySchedule || {};
    const timeSlot = schedule.timeSlot || {};
    const sessionType = schedule.sessionType || {};

    return `
        <article class="enrolled-course-card" data-course-id="${course.id}">
            <img src="${escapeHtml(course.image || "background-images/course-background-image.jpg")}" alt="${escapeHtml(course.title || "Course")}">

            <div class="enrolled-course-content">
                <div class="enrolled-course-top">
                    <span>Instructor ${escapeHtml(course.instructor?.name || "Instructor")}</span>
                    <span><i class="fa-solid fa-star"></i> ${escapeHtml(course.avgRating || "0")}</span>
                </div>

                <h3>${escapeHtml(course.title || "Untitled Course")}</h3>

                <ul class="enrolled-course-meta">
                    <li><i class="fa-regular fa-calendar"></i> ${escapeHtml(weekly.label || "No schedule")}</li>
                    <li><i class="fa-regular fa-clock"></i> ${escapeHtml(timeSlot.label || "No time slot")}</li>
                    <li><i class="fa-regular fa-circle"></i> ${escapeHtml(sessionType.name || "No session type")}</li>
                    <li><i class="fa-solid fa-location-dot"></i> ${escapeHtml(schedule.location || sessionType.location || "—")}</li>
                    <li><i class="fa-solid fa-money-bill"></i> ${formatPrice(enrollment.totalPrice)}</li>
                </ul>

                <div class="enrolled-course-bottom">
                    <div class="enrolled-progress-block">
                        <span>${Number(enrollment.progress || 0)}% Complete</span>
                        <div class="enrolled-progress-bar">
                            <div class="enrolled-progress-fill" style="width: ${Number(enrollment.progress || 0)}%;"></div>
                        </div>
                    </div>

                    <button type="button" class="enrolled-view-btn" data-course-id="${course.id}">
                        View
                    </button>
                </div>
            </div>
        </article>
    `;
}

function renderEmptyEnrollments() {
    if (!enrolledSidebarList) return;

    enrolledSidebarList.innerHTML = `
        <div class="empty-enrollments-state">
            <div class="empty-enrollments-icon">
                <i class="fa-solid fa-book-open"></i>
            </div>
            <h3>Your learning journey starts here!</h3>
            <p>Browse courses to get started and build your enrolled list.</p>
            <a href="courses.html" class="empty-enrollments-btn">Browse Courses</a>
        </div>
    `;
}

function renderEnrollments(enrollments) {
    if (!enrolledSidebarList) return;

    if (!enrollments.length) {
        renderEmptyEnrollments();
        renderEnrollmentsSummary([]);
        return;
    }

    enrolledSidebarList.innerHTML = enrollments.map(createEnrollmentCard).join("");
    renderEnrollmentsSummary(enrollments);

    enrolledSidebarList.querySelectorAll("[data-course-id]").forEach((element) => {
        element.addEventListener("click", (event) => {
            const courseId = event.currentTarget.dataset.courseId;
            window.location.href = `course-details.html?id=${courseId}`;
        });
    });
}

async function openEnrolledSidebarFlow(event) {
    event?.preventDefault();

    if (!getToken()) {
        openLoginModal?.();
        return;
    }

    openSidebar();

    if (enrolledSidebarList) {
        enrolledSidebarList.innerHTML = `<p>Loading enrollments...</p>`;
    }

    try {
        const enrollments = await fetchEnrollments();
        renderEnrollments(enrollments);
    } catch (error) {
        if (error.status === 401) {
            closeSidebar();
            openLoginModal?.();
            return;
        }

        if (enrolledSidebarList) {
            enrolledSidebarList.innerHTML = `
                <div class="empty-enrollments-state">
                    <h3>Could not load enrollments</h3>
                    <p>${escapeHtml(error.message || "Please try again later.")}</p>
                </div>
            `;
        }
    }
}

openEnrolledSidebarBtn?.addEventListener("click", openEnrolledSidebarFlow);
openSeeAllLink?.addEventListener("click", openEnrolledSidebarFlow);
closeEnrolledSidebarBtn?.addEventListener("click", closeSidebar);
enrolledSidebarBackdrop?.addEventListener("click", closeSidebar);

// ფუნქციების გამოძახება
renderAgeOptions();
loadSavedProfileAvatar();
loadSavedUserInfo();
updateSlider();
startSlider();
closeProfileModal();