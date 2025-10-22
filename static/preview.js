document.addEventListener("DOMContentLoaded", () => {
  const data = JSON.parse(localStorage.getItem("relatorioData") || "{}");
  const container = document.getElementById("preview-content");

  function addSection(title, html) {
    if (!html) return; // nothing to render
    const div = document.createElement("div");
    div.classList.add("mb-3");
    div.innerHTML = `<h5>${title}</h5>${html}`;
    container.appendChild(div);
  }

  // ===== Acerto de Dias =====
  if (data.acerto && (data.acerto.valor || data.acerto.info)) {
    let infoHTML = "";
    if (data.acerto.info) {
      let infoArray = [];
      if (Array.isArray(data.acerto.info)) {
        infoArray = data.acerto.info;
      } else if (typeof data.acerto.info === "string") {
        infoArray = data.acerto.info
          .split(/\n+|\s*-\s*/g)
          .map(s => s.trim())
          .filter(Boolean);
      }
      infoHTML = `<p>${infoArray.map(line => `- ${line}<br>`).join('')}</p>`;
    }

    addSection(
      "Acerto de dias",
      `
    ${infoHTML}
    ${data.acerto.valor ? `<strong>${data.acerto.valor}</strong>` : ""}
    `
    );
  }

  // ===== IPTU =====
  if (data.iptu && (data.iptu.list?.length || data.iptu.previsao || data.iptu.total)) {
    const items = (data.iptu.list || []).map(i => `<li>${i}</li>`).join("");
    
    let previsaoHTML = "";
    if (data.iptu.previsao) {
      let previsaoArray = [];
      if (Array.isArray(data.iptu.previsao)) {
        previsaoArray = data.iptu.previsao;
      } else if (typeof data.iptu.previsao === "string") {
        previsaoArray = data.iptu.previsao
          .split(/\n+|\s*-\s*/g)
          .map(s => s.trim())
          .filter(Boolean);
      }
      previsaoHTML = `<p>${previsaoArray.map(line => `- ${line}<br>`).join('')}</p>`;
    }

    addSection(
      "IPTU",
      `
    ${items ? `<ul>${items}</ul>` : ""}
    ${previsaoHTML}
    ${data.iptu.total ? `<strong>${data.iptu.total}</strong>` : ""}
    `
    );
  }

  // ===== Multa Contratual =====
  if (data.multa && (data.multa.valor || data.multa.info)) {
    let infoHTML = "";
    if (data.multa.info) {
      let infoArray = [];
      if (Array.isArray(data.multa.info)) {
        infoArray = data.multa.info;
      } else if (typeof data.multa.info === "string") {
        infoArray = data.multa.info
          .split(/\n+|\s*-\s*/g)
          .map(s => s.trim())
          .filter(Boolean);
      }
      infoHTML = `<p>${infoArray.map(line => `- ${line}<br>`).join('')}</p>`;
    }

    addSection(
      "Multa Contratual",
      `
    ${infoHTML}
    ${data.multa.valor ? `<strong>${data.multa.valor}</strong>` : ""}
    `
    );
  }


  // ===== Energia =====
  if (data.energia && (data.energia.list?.length || data.energia.previsao || data.energia.total)) {
    const items = (data.energia.list || []).map(i => `<li>${i}</li>`).join("");

    let previsaoHTML = "";
    if (data.energia.previsao) {
      let previsaoArray = [];

      if (Array.isArray(data.energia.previsao)) {
        previsaoArray = data.energia.previsao;
      } else if (typeof data.energia.previsao === "string") {
        previsaoArray = data.energia.previsao
          .split(/\n+|\s*-\s*/g)   // break by line or " - "
          .map(s => s.trim())
          .filter(Boolean);
      }

      previsaoHTML = `<p>${previsaoArray.map(line => `- ${line}<br>`).join('')}</p>`;
    }

    addSection(
      "Energia",
      `
    ${items ? `<ul>${items}</ul>` : ""}
    ${previsaoHTML}
    ${data.energia.total ? `<strong>${data.energia.total}</strong>` : ""}
    `
    );
  }


  // ===== Água =====
  if (data.agua && (data.agua.list?.length || data.agua.previsao || data.agua.total)) {
    const items = (data.agua.list || []).map(i => `<li>${i}</li>`).join("");

    let previsaoHTML = "";
    if (data.agua.previsao) {
      let previsaoArray = [];

      if (Array.isArray(data.agua.previsao)) {
        previsaoArray = data.agua.previsao;
      } else if (typeof data.agua.previsao === "string") {
        previsaoArray = data.agua.previsao
          .split(/\n+|\s*-\s*/g)   // break by line or " - "
          .map(s => s.trim())
          .filter(Boolean);
      }

      previsaoHTML = `<p>${previsaoArray.map(line => `- ${line}<br>`).join('')}</p>`;
    }

    addSection(
      "Água",
      `
    ${items ? `<ul>${items}</ul>` : ""}
    ${previsaoHTML}
    ${data.agua.total ? `<strong>${data.agua.total}</strong>` : ""}
    `
    );
  }


  // ===== Condomínio =====
  if (data.condominio && (data.condominio.list?.length || data.condominio.previsao || data.condominio.total)) {
    const items = (data.condominio.list || []).map(i => `<li>${i}</li>`).join("");

    let previsaoHTML = "";
    if (data.condominio.previsao) {
      let previsaoArray = [];

      if (Array.isArray(data.condominio.previsao)) {
        previsaoArray = data.condominio.previsao;
      } else if (typeof data.condominio.previsao === "string") {
        previsaoArray = data.condominio.previsao
          .split(/\n+|\s*-\s*/g)   // break by line or " - "
          .map(s => s.trim())
          .filter(Boolean);
      }

      previsaoHTML = `<p>${previsaoArray.map(line => `- ${line}<br>`).join('')}</p>`;
    }

    addSection(
      "Condomínio",
      `
    ${items ? `<ul>${items}</ul>` : ""}
    ${previsaoHTML}
    ${data.condominio.total ? `<strong>${data.condominio.total}</strong>` : ""}
    `
    );
  }

  // ===== Taxas Extras =====
  if (data.taxas && (data.taxas.list?.length || data.taxas.total)) {
    const items = (data.taxas.list || []).map(i => `<li>${i}</li>`).join("");
    addSection(
      "Taxas Extras",
      `
    ${items ? `<ul>${items}</ul>` : ""}
    ${data.taxas.total ? `<strong>${data.taxas.total}</strong>` : ""}
    `
    );
  }

  // ===== Back to dashboard =====
  const backBtn = document.getElementById("backBtn");
  if (backBtn) {
    backBtn.addEventListener("click", () => {
      window.location.href = "/dashboard";
    });
  }
});

// Contract info card (kept from your current file)
document.addEventListener("DOMContentLoaded", () => {
  const saved = localStorage.getItem("relatorioData");
  if (!saved) return;
  const data = JSON.parse(saved);

  if (data.contractInfo) {
    document.getElementById("preview-address").textContent = data.contractInfo.address || "-";
    document.getElementById("preview-tenant-name").textContent = data.contractInfo.tenantName || "-";
    document.getElementById("preview-contract-number").textContent = data.contractInfo.contractNumber || "-";
    document.getElementById("preview-rent-value").textContent =
      Number(data.contractInfo.rentValue || 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
    document.getElementById("preview-last-rent").textContent = formatDateBR(data.contractInfo.lastRent);
    document.getElementById("preview-delivery-date").textContent = formatDateBR(data.contractInfo.deliveryDate);
    document.getElementById("preview-notice-date").textContent = formatDateBR(data.contractInfo.noticeDate);
    document.getElementById("preview-final-notice").textContent = formatDateBR(data.contractInfo.finalNotice);
  }
});

function formatDateBR(dateStr) {
  if (!dateStr) return "-";
  const [year, month, day] = dateStr.split("-");
  return `${day.padStart(2, "0")}/${month.padStart(2, "0")}/${year}`;
}

  function highlightCurrencyValues() {
    const preview = document.getElementById('preview-content');
    if (!preview) return;

    // Regex para pegar valores com R$, espaços normais e &nbsp;
    const currencyRegex = /R\$(?:\s|&nbsp;)?\d{1,3}(?:\.\d{3})*(?:,\d{2})/g;

    // Substituir sem remover &nbsp;
    preview.innerHTML = preview.innerHTML.replace(
      currencyRegex,
      match => `<b style="color: red;">${match}</b>`
    );
  }

  document.addEventListener("DOMContentLoaded", highlightCurrencyValues);

// Roda assim que a página carregar
document.addEventListener("DOMContentLoaded", highlightCurrencyValues);
