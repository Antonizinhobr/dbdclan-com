const CAMINHO_PASTA = "../assets/img/MAPAS NUMERADOS DBD/";

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
    if (document.getElementById("maps-main-grid")) {
        renderMainGrid();
    }
    
    if (document.getElementById("detail-grid")) {
        initMapaDetail();
    }
});

function renderMainGrid() {
    const grid = document.getElementById("maps-main-grid");
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

        card.onclick = () => {
            window.location.href = `mapa.html?reino=${index}`;
        };
        
        grid.appendChild(card);
    });
}

function initMapaDetail() {
    const detailGrid = document.getElementById('detail-grid');
    const notFound = document.getElementById('detail-notfound');

    const params = new URLSearchParams(window.location.search);
    const reinoIndex = parseInt(params.get('reino'), 10);

    if (isNaN(reinoIndex) || !bancoDeMapas[reinoIndex]) {
        detailGrid.hidden = true;
        notFound.removeAttribute('hidden');
        return;
    }

    const grupo = bancoDeMapas[reinoIndex];
    
    document.title = `${grupo.nomeGrupo} - Numeração Cartográfica`;
    document.getElementById('detail-realm').innerText = grupo.nomeGrupo;
    document.getElementById('detail-type').innerText = grupo.isReino ? 'REINO DE ORIGEM' : 'MAPA INDIVIDUAL';
    
    const listContainer = document.getElementById('map-variations-list');
    listContainer.innerHTML = ''; 
    
    let firstButton = null;

    grupo.mapas.forEach(mapa => {
        if (mapa.qtdVariacoes === 1) {
            const nomeVariacao = /\d$/.test(mapa.nome) ? `${mapa.nome} VARIACAO` : `${mapa.nome} 1 VARIACAO`;
            const imgSrc = grupo.isReino 
                ? `${CAMINHO_PASTA}${grupo.nomeGrupo}/${mapa.nome}/${nomeVariacao}.png`
                : `${CAMINHO_PASTA}${grupo.nomeGrupo}/${nomeVariacao}.png`;
            
            const btn = createVariationButton(mapa.nome, imgSrc);
            listContainer.appendChild(btn);
            if (!firstButton) firstButton = { btn, nome: mapa.nome, src: imgSrc };
            
        } else {
            for (let i = 1; i <= mapa.qtdVariacoes; i++) {
                const nomeVariacao = `${mapa.nome} ${i} VARIACAO`;
                const tituloCard = `${mapa.nome} ${i}`;
                const imgSrc = grupo.isReino
                    ? `${CAMINHO_PASTA}${grupo.nomeGrupo}/${mapa.nome}/${nomeVariacao}.png`
                    : `${CAMINHO_PASTA}${grupo.nomeGrupo}/${nomeVariacao}.png`;
                    
                const btn = createVariationButton(tituloCard, imgSrc);
                listContainer.appendChild(btn);
                if (!firstButton) firstButton = { btn, nome: tituloCard, src: imgSrc };
            }
        }
    });

    if (firstButton) {
        firstButton.btn.click();
    }
    
    notFound.setAttribute('hidden', '');
}

function createVariationButton(nome, imgSrc) {
    const btn = document.createElement('button');
    btn.className = 'map-var-btn';
    btn.innerText = nome;
    
    btn.onclick = () => {
        document.querySelectorAll('.map-var-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        
        document.getElementById('current-map-name').innerText = nome;
        const imgEl = document.getElementById('detail-img');
        
        const tempImg = new Image();
        tempImg.onload = () => imgEl.src = tempImg.src;
        tempImg.onerror = () => imgEl.src = '../assets/icon.jpg';
        tempImg.src = imgSrc;
    };
    
    return btn;
}