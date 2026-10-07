// ================================
// 1. DADOS E CONFIGURAÇÕES
// ================================

const produtos = [
    { id: 1, nome: "Pão Francês", preco: 0.75, categoria: "pães", disponivel: true},
    { id: 2, nome: "Bolo de Cenoura", preco: 8.50, categoria: "bolos", disponivel: true},
    { id: 3, nome: "Croissant", preco: 7.00, categoria: "folhados", disponivel: false},
];

const TAXA_ENTREGA = 6.00; // valor do frete
const VALOR_FRETE_GRATIS = 50.00; // valor mínimo para frete grátis

let carrinho = []; // array para armazenar os produtos adicionados ao carrinho

// ================================
// 2. FUNÇÕES UTILITÁRIAS
// ================================

function arredondar(valor) {
    return Math.round(valor * 100) / 100; // arredonda para duas casas decimais
}

function formatarMoeda(valor) {
    return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }); // formata como moeda brasileira
}

// ================================
// 3. CARRINHO
// ================================

function adicionarAoCarrinho(idProduto, quantidade = 1) {
    const produto = produtos.find(p => p.id === idProduto);

    if (!produto) {
        console.warn(`Produto ${idProduto} não encontrado.`);
        return;
    }

    if (!produto.disponivel) {
        console.warn(`${produto.nome} está indisponível no momento.`);
        return;
    }

    if (quantidade < 1) {
        console.warn("A quantidade deve ser pelo menos 1.");
        return;
    }

    const itemExistente = carrinho.find(item => item.id === idProduto);

    if (itemExistente) {
        itemExistente.quantidade += quantidade;
    } else {
        carrinho.push({
            id: produto.id,
            nome: produto.nome,
            preco: produto.preco,
            quantidade: quantidade
        });
    }

    console.log(`${quantidade} x ${produto.nome} adicionado(s) ao carrinho.`);
}

function removerDoCarrinho(idProduto) {
    carrinho = carrinho.filter(item => item.id !== idProduto);
}

function esvaziarCarrinho() {
    carrinho = [];
}

// ================================
// 4. CÁLCULOS E REGRAS DE NEGÓCIO
// ================================

function calcularSubtotal() {
    let total = 0;
    for (const item of carrinho) {
        total += item.preco * item.quantidade;
    }
    return arredondar(total);
}

function calcularDesconto(subtotal) {
    let percentual = 0;

    if (subtotal >= 100) {
        percentual = 0.10; // 10% de desconto para compras acima de R$100
    }
    else if (subtotal >= 50) {
        percentual = 0.05; // 5% de desconto para compras acima de R$50
    }

    return arredondar(subtotal * percentual);
}

function calcularFrete(subtotal) {
    if (subtotal === 0 || subtotal >= VALOR_FRETE_GRATIS) {
        return 0; // frete grátis
    }
    return TAXA_ENTREGA;
}

function calcularResumo() {
    const subtotal = calcularSubtotal();
    const desconto = calcularDesconto(subtotal);
    const frete = calcularFrete(subtotal);
    const total = arredondar(subtotal - desconto + frete);

    return { subtotal, desconto, frete, total };
}

// ================================
// 5. EXIBIÇÃO NO CONSOLE (para testes)
// ================================

function mostrarCarrinho() {
    if (carrinho.length === 0) {
        console.log("O carrinho está vazio.");
        return;
    }

    console.log("========== SEU CARRINHO ==========");
    carrinho.forEach(item => {
        const valorItem = item.preco * item.quantidade;
        console.log(`${item.quantidade} x ${item.nome} ....... ${formatarMoeda(valorItem)}`);
    });

    const r = calcularResumo();
    console.log("-----------------------------------");
    console.log(`Subtotal: ${formatarMoeda(r.subtotal)}`);
    console.log(`Desconto: ${formatarMoeda(r.desconto)}`);
    console.log(`Entrega: ${r.frete === 0 ? "Grátis" : formatarMoeda(r.frete)}`);
    console.log(`Total: ${formatarMoeda(r.total)}`);
}

// ================================
// 6. MAIS REGRAS DE CARRINHO
// ================================

function contarItens() {
    return carrinho.reduce((soma, item) => soma + item.quantidade, 0);
}

function alterarQuantidade(idProduto, variacao) {
    const item = carrinho.find(i => i.id === idProduto);

    if (!item) return;

    item.quantidade += variacao;

    if (item.quantidade <= 0) {
        removerDoCarrinho(idProduto);
    }
}

// ================================
// 7. ELEMENTOS DA PÁGINA (DOM)
// ================================

const elListaProdutos = document.querySelector(".lista-produtos");
const elListaCarrinho = document.querySelector("#lista-carrinho");
const elCarrinhoVazio = document.querySelector("#carrinho-vazio");
const elResumo = document.querySelector("#resumo-carrinho");
const elContador = document.querySelector("#contador-carrinho");
const elSubtotal = document.querySelector("#resumo-subtotal");
const elDesconto = document.querySelector("#resumo-desconto");
const elFrete = document.querySelector("#resumo-frete");
const elTotal = document.querySelector("#resumo-total");
const elBtnLimpar = document.querySelector("#btn-limpar");

// ================================
// 8. PERSISTÊNCIA (localStorage)
// ================================

const CHAVE_CARRINHO = "padaria:carrinho";

function salvarCarrinho() {
    localStorage.setItem(CHAVE_CARRINHO, JSON.stringify(carrinho));
}

function carregarCarrinho() {
    const salvo = localStorage.getItem(CHAVE_CARRINHO);

    if (!salvo) return;

    try {
        carrinho = JSON.parse(salvo);
    } catch (e) {
        console.error("Carrinho salvo está corrompido:", e);
        carrinho = [];
    }
}

// ================================
// 9. RENDERIZAÇÃO
// ================================

function renderizarCarrinho() {
    const estaVazio = carrinho.length === 0;

    elCarrinhoVazio.hidden = !estaVazio;
    elResumo.hidden = estaVazio;
    elContador.textContent = contarItens();

    elListaCarrinho.innerHTML = ""; // limpa a lista antes de renderizar

    for (const item of carrinho) {
        const li = document.createElement("li");
        li.className = "item-carrinho";
        li.innerHTML = `
            <span class="item-nome">${item.nome}</span>
            <span class="item-controles">
                <button type="button" class="btn-qtd" data-acao="diminuir" data-id="${item.id}" 
                aria-label="Diminuir quantidade de ${item.nome}">-</button>
                <span class="item-qtd">${item.quantidade}</span>
                <button type="button" class="btn-qtd" data-acao="aumentar" data-id="${item.id}" 
                aria-label="Aumentar quantidade de ${item.nome}">+</button>
            </span>
            <span class="item-valor">${formatarMoeda(item.preco * item.quantidade)}</span>
            <button type="button" class="btn-remover" data-acao="remover"data-id="${item.id}" 
            aria-label="Remover ${item.nome}">X</button>
        `;
        elListaCarrinho.appendChild(li);
    }

    const resumo = calcularResumo();
    elSubtotal.textContent = formatarMoeda(resumo.subtotal);
    elDesconto.textContent = resumo.desconto > 0 ? `- ${formatarMoeda(resumo.desconto)}` : "—";
    elFrete.textContent = resumo.frete === 0 ? "Grátis" : formatarMoeda(resumo.frete);
    elTotal.textContent = formatarMoeda(resumo.total);
}

function atualizarCarrinho() {
    salvarCarrinho();
    renderizarCarrinho();
}

// ================================
// 10. EVENTOS
// ================================

// Clique em "Adicionar ao carrinho" (um único ouvinte para todos os produtos)
elListaProdutos.addEventListener("click", (evento) => {
    const botao = evento.target.closest(".btn-adicionar");

    if (!botao) return;

    const idProduto = Number(botao.closest(".produto").dataset.id);
    adicionarAoCarrinho(idProduto);
    atualizarCarrinho();

    // Feedback visual temporário
    botao.textContent = "Adicionado";
    botao.classList.add("adicionado");
    setTimeout(() => {
        botao.textContent = "Adicionar ao carrinho";
        botao.classList.remove("adicionado");
    }, 1000);
});

// Cliques dentro do carrinho: +, - e remover
elListaCarrinho.addEventListener("click", (evento) => {
    const botao = evento.target.closest("button[data-acao]");

    if (!botao) return;

    const idProduto = Number(botao.dataset.id);

    switch (botao.dataset.acao) {
        case "aumentar":
            alterarQuantidade(idProduto, 1);
            break;
        case "diminuir":
            alterarQuantidade(idProduto, -1);
            break;
        case "remover":
            removerDoCarrinho(idProduto);
            break;
    }

    atualizarCarrinho();
});

// Esvaziar carrinho
elBtnLimpar.addEventListener("click", () => {
    esvaziarCarrinho();
    atualizarCarrinho();
})

// ================================
// 11. Inicialização
// ================================

carregarCarrinho();
renderizarCarrinho();
