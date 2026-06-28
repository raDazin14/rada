// ===============================
// SERVICE WORKER - CORREJÁ
// ===============================
// Guarda em cache os arquivos do "esqueleto" do app (html, css, js,
// ícones), pra abrir mais rápido e funcionar melhor com sinal fraco.
// NUNCA guarda em cache as chamadas de API (login, cadastro, corridas,
// ranking) — essas sempre precisam vir direto do servidor, com dados
// atuais.

const CACHE_NAME = "correja-v1";

const ARQUIVOS_PARA_CACHE = [
    "/",
    "/index.html",
    "/login.html",
    "/cadastro.html",
    "/corrida.html",
    "/historico.html",
    "/ranking.html",
    "/compartilhar.html",
    "/style.css",
    "/config.js",
    "/api.js",
    "/auth.js",
    "/mapa.js",
    "/script.js",
    "/historico.js",
    "/ranking.js",
    "/compartilhar.js",
    "/logo.svg",
    "/manifest.json",
    "/icons/icon-192.png",
    "/icons/icon-512.png"
];

// caminhos de API que nunca devem ser respondidos pelo cache
const CAMINHOS_API = [
    "/login",
    "/cadastro",
    "/corrida",
    "/corridas",
    "/ranking"
];

self.addEventListener("install", (evento) => {

    evento.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            return cache.addAll(ARQUIVOS_PARA_CACHE);
        })
    );

});

self.addEventListener("activate", (evento) => {

    evento.waitUntil(

        caches.keys().then((nomes) => {

            return Promise.all(

                nomes
                    .filter((nome) => nome !== CACHE_NAME)
                    .map((nome) => caches.delete(nome))

            );

        })

    );

});

self.addEventListener("fetch", (evento) => {

    const url = new URL(evento.request.url);

    const ehChamadaDeApi = CAMINHOS_API.some((caminho) =>
        url.pathname.startsWith(caminho)
    );

    // chamadas de API: sempre direto na rede, nunca cache
    if(ehChamadaDeApi){

        return;

    }

    // resto (html, css, js, ícones): tenta cache primeiro,
    // senão busca na rede
    evento.respondWith(

        caches.match(evento.request).then((respostaCache) => {

            return respostaCache || fetch(evento.request);

        })

    );

});
