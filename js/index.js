import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getFirestore, doc, updateDoc, increment, collection, getDocs, onSnapshot, writeBatch, setDoc, getDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

const firebaseConfig = {
    apiKey: "AIzaSyARpVKfzOMm-v0pv9-7w9xahvhItosrI2Q",
    authDomain: "dbd-camp.firebaseapp.com",
    projectId: "dbd-camp",
    storageBucket: "dbd-camp.firebasestorage.app",
    messagingSenderId: "357760091556",
    appId: "1:357760091556:web:4d9191b487baf240e92d31",
    measurementId: "G-THBBGJTTMJ"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

const ADMIN_UIDS = [
    "discord:1400218900284571689",
    "discord:392062765323255828",
    "discord:644323555462479892",
    "discord:804843307568988180",
    "discord:361362105363857408",
    "discord:208380369261559808"
];

const mapList = [
    { 
        name: "FERRO-VELHO AUTOHAVEN", 
        img: "https://deadbydaylight.com/static/9de621ec08d76ff4d137215da545c8a6/54ac6/autohaven_wreckers_bloodlodge_map_217f78d3b5.webp",
        variants: [
            { name: "SEPULTURA DE AZAROV", img: "../assets/img/Ferro-Velho Autohaven/Sepultura de Azarov.png"},
            { name: "ABRIGO SANGRENTO", img: "../assets/img/Ferro-Velho Autohaven/Abrigo Sangrento.png" },
            { name: "PARAÍSO DO COMBUSTÍVEL", img: "../assets/img/Ferro-Velho Autohaven/Paraíso do Combustível.png" },
            { name: "LOJA DESGRAÇADA", img: "../assets/img/Ferro-Velho Autohaven/Loja Desgraçada.png" },
            { name: "QUINTAL DO FERRO VELHO", img: "../assets/img/Ferro-Velho Autohaven/Quintal do Ferro Velho.png" }
        ]
    },
    { 
        name: "INSTITUTO MEMORIAL LÉRY", 
        img: "https://deadbydaylight.com/static/83762a7826c82140ad92d1319bec3bb5/54ac6/leyrsmemorialinstitute_realm_treatmenttheater_map1_502ce8d7e1.webp",
        variants: [{ name: "SALA DE TRATAMENTO", img: "../assets/img/Instituto Memorial Léry/Instituto Memorial Léry.png" }]
    },
    { 
        name: "FLORESTA VERMELHA", 
        img: "https://deadbydaylight.com/static/1aece22aaa9439e52698f1597953c32b/54ac6/redforrest_realm_templeofpurgation_1_b016dd81fb.webp",
        variants: [
            { name: "REFÚGIO DA CAÇADORA", img: "../assets/img/Floresta Vermelha/Refúgio da Caçadora.png" },
            { name: "O TEMPLO DA PURGAÇÃO", img: "../assets/img/Floresta Vermelha/O Templo da Purgação.png" }
        ]
    },
    { 
        name: "PROPRIEDADE MACMILLAN", 
        img: "https://deadbydaylight.com/static/aab3e49f753926b6799f370d17641ea7/54ac6/macmillan_realm_ironworks_coaltower_map_2386297fea.webp",
        variants: [
            { name: "TORRE DO CARVÃO 1", img: "../assets/img/Propriedade Macmillan/Torre de Carvão 1.png" },
            { name: "TORRE DO CARVÃO 2", img: "../assets/img/Propriedade Macmillan/Torre de Carvão 2.png" },
            { name: "ARMAZÉM RANGENTE 1", img: "../assets/img/Propriedade Macmillan/Armazem Rangente 1.png" },
            { name: "ARMAZÉM RANGENTE 2", img: "../assets/img/Propriedade Macmillan/Armazem Rangente 2.png" },
            { name: "FÁBRICA DA MISÉRIA 1", img: "../assets/img/Propriedade Macmillan/Fábrica da Miséria 1.png" },
            { name: "FÁBRICA DA MISÉRIA 2", img: "../assets/img/Propriedade Macmillan/Fábrica da Miséria 2.png" },
            { name: "BOSQUE DO ABRIGO 1", img: "../assets/img/Propriedade Macmillan/Bosque do abrigo 1.png" },
            { name: "BOSQUE DO ABRIGO 2", img: "../assets/img/Propriedade Macmillan/Bosque do abrigo 2.png" },
            { name: "FOSSO DO SUFOCAMENTO 1", img: "../assets/img/Propriedade Macmillan/Fosso do sufocamento 1.png" },
            { name: "FOSSO DO SUFOCAMENTO 2", img: "../assets/img/Propriedade Macmillan/Fosso do sufocamento 2.png" }
        ]
    },
    { 
        name: "PÂNTANO DO REMANSO", 
        img: "https://deadbydaylight.com/static/4042dfd3fea1a24a14eb4ef5b3b4b78f/54ac6/backwaterswamp_realm_thepalerose_map1_083911a12d.webp",
        variants: [
            { name: "DESPENSA SOMBRIA", img: "../assets/img/Pântano Do Remanso/Dispensa Cruel.png" },
            { name: "A ROSA LÍVIDA", img: "../assets/img/Pântano Do Remanso/Rosa Lívida.png" }
        ]
    },
    { 
        name: "FAZENDA COLDWIND", 
        img: "https://deadbydaylight.com/static/ad4bb4444122a9795fff2784df22ede7/54ac6/coldwindfarms_realm_rancidabattoir_map2_dec28984f4.webp",
        variants: [
            { name: "ESTÁBULO FRATURADO", img: "../assets/img/Fazenda Cooldwind/Estábulo Fraturado.png" },
            { name: "A CASA DOS THOMPSON", img: "../assets/img/Fazenda Cooldwind/A Casa Dos Thompson.png" },
            { name: "CÓRREGO ATORMENTADOR", img: "../assets/img/Fazenda Cooldwind/Córrego Atormentador.png" },
            { name: "ABATEDOURO ASQUEROSO", img: "../assets/img/Fazenda Cooldwind/Abatedouro Asqueroso.png" },
            { name: "CAMPOS PÚTRIDOS", img: "../assets/img/Fazenda Cooldwind/Campos Pútridos.png" }
        ]
    },
    { 
        name: "JARDIM DA ALEGRIA", 
        img: "https://deadbydaylight.com/static/f28d1adf92a2ca532e867fbfa2dd48b3/54ac6/DBD_CH_24_Garden_Of_Joy_House_Truck_1920x1080_afc4470f70.webp",
        variants: [{ name: "JARDIM DA ALEGRIA", img: "../assets/img/Jardim Da Alegria/Jardim Da Alegria.png" }]
    },
    { 
        name: "TÚMULO DE GLENVALE", 
        img: "https://deadbydaylight.com/static/86102d19c11307efaa488232269e2cb0/54ac6/graveofglenvale_realm_deaddawgsaloon_map3_cc7f9cb052.webp",
        variants: [{ name: "SALOON DEAD DAWGS", img: "../assets/img/Túmulo de Glenvale/Saloon Do Cachorro Morto.png" }]
    }
];

const grid = document.getElementById('map-grid');

onSnapshot(doc(db, "sistema", "status"), (snapshot) => {
    const data = snapshot.data();
    if (!data) return;

    // Redirecionamento automático se houver vencedor
    if (data.vencedorNome && !data.votacaoIniciada) {
        const mapaCompleto = mapList.find(m => m.name === data.vencedorNome);
        if (mapaCompleto) {
            localStorage.setItem('selectedMap', JSON.stringify(mapaCompleto));
            window.location.href = 'variants.html';
        }
    }

    // Gerenciamento de visibilidade baseado em Admin e Status
    onAuthStateChanged(auth, (user) => {
        const startBtn = document.getElementById('start-btn');
        const adminControls = document.getElementById('admin-controls');
        const statusText = document.getElementById('status-text');
        
        const isAdmin = user && ADMIN_UIDS.includes(user.uid);

        if (data.votacaoIniciada) {
            if(startBtn) startBtn.classList.add('hidden');
            if(statusText) statusText.innerText = "VOTAÇÃO EM ANDAMENTO: Escolha um Reino!";
            renderizarMapas(data.mapasAtivos, true);
        } else {
            // Se for admin, libera os controles de votação
            if (isAdmin) {
                if(startBtn) startBtn.classList.remove('hidden');
                if(adminControls) adminControls.classList.remove('hidden');
                if(statusText) statusText.innerText = "PAINEL ADMIN: Inicie a votação quando pronto.";
            } else {
                if(statusText) statusText.innerText = "Analise os Reinos. Aguarde o Admin.";
            }

            if (!data.vencedorNome) {
                renderizarMapas(mapList.map(m => m.name), false);
            }
        }
    });
});

onSnapshot(collection(db, "VOTOS"), (snapshot) => {
    snapshot.docChanges().forEach((change) => {
        const docData = change.doc.data();
        const badge = document.getElementById(`voto-${change.doc.id}`);
        if (badge) {
            badge.innerText = docData.quantidade || 0;
            badge.style.transform = "scale(1.3)";
            setTimeout(() => badge.style.transform = "scale(1)", 200);
        }
    });
});

async function registrarVoto(mapName) {
    if (localStorage.getItem('jaVotou')) return;
    try {
        localStorage.setItem('jaVotou', 'true');
        const mapRef = doc(db, "VOTOS", mapName); 
        await setDoc(mapRef, { quantidade: increment(1) }, { merge: true });
        
        document.querySelectorAll('.map-card').forEach(c => c.style.opacity = "0.4");
        
    } catch (e) {
        console.error("Erro ao registrar voto:", e);
        localStorage.removeItem('jaVotou');
    }
}

function renderizarMapas(nomesParaMostrar, podeVotar) {
    if(!grid) return;
    grid.innerHTML = '';
    const jaVotou = localStorage.getItem('jaVotou');

    nomesParaMostrar.forEach((nome, index) => {
        const map = mapList.find(m => m.name === nome);
        if (!map) return;

        const card = document.createElement('div');
        card.className = 'map-card map-card-anim';
        card.style.animationDelay = `${index * 0.1}s`;
        if (jaVotou && podeVotar) card.style.opacity = "0.4";

        card.innerHTML = `
            <div class="vote-badge ${podeVotar ? '' : 'hidden'}" id="voto-${map.name}">0</div>
            <img src="${map.img}" alt="${map.name}">
            <div class="map-name">${map.name}</div>
        `;

        if (podeVotar && !jaVotou) {
            card.style.cursor = "pointer";
            card.onclick = () => registrarVoto(map.name);
        }
        grid.appendChild(card);
    });
}

document.getElementById('start-btn')?.addEventListener('click', async () => {
    localStorage.removeItem('jaVotou');
    localStorage.removeItem('jaVotouVariante');
    const sorteio = [...mapList].sort(() => 0.5 - Math.random()).slice(0, 3);
    const nomes = sorteio.map(m => m.name);
    
    const batch = writeBatch(db);
    mapList.forEach(m => batch.set(doc(db, "VOTOS", m.name), { quantidade: 0 }, { merge: true }));
    
    batch.set(doc(db, "sistema", "status"), {
        votacaoIniciada: true,
        mapasAtivos: nomes,
        vencedorNome: null
    }, { merge: true });

    await batch.commit();
});

document.getElementById('finish-btn')?.addEventListener('click', async () => {
    const statusSnap = await getDoc(doc(db, "sistema", "status"));
    const statusData = statusSnap.data();
    
    if (!statusData || !statusData.votacaoIniciada) return alert("Inicie a votação!");

    const snap = await getDocs(collection(db, "VOTOS"));
    
    let vencedor = { nome: statusData.mapasAtivos[0], votos: -1 };
    
    snap.forEach(d => {
        if (statusData.mapasAtivos.includes(d.id)) {
            const v = d.data().quantidade || 0;
            if (v > vencedor.votos) { vencedor = { nome: d.id, votos: v }; }
        }
    });

    await updateDoc(doc(db, "sistema", "status"), {
        votacaoIniciada: false,
        vencedorNome: vencedor.nome
    });
});

document.getElementById('reset-btn')?.addEventListener('click', async () => {
    if(!confirm("Deseja resetar tudo?")) return;
    const batch = writeBatch(db);
    
    batch.set(doc(db, "sistema", "status"), { 
        votacaoIniciada: false, 
        mapasAtivos: [], 
        vencedorNome: null 
    }, { merge: true });

    batch.set(doc(db, "sistema", "status_variante"), { votacaoAberta: true }, { merge: true });
    mapList.forEach(m => batch.set(doc(db, "VOTOS", m.name), { quantidade: 0 }, { merge: true }));
    
    const varSnap = await getDocs(collection(db, "VOTOS_VARIANTES"));
    varSnap.forEach(d => batch.delete(d.ref));

    await batch.commit();
    localStorage.removeItem('jaVotou');
    localStorage.removeItem('jaVotouVariante');
    window.location.reload();
});