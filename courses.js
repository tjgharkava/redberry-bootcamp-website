const API_BASE_URL = "https://api.redclass.redberryinternship.ge/api";

const coursesGrid = document.getElementById("coursesGrid");
const resultsText = document.getElementById("resultsText");
const sortSelect = document.getElementById("sortSelect");
const pagination = document.getElementById("pagination");

const categoriesContainer = document.getElementById("categoriesContainer");
const topicsContainer = document.getElementById("topicsContainer");
const instructorsContainer = document.getElementById("instructorsContainer");
const clearFiltersBtn = document.getElementById("clearFiltersBtn");
const activeFiltersCount = document.getElementById("activeFiltersCount");

const state = {
    categories: [],
    topics: [],
    instructors: [],
    sort: "newest",
    page: 1
};

let allCourses = [];
let allCategories = [];
let allTopics = [];
let allInstructors = [];
let topicToCategoryMap = new Map();

function escapeHtml(value) {
    return String(value ?? "")
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}

function truncateText(text, maxLength = 95) {
    if (!text) return "";
    return text.length > maxLength ? text.slice(0, maxLength).trim() + "..." : text;
}

function buildCoursesUrl() {
    const params = new URLSearchParams();

    state.categories.forEach((id) => params.append("categories[]", id));
    state.topics.forEach((id) => params.append("topics[]", id));
    state.instructors.forEach((id) => params.append("instructors[]", id));
    params.append("sort", state.sort);
    params.append("page", state.page);

    return `${API_BASE_URL}/courses?${params.toString()}`;
}

async function fetchCourses() {
    const response = await fetch(buildCoursesUrl());

    if (!response.ok) {
        throw new Error(`Failed to fetch courses: ${response.status}`);
    }

    return response.json();
}

// ყველა კურსის წამოღება
async function fetchAllCoursesForFilters() {
    let page = 1;
    let lastPage = 1;
    const collected = [];

    do {
        const response = await fetch(`${API_BASE_URL}/courses?page=${page}&sort=newest`);

        if (!response.ok) {
            throw new Error(`Failed to fetch all courses: ${response.status}`);
        }

        const result = await response.json();

        collected.push(...result.data);
        lastPage = result.meta.lastPage;
        page++;
    } while (page <= lastPage);

    return collected;
}

function buildFilterData(courses) {
    const categoryMap = new Map();
    const topicMap = new Map();
    const instructorMap = new Map();
    topicToCategoryMap = new Map();

    courses.forEach((course) => {
        if (course.category) {
            categoryMap.set(course.category.id, {
                id: course.category.id,
                name: course.category.name
            });
        }

        if (course.topic) {
            topicMap.set(course.topic.id, {
                id: course.topic.id,
                name: course.topic.name
            });

            if (course.category) {
                topicToCategoryMap.set(course.topic.id, course.category.id);
            }
        }

        if (course.instructor) {
            instructorMap.set(course.instructor.id, {
                id: course.instructor.id,
                name: course.instructor.name,
                avatar: course.instructor.avatar
            });
        }
    });

    allCategories = [...categoryMap.values()].sort((a, b) => a.name.localeCompare(b.name));
    allTopics = [...topicMap.values()].sort((a, b) => a.name.localeCompare(b.name));
    allInstructors = [...instructorMap.values()].sort((a, b) => a.name.localeCompare(b.name));
}

function renderCategories() {
    categoriesContainer.innerHTML = allCategories.map((category) => {
        const checked = state.categories.includes(category.id);

        return `
            <label class="filter-pill ${checked ? "active" : ""}">
                <input 
                    type="checkbox" 
                    class="category-checkbox" 
                    value="${category.id}" 
                    ${checked ? "checked" : ""}
                >
                <span>${escapeHtml(category.name)}</span>
            </label>
        `;
    }).join("");

    categoriesContainer.querySelectorAll(".category-checkbox").forEach((checkbox) => {
        checkbox.addEventListener("change", () => {
            const id = Number(checkbox.value);

            if (checkbox.checked) {
                if (!state.categories.includes(id)) {
                    state.categories.push(id);
                }
            } else {
                state.categories = state.categories.filter((item) => item !== id);
            }

            // თემები რომ category-ს მოერგოს
            const visibleTopicIds = getVisibleTopics().map((topic) => topic.id);
            state.topics = state.topics.filter((topicId) => visibleTopicIds.includes(topicId));

            state.page = 1;
            renderCategories();
            renderTopics();
            updateActiveFiltersCount();
            loadCourses();
        });
    });
}

function getVisibleTopics() {
    if (!state.categories.length) {
        return allTopics;
    }

    return allTopics.filter((topic) => {
        const categoryId = topicToCategoryMap.get(topic.id);
        return state.categories.includes(categoryId);
    });
}

function renderTopics() {
    const visibleTopics = getVisibleTopics();

    topicsContainer.innerHTML = visibleTopics.map((topic) => {
        const checked = state.topics.includes(topic.id);

        return `
            <label class="filter-pill ${checked ? "active" : ""}">
                <input 
                    type="checkbox" 
                    class="topic-checkbox" 
                    value="${topic.id}" 
                    ${checked ? "checked" : ""}
                >
                <span>${escapeHtml(topic.name)}</span>
            </label>
        `;
    }).join("");

    topicsContainer.querySelectorAll(".topic-checkbox").forEach((checkbox) => {
        checkbox.addEventListener("change", () => {
            const id = Number(checkbox.value);

            if (checkbox.checked) {
                if (!state.topics.includes(id)) {
                    state.topics.push(id);
                }
            } else {
                state.topics = state.topics.filter((item) => item !== id);
            }

            state.page = 1;
            renderTopics();
            updateActiveFiltersCount();
            loadCourses();
        });
    });
}

function renderInstructors() {
    instructorsContainer.innerHTML = allInstructors.map((instructor) => {
        const checked = state.instructors.includes(instructor.id);

        return `
            <label class="instructor-item ${checked ? "active" : ""}">
                <input 
                    type="checkbox" 
                    class="instructor-checkbox" 
                    value="${instructor.id}" 
                    ${checked ? "checked" : ""}
                >
                <img src="${escapeHtml(instructor.avatar)}" alt="${escapeHtml(instructor.name)}">
                <span>${escapeHtml(instructor.name)}</span>
            </label>
        `;
    }).join("");

    instructorsContainer.querySelectorAll(".instructor-checkbox").forEach((checkbox) => {
        checkbox.addEventListener("change", () => {
            const id = Number(checkbox.value);

            if (checkbox.checked) {
                if (!state.instructors.includes(id)) {
                    state.instructors.push(id);
                }
            } else {
                state.instructors = state.instructors.filter((item) => item !== id);
            }

            state.page = 1;
            renderInstructors();
            updateActiveFiltersCount();
            loadCourses();
        });
    });
}

function createCourseCard(course) {
    return `
        <article class="course-card" data-course-id="${course.id}">
            <img src="${escapeHtml(course.image)}" alt="${escapeHtml(course.title)}">

            <div class="course-card-body">
                <div class="course-meta">
                    <span>${escapeHtml(course.category.name)} • ${course.durationWeeks} Weeks</span>
                    <span><i class="fa-solid fa-star"></i> ${course.avgRating}</span>
                </div>

                <h3>${escapeHtml(course.title)}</h3>

                <span class="course-badge">
                    ${escapeHtml(course.category.name)}
                </span>

                <p>${escapeHtml(truncateText(course.description))}</p>

                <div class="course-footer">
                    <div>
                        <small>Starting from</small>
                        <p>$${Number(course.basePrice).toFixed(0)}</p>
                    </div>

                    <button class="details-btn" data-course-id="${course.id}">
                        Details
                    </button>
                </div>
            </div>
        </article>
    `;
}

function renderCourses(courses, meta) {
    if (!courses.length) {
        coursesGrid.innerHTML = `<p class="empty-state">No courses found</p>`;
        resultsText.textContent = "No courses found";
        pagination.innerHTML = "";
        return;
    }

    coursesGrid.innerHTML = courses.map(createCourseCard).join("");
    resultsText.textContent = `Showing ${courses.length} courses`;

    coursesGrid.querySelectorAll("[data-course-id]").forEach((element) => {
        element.addEventListener("click", (event) => {
            const courseId = event.currentTarget.dataset.courseId;
            window.location.href = `course-details.html?id=${courseId}`;
        });
    });

    renderPagination(meta);
}

function renderPagination(meta) {
    if (!meta || meta.lastPage <= 1) {
        pagination.innerHTML = "";
        return;
    }

    let html = `
        <button class="page-arrow" data-page="${Math.max(1, meta.currentPage - 1)}" ${meta.currentPage === 1 ? "disabled" : ""}>
            <i class="fa-solid fa-angle-left"></i>
        </button>
    `;

    for (let page = 1; page <= meta.lastPage; page++) {
        html += `
            <button class="${page === meta.currentPage ? "active" : ""}" data-page="${page}">
                ${page}
            </button>
        `;
    }

    html += `
        <button class="page-arrow" data-page="${Math.min(meta.lastPage, meta.currentPage + 1)}" ${meta.currentPage === meta.lastPage ? "disabled" : ""}>
            <i class="fa-solid fa-angle-right"></i>
        </button>
    `;

    pagination.innerHTML = html;

    pagination.querySelectorAll("[data-page]").forEach((button) => {
        button.addEventListener("click", () => {
            if (button.disabled) return;
            state.page = Number(button.dataset.page);
            loadCourses();
            window.scrollTo({ top: 0, behavior: "smooth" });
        });
    });
}

function updateActiveFiltersCount() {
    const total =
        state.categories.length +
        state.topics.length +
        state.instructors.length;

    activeFiltersCount.textContent = `${total} filters active`;
}

function clearAllFilters() {
    state.categories = [];
    state.topics = [];
    state.instructors = [];
    state.sort = "newest";
    state.page = 1;

    if (sortSelect) {
        sortSelect.value = "newest";
    }

    renderCategories();
    renderTopics();
    renderInstructors();
    updateActiveFiltersCount();
    loadCourses();
}

async function loadCourses() {
    try {
        const result = await fetchCourses();
        renderCourses(result.data, result.meta);
    } catch (error) {
        console.error(error);
        coursesGrid.innerHTML = `<p class="empty-state">Failed to load courses</p>`;
        resultsText.textContent = "No courses found";
        pagination.innerHTML = "";
    }
}

async function initBrowsePage() {
    try {
        allCourses = await fetchAllCoursesForFilters();
        buildFilterData(allCourses);

        renderCategories();
        renderTopics();
        renderInstructors();
        updateActiveFiltersCount();

        sortSelect?.addEventListener("change", () => {
            state.sort = sortSelect.value;
            state.page = 1;
            loadCourses();
        });

        clearFiltersBtn?.addEventListener("click", clearAllFilters);

        await loadCourses();
    } catch (error) {
        console.error("Browse init failed:", error);
        coursesGrid.innerHTML = `<p class="empty-state">Failed to load page</p>`;
    }
}

const registerModal = document.getElementById("registerModal");
const registerOverlay = document.getElementById("registerOverlay");
const closeRegisterBtn = document.getElementById("closeRegisterBtn");
const openSignupBtn = document.getElementById("openSignupBtn");
const goToLoginLink = document.getElementById("goToLoginLink");
const goToRegisterLink = document.getElementById("goToRegisterLink");

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

initBrowsePage();