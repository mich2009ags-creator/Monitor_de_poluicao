const API_KEY = "3599313d241ecd95619ccd688590503a";

// Coordenadas
const lat = -23.55;
const lon = -46.63;

// ===== MAPA =====
const mapa = L.map("mapa").setView([lat, lon], 4);
L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: "© OpenStreetMap"
}).addTo(mapa);

let marcador = L.marker([lat, lon]).addTo(mapa);

// ===== TRADUTOR AQI =====
const niveisAQI = {
    1: { texto: "Boa 😊", cor: "#00e400", bg: "#e8f5e9" },
    2: { texto: "Moderada 😐", cor: "#f9a825", bg: "#fff8e1" },
    3: { texto: "Ruim 😷", cor: "#ff6f00", bg: "#fff3e0" },
    4: { texto: "Muito Ruim 😰", cor: "#d32f2f", bg: "#fce4ec" },
    5: { texto: "Péssima ☠️", cor: "#7e0023", bg: "#fce4ec" }
};

// ===== GRÁFICO =====
const ctx = document.getElementById("grafico");
let grafico = null;

// ===== FUNÇÃO PRINCIPAL =====
async function carregarDados() {
    try {
        const resposta = await fetch(
            `https://api.openweathermap.org/data/2.5/air_pollution?lat=${lat}&lon=${lon}&appid=${API_KEY}`
        );

        if (!resposta.ok) throw new Error("Falha na requisição");

        const dados = await resposta.json();

        if (!dados.list || dados.list.length === 0) {
            throw new Error("Sem dados disponíveis");
        }

        const itemAtual = dados.list[0];
        const aqi = itemAtual.main.aqi;
        const componentes = itemAtual.components;
        const info = niveisAQI[aqi] || niveisAQI[1];

        // ===== ATUALIZA UI =====
        // AQI com cor
        document.getElementById("brasil").innerHTML = `
            AQI: <span style="color:${info.cor}; background:${info.bg}; 
            padding: 4px 16px; border-radius: 30px; display: inline-block;">
                ${aqi} — ${info.texto}
            </span>
        `;

        // Detalhes dos poluentes
        document.getElementById("detalhes").innerHTML = `
            <span>🌫️ PM2.5: ${componentes.pm2_5 || '--'} µg/m³</span>
            <span>🌬️ PM10: ${componentes.pm10 || '--'} µg/m³</span>
            <span>🧪 NO₂: ${componentes.no2 || '--'} µg/m³</span>
            <span>💨 O₃: ${componentes.o3 || '--'} µg/m³</span>
        `;

        // Data REAL da medição
        const timestamp = itemAtual.dt;
        const dataHora = new Date(timestamp * 1000).toLocaleString("pt-BR", {
            weekday: 'short',
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
        document.getElementById("data").innerText = dataHora;

        // Atualiza marcador do mapa
        marcador.bindPopup(`
            <b>🇧🇷 São Paulo</b><br>
            AQI: ${aqi} — ${info.texto}
        `).openPopup();

        // ===== GRÁFICO COM DADOS REAIS =====
        // Pega até 7 registros da previsão (se disponível)
        const registros = dados.list.slice(0, 7);
        const labels = registros.map((item, i) => {
            const d = new Date(item.dt * 1000);
            if (i === 0) return "Agora";
            return d.toLocaleTimeString("pt-BR", { hour: '2-digit', minute: '2-digit' });
        });

        const dadosGrafico = registros.map(item => item.main.aqi);

        if (grafico) grafico.destroy();

        grafico = new Chart(ctx, {
            type: "line",
            data: {
                labels: labels,
                datasets: [{
                    label: "Índice de Qualidade do Ar (AQI)",
                    data: dadosGrafico,
                    borderColor: "#2e7d32",
                    backgroundColor: "rgba(46, 125, 50, 0.15)",
                    fill: true,
                    tension: 0.3,
                    pointRadius: 5,
                    pointBackgroundColor: dadosGrafico.map(v => {
                        const nivel = niveisAQI[v] || niveisAQI[1];
                        return nivel.cor;
                    })
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: { display: false }
                },
                scales: {
                    y: {
                        min: 0,
                        max: 5.5,
                        ticks: {
                            stepSize: 1,
                            callback: (v) => niveisAQI[v] ? niveisAQI[v].texto.split(' ')[0] : v
                        }
                    }
                }
            }
        });

    } catch (erro) {
        console.error("Erro:", erro);
        document.getElementById("brasil").innerHTML = "❌ Erro ao carregar dados";
        document.getElementById("detalhes").innerHTML = "";
        document.getElementById("data").innerText = "Falha na atualização";
    }
}

// ===== ALTERNAR TEMA =====
function alternarTema() {
    document.body.classList.toggle("dark");
    const btn = document.getElementById("temaBtn");
    btn.innerText = document.body.classList.contains("dark") ? "☀️" : "🌙";
}

// ===== INICIALIZA =====
carregarDados();
setInterval(carregarDados, 60000); // a cada 1 minuto
