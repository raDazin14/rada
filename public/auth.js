// ===============================
// AUTENTICAÇÃO
// ===============================
// Usa a constante API definida em config.js

// ===============================
// LOGIN
// ===============================

async function login(){

    const email =
        document.getElementById("email").value;

    const senha =
        document.getElementById("senha").value;

    if(!email || !senha){

        alert("Preencha e-mail e senha.");

        return;

    }

    try{

        const resposta = await fetch(API + "/login",{

            method:"POST",

            headers:{
                "Content-Type":"application/json"
            },

            body:JSON.stringify({

                email,
                senha

            })

        });

        const dados =
            await resposta.json();

        if(dados.ok){

            localStorage.setItem(
                "usuario",
                JSON.stringify(dados.usuario)
            );

            window.location = "index.html";

        }else{

            alert("E-mail ou senha inválidos.");

        }

    }catch(e){

        console.error("Erro ao entrar:", e);

        alert("Não foi possível conectar ao servidor.");

    }

}

// ===============================
// CADASTRO
// ===============================

async function cadastrar(){

    const nome =
        document.getElementById("nome").value;

    const email =
        document.getElementById("email").value;

    const senha =
        document.getElementById("senha").value;

    const confirmar =
        document.getElementById("confirmar").value;

    if(!nome || !email || !senha){

        alert("Preencha todos os campos.");

        return;

    }

    if(senha !== confirmar){

        alert("As senhas não coincidem.");

        return;

    }

    try{

        const resposta = await fetch(API + "/cadastro",{

            method:"POST",

            headers:{
                "Content-Type":"application/json"
            },

            body:JSON.stringify({

                nome,
                email,
                senha

            })

        });

        const dados =
            await resposta.json();

        if(dados.ok){

            alert("Conta criada! Agora faça login.");

            window.location = "login.html";

        }else{

            alert(dados.erro || "Não foi possível criar a conta.");

        }

    }catch(e){

        console.error("Erro ao cadastrar:", e);

        alert("Não foi possível conectar ao servidor.");

    }

}

// ===============================
// LOGOUT
// ===============================

function logout(){

    localStorage.removeItem("usuario");

    window.location = "login.html";

}
