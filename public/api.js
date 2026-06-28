// ===============================
// API DO CORREJÁ
// ===============================
// Usa a constante API definida em config.js

// ===============================
// SALVAR CORRIDA
// ===============================

async function salvarCorrida(km, tempo, calorias){

    const usuario = JSON.parse(
        localStorage.getItem("usuario") || "null"
    );

    if(!usuario){

        console.warn("Nenhum usuário logado, corrida não foi salva no servidor.");

        return null;

    }

    try{

        const resposta = await fetch(`${API}/corrida`,{

            method:"POST",

            headers:{
                "Content-Type":"application/json"
            },

            body:JSON.stringify({
                usuario_id: usuario.id,
                km,
                tempo,
                calorias
            })

        });

        return await resposta.json();

    }catch(e){

        console.error("Erro ao salvar:",e);

        return null;

    }

}

// ===============================
// RANKING DO MÊS
// ===============================

async function buscarRanking(){

    try{

        const resposta = await fetch(`${API}/ranking`);

        return await resposta.json();

    }catch(e){

        console.error(e);

        return [];

    }

}

// ===============================
// LISTAR CORRIDAS DO USUÁRIO LOGADO
// ===============================

async function listarCorridas(){

    const usuario = JSON.parse(
        localStorage.getItem("usuario") || "null"
    );

    if(!usuario) return [];

    try{

        const resposta = await fetch(`${API}/corridas/${usuario.id}`);

        return await resposta.json();

    }catch(e){

        console.error(e);

        return [];

    }

}
