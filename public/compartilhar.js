// ===============================
// COMPARTILHAR CORRIDA
// ===============================
// Câmera ao vivo dentro do próprio app pra fotografar a
// corrida e montar um card estilo Strava: foto de fundo
// com distância, tempo, velocidade e calorias por cima.

// ===============================
// PROTEGER PÁGINA (exige login)
// ===============================

if(!localStorage.getItem("usuario")){

    window.location = "login.html";

}

// ===============================
// DADOS DA ÚLTIMA CORRIDA
// ===============================

const ultima = JSON.parse(
    localStorage.getItem("ultimaCorrida") || "null"
);

if(!ultima){

    window.location = "index.html";

}

// ===============================
// ELEMENTOS
// ===============================

const cameraWrap = document.getElementById("cameraWrap");
const video = document.getElementById("video");
const btnCapturar = document.getElementById("btnCapturar");
const btnTrocarCamera = document.getElementById("btnTrocarCamera");

const erroCamera = document.getElementById("erroCamera");
const btnGaleria = document.getElementById("btnGaleria");
const inputFoto = document.getElementById("inputFoto");

const previewWrap = document.getElementById("previewWrap");
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

const acoesFinais = document.getElementById("acoesFinais");
const btnBaixar = document.getElementById("btnBaixar");
const btnCompartilhar = document.getElementById("btnCompartilhar");
const btnRefazer = document.getElementById("btnRefazer");

let stream = null;
let facingMode = "environment";
let fotoCarregada = null;

// ===============================
// CÂMERA AO VIVO
// ===============================

async function iniciarCamera(){

    pararCamera();

    mostrarTela("camera");

    if(!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia){

        mostrarErroCamera();

        return;

    }

    try{

        stream = await navigator.mediaDevices.getUserMedia({

            video:{
                facingMode,
                width:{ ideal: 1080 },
                height:{ ideal: 1350 }
            },

            audio:false

        });

        video.srcObject = stream;

        video.classList.toggle("espelhado", facingMode === "user");

    }catch(e){

        console.error("Erro ao acessar a câmera:", e);

        mostrarErroCamera();

    }

}

function pararCamera(){

    if(stream){

        stream.getTracks().forEach(t => t.stop());

        stream = null;

    }

}

function mostrarErroCamera(){

    mostrarTela("erro");

}

btnTrocarCamera.addEventListener("click", ()=>{

    facingMode = facingMode === "environment" ? "user" : "environment";

    iniciarCamera();

});

// ===============================
// TIRAR FOTO (capturar frame do vídeo)
// ===============================

btnCapturar.addEventListener("click", ()=>{

    // captura o frame ATUAL do vídeo de forma síncrona, num
    // canvas temporário — antes de parar a câmera. Se isso
    // rodasse depois de pararCamera(), a imagem saía em branco.

    const temp = document.createElement("canvas");
    temp.width = video.videoWidth;
    temp.height = video.videoHeight;

    const tctx = temp.getContext("2d");

    if(facingMode === "user"){

        // espelha a captura igual ao preview da câmera frontal
        tctx.save();
        tctx.translate(temp.width, 0);
        tctx.scale(-1, 1);
        tctx.drawImage(video, 0, 0, temp.width, temp.height);
        tctx.restore();

    }else{

        tctx.drawImage(video, 0, 0, temp.width, temp.height);

    }

    fotoCarregada = temp;

    pararCamera();

    desenharCard();

    mostrarTela("preview");

});

// ===============================
// FALLBACK: ESCOLHER DA GALERIA
// ===============================

btnGaleria.addEventListener("click", ()=>{

    inputFoto.click();

});

inputFoto.addEventListener("change", (e)=>{

    const arquivo = e.target.files[0];

    if(!arquivo) return;

    const leitor = new FileReader();

    leitor.onload = (evento)=>{

        const img = new Image();

        img.onload = ()=>{

            fotoCarregada = img;

            desenharCard();

            mostrarTela("preview");

        };

        img.src = evento.target.result;

    };

    leitor.readAsDataURL(arquivo);

});

// ===============================
// TIRAR OUTRA FOTO
// ===============================

btnRefazer.addEventListener("click", ()=>{

    fotoCarregada = null;

    iniciarCamera();

});

// ===============================
// CONTROLE DE TELAS
// ===============================

function mostrarTela(nome){

    cameraWrap.style.display = nome === "camera" ? "flex" : "none";
    erroCamera.style.display = nome === "erro" ? "block" : "none";
    previewWrap.style.display = nome === "preview" ? "block" : "none";
    acoesFinais.style.display = nome === "preview" ? "flex" : "none";

}

// ===============================
// DIMENSÕES DA FONTE DA FOTO
// (funciona tanto com <img> quanto com <video>)
// ===============================

function obterDimensoes(fonte){

    if(fonte instanceof HTMLVideoElement){

        return { w: fonte.videoWidth, h: fonte.videoHeight };

    }

    return { w: fonte.width, h: fonte.height };

}

// ===============================
// DESENHAR FOTO "COVER" (preenche sem distorcer)
// ===============================

function desenharFotoCover(fonte){

    const { w: largura, h: altura } = obterDimensoes(fonte);

    const imgRatio = largura / altura;
    const boxRatio = canvas.width / canvas.height;

    let sx, sy, sw, sh;

    if(imgRatio > boxRatio){

        sh = altura;
        sw = sh * boxRatio;
        sx = (largura - sw) / 2;
        sy = 0;

    }else{

        sw = largura;
        sh = sw / boxRatio;
        sx = 0;
        sy = (altura - sh) / 2;

    }

    ctx.drawImage(fonte, sx, sy, sw, sh, 0, 0, canvas.width, canvas.height);

}

// ===============================
// RETÂNGULO ARREDONDADO (compatível com navegadores antigos)
// ===============================

function retanguloArredondado(x, y, w, h, r){

    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();

}

// ===============================
// FORMATAR TEMPO (segundos -> 00:00:00)
// ===============================

function formatarTempo(segundos){

    const h = String(Math.floor(segundos/3600)).padStart(2,"0");
    const m = String(Math.floor((segundos%3600)/60)).padStart(2,"0");
    const s = String(segundos%60).padStart(2,"0");

    return `${h}:${m}:${s}`;

}

// ===============================
// ÍCONE DA MARCA (versão em canvas do logo.svg)
// ===============================

function desenharIconeMarca(x, y, tamanho){

    const escala = tamanho / 100;

    ctx.save();
    ctx.translate(x, y);
    ctx.scale(escala, escala);

    const grad = ctx.createLinearGradient(0, 0, 100, 100);
    grad.addColorStop(0, "#FF8A50");
    grad.addColorStop(0.5, "#D6486F");
    grad.addColorStop(1, "#5B3A8C");

    ctx.fillStyle = grad;
    retanguloArredondado(0, 0, 100, 100, 24);
    ctx.fill();

    ctx.strokeStyle = "white";
    ctx.lineWidth = 8;
    ctx.lineCap = "round";
    ctx.globalAlpha = 0.97;
    ctx.beginPath();
    ctx.moveTo(20, 80);
    ctx.bezierCurveTo(32, 62, 10, 50, 30, 38);
    ctx.bezierCurveTo(48, 27, 56, 14, 82, 20);
    ctx.stroke();
    ctx.globalAlpha = 1;

    ctx.fillStyle = "rgba(255,255,255,0.55)";
    ctx.beginPath();
    ctx.arc(20, 80, 5, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "white";
    ctx.beginPath();
    ctx.arc(82, 20, 8, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();

}

// ===============================
// DESENHAR O CARD COMPLETO
// ===============================

async function desenharCard(){

    // espera as fontes carregarem, senão o canvas
    // desenha com a fonte padrão do sistema na primeira vez
    await Promise.all([
        document.fonts.load("600 40px Inter"),
        document.fonts.load("700 40px Inter"),
        document.fonts.load("800 40px Inter"),
        document.fonts.load("600 40px Fredoka"),
        document.fonts.load("700 40px Fredoka")
    ]);
    await document.fonts.ready;

    // fundo (caso a foto não cubra tudo): gradiente "amanhecer" da marca
    const gradFundo = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
    gradFundo.addColorStop(0, "#FF8A50");
    gradFundo.addColorStop(0.55, "#D6486F");
    gradFundo.addColorStop(1, "#5B3A8C");
    ctx.fillStyle = gradFundo;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    if(fotoCarregada){

        desenharFotoCover(fotoCarregada);

    }

    // gradiente escuro na parte de baixo, pra texto ficar legível
    const gradiente = ctx.createLinearGradient(0, canvas.height*0.45, 0, canvas.height);
    gradiente.addColorStop(0, "rgba(0,0,0,0)");
    gradiente.addColorStop(1, "rgba(0,0,0,0.75)");
    ctx.fillStyle = gradiente;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // selo "CorreJá" no topo, com o ícone da marca
    ctx.fillStyle = "rgba(255,255,255,0.92)";
    retanguloArredondado(60, 60, 320, 90, 45);
    ctx.fill();

    desenharIconeMarca(72, 72, 66);

    ctx.fillStyle = "#2B2230";
    ctx.font = "600 36px Fredoka, sans-serif";
    ctx.textBaseline = "middle";
    ctx.fillText("CorreJá", 150, 108);

    // distância em destaque
    ctx.fillStyle = "white";
    ctx.font = "700 150px Fredoka, sans-serif";
    ctx.textBaseline = "alphabetic";
    ctx.fillText(`${ultima.distancia.toFixed(2)} km`, 60, 1080);

    ctx.font = "600 36px Inter, sans-serif";
    ctx.fillStyle = "rgba(255,255,255,0.85)";
    ctx.fillText("Distância percorrida", 64, 1130);

    // 3 estatísticas menores
    const stats = [
        { label: "Tempo", valor: formatarTempo(ultima.tempo) },
        { label: "Vel. média", valor: `${ultima.velocidade.toFixed(1)} km/h` },
        { label: "Calorias", valor: `${ultima.calorias} kcal` }
    ];

    const largura = (canvas.width - 120 - 40) / 3;

    stats.forEach((stat, i)=>{

        const x = 60 + i * (largura + 20);
        const y = 1190;

        ctx.fillStyle = "rgba(255,255,255,0.15)";
        retanguloArredondado(x, y, largura, 120, 24);
        ctx.fill();

        ctx.fillStyle = "white";
        ctx.font = "800 44px Inter, sans-serif";
        ctx.textBaseline = "alphabetic";
        ctx.fillText(stat.valor, x + 24, y + 60);

        ctx.fillStyle = "rgba(255,255,255,0.8)";
        ctx.font = "600 24px Inter, sans-serif";
        ctx.fillText(stat.label, x + 24, y + 95);

    });

}

// ===============================
// BAIXAR IMAGEM
// ===============================

btnBaixar.addEventListener("click", ()=>{

    canvas.toBlob((blob)=>{

        const url = URL.createObjectURL(blob);

        const a = document.createElement("a");
        a.href = url;
        a.download = "correja-corrida.png";
        a.click();

        URL.revokeObjectURL(url);

    });

});

// ===============================
// COMPARTILHAR (Web Share API)
// ===============================

btnCompartilhar.addEventListener("click", ()=>{

    canvas.toBlob(async (blob)=>{

        const arquivo = new File([blob], "correja-corrida.png", {
            type: "image/png"
        });

        if(navigator.canShare && navigator.canShare({ files: [arquivo] })){

            try{

                await navigator.share({
                    files: [arquivo],
                    title: "Minha corrida no CorreJá",
                    text: `Corri ${ultima.distancia.toFixed(2)} km hoje! 🏃`
                });

            }catch(e){

                // usuário cancelou o compartilhamento, sem problema

            }

        }else{

            alert("Seu navegador não suporta compartilhar imagens direto. Use o botão de baixar e compartilhe manualmente.");

        }

    });

});

// ===============================
// LIBERAR A CÂMERA SE SAIR DA PÁGINA
// ===============================

window.addEventListener("beforeunload", pararCamera);

// ===============================
// INICIAR
// ===============================

iniciarCamera();
