// =============================
// saveData.js — saves all form data, inputs, lists and preview information to localStorage
// =============================
document.addEventListener("DOMContentLoaded", () => {
  const generateBtn = document.getElementById("generatePDF");
  if (!generateBtn) return;

  generateBtn.addEventListener("click", () => {
    // 🧠 Start with existing data to avoid overwriting other sections
    const data = JSON.parse(localStorage.getItem("relatorioData") || "{}");

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

    const parseBR = (s) =>
      s ? parseFloat(String(s).replace(/[^\d,.-]/g, "").replace(/\./g, "").replace(",", ".")) : NaN;

    // ---------- Acerto de Dias ----------
    (() => {
      const valor = document.getElementById("acerto-total")?.value || "";
      const info = document.getElementById("acerto-info")?.textContent || "";
      const hasMoney = parseBR(valor) > 0;

      if (hasMoney || info.trim()) {
        data.acerto = {
          valor,
          info,
          inputs: {
            lastRent: document.getElementById("acertoDias-ultimo-display")?.value || "",
            noticeDate: document.getElementById("notice-date")?.value || "",
            deliveryDate: document.getElementById("delivery-date")?.value || "",
            rentValue: document.getElementById("rent-value")?.value || ""
          }
        };
      } else {
        delete data.acerto;
      }
    })();

    // ---------- Multa ----------
    (() => {
      const valor = document.getElementById("multa-contratual")?.value || "";
      const info = document.getElementById("multa-contratual-info")?.textContent || "";
      if (parseBR(valor) > 0 || info.trim()) {
        data.multa = {
          valor,
          info,
          inputs: {
            finishDate: document.getElementById("finish-date")?.value || "",
            contractTime: document.getElementById("contract-time")?.value || "",
            delivery: document.getElementById("delivery-date-multa")?.value || "",
            rentValue: document.getElementById("rent-value-multa")?.value || ""
          }
        };
      } else {
        delete data.multa;
      }
    })();

    // ---------- IPTU ----------
    (() => {
      const list = Array.from(document.querySelectorAll("#iptu-list li span")).map(el => el.textContent);
      const previsao = document.getElementById("iptu-previsao-container")?.innerText.trim("<br />") || "";
      const total = document.getElementById("iptu-soma-container")?.textContent.trim("<br />") || "";

      if (list.length > 0 || previsao) {
        data.iptu = {
          list,
          previsao,
          total,
          inputs: {
            ultimo: document.getElementById("iptu-ultimo")?.value || "",
            delivery: document.getElementById("iptu-delivery")?.value || "",
            valor: document.getElementById("iptu-value-input")?.value || ""
          }
        };
      } else {
        delete data.iptu;
      }
    })();


    // ---------- Energia ----------
    (() => {
      const list = Array.from(document.querySelectorAll("#energia-list li span")).map(el => el.textContent);
      const previsao = document.getElementById("energia-previsao-container")?.innerText.trim("<br />") || "";
      const total = document.getElementById("energia-soma-container")?.textContent.trim("<br />") || "";
      if (list.length > 0 || previsao) {
        data.energia = {
          list, previsao, total,
          inputs: {
            ultimo: document.getElementById("energia-ultimo")?.value || "",
            delivery: document.getElementById("energia-delivery")?.value || "",
            valor: document.getElementById("energia-valor")?.value || ""
          }
        };
      } else {
        delete data.energia;
      }
    })();

    // ---------- Água ----------
    (() => {
      const list = Array.from(document.querySelectorAll("#agua-list li span")).map(el => el.textContent);
      const previsao = document.getElementById("agua-previsao-container")?.innerText.trim() || "";
      const total = document.getElementById("agua-soma-container")?.textContent.trim() || "";
      if (list.length > 0 || previsao) {
        data.agua = {
          list, previsao, total,
          inputs: {
            ultimo: document.getElementById("agua-ultimo")?.value || "",
            delivery: document.getElementById("agua-delivery")?.value || "",
            valor: document.getElementById("agua-valor")?.value || ""
          }
        };
      } else {
        delete data.agua;
      }
    })();

    // ---------- Condomínio ----------
    (() => {
      const list = Array.from(document.querySelectorAll("#cond-list li span")).map(el => el.textContent);
      const previsao = document.getElementById("cond-previsao-container")?.innerText.trim() || "";
      const total = document.getElementById("cond-soma-container")?.textContent.trim() || "";
      if (list.length > 0 || previsao) {
        data.condominio = {
          list, previsao, total,
          inputs: {
            ultimo: document.getElementById("cond-ultimo")?.value || "",
            delivery: document.getElementById("cond-delivery")?.value || "",
            valor: document.getElementById("cond-valor")?.value || ""
          }
        };
      } else {
        delete data.condominio;
      }
    })();

    // ---------- Taxas Extras (✅ Fixed persistence logic) ----------
    (() => {
      const list = Array.from(document.querySelectorAll("#entriesList li span")).map(el => el.textContent);
      const total = document.getElementById("total")?.textContent.trim() || "";

      if (list.length > 0) {
        // Instead of overwriting the entire object, just update this section
        data.taxas = {
          list: [...(data.taxas?.list || []), ...list.filter(i => !data.taxas?.list?.includes(i))],
          total
        };
      } else {
        delete data.taxas;
      }
    })();

    // ✅ Save everything merged
    localStorage.setItem("relatorioData", JSON.stringify(data));

    // Go to preview
    window.location.href = "/preview";
  });
});

// 🧹 Clear all saved data and refresh page
document.addEventListener("DOMContentLoaded", () => {
  const clearBtn = document.getElementById("clearAll");
  if (!clearBtn) return;

  clearBtn.addEventListener("click", () => {
    localStorage.removeItem("relatorioData");
    location.reload();
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
