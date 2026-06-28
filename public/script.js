// ===============================
// PROTEGER PÁGINA (exige login)
// ===============================

if(!localStorage.getItem("usuario")){

    window.location = "login.html";

}

// ===============================
// CONFIGURAÇÕES
// ===============================

const META_MENSAL = 50;
const KCAL_POR_KM = 60; // estimativa simples de gasto calórico

let kmMes = 0;
let meta = META_MENSAL;

let segundos = 0;
let timer = null;

const frases = [
    "🔥 A disciplina te trouxe até aqui!",
    "🏆 Você venceu mais uma meta!",
    "🚀 Continue! Seu limite é maior do que imagina.",
    "💪 Cada quilômetro conta.",
    "⭐ Hoje você é melhor que ontem.",
    "🥇 Grandes corredores são feitos de pequenos passos.",
    "🎯 Meta concluída! Hora da próxima.",
    "🏃 Continue firme!"
];

// ===============================
// ELEMENTOS (cada página tem só parte deles —
// por isso toda leitura abaixo é "segura": só usamos
// o elemento se ele realmente existir na página atual)
// ===============================

const kmMesEl = document.getElementById("kmMes");
const barra = document.getElementById("barra");
const percentualEl = document.getElementById("percentual");
const ultimaCorridaEl = document.getElementById("ultimaCorrida");

const btnFinalizar = document.getElementById("btnFinalizar");

// ===============================
// PERSISTÊNCIA LOCAL (km do mês)
// ===============================

function chaveMesAtual(){

    const agora = new Date();

    return `${agora.getFullYear()}-${agora.getMonth()}`;

}

function carregarKmMes(){

    const salvo = JSON.parse(
        localStorage.getItem("kmMes") || "null"
    );

    if(salvo && salvo.mes === chaveMesAtual()){

        kmMes = salvo.km;

    }else{

        kmMes = 0;

    }

}

function salvarKmMes(){

    localStorage.setItem("kmMes", JSON.stringify({
        mes: chaveMesAtual(),
        km: kmMes
    }));

}

// ===============================
// DASHBOARD
// ===============================

function atualizarDashboard(){

    if(!kmMesEl) return;

    kmMesEl.innerHTML = `${kmMes.toFixed(2)} km`;

    const percentual = Math.min(
        Math.round((kmMes/meta)*100),
        100
    );

    barra.style.width = percentual + "%";

    percentualEl.innerHTML =
        percentual + "% da meta";

}

function mostrarUltimaCorrida(){

    if(!ultimaCorridaEl) return;

    const ultima = JSON.parse(
        localStorage.getItem("ultimaCorrida") || "null"
    );

    if(!ultima){

        ultimaCorridaEl.classList.add("vazio");

        ultimaCorridaEl.innerHTML =
            "Você ainda não registrou nenhuma corrida.";

        return;

    }

    ultimaCorridaEl.classList.remove("vazio");
    ultimaCorridaEl.classList.add("grid-corrida");

    const h = String(Math.floor(ultima.tempo/3600)).padStart(2,"0");
    const m = String(Math.floor((ultima.tempo%3600)/60)).padStart(2,"0");
    const s = String(ultima.tempo%60).padStart(2,"0");

    ultimaCorridaEl.innerHTML = `
        <div class="item">
            <span>Última distância</span>
            <h2>${ultima.distancia.toFixed(2)} km</h2>
        </div>
        <div class="item">
            <span>Tempo</span>
            <h2>${h}:${m}:${s}</h2>
        </div>
        <div class="item">
            <span>Velocidade média</span>
            <h2>${ultima.velocidade.toFixed(1)} km/h</h2>
        </div>
        <div class="item">
            <span>Calorias</span>
            <h2>${ultima.calorias} kcal</h2>
        </div>
    `;

}

// ===============================
// CRONÔMETRO
// ===============================

function iniciarCronometro(){

    clearInterval(timer);

    segundos = 0;

    atualizarTempo();

    timer = setInterval(()=>{

        segundos++;

        atualizarTempo();

    },1000);

}

function pararCronometro(){

    clearInterval(timer);

}

function atualizarTempo(){

    const h = String(Math.floor(segundos/3600)).padStart(2,"0");

    const m = String(Math.floor((segundos%3600)/60)).padStart(2,"0");

    const s = String(segundos%60).padStart(2,"0");

    const texto = `${h}:${m}:${s}`;

    const elTempo = document.getElementById("tempo");
    const elTempoMapa = document.getElementById("tempoMapa");

    if(elTempo) elTempo.innerHTML = texto;
    if(elTempoMapa) elTempoMapa.innerHTML = texto;

}

// ===============================
// FINALIZAR CORRIDA
// ===============================

function finalizarCorrida(){

    pararCronometro();

    if(typeof pararRota === "function"){

        pararRota();

    }

    const distancia =
        typeof calcularDistancia === "function"
            ? calcularDistancia()
            : 0;

    const horas = segundos/3600;

    const velocidade = horas > 0 ? distancia/horas : 0;

    const calorias = Math.round(distancia * KCAL_POR_KM);

    // soma na meta do mês e persiste localmente
    carregarKmMes();

    kmMes += distancia;

    salvarKmMes();

    // guarda o resumo desta corrida para mostrar no dashboard
    localStorage.setItem("ultimaCorrida", JSON.stringify({
        tempo: segundos,
        distancia,
        velocidade,
        calorias
    }));

    // envia para o back-end (se estiver disponível)
    if(typeof salvarCorrida === "function"){

        salvarCorrida(distancia, segundos, calorias);

    }

    if(kmMes >= meta){

        const frase =
            frases[Math.floor(Math.random()*frases.length)];

        alert(frase);

    }

    window.location = "compartilhar.html";

}

// ===============================
// BOTÕES
// ===============================

if(btnFinalizar){

    btnFinalizar.addEventListener("click", finalizarCorrida);

}

function atualizarVelocidade(){

    if(segundos===0) return;

    const horas = segundos/3600;

    const velocidade = distanciaAtual/horas;

    const elVelocidade = document.getElementById("velocidade");
    const elRitmo = document.getElementById("ritmo");
    const elCalorias = document.getElementById("calorias");

    if(elVelocidade){

        elVelocidade.innerHTML =
            velocidade.toFixed(1)+" km/h";

    }

    if(elCalorias){

        elCalorias.innerHTML =
            Math.round(distanciaAtual * KCAL_POR_KM) + " kcal";

    }

    if(distanciaAtual>0 && elRitmo){

        const ritmo = segundos/distanciaAtual;

        const min = Math.floor(ritmo/60);

        const seg = Math.floor(ritmo%60);

        elRitmo.innerHTML =
            `${min}'${String(seg).padStart(2,"0")}"/km`;

    }

}

// ===============================
// SAUDAÇÃO PERSONALIZADA
// ===============================

function aplicarSaudacao(){

    const saudacaoEl = document.getElementById("saudacao");

    if(!saudacaoEl) return;

    const usuario = JSON.parse(
        localStorage.getItem("usuario") || "null"
    );

    if(usuario && usuario.nome){

        saudacaoEl.innerHTML = `Bom treino, ${usuario.nome.split(" ")[0]}!`;

    }

}

// ===============================
// INICIAR APP
// ===============================

carregarKmMes();
atualizarDashboard();
mostrarUltimaCorrida();
aplicarSaudacao();
