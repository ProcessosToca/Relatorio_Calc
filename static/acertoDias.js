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
    return;
  }

  const ultimoDate = new Date(ultimo);
  const deliveryDate = new Date(delivery);
  const noticeDate = new Date(notice);


  // If both are equal, there's no difference
  if (deliveryDate.getTime() === noticeDate.getTime()) {
    resultField.value = "R$ 0,00";
    info.textContent = `Sem diferença de dias entre a entrega e o aviso. ${resultField.value}`;
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
    // ✅ YES: original calculation (absolute difference) - inclui o dia inicial
    diffDays = Math.abs((deliveryDate - ultimoDate) / (1000 * 60 * 60 * 24)) + 1;
    total = dailyVal * diffDays;

    const valorFormatado = total.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
    resultField.value = valorFormatado;
    info.textContent = `Referente ao acerto de ${diffDays.toFixed(0)} dia(s) de aluguel × R$ ${dailyVal.toFixed(2)} por dia (período ${ultimoFormatted} à ${deliveryFormatted}). ${valorFormatado}`;

  } else if (noSelected) {
    // ✅ NO: special rule — if deliveryDate > noticeDate - inclui o dia inicial
    if (deliveryDate > noticeDate) {
      diffDays = Math.floor((deliveryDate - ultimoDate) / (1000 * 60 * 60 * 24)) + 1;
      total = dailyVal * diffDays;

      const valorFormatado = total.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
      resultField.value = valorFormatado;
      info.textContent = `Previsão referente a ${diffDays.toFixed(0)} dia(s) de aluguel × R$ ${dailyVal.toFixed(2)} (Período de ${ultimoFormatted} até ${deliveryFormatted}). ${valorFormatado}`;
    } else if (noticeDate > deliveryDate) {
      // You said you'll implement another calc here later
      diffDays = Math.floor((noticeDate - ultimoDate) / (1000 * 60 * 60 * 24)) + 1;
      total = dailyVal * diffDays;

      const valorFormatado = total.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
      resultField.value = valorFormatado;
      info.textContent = `Previsão referente a ${diffDays.toFixed(0)} dia(s) de aluguel × R$ ${dailyVal.toFixed(2)} (Período de ${ultimoFormatted} até ${noticeFormatted}). ${valorFormatado}`;
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

// 🔁 Shared helper - inclui o dia inicial
function getDaysDiff(date1, date2) {
  if (!date1 || !date2) return 0;
  const d1 = new Date(date1);
  const d2 = new Date(date2);
  return Math.abs((d1 - d2) / (1000 * 60 * 60 * 24)) + 1;
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

  // Atualiza modal de Acerto ao abrir
  const acertoModal = document.getElementById("acertoModal");
  if (acertoModal) {
    acertoModal.addEventListener("show.bs.modal", updateAcertoModal);
  }
});

// === Modal: passos simples do Acerto de Dias ===
function updateAcertoModal() {
  const ultimo = document.getElementById("acertoDias-ultimo-display")?.value;
  const delivery = document.getElementById("delivery-date")?.value;
  const notice = document.getElementById("final-notice")?.value;
  const rentVal = parseFloat(document.getElementById("rent-value")?.value || 0);

  const ctx = document.getElementById("acerto-contexto");
  const stepsBox = document.getElementById("acerto-steps");
  const out = document.getElementById("acerto-resultado");
  if (!ctx || !stepsBox || !out) return;

  if (!ultimo || !delivery || !notice || !rentVal) {
    ctx.textContent = "Preencha 'Último pagamento', 'Entrega', 'Final do Aviso' e 'Valor do Aluguel'.";
    stepsBox.innerHTML = "";
    out.textContent = "";
    return;
  }

  const ultimoDate = new Date(ultimo);
  const deliveryDate = new Date(delivery);
  const noticeDate = new Date(notice);
  const dailyVal = rentVal / 30;

  const yesSelected = document.getElementById("yesOption").checked;
  const noSelected = document.getElementById("noOption").checked;

  let diffDays = 0;
  let total = 0;
  let regra = "";

  if (yesSelected) {
    diffDays = Math.abs((deliveryDate - ultimoDate) / (1000 * 60 * 60 * 24)) + 1;
    total = dailyVal * diffDays;
    regra = "Com multa: dias até a entrega + multa contratual (a multa é somada em outra seção).";
  } else if (noSelected) {
    if (deliveryDate > noticeDate) {
      diffDays = Math.floor((deliveryDate - ultimoDate) / (1000 * 60 * 60 * 24)) + 1;
      total = dailyVal * diffDays;
      regra = "Sem multa: cobrar até a data da entrega das chaves.";
    } else {
      diffDays = Math.floor((noticeDate - ultimoDate) / (1000 * 60 * 60 * 24)) + 1;
      total = dailyVal * diffDays;
      regra = "Sem multa: cobrar até o final do aviso.";
    }
  }

  ctx.textContent = `Regra aplicada: ${regra}`;

  const steps = [];
  steps.push(`
    <div class="mb-3 p-3 border rounded bg-light">
      <h6 class="text-primary mb-2">Passo 1: Valor por dia</h6>
      <p class="mb-1"><strong>Aluguel ÷ 30 = R$ ${dailyVal.toFixed(2)}</strong></p>
      <small class="text-muted">(R$ ${rentVal.toFixed(2)} ÷ 30)</small>
    </div>
  `);
  steps.push(`
    <div class="mb-3 p-3 border rounded bg-light">
      <h6 class="text-primary mb-2">Passo 2: Quantidade de dias</h6>
      <p class="mb-1"><strong>${diffDays.toFixed(0)} dia(s)</strong></p>
      <small class="text-muted">Entre ${formatDateBR(ultimo)} e ${yesSelected ? formatDateBR(delivery) : (deliveryDate > noticeDate ? formatDateBR(delivery) : formatDateBR(notice))}</small>
    </div>
  `);
  steps.push(`
    <div class="mb-3 p-3 border rounded bg-success text-white">
      <h6 class="mb-2">Passo 3: Resultado</h6>
      <p class="mb-1"><strong>R$ ${dailyVal.toFixed(2)} × ${diffDays.toFixed(0)} = R$ ${total.toFixed(2)}</strong></p>
      <small>Este é o valor do acerto de dias</small>
    </div>
  `);

  stepsBox.innerHTML = steps.join("");
  out.textContent = `Resultado: ${total.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}`;
}