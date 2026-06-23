const API_KEY = "3599313d241ecd95619ccd688590503a";

// São Paulo
const lat = -23.55;
const lon = -46.63;

// MAPA
const mapa = L.map("mapa").setView([lat, lon], 4);

L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: "© OpenStreetMap"
}).addTo(mapa);

let marcador = L.marker([lat, lon]).addTo(mapa);

// GRÁFICO
const ctx = document.getElementById("grafico");
let grafico;

// FUNÇÃO PRINCIPAL
async function carregarDados() {
    try {
        const resposta = await fetch(
            `https://api.openweathermap.org/data/2.5/air_pollution?lat=${lat}&lon=${lon}&appid=${API_KEY}`
        );

        const dados = await resposta.json();

        const aqi = dados.list[0].main.aqi;

        // Texto bonito
        document.getElementById("brasil").innerHTML =
            `AQI atual: <b>${aqi}</b>`;

        document.getElementById("mundo").innerText =
            "Monitoramento em tempo real - São Paulo";

        document.getElementById("data").innerText =
            new Date().toLocaleString("pt-BR");

        // Atualiza marcador no mapa
        marcador.bindPopup(`São Paulo<br>AQI: ${aqi}`).openPopup();

        // Simulação de histórico (visual bonito)
        const historico = [
            aqi + 1,
            aqi,
            aqi - 1,
            aqi + 2,
            aqi,
            aqi - 1,
            aqi + 1
        ];

        // Atualiza gráfico
        if (grafico) grafico.destroy();

        grafico = new Chart(ctx, {
            type: "line",
            data: {
                labels: ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"],
                datasets: [{
                    label: "Índice de Qualidade do Ar",
                    data: historico,
                    borderColor: "#2e7d32",
                    backgroundColor: "rgba(46, 125, 50, 0.15)",
                    fill: true,
                    tension: 0.4,
                    pointRadius: 5
                }]
            },
            options: {
                responsive: true
            }
        });

    } catch (erro) {
        document.getElementById("brasil").innerText =
            "Erro ao carregar dados da API";
    }
}

carregarDados();

// Atualiza a cada 60 segundos
setInterval(carregarDados, 60000);