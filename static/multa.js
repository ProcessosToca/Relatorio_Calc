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

// ✅ Get difference in months between two dates - inclui o dia inicial
function getMonthsAndDaysDiff(date1, date2) {
  const d1 = new Date(date1);
  const d2 = new Date(date2);
  const diffMs = Math.abs(d1 - d2);
  // Inclui o dia inicial no cálculo
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24)) + 1;
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

  // Calcular dias totais e valor por dia
  const totalDays = months * 30 + remainingDays;
  const dailyValue = rentValue / 30;

  // Formatar datas para exibição
  const finishDateFormatted = formatDateBR(finishDateStr);
  const deliveryDateFormatted = formatDateBR(deliveryISO);

  infoField.textContent = `Previsão referente ao acerto dias sendo ${totalDays} dia(s) de aluguel (período ${deliveryDateFormatted} à ${finishDateFormatted}). ${resultField.value}`;
}


// ✅ Recalculate when relevant fields change
document.addEventListener("DOMContentLoaded", () => {
  ["contract-time", "finish-date", "delivery-date", "rent-value"].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.addEventListener("input", calculateMultaContratual);
  });
});


// === Montagem LaTeX e Modal ===
function formatNumberBR(n) {
  return Number(n).toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function buildMultaLatex({ rentValue, prazoTotal, months, remainingDays }) {
  // Fórmula base que você usa:
  // penalty = (rentValue * 3 / prazoTotal) * floor(months + remainingDays/30)
  // Em LaTeX (sem o floor textual): usamos m + d/30 para explicar
  const m = months || 0;
  const d = remainingDays || 0;

  return String.raw`
\[
\text{Multa} \;=\; \left( \underbrace{\text{R\$}\,${formatNumberBR(rentValue)}}_{\text{aluguel}} \times 3 \;\big/\; ${prazoTotal} \right)
\;\times\;
\left( ${m} + \dfrac{${d}}{30} \right)
\]
`;
}

function updateMultaModal() {
  const rentStr = document.getElementById("rent-value-multa")?.value || "";
  const prazoTotal = parseFloat(document.getElementById("contract-time")?.value || 0);
  const deliveryDateStr = document.getElementById("delivery-date-multa")?.value || "";
  const finishDateStr = document.getElementById("finish-date")?.value || "";

  const rentValue = Number(rentStr.replace(/[^\d,.-]/g, "").replace(/\./g, "").replace(",", ".")) || 0;

  const ctx = document.getElementById("multa-contexto");
  const mathBox = document.getElementById("multa-math");
  const out = document.getElementById("multa-resultado");

  if (!ctx || !mathBox || !out) return;

  // Caso faltem dados, limpar conteúdo
  if (!rentValue || !prazoTotal || !deliveryDateStr || !finishDateStr) {
    ctx.textContent = "Preencha os campos de multa para visualizar o cálculo.";
    mathBox.innerHTML = "";
    out.textContent = "";
    if (window.MathJax && MathJax.typesetPromise) MathJax.typesetPromise([mathBox]);
    return;
  }

  const deliveryISO = (function (br) {
    const [dd, mm, yy] = String(br).split("/");
    return `${yy}-${String(mm).padStart(2, "0")}-${String(dd).padStart(2, "0")}`;
  })(deliveryDateStr);

  const { months, remainingDays } = getMonthsAndDaysDiff(finishDateStr, deliveryISO);

  // Contexto textual (humano)
  const tempoStr = [
    months > 0 ? `${months} mês(es)` : "",
    remainingDays > 0 ? `${remainingDays} dia(s)` : ""
  ].filter(Boolean).join(" e ");
  ctx.textContent = `Prazo restante considerado: ${tempoStr || "0 dia(s)"}.`;

  const fatorTempo = months + (remainingDays / 30);
  const tempoArred = Math.floor(fatorTempo);
  const multaPorMes = (rentValue * 3) / prazoTotal;
  const penalty = multaPorMes * tempoArred;

  // Passos simples (sem LaTeX complexo)
  const steps = [];

  // 1) Fórmula geral simples
  steps.push(`
    <div class="mb-3 p-3 border rounded bg-light">
      <h6 class="text-primary mb-2">Passo 1: Fórmula Geral</h6>
      <p class="mb-1"><strong>Multa = (Aluguel × 3 ÷ Prazo Total) × Tempo Restante</strong></p>
      <small class="text-muted">Onde: Tempo Restante = Meses + (Dias ÷ 30)</small>
    </div>
  `);

  // 2) Valores que você tem
  steps.push(`
    <div class="mb-3 p-3 border rounded bg-light">
      <h6 class="text-primary mb-2">Passo 2: Seus Valores</h6>
      <ul class="mb-0">
        <li><strong>Aluguel:</strong> R$ ${formatNumberBR(rentValue)}</li>
        <li><strong>Prazo Total:</strong> ${prazoTotal} meses</li>
        <li><strong>Tempo Restante:</strong> ${months} meses e ${remainingDays} dias</li>
      </ul>
    </div>
  `);

  // 3) Calcular tempo restante
  steps.push(`
    <div class="mb-3 p-3 border rounded bg-light">
      <h6 class="text-primary mb-2">Passo 3: Calcular Tempo Restante</h6>
      <p class="mb-1"><strong>${months} + (${remainingDays} ÷ 30) = ${fatorTempo.toFixed(2)}</strong></p>
      <p class="mb-0"><strong>Arredondando para baixo: ${tempoArred} meses</strong></p>
    </div>
  `);

  // 4) Calcular multa por mês
  steps.push(`
    <div class="mb-3 p-3 border rounded bg-light">
      <h6 class="text-primary mb-2">Passo 4: Calcular Multa por Mês</h6>
      <p class="mb-1"><strong>(R$ ${formatNumberBR(rentValue)} × 3) ÷ ${prazoTotal} = R$ ${formatNumberBR(multaPorMes)}</strong></p>
      <small class="text-muted">Isso significa que a multa é de R$ ${formatNumberBR(multaPorMes)} por mês restante</small>
    </div>
  `);

  // 5) Resultado final
  steps.push(`
    <div class="mb-3 p-3 border rounded bg-success text-white">
      <h6 class="mb-2">Passo 5: Resultado Final</h6>
      <p class="mb-1"><strong>R$ ${formatNumberBR(multaPorMes)} × ${tempoArred} = R$ ${formatNumberBR(penalty)}</strong></p>
      <small>Esta é a multa que deve ser paga</small>
    </div>
  `);

  // Renderizar todos os passos
  mathBox.innerHTML = steps.join("");

  // Resultado numérico destacado
  out.textContent = `Resultado: ${penalty.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}`;

  if (window.MathJax && MathJax.typesetPromise) {
    MathJax.typesetPromise([mathBox]).catch(() => { });
  }
}

// Atualiza o modal ao abrir
document.addEventListener("DOMContentLoaded", () => {
  const modalEl = document.getElementById("multaModal");
  if (modalEl) {
    modalEl.addEventListener("show.bs.modal", updateMultaModal);
  }

  // Recalcular também quando os inputs relevantes mudarem
  ["contract-time", "finish-date", "delivery-date", "rent-value"].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.addEventListener("input", () => {
      // espelhos já atualizam rent-value-multa e delivery-date-multa; chamamos update para refletir
      updateMultaModal();
    });
  });

  // Atualiza uma vez na carga (se já houver dados preenchidos/restaurados)
  updateMultaModal();
});
