const { DatabaseSync } = require("node:sqlite");

// node:sqlite vem embutido no próprio Node (a partir da v22.5),
// então não depende de nenhum pacote externo compilado — é
// isso que evita o erro de incompatibilidade de binário que
// dava no Render com o pacote "sqlite3".

const db = new DatabaseSync("./corridas.db");

// =====================
// USUÁRIOS
// =====================
// email é UNIQUE: é isso que faz o cadastro
// detectar e-mail repetido corretamente.

db.exec(`
    CREATE TABLE IF NOT EXISTS usuarios (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nome TEXT,
        email TEXT UNIQUE,
        senha TEXT,
        criado_em TEXT
    )
`);

// =====================
// CORRIDAS
// =====================

db.exec(`
    CREATE TABLE IF NOT EXISTS corridas (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        usuario_id INTEGER,
        km REAL,
        tempo INTEGER,
        calorias REAL,
        data TEXT,
        FOREIGN KEY(usuario_id) REFERENCES usuarios(id)
    )
`);

// =====================
// MIGRAÇÃO AUTOMÁTICA
// =====================
// Mesma lógica de antes: se o corridas.db já existir com o
// schema antigo (sem usuario_id/tempo/calorias) e estiver
// vazio, recria a tabela certa sozinho. Se tiver dados, avisa
// e não toca em nada, pra nunca apagar corrida de verdade.

const colunas = db.prepare("PRAGMA table_info(corridas)").all();
const nomesColunas = colunas.map((c) => c.name);

const faltaColuna =
    !nomesColunas.includes("usuario_id") ||
    !nomesColunas.includes("tempo") ||
    !nomesColunas.includes("calorias");

if(faltaColuna){

    const { total } = db.prepare("SELECT COUNT(*) AS total FROM corridas").get();

    if(total > 0){

        console.warn(
            "⚠️  Tabela 'corridas' está com schema antigo e tem dados. " +
            "Migração automática cancelada — apague corridas.db manualmente " +
            "ou faça a migração à mão para não perder dados."
        );

    }else{

        console.log("🔧 Atualizando schema da tabela 'corridas'...");

        db.exec("DROP TABLE corridas");

        db.exec(`
            CREATE TABLE corridas (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                usuario_id INTEGER,
                km REAL,
                tempo INTEGER,
                calorias REAL,
                data TEXT,
                FOREIGN KEY(usuario_id) REFERENCES usuarios(id)
            )
        `);

    }

}

module.exports = db;
