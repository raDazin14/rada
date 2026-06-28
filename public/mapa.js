// ===============================
// CORREJÁ - MAPA E GPS
// ===============================

let map;
let rota = [];
let linha = null;
let watchId = null;
let distanciaAtual = 0;

// ===============================
// INICIAR MAPA
// ===============================

function iniciarMapa() {

    if (!document.getElementById("map")) return;

    map = L.map("map").setView([-12.145, -41.670], 13);

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "&copy; OpenStreetMap"
    }).addTo(map);

}

iniciarMapa();


// ===============================
// INICIAR ROTA
// ===============================

function iniciarRota() {

    rota = [];
    distanciaAtual = 0;

    if (watchId) {
        navigator.geolocation.clearWatch(watchId);
    }

    watchId = navigator.geolocation.watchPosition(
        (pos) => {

            const lat = pos.coords.latitude;
            const lng = pos.coords.longitude;

            rota.push([lat, lng]);

            desenharRota();

        },
        (erro) => {

            console.error("Erro GPS:", erro);

        },
        {
            enableHighAccuracy: true,
            maximumAge: 1000,
            timeout: 10000
        }
    );

}


// ===============================
// PARAR ROTA
// ===============================

function pararRota() {

    if (watchId) {

        navigator.geolocation.clearWatch(watchId);

        watchId = null;

    }

}


// ===============================
// DESENHAR ROTA
// ===============================

function desenharRota(){

    if(linha){

        map.removeLayer(linha);

    }

    linha = L.polyline(rota,{

        color:"#0071E3",

        weight:6,

        smoothFactor:1

    }).addTo(map);

    const ultimo = rota[rota.length-1];

    map.setView(ultimo,18,{
        animate:true
    });

    distanciaAtual = calcularDistancia();

    document.getElementById("distancia").innerHTML =
        distanciaAtual.toFixed(2)+" km";

    atualizarVelocidade();

}

// ===============================
// CALCULAR DISTÂNCIA
// ===============================

function calcularDistancia() {

    let distancia = 0;

    for (let i = 1; i < rota.length; i++) {

        const p1 = L.latLng(rota[i - 1]);
        const p2 = L.latLng(rota[i]);

        distancia += p1.distanceTo(p2);

    }

    return distancia / 1000;

}