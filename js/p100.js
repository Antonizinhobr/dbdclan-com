import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import {
    getAuth,
    onAuthStateChanged,
    signOut,
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import {
    getFirestore,
    collection,
    addDoc,
    onSnapshot,
    query,
    orderBy,
    doc,
    updateDoc,
    serverTimestamp,
    getDoc,
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyARpVKfzOMm-v0pv9-7w9xahvhItosrI2Q",
    authDomain: "dbd-camp.firebaseapp.com",
    projectId: "dbd-camp",
    storageBucket: "dbd-camp.firebasestorage.app",
    messagingSenderId: "357760091556",
    appId: "1:357760091556:web:4d9191b487baf240e92d31",
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

const MAKE_WEBHOOK_URL = "https://hook.us2.make.com/zocc3p6xafnet5su7pk24ax62luys8mt";

const ADMIN_UIDS = [
    "discord:1400218900284571689",
    "discord:392062765323255828",
    "discord:644323555462479892",
    "discord:804843307568988180",
    "discord:361362105363857408",
];

let currentUser = null;
let isAdmin = false;

const survivorFiles = [
    "Ace.png", "Ada Wong.png", "Adam.png", "Aestri.png", "Allan Wake.png", "Ash.png", "Bill.png", "Cheryl.png",
    "Claudette.png", "David King.png", "David Tapp.png", "Dustin.png", "Dwight.png", "Ellen Ripley.png", "Elodie.png",
    "Felix.png", "Feng Min.png", "Gabriel Soma.png", "Haddie.png", "Jake.png", "Jane.png", "Jeff.png", "Jill.png",
    "Jonag.png", "Kate.png", "Lara Croft.png", "Leon.png", "Meg.png", "Michonne.png", "Mikaela.png", "Nancy.png",
    "Nea.png", "Nickolas Cage.png", "Onze.png", "Orela.png", "Quentin.png", "Rebeca.png", "Renato.png", "Rick Grimes.png",
    "Sable.png", "Steve.png", "Taurie.png", "Thalita.png", "Trevor Belmont.png", "Vee.png", "Vittoria.png", "Yoichi.png",
    "Yui Kimura.png", "Yun Jin.png", "Zarina.png"
];

const killerFiles = [
    "Wesker.png", "Pinhead.png", "Shape.png", "Artista.png", "Blight.png", "Clow.png", "Deathslinger.png", "Demogorgon.png",
    "Unknown.png", "Doctor.png", "Draga.png", "Freddy.png", "Ghostface.png", "Hag.png", "Hillbilly.png", "Huntress.png",
    "Krasue.png", "Leatherface.png", "Legion.png", "Lich.png", "Houndmaster.png", "Adriana.png", "Nemesis.png", "Nurse.png",
    "Xenomorph.png", "Chucky.png", "Knight.png", "Oni.png", "Twins.png", "Pig.png", "Piramide.png", "Plague.png",
    "Sadako.png", "Singularity.png", "Spirit.png", "Drácula.png", "Ghoul.png", "Springtrap.png", "Trapper.png", "Trickster.png",
    "Vecna.png", "Wraith.png"
];

let selectedP100CharObj = null;

onAuthStateChanged(auth, (user) => {
    if (user) {
        currentUser = user;
        isAdmin = ADMIN_UIDS.includes(user.uid);
        document.getElementById("display-name").innerText = (user.displayName || "SOBREVIVENTE").toUpperCase();

        if (isAdmin) {
            document.getElementById("admin-p100-section").classList.remove("hidden");
        }

        loadTickets();
    } else {
        window.location.href = "login.html";
    }
});

function formatCharName(filename) {
    return filename
        .replace(".png", "")
        .replace(/([A-Z])/g, " $1")
        .trim();
}

window.loadP100Chars = (role) => {
    document.getElementById("btn-p100-surv").classList.remove("active");
    document.getElementById("btn-p100-kill").classList.remove("active");

    if (role === "survivor") {
        document.getElementById("btn-p100-surv").classList.add("active");
    } else {
        document.getElementById("btn-p100-kill").classList.add("active");
    }

    const grid = document.getElementById("p100-char-grid");
    grid.innerHTML = "";

    const fileList = role === "survivor" ? survivorFiles : killerFiles;
    const folder = role === "survivor" ? "survivors" : "killers";

    fileList.forEach((file) => {
        const cleanName = formatCharName(file);
        const fullPath = `../assets/img/dbd/${folder}/${file}`;

        const el = document.createElement("div");
        el.className = "selectable-item";
        el.innerHTML = `
            <img src="${fullPath}">
            <div class="char-name-hidden" style="display:none;">${cleanName.toLowerCase()}</div>
        `;
        el.onclick = () => window.selectP100Char(el, cleanName, fullPath);
        grid.appendChild(el);
    });
};

window.selectP100Char = (element, name, path) => {
    document.querySelectorAll("#p100-char-grid .selectable-item").forEach((el) => el.classList.remove("selected"));
    element.classList.add("selected");

    selectedP100CharObj = { name: name, path: path };

    document.getElementById("selected-p100-char-slot").innerHTML = `<img src="${path}" style="border-radius: 6px;">`;
    document.getElementById("selected-p100-char-name").innerText = name;
};

window.searchP100Grid = (term) => {
    term = term.toLowerCase();
    const items = document.querySelectorAll("#p100-char-grid .selectable-item");
    
    items.forEach((item) => {
        const name = item.querySelector(".char-name-hidden").innerText;
        item.style.display = name.includes(term) ? "block" : "none";
    });
};

window.submitP100Ticket = async () => {
    const msg = document.getElementById("p100-msg").value.trim();
    const fileInput = document.getElementById("p100-file");
    const btn = document.getElementById("btn-submit-p100");

    if (!selectedP100CharObj) {
        return alert("Selecione qual personagem você colocou P100 na grade visual!");
    }
    if (fileInput.files.length === 0) {
        return alert("Envie o print de tela inteira comprovando o P100!");
    }

    btn.innerText = "ENVIANDO PROVA PARA A IMGBB...";
    btn.disabled = true;

    try {
        const formData = new FormData();
        formData.append("image", fileInput.files[0]);
        
        const res = await fetch(`https://api.imgbb.com/1/upload?key=02ac971f74c655e88eb932d14930342f`, { 
            method: "POST", 
            body: formData 
        });
        
        const imgData = await res.json();

        await addDoc(collection(db, "tickets_p100"), {
            uid: currentUser.uid,
            userName: currentUser.displayName,
            userAvatar: currentUser.photoURL,
            character: selectedP100CharObj.name,
            charImgPath: selectedP100CharObj.path,
            message: msg,
            proofImg: imgData.data.url,
            status: "pending",
            createdAt: serverTimestamp(),
        });

        alert("Solicitação enviada! Aguarde a análise da Entidade.");
        window.closeModal("p100-modal");
    } catch (e) {
        alert("Erro ao enviar ticket. Verifique sua conexão.");
        console.error(e);
    } finally {
        btn.innerText = "ENVIAR PARA ANÁLISE";
        btn.disabled = false;
    }
};

function loadTickets() {
    const qAdmin = query(collection(db, "tickets_p100"), orderBy("createdAt", "desc"));
    
    onSnapshot(qAdmin, (snap) => {
        const adminGrid = document.getElementById("tickets-grid");
        const userGrid = document.getElementById("my-tickets-list");
        
        if (adminGrid) adminGrid.innerHTML = "";
        if (userGrid) userGrid.innerHTML = "";

        snap.forEach((docSnap) => {
            const t = docSnap.data();
            const charIconHtml = t.charImgPath
                ? `<img src="${t.charImgPath}" style="width: 30px; height: 30px; border-radius: 4px; border: 1px solid #555; vertical-align: middle;">`
                : "";

            let adminControls = "";
            if (isAdmin && t.status === "pending") {
                adminControls = `
                    <div class="admin-actions">
                        <button class="btn-approve" onclick="window.processTicket('${docSnap.id}', 'approved')">APROVAR</button>
                        <button class="btn-reject" onclick="window.processTicket('${docSnap.id}', 'rejected')">REJEITAR</button>
                    </div>
                `;
            }

            const ticketHtml = `
                <div class="ticket-card ${t.status}">
                    <span class="ticket-status status-${t.status}">${t.status}</span>
                    <img src="${t.proofImg}" class="ticket-img" onclick="window.open('${t.proofImg}', '_blank')" title="Clique para ampliar">
                    <div class="ticket-info">
                        <strong>${t.userName}</strong> <br>
                        <div style="margin-top: 5px; color: #ccc;">
                            ${charIconHtml} ${t.character}
                        </div>
                        <p class="ticket-msg">"${t.message || "Sem mensagem."}"</p>
                    </div>
                    ${adminControls}
                </div>
            `;
            
            if (isAdmin && adminGrid) {
                adminGrid.innerHTML += ticketHtml;
            }
            
            if (t.uid === currentUser.uid && userGrid) {
                userGrid.innerHTML += ticketHtml;
            }
        });
    });
}

window.processTicket = async (id, newStatus) => {
    let reason = null;
    
    if (newStatus === "rejected") {
        reason = prompt("Motivo da rejeição (aparecerá para o jogador):");
        if (!reason) return;
    }

    try {
        const ticketRef = doc(db, "tickets_p100", id);
        const snap = await getDoc(ticketRef);
        const data = snap.data();

        await updateDoc(ticketRef, {
            status: newStatus,
            message: newStatus === "rejected" ? `REJEITADO: ${reason}` : data.message,
        });

        if (newStatus === "approved") {
            const discordId = data.uid.replace("discord:", "");

            fetch(MAKE_WEBHOOK_URL, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    discord_id: discordId,
                    character: data.character,
                    player_name: data.userName,
                    proof_url: data.proofImg,
                    message: data.message,
                }),
            });
            
            alert("P100 Aprovado! O cargo será atribuído automaticamente via Make.com no Discord.");
        }
    } catch (e) {
        alert("Erro ao processar ticket.");
        console.error(e);
    }
};

window.openP100Modal = () => {
    selectedP100CharObj = null;
    document.getElementById("selected-p100-char-slot").innerHTML = "";
    document.getElementById("selected-p100-char-name").innerText = "Nenhum personagem selecionado";
    document.getElementById("p100-search").value = "";
    
    window.loadP100Chars("survivor");
    document.getElementById("p100-modal").classList.add("open");
};

window.closeModal = (id) => {
    document.getElementById(id).classList.remove("open");
};

window.closeModalOut = (e, id) => {
    if (e.target.id === id) {
        window.closeModal(id);
    }
};

// --- CONTROLES DE USUÁRIO DO HEADER ---
const profileTrigger = document.getElementById("user-profile-trigger");
if (profileTrigger) {
    profileTrigger.onclick = (e) => {
        e.stopPropagation();
        document.getElementById("user-submenu").classList.toggle("hidden");
    };
}

window.addEventListener("click", () => {
    const sub = document.getElementById("user-submenu");
    if (sub && !sub.classList.contains("hidden")) {
        sub.classList.add("hidden");
    }
});

const logoutBtn = document.getElementById("logout-btn");
if (logoutBtn) {
    logoutBtn.onclick = () => {
        signOut(auth).then(() => {
            window.location.href = "login.html";
        });
    };
}