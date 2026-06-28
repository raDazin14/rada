// ===============================
// RANKING DO MÊS
// ===============================

// ===============================
// PROTEGER PÁGINA (exige login)
// ===============================

if(!localStorage.getItem("usuario")){

    window.location = "login.html";

}

const usuarioLogado = JSON.parse(
    localStorage.getItem("usuario") || "null"
);

// ===============================
// ELEMENTOS
// ===============================

const listaRankingEl = document.getElementById("listaRanking");

// ===============================
// MEDALHAS PARA O TOP 3
// ===============================

function medalha(posicao){

    if(posicao === 1) return "🥇";
    if(posicao === 2) return "🥈";
    if(posicao === 3) return "🥉";

    return posicao;

}

// ===============================
// CARREGAR E MONTAR A TELA
// ===============================

async function carregarRanking(){

    const ranking = await buscarRanking();

    if(!ranking || ranking.length === 0){

        listaRankingEl.innerHTML = `
            <div class="historico-vazio">
                <span>🏆</span>
                <p>Ninguém correu neste mês ainda.<br>Seja o primeiro!</p>
            </div>
        `;

        return;

    }

    listaRankingEl.innerHTML = ranking.map((pessoa, i) => {

        const posicao = i + 1;

        const ehVoce =
            usuarioLogado && pessoa.usuario_id === usuarioLogado.id;

        const primeiroNome = pessoa.nome.split(" ")[0];

        return `
            <div class="linha-ranking ${ehVoce ? "voce" : ""}">

                <div class="posicao-ranking">${medalha(posicao)}</div>

                <div class="nome-ranking">
                    ${primeiroNome}${ehVoce ? ' <span class="tag-voce">(você)</span>' : ""}
                    <span class="corridas-ranking">${pessoa.total_corridas} corrida${pessoa.total_corridas > 1 ? "s" : ""}</span>
                </div>

                <div class="km-ranking">${pessoa.km_total.toFixed(1)} km</div>

            </div>
        `;

    }).join("");

}

carregarRanking();
