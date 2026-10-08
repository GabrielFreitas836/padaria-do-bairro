import express from "express"
import path from "node:path"

const app = express();
const PORT = process.env.PORT || 3000;

const PASTA_FRONTEND = path.join(import.meta.dirname, "..", "frontend");

// Middleware que registra cada requisição recebida
app.use((req, res, next) => {
    const hora = new Date().toLocaleTimeString("pt-BR");
    console.log(`${hora} ${req.method} ${req.url}`);
    next();
})

app.use(express.static(PASTA_FRONTEND));

app.get("/api/status", (req, res) => {
    res.json({
        status: "ok",
        loja: "Padaria do Bairro",
        horario: new Date().toISOString()
    });
});

app.get("/api/ola/:nome", (req, res) => {
    res.json({mensagem: `Olá, ${req.params.nome}! Bem-vindo(a) à padaria`});
});

app.get("/api/busca", (req, res) => {
    const termo = req.query.termo || "(nenhum)";
    res.json({termoBuscado: termo});
});

// Se nenhuma rota respondeu, chega aqui
app.use((req, res) => {
    res.status(404).send("Página não encontrada");
});

app.listen(PORT, () => {
    console.log(`Servidor rodando em http://localhost:${PORT}`);
});
