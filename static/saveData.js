// saveData.js — saves all form data, inputs, lists and preview information to localStorage
document.addEventListener("DOMContentLoaded", () => {
  const generateBtn = document.getElementById("generatePDF");
  if (!generateBtn) return;

  generateBtn.addEventListener("click", () => {
    const data = {};

    // ---------- Informações do Contrato ----------
    data.contractInfo = {
      address: document.getElementById("address-info")?.value || "",
      tenantName: document.getElementById("tenant-name")?.value || "",
      contractNumber: document.getElementById("contract-number")?.value || "",
      rentValue: document.getElementById("rent-value")?.value || "",
      lastRent: document.getElementById("last-rent")?.value || "",
      deliveryDate: document.getElementById("delivery-date")?.value || "",
      noticeDate: document.getElementById("notice-date")?.value || "",
      finalNotice: document.getElementById("final-notice")?.value || ""
    };


    // ---------- Acerto de Dias ----------
    data.acerto = {
      valor: document.getElementById("acerto-total")?.value || "",
      info: document.getElementById("acerto-info")?.textContent || "",
      inputs: {
        lastRent: document.getElementById("acertoDias-ultimo-display")?.value || "",
        noticeDate: document.getElementById("notice-date")?.value || "",
        deliveryDate: document.getElementById("delivery-date")?.value || "",
        rentValue: document.getElementById("rent-value")?.value || ""
      }
    };

    // ---------- IPTU ----------
    data.iptu = {
      valor: document.getElementById("iptu-total")?.value || "",
      info: document.getElementById("iptu-info")?.textContent || "",
      inputs: {
        ultimo: document.getElementById("iptu-ultimo")?.value || "",
        delivery: document.getElementById("iptu-delivery")?.value || "",
        valor: document.getElementById("iptu-valor")?.value || ""
      }
    };

    // ---------- Multa ----------
    data.multa = {
      valor: document.getElementById("multa-contratual")?.value || "",
      info: document.getElementById("multa-contratual-info")?.textContent || "",
      inputs: {
        finishDate: document.getElementById("finish-date")?.value || "",
        contractTime: document.getElementById("contract-time")?.value || "",
        delivery: document.getElementById("delivery-date-multa")?.value || "",
        rentValue: document.getElementById("rent-value-multa")?.value || ""
      }
    };

    // ---------- Energia ----------
    data.energia = {
      list: Array.from(document.querySelectorAll("#energia-list li span")).map(el => el.textContent),
      previsao: document.getElementById("energia-previsao-container")?.innerText || "",
      total: document.getElementById("energia-soma-container")?.textContent || "",
      inputs: {
        ultimo: document.getElementById("energia-ultimo")?.value || "",
        delivery: document.getElementById("energia-delivery")?.value || "",
        valor: document.getElementById("energia-valor")?.value || ""
      }
    };

    // ---------- Água ----------
    data.agua = {
      list: Array.from(document.querySelectorAll("#agua-list li span")).map(el => el.textContent),
      previsao: document.getElementById("agua-previsao-container")?.innerText || "",
      total: document.getElementById("agua-soma-container")?.textContent || "",
      inputs: {
        ultimo: document.getElementById("agua-ultimo")?.value || "",
        delivery: document.getElementById("agua-delivery")?.value || "",
        valor: document.getElementById("agua-valor")?.value || ""
      }
    };

    // ---------- Condomínio ----------
    data.condominio = {
      list: Array.from(document.querySelectorAll("#cond-list li span")).map(el => el.textContent),
      previsao: document.getElementById("cond-previsao-container")?.innerText || "",
      total: document.getElementById("cond-soma-container")?.textContent || "",
      inputs: {
        ultimo: document.getElementById("cond-ultimo")?.value || "",
        delivery: document.getElementById("cond-delivery")?.value || "",
        valor: document.getElementById("cond-valor")?.value || ""
      }
    };

    // ---------- Taxas Extras ----------
    data.taxas = {
      list: Array.from(document.querySelectorAll("#entriesList li span")).map(el => el.textContent),
      total: document.getElementById("total")?.textContent || ""
    };

    localStorage.setItem("relatorioData", JSON.stringify(data));
    window.location.href = "/preview";
  });
});


// 🧹 Clear all saved data and refresh page
document.addEventListener("DOMContentLoaded", () => {
  const clearBtn = document.getElementById("clearAll");
  if (!clearBtn) return;

  clearBtn.addEventListener("click", () => {
    const confirmClear = confirm("Tem certeza que deseja limpar todos os dados?");
    if (confirmClear) {
      localStorage.removeItem("relatorioData");
      location.reload(); // Refresh the page to clean everything visually
    }
  });
});

// === ✅ Toast Helper ===
// function showToast(message) {
//   const toastEl = document.getElementById('toast-message');
//   const toastBody = toastEl.querySelector('.toast-body');
//   toastBody.textContent = message;

//   const toast = new bootstrap.Toast(toastEl, { delay: 3000 });
//   toast.show();
// }

// // === 🧹 Clear all saved data ===
// document.addEventListener("DOMContentLoaded", () => {
//   const clearBtn = document.getElementById("clearAll");
//   if (clearBtn) {
//     clearBtn.addEventListener("click", () => {
//       const confirmClear = confirm("Tem certeza que deseja limpar todos os dados?");
//       if (confirmClear) {
//         localStorage.removeItem("relatorioData");
//         showToast("✅ Dados limpos com sucesso!");
//         setTimeout(() => location.reload(), 1000);
//       }
//     });
//   }
// });
