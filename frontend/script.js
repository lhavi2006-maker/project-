// ---- CONFIG ----
// Change this if your backend runs on a different host/port
const API_BASE_URL = "http://localhost:5000/api";

// ---- STATE ----
let token = localStorage.getItem("token") || null;
let currentUser = JSON.parse(localStorage.getItem("user") || "null");
let lastAiResult = null;

// ---- DOM ELEMENTS ----
const authStatus = document.getElementById("authStatus");
const authSection = document.getElementById("authSection");
const authMessage = document.getElementById("authMessage");
const aiSection = document.getElementById("aiSection");
const createSection = document.getElementById("createSection");
const faqList = document.getElementById("faqList");

// ---- TABS ----
document.querySelectorAll(".tab-btn").forEach((btn) => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".tab-btn").forEach((b) => b.classList.remove("active"));
    document.querySelectorAll(".tab-panel").forEach((p) => p.classList.remove("active"));
    btn.classList.add("active");
    document.getElementById(btn.dataset.tab + "Form").classList.add("active");
  });
});

// ---- AUTH UI ----
function renderAuthStatus() {
  if (currentUser) {
    authStatus.innerHTML = `Logged in as <strong>${currentUser.name}</strong> <button id="logoutBtn">Logout</button>`;
    document.getElementById("logoutBtn").addEventListener("click", logout);
    authSection.classList.add("hidden");
    aiSection.classList.remove("hidden");
    createSection.classList.remove("hidden");
  } else {
    authStatus.innerHTML = "";
    authSection.classList.remove("hidden");
    aiSection.classList.add("hidden");
    createSection.classList.add("hidden");
  }
}

function logout() {
  token = null;
  currentUser = null;
  localStorage.removeItem("token");
  localStorage.removeItem("user");
  renderAuthStatus();
}

document.getElementById("loginForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  authMessage.textContent = "";
  const email = document.getElementById("loginEmail").value;
  const password = document.getElementById("loginPassword").value;

  try {
    const res = await fetch(`${API_BASE_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Login failed");

    token = data.token;
    currentUser = { _id: data._id, name: data.name, email: data.email, role: data.role };
    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(currentUser));
    renderAuthStatus();
  } catch (err) {
    authMessage.textContent = err.message;
  }
});

document.getElementById("registerForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  authMessage.textContent = "";
  const name = document.getElementById("registerName").value;
  const email = document.getElementById("registerEmail").value;
  const password = document.getElementById("registerPassword").value;

  try {
    const res = await fetch(`${API_BASE_URL}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Registration failed");

    token = data.token;
    currentUser = { _id: data._id, name: data.name, email: data.email, role: data.role };
    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(currentUser));
    renderAuthStatus();
  } catch (err) {
    authMessage.textContent = err.message;
  }
});

// ---- FAQ LIST ----
async function loadFAQs() {
  try {
    const res = await fetch(`${API_BASE_URL}/faqs`);
    const data = await res.json();
    renderFAQs(data);
  } catch (err) {
    faqList.innerHTML = `<p class="message">Could not load FAQs. Is the backend running?</p>`;
  }
}

function renderFAQs(faqs) {
  if (!faqs || faqs.length === 0) {
    faqList.innerHTML = "<p>No FAQs found.</p>";
    return;
  }

  faqList.innerHTML = faqs
    .map(
      (faq) => `
    <div class="faq-item" data-id="${faq._id}">
      <h3>${escapeHtml(faq.question)}</h3>
      <p>${escapeHtml(faq.answer)}</p>
      <p class="meta">Category: ${escapeHtml(faq.category)} • By: ${
        faq.createdBy ? escapeHtml(faq.createdBy.name) : "Unknown"
      }</p>
      ${
        currentUser && faq.createdBy && faq.createdBy._id === currentUser._id
          ? `<div class="actions">
               <button class="delete-btn" onclick="deleteFAQ('${faq._id}')">Delete</button>
             </div>`
          : ""
      }
    </div>
  `
    )
    .join("");
}

function escapeHtml(str) {
  const div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
}

async function deleteFAQ(id) {
  if (!confirm("Delete this FAQ?")) return;
  try {
    const res = await fetch(`${API_BASE_URL}/faqs/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.message || "Delete failed");
    }
    loadFAQs();
  } catch (err) {
    alert(err.message);
  }
}

// ---- CREATE FAQ ----
document.getElementById("createFaqForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  const question = document.getElementById("newQuestion").value;
  const answer = document.getElementById("newAnswer").value;
  const category = document.getElementById("newCategory").value;

  try {
    const res = await fetch(`${API_BASE_URL}/faqs`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ question, answer, category }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Could not create FAQ");

    document.getElementById("createFaqForm").reset();
    loadFAQs();
  } catch (err) {
    alert(err.message);
  }
});

// ---- SEARCH ----
document.getElementById("searchBtn").addEventListener("click", async () => {
  const q = document.getElementById("searchInput").value.trim();
  if (!q) {
    loadFAQs();
    return;
  }
  try {
    const res = await fetch(`${API_BASE_URL}/faqs/search?q=${encodeURIComponent(q)}`);
    const data = await res.json();
    renderFAQs(data);
  } catch (err) {
    faqList.innerHTML = `<p class="message">Search failed.</p>`;
  }
});

document.getElementById("clearSearchBtn").addEventListener("click", () => {
  document.getElementById("searchInput").value = "";
  loadFAQs();
});

// ---- AI GENERATE ----
document.getElementById("generateBtn").addEventListener("click", async () => {
  const topic = document.getElementById("aiTopic").value.trim();
  if (!topic) {
    alert("Please enter a topic");
    return;
  }
  try {
    const res = await fetch(`${API_BASE_URL}/ai/generate-faq`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ topic }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "AI generation failed");

    lastAiResult = data;
    document.getElementById("aiQuestion").textContent = data.generatedQuestion;
    document.getElementById("aiAnswer").textContent = data.generatedAnswer;
    document.getElementById("aiCategory").textContent = data.generatedCategory;
    document.getElementById("aiResult").classList.remove("hidden");
  } catch (err) {
    alert(err.message);
  }
});

document.getElementById("saveAiFaqBtn").addEventListener("click", async () => {
  if (!lastAiResult) return;
  try {
    const res = await fetch(`${API_BASE_URL}/faqs`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        question: lastAiResult.generatedQuestion,
        answer: lastAiResult.generatedAnswer,
        category: lastAiResult.generatedCategory,
      }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Could not save FAQ");

    document.getElementById("aiResult").classList.add("hidden");
    document.getElementById("aiTopic").value = "";
    loadFAQs();
  } catch (err) {
    alert(err.message);
  }
});

// ---- INIT ----
renderAuthStatus();
loadFAQs();
