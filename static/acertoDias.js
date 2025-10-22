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
  const ultimo = document.getElementById("acertoDias-ultimo-display")?.value;
  const delivery = document.getElementById("delivery-date")?.value;
  const notice = document.getElementById("final-notice")?.value;
  const rentVal = parseFloat(document.getElementById("rent-value")?.value || 0);

  const resultField = document.getElementById("acerto-dias");
  const info = document.getElementById("acerto-info");
  const tipoOpicional = document.getElementById("acerto-tipo-opicional");

  const noticeDisp = document.getElementById("final-notice-display");
  const delDisp = document.getElementById("delivery-date-display");
  const rentDisp = document.getElementById("rent-value-display");

  // ✅ Display formatted fields
  if (delDisp) delDisp.value = formatDateBR(delivery);
  if (noticeDisp) noticeDisp.value = formatDateBR(notice);
  if (rentDisp) rentDisp.value = rentVal
    ? rentVal.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })
    : "-";

  // ✅ Validate data
  if (!ultimo || !delivery || !notice || !rentVal) {
    resultField.value = "";
    info.textContent = "";
    tipoOpicional.textContent = "";
    return;
  }

  const ultimoDate = new Date(ultimo);
  const deliveryDate = new Date(delivery);
  const noticeDate = new Date(notice);


  // If both are equal, there's no difference
  if (deliveryDate.getTime() === noticeDate.getTime()) {
    resultField.value = "R$ 0,00";
    info.textContent = "Sem diferença de dias entre a entrega e o aviso.";
    return;
  }

  const dailyVal = rentVal / 30;
  const deliveryFormatted = formatDateBR(delivery);
  const noticeFormatted = formatDateBR(notice);
  const ultimoFormatted = formatDateBR(ultimo)

  // ✅ Check which option was selected
  const yesSelected = document.getElementById("yesOption").checked;
  const noSelected = document.getElementById("noOption").checked;

  let total = 0;
  let diffDays = 0;

  if (yesSelected) {
    // ✅ YES: original calculation (absolute difference)
    diffDays = Math.abs((deliveryDate - ultimoDate) / (1000 * 60 * 60 * 24));
    total = dailyVal * diffDays;

    resultField.value = total.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
    tipoOpicional.textContent = `Possui multa, cobrança de dias até entrega das chaves + a multa:(((${rentVal.toFixed(0)}/30) x ${diffDays.toFixed(0)}) + Multa)`;
    info.textContent = `Referente ao acerto de ${diffDays.toFixed(0)} dia(s) de aluguel × R$ ${dailyVal.toFixed(2)} por dia (período ${ultimoFormatted} à ${deliveryFormatted}).`;

  } else if (noSelected) {
    // ✅ NO: special rule — if deliveryDate > noticeDate
    if (deliveryDate > noticeDate) {
      diffDays = (deliveryDate - ultimoDate) / (1000 * 60 * 60 * 24);
      total = dailyVal * diffDays;

      resultField.value = total.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
      tipoOpicional.textContent = `Sem multa, cobrança de dias até fim do aviso: (((${rentVal.toFixed(0)}/30) x ${diffDays.toFixed(0)}))`;
      info.textContent = `Previsão referente a ${diffDays.toFixed(0)} dia(s) de aluguel × R$ ${dailyVal.toFixed(2)} (Período de ${ultimoFormatted} até ${deliveryFormatted}).`;
    } else if (noticeDate > deliveryDate) {
      // You said you'll implement another calc here later
      diffDays = (noticeDate - ultimoDate) / (1000 * 60 * 60 * 24);
      total = dailyVal * diffDays;

      resultField.value = total.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
      tipoOpicional.textContent = `Sem multa, cobrança de dias até entrega das chaves: (((${rentVal.toFixed(0)}/30) x ${diffDays.toFixed(0)}))`;
      info.textContent = `Previsão referente a ${diffDays.toFixed(0)} dia(s) de aluguel × R$ ${dailyVal.toFixed(2)} (Período de ${ultimoFormatted} até ${noticeFormatted}).`;
    }
  }
}

// ✅ Controla exibição de seções de multa
document.getElementById("yesOption").addEventListener("change", () => {
  document.getElementById("possuiMulta").style.display = "block";
  document.getElementById("naoPossuiMulta").style.display = "none";
  calculateAcertoDias();
});

document.getElementById("noOption").addEventListener("change", () => {
  document.getElementById("possuiMulta").style.display = "none";
  document.getElementById("naoPossuiMulta").style.display = "block";
  calculateAcertoDias();
});

// 🔁 Shared helper
function getDaysDiff(date1, date2) {
  if (!date1 || !date2) return 0;
  const d1 = new Date(date1);
  const d2 = new Date(date2);
  return Math.abs((d1 - d2) / (1000 * 60 * 60 * 24));
}

function updateSharedDates() {
  const delivery = document.getElementById("delivery-date")?.value || "";
  const notice = document.getElementById("final-notice")?.value || "";
  document.querySelectorAll("#iptu-delivery, #energia-delivery, #agua-delivery, #cond-delivery")
    .forEach(el => el.value = formatDateBR(delivery));
  document.querySelectorAll("#iptu-delivery, #energia-notice, #agua-notice, #cond-notice")
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