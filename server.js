const express = require("express");
const cors = require("cors");
const path = require("path");
const bcrypt = require("bcryptjs");

const db = require("./database");

const app = express();

app.use(cors());
app.use(express.json());

// serve os arquivos do front-end (html, css, js) que estão
// dentro da pasta public/ — assim o site inteiro roda numa
// porta só, sem precisar de Live Server separado.
app.use(express.static(path.join(__dirname, "public")));


// =====================
// CADASTRO
// =====================

app.post("/cadastro",(req,res)=>{

    const {nome,email,senha} = req.body;

    if(!nome || !email || !senha){

        return res.json({
            ok:false,
            erro:"Preencha nome, e-mail e senha."
        });

    }

    const senhaHash = bcrypt.hashSync(senha, 10);

    try{

        db.prepare(
            "INSERT INTO usuarios(nome,email,senha,criado_em) VALUES(?,?,?,?)"
        ).run(nome, email, senhaHash, new Date().toISOString());

        res.json({ ok:true });

    }catch(err){

        // UNIQUE em "email" é o que garante esse erro
        // quando o e-mail já existe.
        res.json({
            ok:false,
            erro:"E-mail já cadastrado."
        });

    }

});


// =====================
// LOGIN
// =====================

app.post("/login",(req,res)=>{

    const {email,senha} = req.body;

    if(!email || !senha){

        return res.json({ ok:false });

    }

    try{

        const row = db.prepare("SELECT * FROM usuarios WHERE email=?").get(email);

        if(!row || !bcrypt.compareSync(senha, row.senha)){

            return res.json({ ok:false });

        }

        res.json({

            ok:true,

            usuario:{
                id:row.id,
                nome:row.nome,
                email:row.email
            }

        });

    }catch(err){

        console.error("Erro no login:", err);

        res.json({ ok:false });

    }

});


// =====================
// SALVAR CORRIDA
// =====================

app.post("/corrida",(req,res)=>{

    const{ usuario_id, km, tempo, calorias } = req.body;

    if(!usuario_id || km === undefined){

        return res.json({
            ok:false,
            erro:"Dados da corrida incompletos."
        });

    }

    try{

        const info = db.prepare(

            `INSERT INTO corridas
            (usuario_id,km,tempo,calorias,data)
            VALUES(?,?,?,?,?)`

        ).run(usuario_id, km, tempo || 0, calorias || 0, new Date().toISOString());

        res.json({
            ok:true,
            id: Number(info.lastInsertRowid)
        });

    }catch(err){

        console.error("Erro ao salvar corrida:", err);

        res.json({ ok:false });

    }

});


// =====================
// HISTÓRICO
// =====================

app.get("/corridas/:usuario",(req,res)=>{

    try{

        const rows = db.prepare(
            "SELECT * FROM corridas WHERE usuario_id=? ORDER BY id DESC"
        ).all(req.params.usuario);

        res.json(rows);

    }catch(err){

        console.error("Erro ao listar corridas:", err);

        res.json([]);

    }

});


// =====================
// RANKING DO MÊS
// =====================

app.get("/ranking",(req,res)=>{

    try{

        const rows = db.prepare(

            `SELECT
                u.id AS usuario_id,
                u.nome,
                SUM(c.km) AS km_total,
                COUNT(c.id) AS total_corridas
            FROM corridas c
            JOIN usuarios u ON u.id = c.usuario_id
            WHERE strftime('%Y-%m', c.data) = strftime('%Y-%m', 'now')
            GROUP BY c.usuario_id
            ORDER BY km_total DESC`

        ).all();

        res.json(rows);

    }catch(err){

        console.error("Erro ao montar ranking:", err);

        res.json([]);

    }

});

// O Render (e a maioria dos serviços de hospedagem) define
// a porta automaticamente pela variável PORT. Localmente, como
// essa variável não existe, cai no 3000 de sempre.
const PORTA = process.env.PORT || 3000;

app.listen(PORTA,()=>{

    console.log(`🚀 CorreJá rodando! http://localhost:${PORTA}`);
});
