const CAMINHO_PASTA = "../assets/img/MAPAS NUMERADOS DBD/";

let currentGrupoIndex = null;
let currentMapaIndex = null;

const bancoDeMapas = [
    { nomeGrupo: "JARDIM DA ALEGRIA", mapas: [{ nome: "JARDIM DA ALEGRIA", qtdVariacoes: 1 }] },
    { nomeGrupo: "POUSO DO LAGO TOBA", mapas: [{ nome: "POUSO DO LAGO TOBA", qtdVariacoes: 1 }] },
    { nomeGrupo: "NAVE NOSTROMO", mapas: [{ nome: "NAVE NOSTROMO", qtdVariacoes: 1 }] },
    { nomeGrupo: "PRACA ESTILHAÇADA", mapas: [{ nome: "PRACA ESTILHAÇADA", qtdVariacoes: 1 }] },
    { nomeGrupo: "PRACA GREENVILLE", mapas: [{ nome: "PRACA GREENVILLE", qtdVariacoes: 1 }] },
    { nomeGrupo: "NINHO DOS CORVOS", mapas: [{ nome: "NINHO DOS CORVOS", qtdVariacoes: 2 }] },
    { nomeGrupo: "PIZZARIA DO FREDDY", mapas: [{ nome: "PIZZARIA DO FREDDY", qtdVariacoes: 1 }] },
    {
        nomeGrupo: "TUMULO DE GLENVALE",
        isReino: true,
        mapas: [{ nome: "SALAO DO CACHORRO MORTO", qtdVariacoes: 1 }]
    },
    {
        nomeGrupo: "INSTITUTO MEMORIAL LERY",
        isReino: true,
        mapas: [{ nome: "SALA DE TRATAMENTO", qtdVariacoes: 1 }]
    },
    {
        nomeGrupo: "LABORATORIO NACIONAL HAWKINS",
        isReino: true,
        mapas: [{ nome: "COMPLEXO SUBTERRANEO", qtdVariacoes: 1 }]
    },
    {
        nomeGrupo: "SPRINGWOOD",
        isReino: true,
        mapas: [
            { nome: "PRE ESCOLA BRADHAM 1", qtdVariacoes: 1 },
            { nome: "PRE ESCOLA BRADHAM 2", qtdVariacoes: 1 },
            { nome: "PRE ESCOLA BRADHAM 3", qtdVariacoes: 1 },
            { nome: "PRE ESCOLA BRADHAM 4", qtdVariacoes: 1 },
            { nome: "PRE ESCOLA BRADHAM 5", qtdVariacoes: 1 }
        ]
    },
    {
        nomeGrupo: "ORMOND",
        isReino: true,
        mapas: [
            { nome: "MINA DO LAGO ORMOND", qtdVariacoes: 1 },
            { nome: "RESORT ORMOND", qtdVariacoes: 3 }
        ]
    },
    {
        nomeGrupo: "YAMAOKA",
        isReino: true,
        mapas: [
            { nome: "SANTUARIO DA IRA", qtdVariacoes: 2 },
            { nome: "RESIDENCIA DA FAMILIA", qtdVariacoes: 2 }
        ]
    },
    {
        nomeGrupo: "PANTANO DO REMANSO",
        isReino: true,
        mapas: [
            { nome: "DESPENSA SOMBRIA", qtdVariacoes: 1 },
            { nome: "ROSA PALIDA", qtdVariacoes: 1 }
        ]
    },
    {
        nomeGrupo: "FLORESTA VERMELHA",
        isReino: true,
        mapas: [
            { nome: "CASA DA MAMAE", qtdVariacoes: 1 },
            { nome: "TEMPLO DA PURGACAO", qtdVariacoes: 1 }
        ]
    },
    {
        nomeGrupo: "HOSPICIO CROTUS PEN",
        isReino: true,
        mapas: [
            { nome: "CAPELA DO PADRE CAMPBELL", qtdVariacoes: 1 },
            { nome: "ALA DE PACIENTES", qtdVariacoes: 1 }
        ]
    },
    {
        nomeGrupo: "FAZENDA COLDWIND",
        isReino: true,
        mapas: [
            { nome: "MATADOURO FÉTIDO", qtdVariacoes: 1 },
            { nome: "CAMPOS PUTRIDOS", qtdVariacoes: 1 },
            { nome: "CORREGO ATORMENTADOR", qtdVariacoes: 1 },
            { nome: "CASA THOMPSON", qtdVariacoes: 1 },
            { nome: "ESTABULO FRATURADO", qtdVariacoes: 1 }
        ]
    },
    {
        nomeGrupo: "AUTOHAVEN",
        isReino: true,
        mapas: [
            { nome: "PARAISO DA GASOLINA", qtdVariacoes: 1 },
            { nome: "DESCANSO AZAROV", qtdVariacoes: 1 },
            { nome: "LOJA MISERAVEL", qtdVariacoes: 1 },
            { nome: "CABANA DE SANGUE", qtdVariacoes: 1 },
            { nome: "PATIO DA SUCATA", qtdVariacoes: 1 }
        ]
    },
    {
        nomeGrupo: "MACMILLAN",
        isReino: true,
        mapas: [
            { nome: "BOSQUE DO ABRIGO", qtdVariacoes: 2 },
            { nome: "SIDERURGICA DA MISERIA", qtdVariacoes: 2 },
            { nome: "FOSSO DA SUFOCACAO", qtdVariacoes: 2 },
            { nome: "ARMAZEM ABARROTADO", qtdVariacoes: 2 },
            { nome: "TORRE DO CARVAO", qtdVariacoes: 2 }
        ]
    }
];

document.addEventListener("DOMContentLoaded", () => {
    renderMainGrid();
});

function renderMainGrid() {
    const grid = document.getElementById("maps-main-grid");
    if (!grid) return;
    grid.innerHTML = "";

    bancoDeMapas.forEach((grupo, index) => {
        const card = document.createElement("div");
        card.className = "map-card";

        let imgSrc = "";
        if (grupo.isReino) {
            const primeiroMapa = grupo.mapas[0].nome;
            imgSrc = `${CAMINHO_PASTA}${grupo.nomeGrupo}/${primeiroMapa}/${primeiroMapa}.png`;
        } else {
            imgSrc = `${CAMINHO_PASTA}${grupo.nomeGrupo}/${grupo.nomeGrupo}.png`;
        }

        card.innerHTML = `
            <img src="${imgSrc}" alt="${grupo.nomeGrupo}" onerror="this.src='../assets/icon.jpg'">
            <div class="map-card-title">${grupo.nomeGrupo}</div>
        `;

        card.onclick = () => openModalMaps(index);
        grid.appendChild(card);
    });
}

function openModalMaps(grupoIndex) {
    currentGrupoIndex = grupoIndex;
    const grupo = bancoDeMapas[grupoIndex];

    if (grupo.mapas.length === 1) {
        currentMapaIndex = 0;
        const mapa = grupo.mapas[0];
        if (mapa.qtdVariacoes === 1) {
            const nomeVariacao = /\d$/.test(mapa.nome) ? `${mapa.nome} VARIACAO` : `${mapa.nome} 1 VARIACAO`;

            let imgSrcVar = grupo.isReino
                ? `${CAMINHO_PASTA}${grupo.nomeGrupo}/${mapa.nome}/${nomeVariacao}.png`
                : `${CAMINHO_PASTA}${grupo.nomeGrupo}/${nomeVariacao}.png`;
            openModalFullscreen(imgSrcVar, mapa.nome);
        } else {
            openModalVariations(grupoIndex, 0);
        }
        return;
    }

    document.getElementById("m-realm-name").innerText = grupo.nomeGrupo;
    const grid = document.getElementById("maps-grid");
    grid.innerHTML = "";

    grupo.mapas.forEach((mapa, mapaIndex) => {
        let imgSrcBase = grupo.isReino
            ? `${CAMINHO_PASTA}${grupo.nomeGrupo}/${mapa.nome}/${mapa.nome}.png`
            : `${CAMINHO_PASTA}${grupo.nomeGrupo}/${mapa.nome}.png`;

        const card = document.createElement("div");
        card.className = "map-card";
        card.innerHTML = `
            <img src="${imgSrcBase}" alt="${mapa.nome}" onerror="this.src='../assets/icon.jpg'">
            <div class="map-card-title">${mapa.nome}</div>
        `;

        card.onclick = () => {
            currentMapaIndex = mapaIndex;
            closeModal('modal-maps');

            if (mapa.qtdVariacoes === 1) {
                const nomeVariacao = /\d$/.test(mapa.nome) ? `${mapa.nome} VARIACAO` : `${mapa.nome} 1 VARIACAO`;

                let imgSrcVar = grupo.isReino
                    ? `${CAMINHO_PASTA}${grupo.nomeGrupo}/${mapa.nome}/${nomeVariacao}.png`
                    : `${CAMINHO_PASTA}${grupo.nomeGrupo}/${nomeVariacao}.png`;

                openModalFullscreen(imgSrcVar, mapa.nome);
            } else {
                openModalVariations(grupoIndex, mapaIndex);
            }
        };
        grid.appendChild(card);
    });

    document.getElementById("modal-maps").classList.add("open");
}

function openModalVariations(grupoIndex, mapaIndex) {
    currentGrupoIndex = grupoIndex;
    currentMapaIndex = mapaIndex;
    const grupo = bancoDeMapas[grupoIndex];
    const mapa = grupo.mapas[mapaIndex];

    document.getElementById("v-map-name").innerText = mapa.nome;
    const grid = document.getElementById("variations-grid");
    grid.innerHTML = "";

    for (let i = 1; i <= mapa.qtdVariacoes; i++) {
        const nomeVariacao = `${mapa.nome} ${i} VARIACAO`;
        let imgSrcBase = "";
        let imgSrcVar = "";

        if (grupo.isReino) {
            imgSrcBase = `${CAMINHO_PASTA}${grupo.nomeGrupo}/${mapa.nome}/${mapa.nome}.png`;
            imgSrcVar = `${CAMINHO_PASTA}${grupo.nomeGrupo}/${mapa.nome}/${nomeVariacao}.png`;
        } else {
            imgSrcBase = `${CAMINHO_PASTA}${grupo.nomeGrupo}/${mapa.nome}.png`;
            imgSrcVar = `${CAMINHO_PASTA}${grupo.nomeGrupo}/${nomeVariacao}.png`;
        }

        let tituloCard = mapa.nome;
        if (mapa.qtdVariacoes > 1) {
            tituloCard += ` ${i}`;
        }

        const card = document.createElement("div");
        card.className = "map-card";
        card.innerHTML = `
            <img src="${imgSrcBase}" alt="${tituloCard}" onerror="this.src='../assets/icon.jpg'">
            <div class="map-card-title">${tituloCard}</div>
        `;

        card.onclick = () => openModalFullscreen(imgSrcVar, tituloCard);
        grid.appendChild(card);
    }

    document.getElementById("modal-variations").classList.add("open");
}

function openModalFullscreen(imgSrc, titulo) {
    // Fecha o modal de variações se estiver aberto
    closeModal('modal-variations');

    const fullscreenModal = document.getElementById("modal-fullscreen");
    const title = document.getElementById("f-variation-name");
    const img = document.getElementById("f-variation-img");

    title.innerText = titulo;

    // Pré-carrega a imagem para evitar flicker
    const tempImg = new Image();
    tempImg.onload = function() {
        img.src = this.src;
    };
    tempImg.onerror = function() {
        img.src = '../assets/icon.jpg';
    };
    tempImg.src = imgSrc;

    fullscreenModal.classList.add("open");
}

function voltarParaMaps() {
    closeModal('modal-variations');
    const grupo = bancoDeMapas[currentGrupoIndex];
    if (grupo.mapas.length > 1) {
        document.getElementById("modal-maps").classList.add("open");
    }
}

function voltarParaVariacoes() {
    closeModal('modal-fullscreen');
    const grupo = bancoDeMapas[currentGrupoIndex];
    const mapa = grupo.mapas[currentMapaIndex];

    if (mapa.qtdVariacoes === 1) {
        if (grupo.mapas.length > 1) {
            document.getElementById("modal-maps").classList.add("open");
        }
    } else {
        document.getElementById("modal-variations").classList.add("open");
    }
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.remove("open");
    }
}

function closeModalOut(event, modalId) {
    if (event.target.id === modalId) {
        closeModal(modalId);
    }
}