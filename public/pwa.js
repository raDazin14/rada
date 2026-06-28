// ===============================
// REGISTRO DO SERVICE WORKER (PWA)
// ===============================

if("serviceWorker" in navigator){

    window.addEventListener("load", () => {

        navigator.serviceWorker.register("/sw.js").catch((erro) => {

            console.error("Erro ao registrar service worker:", erro);

        });

    });

}
