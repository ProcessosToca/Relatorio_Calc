document.addEventListener("DOMContentLoaded", () => {
            const data = JSON.parse(localStorage.getItem("relatorioData") || "{}");
            const container = document.getElementById("preview-content");

            function addSection(title, content, extra = "") {
                const div = document.createElement("div");
                div.classList.add("mb-3");
                div.innerHTML = `<h5>${title}</h5><p>${content || "-"}</p>${extra}`;
                container.appendChild(div);
            }

            addSection("Acerto de dias", data.acerto?.info, `<strong>${data.acerto?.valor || ""}</strong>`);
            addSection("IPTU", data.iptu?.info, `<strong>${data.iptu?.valor || ""}</strong>`);
            addSection("Multa Contratual", data.multa?.info, `<strong>${data.multa?.valor || ""}</strong>`);

            const energiaItems = data.energia?.list?.map(i => `<li>${i}</li>`).join("") || "";
            addSection("Energia", `<ul>${energiaItems}</ul><p>${data.energia?.previsao || ""}</p><strong>${data.energia?.total || ""}</strong>`);

            const aguaItems = data.agua?.list?.map(i => `<li>${i}</li>`).join("") || "";
            addSection("Água", `<ul>${aguaItems}</ul><p>${data.agua?.previsao || ""}</p><strong>${data.agua?.total || ""}</strong>`);

            const condItems = data.condominio?.list?.map(i => `<li>${i}</li>`).join("") || "";
            addSection("Condomínio", `<ul>${condItems}</ul><p>${data.condominio?.previsao || ""}</p><strong>${data.condominio?.total || ""}</strong>`);

            const taxasItems = data.taxas?.list?.map(i => `<li>${i}</li>`).join("") || "";
            addSection("Taxas Extras", `<ul>${taxasItems}</ul><strong>${data.taxas?.total || ""}</strong>`);

            // ✅ Fixed navigation to go back to dashboard.html
            document.getElementById("backBtn").addEventListener("click", () => {
                window.location.href = "/dashboard";  // redirect to your dashboard page
            });
        });

        document.addEventListener("DOMContentLoaded", () => {
            const saved = localStorage.getItem("relatorioData");
            if (!saved) return;
            const data = JSON.parse(saved);

            if (data.contractInfo) {
                document.getElementById("preview-address").textContent = data.contractInfo.address || "-";
                document.getElementById("preview-tenant-name").textContent = data.contractInfo.tenantName || "-";
                document.getElementById("preview-contract-number").textContent = data.contractInfo.contractNumber || "-";
                document.getElementById("preview-rent-value").textContent = Number(data.contractInfo.rentValue || 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
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
