// ===== ACERTO DE DIAS =====

// ✅ Convert ISO to dd/mm/yyyy
function formatDateBR(dateStr) {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  if (isNaN(d)) return "";
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const yyyy = d.getFullYear();
  return `${dd}/${mm}/${yyyy}`;
}

function calculateAcertoDias() {
  const ultimo   = document.getElementById("acertoDias-ultimo-display")?.value;  // real date input
  const delivery = document.getElementById("delivery-date")?.value;              // real date input
  const notice   = document.getElementById("final-notice")?.value;               // real date input
  const rentVal  = parseFloat(document.getElementById("rent-value")?.value || 0);

  const resultField = document.getElementById("acerto-dias");
  const info        = document.getElementById("acerto-info");

  const delDisp    = document.getElementById("delivery-date-display");
  const noticeDisp = document.getElementById("final-notice-display");
  const rentDisp   = document.getElementById("rent-value-display");

  if (delDisp)    delDisp.value    = formatDateBR(delivery);
  if (noticeDisp) noticeDisp.value = formatDateBR(notice);
  if (rentDisp)   rentDisp.value   = rentVal
    ? rentVal.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })
    : "-";

  // ⛔ missing required fields
  if (!ultimo || !delivery || !notice || !rentVal) {
    resultField.value = "";
    info.textContent = "";
    return;
  }

  const deliveryDate = new Date(delivery);
  const noticeDate   = new Date(notice);

  if (deliveryDate.getTime() === noticeDate.getTime()) {
    resultField.value = "R$ 0,00";
    info.textContent = "Sem diferença de dias entre a entrega e o aviso.";
    return;
  }

  const diffDays = Math.abs((deliveryDate - noticeDate) / (1000 * 60 * 60 * 24));
  const dailyVal = rentVal / 30;
  const total    = dailyVal * diffDays;

  resultField.value = total.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
  info.textContent = `Diferença de ${diffDays.toFixed(0)} dia(s) × R$ ${dailyVal.toFixed(2)} por dia.`;
}

// 🔁 Shared helper
function getDaysDiff(date1, date2) {
  if (!date1 || !date2) return 0;
  const d1 = new Date(date1);
  const d2 = new Date(date2);
  return Math.abs((d1 - d2) / (1000 * 60 * 60 * 24));
}

function updateSharedDates() {
  const delivery = document.getElementById("delivery-date")?.value || "";
  const notice   = document.getElementById("final-notice")?.value || "";
  document.querySelectorAll("#energia-delivery, #agua-delivery, #cond-delivery")
    .forEach(el => el.value = formatDateBR(delivery));
  document.querySelectorAll("#energia-notice, #agua-notice, #cond-notice")
    .forEach(el => el.value = formatDateBR(notice));
}

// 🔥 Init
document.addEventListener("DOMContentLoaded", () => {
  ["acertoDias-ultimo-display", "delivery-date", "final-notice", "rent-value"].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.addEventListener("input", calculateAcertoDias);
  });

  calculateAcertoDias();
});
