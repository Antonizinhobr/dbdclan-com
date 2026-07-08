import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { getFirestore, collection, addDoc, onSnapshot, query, orderBy, serverTimestamp, deleteDoc, doc, updateDoc, getDoc, setDoc, increment, writeBatch } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyARpVKfzOMm-v0pv9-7w9xahvhItosrI2Q",
    authDomain: "dbd-camp.firebaseapp.com",
    projectId: "dbd-camp",
    storageBucket: "dbd-camp.firebasestorage.app",
    messagingSenderId: "357760091556",
    appId: "1:357760091556:web:4d9191b487baf240e92d31"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

const ADMIN_UIDS = [
    "discord:1400218900284571689",
    "discord:1522742461389078568",
    "discord:743696235248091206"
];

let currentUser = null;
let isAdmin = false;

let currentTotalCamps = 1;
let lockedCamps = [];
let deletedCamps = [];
let isCurrentCampLocked = false;
window.nextCampId = 1;

const urlParams = new URLSearchParams(window.location.search);
const currentCamp = urlParams.get('camp') || '1'; 

document.getElementById('page-main-title').innerText = `EQUIPES DO TORNEIO ${currentCamp}`;
document.getElementById('modal-title-camp').innerText = `INSCRIÇÃO - TORNEIO ${currentCamp}`;

window.currentViewedTeamId = null;

onAuthStateChanged(auth, (user) => {
    if (user) {
        currentUser = user;
        isAdmin = ADMIN_UIDS.includes(user.uid);
        
        const userName = user.displayName || (user.email ? user.email.split("@")[0] : "SOBREVIVENTE");
        document.getElementById("display-name").innerText = userName.toUpperCase();
        if(user.photoURL) document.getElementById("header-avatar").src = user.photoURL;

        renderCampDropdown();
        updateCampUI();
    } else {
        window.location.href = "login.html";
    }
});

document.getElementById('user-profile-trigger').onclick = (e) => {
    e.stopPropagation();
    document.getElementById('user-submenu').classList.toggle('hidden');
};
window.onclick = () => document.getElementById('user-submenu').classList.add('hidden');
document.getElementById('logout-btn').onclick = () => signOut(auth);

let allTeams = [];
let registeredEmails = new Set(); 
let draftMembers = []; 

// ==========================================
// LÓGICA DE GERENCIAMENTO DE CAMPEONATOS
// ==========================================
onSnapshot(doc(db, "sistema", "geral"), (docSnap) => {
    if (docSnap.exists()) {
        const data = docSnap.data();
        currentTotalCamps = data.totalCampeonatos || 1;
        lockedCamps = data.lockedCamps || [];
        deletedCamps = data.deletedCamps || [];
    }

    const campInt = parseInt(currentCamp);

    if (deletedCamps.includes(campInt)) {
        document.querySelector('main').innerHTML = '<h2 class="camp-deleted-msg"><i class="fas fa-skull"></i> ESTE CAMPEONATO FOI EXCLUÍDO PELA ENTIDADE.</h2>';
        renderCampDropdown();
        return;
    }

    isCurrentCampLocked = lockedCamps.includes(campInt);
    updateCampUI();
    renderCampDropdown();
});

function updateCampUI() {
    const banner = document.getElementById('camp-status-banner');
    const btnCreate = document.getElementById('btn-create-team-main');
    const adminControls = document.getElementById('admin-camp-controls');
    const lockBtn = document.getElementById('btn-toggle-lock');

    if (isAdmin) adminControls.classList.remove('hidden');
    else adminControls.classList.add('hidden');

    if (isCurrentCampLocked) {
        banner.classList.remove('hidden');
        btnCreate.classList.add('hidden'); 
        
        if (isAdmin) {
            lockBtn.innerHTML = '<i class="fas fa-unlock"></i> REABRIR INSCRIÇÕES';
            lockBtn.classList.remove('admin-btn-unlocked');
            lockBtn.classList.add('admin-btn-locked');
        }
    } else {
        banner.classList.add('hidden');
        btnCreate.classList.remove('hidden');
        
        if (isAdmin) {
            lockBtn.innerHTML = '<i class="fas fa-lock"></i> ENCERRAR INSCRIÇÕES';
            lockBtn.classList.remove('admin-btn-locked');
            lockBtn.classList.add('admin-btn-unlocked');
        }
    }
}

function renderCampDropdown() {
    const menuTeams = document.getElementById('camp-dropdown-teams');
    const menuBrackets = document.getElementById('camp-dropdown-brackets');
    
    if(menuTeams) menuTeams.innerHTML = ''; 
    if(menuBrackets) menuBrackets.innerHTML = '';

    let activeCamps = [];

    for (let i = 1; i <= currentTotalCamps; i++) {
        if (!deletedCamps.includes(i)) {
            activeCamps.push(i);
            const isLocked = lockedCamps.includes(i) ? ' <i class="fas fa-lock icon-lock-small"></i>' : '';
            
            if(menuTeams) menuTeams.innerHTML += `<a href="teams.html?camp=${i}">Campeonato ${i}${isLocked}</a>`;
            if(menuBrackets) menuBrackets.innerHTML += `<a href="bracket.html?camp=${i}">Chaves ${i}</a>`;
        }
    }

    window.nextCampId = 1;
    while (activeCamps.includes(window.nextCampId)) {
        window.nextCampId++;
    }

    if (isAdmin) {
        if(menuTeams) {
            menuTeams.innerHTML += `
                <a href="#" onclick="window.criarCampeonato(event)" class="dropdown-create-camp">
                    <i class="fas fa-plus"></i> CRIAR CAMP ${window.nextCampId}
                </a>
            `;
        }
    }
}

window.criarCampeonato = async (e) => {
    e.preventDefault();
    if (!confirm(`Deseja abrir as inscrições para o Campeonato ${window.nextCampId}?`)) return;
    
    const refDoc = doc(db, "sistema", "geral");
    try {
        const snap = await getDoc(refDoc);
        if (!snap.exists()) {
            await setDoc(refDoc, { totalCampeonatos: window.nextCampId, deletedCamps: [], lockedCamps: [] }, { merge: true });
        } else {
            let updates = {};
            
            if (window.nextCampId > currentTotalCamps) {
                updates.totalCampeonatos = window.nextCampId;
            } 
            else if (deletedCamps.includes(window.nextCampId)) {
                updates.deletedCamps = deletedCamps.filter(id => id !== window.nextCampId);
            }
            
            if (Object.keys(updates).length > 0) {
                await updateDoc(refDoc, updates);
            }
        }
        
        window.location.href = `teams.html?camp=${window.nextCampId}`;
    } catch(err) {
        alert("Erro ao criar campeonato. Permissão Negada.");
        console.error(err);
    }
};

window.toggleLockCamp = async () => {
    const refDoc = doc(db, "sistema", "geral");
    let newLocked = [...lockedCamps];
    const campInt = parseInt(currentCamp);
    
    if (isCurrentCampLocked) {
        newLocked = newLocked.filter(c => c !== campInt);
        alert(`As inscrições para o Campeonato ${campInt} foram REABERTAS!`);
    } else {
        newLocked.push(campInt);
        alert(`O Campeonato ${campInt} foi BLOQUEADO! Ninguém mais pode criar ou excluir times.`);
    }
    
    await setDoc(refDoc, { lockedCamps: newLocked }, { merge: true });
};

window.deleteCamp = async () => {
    const campInt = parseInt(currentCamp);
    if (!confirm(`⚠️ ATENÇÃO EXTREMA: Você está prestes a EXCLUIR o Campeonato ${campInt} e TODOS OS SEUS TIMES.\n\nIsso NÃO pode ser desfeito. Tem certeza?`)) return;
    
    const btn = document.getElementById('btn-delete-camp');
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> EXCLUINDO...';
    btn.disabled = true;

    try {
        const teamsToDelete = allTeams.filter(t => t.campId == currentCamp);
        const batch = writeBatch(db); 
        teamsToDelete.forEach(t => {
            batch.delete(doc(db, "teams", t.id));
        });
        await batch.commit();

        const refDoc = doc(db, "sistema", "geral");
        let newDeleted = [...deletedCamps];
        if (!newDeleted.includes(campInt)) newDeleted.push(campInt);
        
        let newLocked = lockedCamps.filter(c => c !== campInt);
        
        await setDoc(refDoc, { deletedCamps: newDeleted, lockedCamps: newLocked }, { merge: true });

        alert("Campeonato e times excluídos permanentemente!");
        
        let activeCamps = [];
        for (let i = 1; i <= currentTotalCamps; i++) {
            if (!newDeleted.includes(i)) activeCamps.push(i);
        }
        const proximoValido = activeCamps.length > 0 ? Math.min(...activeCamps) : 1;
        
        window.location.href = `teams.html?camp=${proximoValido}`;
    } catch (err) {
        console.error(err);
        alert("Erro ao excluir o campeonato.");
        btn.innerHTML = '<i class="fas fa-trash-alt"></i> EXCLUIR CAMPEONATO';
        btn.disabled = false;
    }
};

// ==========================================
// CARREGAR EQUIPES DO BANCO DE DADOS E REGISTRAR EMAILS
// ==========================================
const q = query(collection(db, "teams"), orderBy("createdAt", "desc"));

onSnapshot(q, (snapshot) => {
    allTeams = [];
    registeredEmails.clear();

    snapshot.forEach((docSnap) => {
        const data = docSnap.data();
        allTeams.push({ id: docSnap.id, ...data });
        
        // Cadastra os e-mails apenas do campeonato atual para bloqueio
        if(data.campId == currentCamp) {
            if(data.leaderEmail) registeredEmails.add(data.leaderEmail.toLowerCase());
            if(data.members) data.members.forEach(m => registeredEmails.add(m.email.toLowerCase()));
        }
    });
    
    renderTeamsGrid();

    if (window.currentViewedTeamId) {
        const updatedTeam = allTeams.find(t => t.id === window.currentViewedTeamId);
        if (updatedTeam) window.openViewModal(updatedTeam);
        else window.closeModal('team-modal'); 
    }
});

function renderTeamsGrid() {
    const grid = document.getElementById('teams-grid');
    if(!grid) return;
    grid.innerHTML = '';

    const filteredTeams = allTeams.filter(team => team.campId == currentCamp);

    if (filteredTeams.length === 0) {
        grid.innerHTML = '<p class="empty-msg">Nenhuma equipe cadastrada para este campeonato ainda.</p>';
        return;
    }

    filteredTeams.forEach(team => {
        const card = document.createElement('div');
        card.className = 'team-card'; 
        card.innerHTML = `
            <img src="${team.logo}" alt="${team.name}">
            <div class="team-info">
                <div class="team-name-card">${team.name}</div>
                <div class="team-leader-card">Capitão: ${team.leaderName}</div>
            </div>
        `;
        card.onclick = () => {
            window.currentViewedTeamId = team.id;
            window.openViewModal(team);
        };
        grid.appendChild(card);
    });
}

// ==========================================
// LÓGICA DE EXCLUSÃO DE TIME E ASSASSINO
// ==========================================
window.deleteTeam = async (teamId) => {
    if(isCurrentCampLocked && !isAdmin) return alert("Ações bloqueadas! O Campeonato foi encerrado.");
    if(!confirm("⚠️ AVISO: Deseja realmente excluir esta equipe permanentemente?")) return;
    try {
        await deleteDoc(doc(db, "teams", teamId));
        window.closeModal('team-modal');
        alert("Equipe removida com sucesso!");
    } catch(e) {
        alert("Erro ao excluir equipe. Permissão negada.");
    }
};

window.toggleKiller = async (teamId, memberEmail) => {
    if(isCurrentCampLocked && !isAdmin) return alert("Ações bloqueadas! O Campeonato foi encerrado.");
    try {
        await updateDoc(doc(db, "teams", teamId), { killerEmail: memberEmail });
    } catch(e) {
        alert("Erro ao definir papel.");
    }
};

// ==========================================
// VISUALIZAR EQUIPE CADASTRADA
// ==========================================
window.openViewModal = (team) => {
    document.getElementById('m-team-logo').src = team.logo;
    document.getElementById('m-team-leader').innerText = team.leaderName;
    document.getElementById('m-team-name').innerText = team.name;
    
    const userToCheck = auth.currentUser || currentUser;
    const isCaptain = userToCheck && (
        (team.leaderUid && userToCheck.uid === team.leaderUid) || 
        (userToCheck.email && userToCheck.email.toLowerCase() === team.leaderEmail.toLowerCase())
    );
    
    let canEdit = isCaptain || isAdmin;
    if (isCurrentCampLocked && !isAdmin) canEdit = false;

    const deleteBtn = document.getElementById('delete-team-btn');
    if (canEdit) {
        deleteBtn.classList.remove('hidden');
    } else {
        deleteBtn.classList.add('hidden');
    }

    const grid = document.getElementById('m-members-grid');
    grid.innerHTML = '';

    const elencoCompleto = [
        { name: team.leaderName, email: team.leaderEmail, isCap: true, img: "../assets/icon.jpg" },
        ...(team.members || [])
    ];

    elencoCompleto.forEach(person => {
        const isKiller = team.killerEmail === person.email;
        
        const coroa = person.isCap ? '<i class="fas fa-crown icon-crown-cap"></i>' : '';
        const caveira = isKiller ? '<i class="fas fa-skull icon-skull-killer"></i>' : '';
        
        const avatarClass = isKiller ? 'is-killer' : (person.isCap ? 'is-cap' : 'is-normal');
        const nameClass = isKiller ? 'is-killer' : (person.isCap ? 'is-cap' : 'is-normal');
        const btnClass = isKiller ? 'is-killer' : 'is-normal';

        let toggleBtn = '';
        if (canEdit) {
            toggleBtn = `<button onclick="window.toggleKiller('${team.id}', '${person.email}')" class="btn-toggle-killer ${btnClass}">
                ${isKiller ? 'REMOVER ASSASSINO' : 'MARCAR ASSASSINO'}
            </button>`;
        }

        const mCard = document.createElement('div');
        mCard.className = 'member-card member-card-wrapper';
        mCard.innerHTML = `
            <div class="member-avatar-wrapper">
                ${coroa}
                <img src="${person.img}" class="member-avatar ${avatarClass}">
                ${caveira}
            </div>
            <div class="member-name ${nameClass}">${person.name}</div>
            ${toggleBtn}
        `;
        grid.appendChild(mCard);
    });

    document.getElementById('team-modal').classList.add('open');
};

// ==========================================
// CRIAR EQUIPE E ADICIONAR MEMBROS
// ==========================================
window.openCreateTeamModal = () => {
    if(isCurrentCampLocked && !isAdmin) return alert("As inscrições para este campeonato estão encerradas!");
    
    const user = auth.currentUser || currentUser;
    if (!user) return alert("Sessão inválida. Por favor, aguarde ou recarregue a página.");

    // NOVA REGRA: Verifica se o usuário logado já está em algum time!
    const userEmail = user.email ? user.email.toLowerCase() : "";
    if (userEmail && registeredEmails.has(userEmail)) {
        return alert("Você já está cadastrado em uma equipe neste campeonato! Cada jogador pode participar de apenas um time.");
    }

    document.getElementById('t-name').value = '';
    document.getElementById('t-logo').value = '';
    document.getElementById('t-cap-name').value = user.displayName || "";
    document.getElementById('t-cap-email').value = user.email || ""; 
    
    draftMembers = [];
    window.renderDraftMembers();
    
    document.getElementById('t-step-1').classList.remove('hidden');
    document.getElementById('t-step-2').classList.add('hidden');
    document.getElementById('t-step-indicator').innerText = 'Passo 1 de 2';
    
    document.getElementById('create-team-modal').classList.add('open');
};

window.nextTeamStep = () => {
    const name = document.getElementById('t-name').value.trim();
    const capName = document.getElementById('t-cap-name').value.trim();
    const capEmail = document.getElementById('t-cap-email').value.trim().toLowerCase();
    const fileInput = document.getElementById('t-logo');

    if (!name || !capName || !capEmail) return alert("Preencha o Nome da Equipe, Capitão e E-mail!");
    
    if (fileInput.files.length > 0) {
        const file = fileInput.files[0];
        if (!file.type.startsWith('image/')) return alert("Por favor, selecione um arquivo de imagem válido (JPG ou PNG).");
        if (file.size > 2 * 1024 * 1024) return alert("A imagem é muito pesada! O tamanho máximo permitido é 2MB.");
    }

    if (registeredEmails.has(capEmail)) {
        return alert(`Erro: O capitão (${capEmail}) já está registrado em outra equipe no torneio atual!`);
    }

    document.getElementById('t-step-1').classList.add('hidden');
    document.getElementById('t-step-2').classList.remove('hidden');
    document.getElementById('t-step-indicator').innerText = 'Passo 2 de 2';
};

window.prevTeamStep = () => {
    document.getElementById('t-step-2').classList.add('hidden');
    document.getElementById('t-step-1').classList.remove('hidden');
    document.getElementById('t-step-indicator').innerText = 'Passo 1 de 2';
};

window.addDraftMember = () => {
    if (draftMembers.length >= 4) return alert("Limite de Membros atingido! Uma equipe pode ter no máximo 4 membros além do Capitão (Total de 5 jogadores).");

    const mName = document.getElementById('m-name').value.trim();
    const mEmail = document.getElementById('m-email').value.trim().toLowerCase();
    const capEmail = document.getElementById('t-cap-email').value.trim().toLowerCase();

    if (!mName || !mEmail) return alert("Preencha o Nome e o E-mail do membro!");
    
    if (mEmail === capEmail) return alert("O capitão já faz parte do time automaticamente!");
    if (draftMembers.some(m => m.email === mEmail)) return alert("Você já adicionou este e-mail na lista abaixo!");
    if (registeredEmails.has(mEmail)) return alert(`Erro: O e-mail ${mEmail} já pertence a outro time neste torneio! Peça para ele fornecer outro e-mail válido.`);

    draftMembers.push({ name: mName, email: mEmail, img: "../assets/icon.jpg" });
    
    document.getElementById('m-name').value = '';
    document.getElementById('m-email').value = '';
    window.renderDraftMembers();
};

window.removeDraftMember = (index) => {
    draftMembers.splice(index, 1);
    window.renderDraftMembers();
};

window.renderDraftMembers = () => {
    const container = document.getElementById('draft-members-list');
    if (draftMembers.length === 0) {
        container.innerHTML = '<p class="empty-draft-text">Nenhum membro adicionado ainda.</p>';
        return;
    }

    container.innerHTML = draftMembers.map((m, i) => `
        <div class="draft-member-item">
            <div>
                <strong class="draft-member-name">${m.name}</strong>
                <div class="draft-member-email">${m.email}</div>
            </div>
            <i class="fas fa-trash btn-draft-delete" onclick="window.removeDraftMember(${i})"></i>
        </div>
    `).join('');
};

// ==========================================
// SUBMETER EQUIPE (COM UPLOAD VIA IMGBB E VALIDAÇÃO)
// ==========================================
window.submitTeam = async () => {
    if(isCurrentCampLocked && !isAdmin) return alert("As inscrições para este campeonato estão encerradas!");

    // NOVA REGRA: Obrigar a ter exatamente 4 membros adicionados no elenco (total de 5 no time)
    if (draftMembers.length < 4) {
        return alert("Erro: Sua equipe está incompleta! Você precisa adicionar exatamente 4 membros (além do Capitão) para finalizar a inscrição.");
    }

    const user = auth.currentUser || currentUser;
    const tName = document.getElementById('t-name').value.trim();
    const capName = document.getElementById('t-cap-name').value.trim();
    const capEmail = document.getElementById('t-cap-email').value.trim().toLowerCase();
    const fileInput = document.getElementById('t-logo');
    const btnSubmit = document.getElementById('submit-team-btn');

    btnSubmit.innerHTML = '<i class="fas fa-spinner fa-spin"></i> SALVANDO NA NÉVOA...';
    btnSubmit.disabled = true;

    try {
        let logoUrl = "https://i.ibb.co/ds7hn376/Batutinha.png"; 
        
        if (fileInput.files.length > 0) {
            const file = fileInput.files[0];
            const formData = new FormData();
            formData.append("image", file);
            
            const IMGBB_API_KEY = "02ac971f74c655e88eb932d14930342f"; 
            
            const response = await fetch(`https://api.imgbb.com/1/upload?key=${IMGBB_API_KEY}`, {
                method: "POST",
                body: formData
            });
            
            const imgbbData = await response.json();
            
            if (imgbbData.success) {
                logoUrl = imgbbData.data.url; 
            } else {
                throw new Error("O servidor de imagens recusou o arquivo.");
            }
        }

        const newTeamData = {
            campId: currentCamp, 
            name: tName,
            leaderName: capName,
            leaderEmail: capEmail,
            leaderUid: user.uid, 
            killerEmail: "", 
            logo: logoUrl,
            members: draftMembers,
            createdAt: serverTimestamp()
        };

        await addDoc(collection(db, "teams"), newTeamData);
        
        window.closeModal('create-team-modal');
        alert("Equipe forjada com sucesso! Que a Entidade tenha piedade de vocês.");

        // ==========================================
        // INTEGRAÇÃO COM DISCORD WEBHOOK
        // ==========================================
        const webhookUrl = "https://discord.com/api/webhooks/1524454164904808558/EEBzHbxPgavMeP3RDKm_d4IDPlMJy9BAKtzzaWVjFhjyBN8NklZooRHRCXb432Eyeiei";
        
        // Formata os membros adicionais para o embed
        const membersListString = draftMembers.map(m => `🔪 **${m.name}**`).join('\n');

        const embedData = {
            embeds: [
                {
                    title: "🩸 NOVA EQUIPE FORJADA NA NÉVOA! 🩸",
                    description: `Um novo time acaba de realizar sua inscrição para o **Torneio ${currentCamp}**! Que a Entidade tenha piedade de suas almas...`,
                    color: 10038562, // Vermelho Escuro / Cor de sangue
                    thumbnail: {
                        url: logoUrl
                    },
                    fields: [
                        {
                            name: "🛡️ NOME DA EQUIPE",
                            value: `**${tName}**`,
                            inline: true
                        },
                        {
                            name: "👑 CAPITÃO",
                            value: `${capName}`,
                            inline: true
                        },
                        {
                            name: "👥 ELENCO DE SOBREVIVENTES",
                            value: membersListString,
                            inline: false
                        }
                    ],
                    footer: {
                        text: "DbD - Inscrição de Equipes",
                        icon_url: "https://i.ibb.co/ds7hn376/Batutinha.png"
                    },
                    timestamp: new Date().toISOString()
                }
            ]
        };

        fetch(webhookUrl, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(embedData)
        }).catch(err => console.error("Falha ao enviar aviso pro Discord:", err));

    } catch (error) {
        console.error("Erro ao salvar equipe:", error);
        alert("Ocorreu um erro no upload da imagem ou ao salvar a equipe. Tente novamente.");
    } finally {
        btnSubmit.innerText = "FINALIZAR INSCRIÇÃO";
        btnSubmit.disabled = false;
    }
};

window.closeModal = (modalId) => {
    document.getElementById(modalId).classList.remove('open');
    if(modalId === 'team-modal') window.currentViewedTeamId = null;
};

window.closeModalOut = (event, modalId) => {
    if (event.target.id === modalId) window.closeModal(modalId);
};