// ===== ACERTO DE DIAS CALCULATION =====
function formatDateBR(dateStr) {
  if (!dateStr) return "-";
  const [year, month, day] = dateStr.split("-");
  if (!year || !month || !day) return "-";
  return `${day.padStart(2, "0")}/${month.padStart(2, "0")}/${year}`;
}


function calculateAcertoDias() {
  const lastRent = document.getElementById("last-rent")?.value || "";
  const delivery = document.getElementById("delivery-date")?.value || "";
  const notice = document.getElementById("final-notice")?.value || "";
  const rentValue = parseFloat(document.getElementById("rent-value")?.value || 0);

  const resultField = document.getElementById("acerto-dias");
  const infoBox = document.getElementById("acerto-info");

  // ✅ Update display inputs in dd/mm/yyyy
  document.getElementById("last-rent-display").value = formatDateBR(lastRent);
  document.getElementById("delivery-date-display").value = formatDateBR(delivery);
  document.getElementById("final-notice-display").value = formatDateBR(notice);
  document.getElementById("rent-value-display").value = rentValue
    ? rentValue.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })
    : "-";

  // Missing data check
  if (!delivery || !notice || !rentValue) {
    resultField.value = "";
    infoBox.textContent = "";
    return;
  }

  const deliveryDate = new Date(delivery);
  const noticeDate = new Date(notice);

  // If same date → no calc
  if (deliveryDate.getTime() === noticeDate.getTime()) {
    resultField.value = "R$ 0,00";
    infoBox.textContent = "Sem diferença de dias entre a entrega e o aviso.";
    return;
  }

  // Difference in days
  const diffDays = Math.abs((deliveryDate - noticeDate) / (1000 * 60 * 60 * 24));
  const dailyValue = rentValue / 30;
  const acertoValue = dailyValue * diffDays;

  // Format result
  resultField.value = acertoValue.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });

  infoBox.textContent = `Diferença de ${diffDays.toFixed(0)} dia(s) × R$ ${dailyValue.toFixed(2)} por dia.`;
}

// Auto-recalculate when source fields change
["last-rent", "delivery-date", "final-notice", "rent-value"].forEach((id) => {
  const el = document.getElementById(id);
  if (el) el.addEventListener("input", calculateAcertoDias);
});

function getDaysDiff(date1, date2) {
  if (!date1 || !date2) return 0;
  const d1 = new Date(date1);
  const d2 = new Date(date2);
  return Math.abs((d1 - d2) / (1000 * 60 * 60 * 24));
}

function updateSharedDates() {
  const delivery = document.getElementById("delivery-date")?.value || "";
  const notice = document.getElementById("final-notice")?.value || "";
  document.querySelectorAll("#energia-delivery, #agua-delivery, #cond-delivery")
    .forEach(el => el.value = formatDateBR(delivery));
  document.querySelectorAll("#energia-notice, #agua-notice, #cond-notice")
    .forEach(el => el.value = formatDateBR(notice));
}