document.addEventListener("DOMContentLoaded", () => {
  const yesOption = document.getElementById("yesOption");
  const noOption = document.getElementById("noOption");
  const dateInputs = document.getElementById("dateInputs");

  function toggleDateInputs() {
    if (yesOption.checked) {
      dateInputs.style.display = "block";
      dateInputs.classList.add("animate__animated", "animate__fadeIn");
    } else {
      dateInputs.style.display = "none";
    }
  }

  yesOption.addEventListener("change", toggleDateInputs);
  noOption.addEventListener("change", toggleDateInputs);
});

// ✅ Format BRL properly
function formatCurrencyBRL(value) {
  if (isNaN(value) || value === null) return "";
  return Number(value).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

// ✅ Convert ISO date (yyyy-mm-dd) → BR format (dd/mm/yyyy)
function formatDateBR(dateStr) {
  if (!dateStr) return "";
  const [year, month, day] = dateStr.split("-");
  if (!year || !month || !day) return "";
  return `${day.padStart(2, "0")}/${month.padStart(2, "0")}/${year}`;
}

// ✅ Convert BR format (dd/mm/yyyy) → ISO format (yyyy-mm-dd)
function formatDateISO(brDateStr) {
  if (!brDateStr) return "";
  const [day, month, year] = brDateStr.split("/");
  if (!day || !month || !year) return "";
  return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
}

// ✅ Mirror delivery date and rent value from above sections
function mirrorMultaInputs() {
  const originalDelivery = document.getElementById("delivery-date"); // existing Acerto de Dias input
  const originalRent = document.getElementById("rent-value");        // existing Valor Aluguel input

  const multaDelivery = document.getElementById("delivery-date-multa");
  const multaRent = document.getElementById("rent-value-multa");

  // 🟡 Mirror and format delivery date
  if (originalDelivery && multaDelivery) {
    originalDelivery.addEventListener("input", () => {
      multaDelivery.value = formatDateBR(originalDelivery.value);
    });
    // initialize on load
    multaDelivery.value = formatDateBR(originalDelivery.value);
  }

  // 🟢 Mirror and format rent value
  if (originalRent && multaRent) {
    originalRent.addEventListener("input", () => {
      const val = parseFloat(originalRent.value || 0);
      multaRent.value = formatCurrencyBRL(val);
    });
    // initialize on load
    multaRent.value = formatCurrencyBRL(parseFloat(originalRent.value || 0));
  }
}

// 🚀 Run once when page loads
document.addEventListener("DOMContentLoaded", mirrorMultaInputs);

// ✅ Get difference in months between two dates
function getMonthsAndDaysDiff(date1, date2) {
  const d1 = new Date(date1);
  const d2 = new Date(date2);
  const diffMs = Math.abs(d1 - d2);
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const months = Math.floor(diffDays / 30);
  const remainingDays = diffDays % 30;
  return { months, remainingDays };
}



// ✅ Calculate Multa Contratual
function calculateMultaContratual() {
  const deliveryDateStr = document.getElementById("delivery-date-multa")?.value;
  const rentStr = document.getElementById("rent-value-multa")?.value;
  const prazoTotal = parseFloat(document.getElementById("contract-time")?.value || 0);
  const finishDateStr = document.getElementById("finish-date")?.value;

  const resultField = document.getElementById("multa-contratual");
  const infoField = document.getElementById("multa-contratual-info");

  if (!deliveryDateStr || !rentStr || !prazoTotal || !finishDateStr) {
    resultField.value = "";
    infoField.textContent = "";
    return;
  }

  // Converter data BR (07/10/2025) para ISO
  const deliveryISO = formatDateISO(deliveryDateStr);

  // ✅ Pega meses e dias restantes
  const { months, remainingDays } = getMonthsAndDaysDiff(finishDateStr, deliveryISO);

  const rentValue = Number(
    rentStr.replace(/[^\d,.-]/g, "").replace(/\./g, "").replace(",", ".")
  ) || 0;

  if ((months <= 0 && remainingDays <= 0) || rentValue <= 0 || prazoTotal <= 0) {
    resultField.value = formatCurrencyBRL(0);
    infoField.textContent = "Sem multa (dados inválidos ou sem tempo restante).";
    return;
  }

  // Multa proporcional
  const penalty = (rentValue * 3 / prazoTotal) * Math.floor(months + remainingDays / 30);
  resultField.value = formatCurrencyBRL(penalty);

  // 📝 Exibe meses e dias no cálculo
  let timeText = "";
  if (months > 0) timeText += `${months} mês(es)`;
  if (remainingDays > 0) timeText += (timeText ? " e " : "") + `${remainingDays} dia(s)`;

  infoField.textContent = `(${formatCurrencyBRL(rentValue)} × 3 ÷ ${prazoTotal}) × ${timeText}`;
}


// ✅ Recalculate when relevant fields change
document.addEventListener("DOMContentLoaded", () => {
  ["contract-time", "finish-date", "delivery-date", "rent-value"].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.addEventListener("input", calculateMultaContratual);
  });
});
