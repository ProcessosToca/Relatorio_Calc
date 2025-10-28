async function renderEntries(entries, total) {
  entriesList.innerHTML = "";
  entries.forEach(e => {
    const li = document.createElement("li");
    li.className = "list-group-item d-flex justify-content-between align-items-center";
    li.innerHTML = `
            ${e.date} — R$ ${e.value.toFixed(2)}
            <button class="btn btn-sm btn-danger delete-btn" data-id="${e.id}">Delete</button>
        `;
    entriesList.appendChild(li);
  });
  totalEl.textContent = "R$ " + total.toFixed(2);
}

function formatDateBR(dateStr) {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  if (isNaN(d)) return "";
  const dd = String(d.getDate() + 1).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const yyyy = d.getFullYear();
  return `${dd}/${mm}/${yyyy}`;
}

// Attach listeners
[
  "delivery-date", "final-notice",
  "iptu-ultimo","iptu-valor",
  "energia-ultimo", "energia-valor",
  "agua-ultimo", "agua-valor",
  "cond-ultimo", "cond-valor"
].forEach(id => {
  const el = document.getElementById(id);
  if (el) el.addEventListener("input", () => {
    calculateIptu();
    calculateEnergia();
    calculateAgua();
    calculateCondominio();
  });
});

// ===== Aviso → Final do Aviso (Add 30 Days) =====
function updateFinalNotice() {
  const noticeInput = document.getElementById("notice-date");
  const finalNotice = document.getElementById("final-notice");

  if (!noticeInput || !finalNotice) return;

  noticeInput.addEventListener("input", () => {
    const noticeDate = noticeInput.value;
    if (!noticeDate) {
      finalNotice.value = "";
      return;
    }

    const date = new Date(noticeDate);
    date.setDate(date.getDate() + 30);

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    finalNotice.value = `${year}-${month}-${day}`;
  });
}

// Run when the page loads
document.addEventListener("DOMContentLoaded", () => {
  updateFinalNotice();
});


let btnUp = document.getElementById("myBtnUp");
let btnDown = document.getElementById("myBtnDown");

// Show/Hide buttons depending on scroll position
window.onscroll = function () {
  scrollFunction();
};

function scrollFunction() {
  // Show Up button after scrolling down 20px
  if (document.body.scrollTop > 20 || document.documentElement.scrollTop > 20) {
    btnUp.style.display = "block";
  } else {
    btnUp.style.display = "none";
  }

  // Show Down button when not at bottom
  if ((window.innerHeight + window.scrollY) < document.body.offsetHeight - 20) {
    btnDown.style.display = "block";
  } else {
    btnDown.style.display = "none";
  }
}

// Scroll to top
function topFunction() {
  window.scrollTo({ top: 0, behavior: "smooth" });
}

// Scroll to bottom
function bottomFunction() {
  window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" });
}