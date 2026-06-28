// ===============================
// HISTÓRICO DE CORRIDAS
// ===============================

// ===============================
// PROTEGER PÁGINA (exige login)
// ===============================

if(!localStorage.getItem("usuario")){

    window.location = "login.html";

}

// ===============================
// ELEMENTOS
// ===============================

const resumoEl = document.getElementById("resumoHistorico");
const listaEl = document.getElementById("listaHistorico");

// ===============================
// FORMATAÇÃO
// ===============================

function formatarTempo(segundos){

    const h = String(Math.floor(segundos/3600)).padStart(2,"0");
    const m = String(Math.floor((segundos%3600)/60)).padStart(2,"0");
    const s = String(Math.floor(segundos%60)).padStart(2,"0");

    return `${h}:${m}:${s}`;

}

function formatarData(isoString){

    const data = new Date(isoString);

    const hoje = new Date();

    const ontem = new Date();
    ontem.setDate(hoje.getDate() - 1);

    const mesmoDia = (a, b) =>
        a.getDate() === b.getDate() &&
        a.getMonth() === b.getMonth() &&
        a.getFullYear() === b.getFullYear();

    const hora = data.toLocaleTimeString("pt-BR", {
        hour: "2-digit",
        minute: "2-digit"
    });

    if(mesmoDia(data, hoje)) return `Hoje, ${hora}`;
    if(mesmoDia(data, ontem)) return `Ontem, ${hora}`;

    const dataFormatada = data.toLocaleDateString("pt-BR", {
        day: "2-digit",
        month: "short"
    });

    return `${dataFormatada}, ${hora}`;

}

// ===============================
// CARREGAR E MONTAR A TELA
// ===============================

async function carregarHistorico(){

    const corridas = await listarCorridas();

    if(!corridas || corridas.length === 0){

        resumoEl.style.display = "none";

        listaEl.innerHTML = `
            <div class="historico-vazio">
                <span>🏃</span>
                <p>Você ainda não tem corridas registradas.<br>Vai lá fazer a primeira!</p>
            </div>
        `;

        return;

    }

    // ----- resumo geral -----

    const totalKm = corridas.reduce((soma, c) => soma + (c.km || 0), 0);
    const totalTempo = corridas.reduce((soma, c) => soma + (c.tempo || 0), 0);

    resumoEl.innerHTML = `
        <div class="card">
            <span>Corridas</span>
            <h3>${corridas.length}</h3>
        </div>
        <div class="card">
            <span>Distância total</span>
            <h3>${totalKm.toFixed(1)} km</h3>
        </div>
        <div class="card">
            <span>Tempo total</span>
            <h3>${formatarTempo(totalTempo)}</h3>
        </div>
    `;

    // ----- lista de corridas -----

    listaEl.innerHTML = corridas.map((c) => {

        const horas = (c.tempo || 0) / 3600;
        const velocidade = horas > 0 ? c.km / horas : 0;

        return `
            <div class="corrida-historico">

                <div class="topo-corrida">
                    <span class="data-corrida">${formatarData(c.data)}</span>
                    <span class="km-corrida">${c.km.toFixed(2)} km</span>
                </div>

                <div class="detalhes-corrida">

                    <div>
                        <span>Tempo</span>
                        <strong>${formatarTempo(c.tempo || 0)}</strong>
                    </div>

                    <div>
                        <span>Vel. média</span>
                        <strong>${velocidade.toFixed(1)} km/h</strong>
                    </div>

                    <div>
                        <span>Calorias</span>
                        <strong>${Math.round(c.calorias || 0)} kcal</strong>
                    </div>

                </div>

            </div>
        `;

    }).join("");

}

carregarHistorico();
