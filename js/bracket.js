import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import {
  getAuth,
  onAuthStateChanged,
  signOut,
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import {
  getFirestore,
  doc,
  onSnapshot,
  getDoc,
  setDoc,
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import {
  collection,
  query,
  orderBy,
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

const ADMIN_UIDS = [
  "discord:1037035142860001400",
  "discord:1400218900284571689",
  "discord:743696235248091206",
];

let currentUser = null;
let isAdmin = false;
let currentTotalCamps = 1;
let deletedCamps = [];
let allTeams = [];
let currentBracketState = {};
let activeSlotId = null;

const urlParams = new URLSearchParams(window.location.search);
const currentCamp = urlParams.get("camp") || "1";

document.getElementById("page-main-title").innerText =
  `CHAVES - TORNEIO ${currentCamp}`;

onAuthStateChanged(auth, (user) => {
  if (user) {
    currentUser = user;
    isAdmin = ADMIN_UIDS.includes(user.uid);

    const userName =
      user.displayName ||
      (user.email ? user.email.split("@")[0] : "SOBREVIVENTE");
    document.getElementById("display-name").innerText = userName.toUpperCase();
    if (user.photoURL)
      document.getElementById("header-avatar").src = user.photoURL;

    if (isAdmin) {
      document.getElementById("admin-hint").innerHTML =
        "👑 ADMIN: Gerencie os resultados usando os ícones X (perdeu) e ✅ (ganhou) dentro dos cards.";
      document
        .querySelectorAll(".team-slot")
        .forEach((el) => el.classList.add("admin-mode"));
    }
    renderMenus();
  } else {
    window.location.href = "login.html";
  }
});

onSnapshot(doc(db, "sistema", "geral"), (docSnap) => {
  if (docSnap.exists()) {
    const data = docSnap.data();
    currentTotalCamps = data.totalCampeonatos || 1;
    deletedCamps = data.deletedCamps || [];
  }
  renderMenus();
});

function renderMenus() {
  const menuTeams = document.getElementById("camp-dropdown-teams");
  const menuBrackets = document.getElementById("camp-dropdown-brackets");
  if (!menuTeams || !menuBrackets) return;

  menuTeams.innerHTML = "";
  menuBrackets.innerHTML = "";
  let activeCamps = [];

  for (let i = 1; i <= currentTotalCamps; i++) {
    if (!deletedCamps.includes(i)) {
      activeCamps.push(i);
      menuTeams.innerHTML += `<a href="teams.html?camp=${i}">Campeonato ${i}</a>`;
      menuBrackets.innerHTML += `<a href="bracket.html?camp=${i}">Chaves ${i}</a>`;
    }
  }
  window.nextCampId = 1;
  while (activeCamps.includes(window.nextCampId)) window.nextCampId++;

  if (isAdmin) {
    menuTeams.innerHTML += `<a href="#" onclick="window.criarCampeonato(event)" class="dropdown-create-camp"><i class="fas fa-plus"></i> CRIAR CAMP ${window.nextCampId}</a>`;
  }
}

const qTeams = query(collection(db, "teams"), orderBy("createdAt", "desc"));
onSnapshot(qTeams, (snapshot) => {
  allTeams = [];
  snapshot.forEach((docSnap) => {
    const data = docSnap.data();
    if (data.campId == currentCamp) allTeams.push({ id: docSnap.id, ...data });
  });
});

const bracketRef = doc(db, "brackets", `camp_${currentCamp}`);
onSnapshot(bracketRef, (docSnap) => {
  if (docSnap.exists()) currentBracketState = docSnap.data();
  else currentBracketState = {};
  updateBracketUI();
});

function updateBracketUI() {
  const slots = [
    "q1",
    "q2",
    "q3",
    "q4",
    "q5",
    "q6",
    "q7",
    "q8",
    "s1",
    "s2",
    "s3",
    "s4",
    "f1",
    "f2",
    "champ",
  ];

  slots.forEach((slotId) => {
    const el = document.getElementById(`slot-${slotId}`);
    if (!el) return;

    el.classList.remove("is-winner", "is-loser");
    const slotData = currentBracketState[slotId];
    const teamIdInSlot = slotData ? slotData.teamId : null;
    const resultStatus = slotData ? slotData.status : null;

    if (teamIdInSlot) {
      const teamData = allTeams.find((t) => t.id === teamIdInSlot);

      if (resultStatus === "winner") el.classList.add("is-winner");
      if (resultStatus === "loser") el.classList.add("is-loser");

      let teamContent = `<img src="../assets/icon.jpg"> <span class="team-name" style="color:red;">EXCLUÍDO</span>`;
      if (teamData) {
        teamContent = `<img src="${teamData.logo}"> <span class="team-name">${teamData.name}</span>`;
      }

      let controls = "";
      if (isAdmin && teamData && slotId !== "champ") {
        if (resultStatus) {
          controls = `<div class="match-admin-controls"><button onclick="window.setPartidaResult(event, '${slotId}', '${teamData.id}', null)" class="btn-control reset" title="Desfazer Resultado"><i class="fas fa-undo"></i></button></div>`;
        } else {
          controls = `
                        <div class="match-admin-controls">
                            <button onclick="window.setPartidaResult(event, '${slotId}', '${teamData.id}', 'loser')" class="btn-control lose" title="Marcar Derrota"><i class="fas fa-times"></i></button>
                            <button onclick="window.setPartidaResult(event, '${slotId}', '${teamData.id}', 'winner')" class="btn-control win" title="Marcar Vitória"><i class="fas fa-check-circle"></i></button>
                        </div>
                    `;
        }
      }
      el.innerHTML = teamContent + controls;
    } else {
      el.innerHTML = `<img src="data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs=" style="opacity:0; height:70px;"> <span class="team-name" style="color:#555;">A DEFINIR</span>`;
    }
  });
}

const ADVANCE_MAP = {
  q1: "s1",
  q2: "s1",
  q3: "s2",
  q4: "s2",
  q5: "s3",
  q6: "s3",
  q7: "s4",
  q8: "s4",
  s1: "f1",
  s2: "f1",
  s3: "f2",
  s4: "f2",
  f1: "champ",
  f2: "champ",
};

window.setPartidaResult = async (event, slotId, teamId, status) => {
  event.stopPropagation();

  let newState = JSON.parse(JSON.stringify(currentBracketState));
  const nextSlotId = ADVANCE_MAP[slotId];

  let opponentSlotId = null;
  for (let key in ADVANCE_MAP) {
    if (ADVANCE_MAP[key] === nextSlotId && key !== slotId) {
      opponentSlotId = key;
      break;
    }
  }

  if (!newState[slotId]) newState[slotId] = { teamId: teamId };

  if (status === "winner") {
    newState[slotId].status = "winner";
    if (opponentSlotId && newState[opponentSlotId]) {
      newState[opponentSlotId].status = "loser";
    }
    newState[nextSlotId] = { teamId: teamId, status: null };
  } else if (status === "loser") {
    newState[slotId].status = "loser";
    if (opponentSlotId && newState[opponentSlotId]) {
      newState[opponentSlotId].status = "winner";
      newState[nextSlotId] = {
        teamId: newState[opponentSlotId].teamId,
        status: null,
      };
    }
  } else if (status === null) {
    newState[slotId].status = null;
    if (opponentSlotId && newState[opponentSlotId]) {
      newState[opponentSlotId].status = null;
    }
    if (
      newState[nextSlotId] &&
      (newState[nextSlotId].teamId === teamId ||
        (opponentSlotId &&
          newState[opponentSlotId] &&
          newState[nextSlotId].teamId === newState[opponentSlotId].teamId))
    ) {
      newState[nextSlotId] = null;
    }
  }

  try {
    await setDoc(bracketRef, newState);
  } catch (e) {
    alert("Erro ao atualizar resultado da partida.");
    console.error(e);
  }
};

window.handleSlotClick = (event, slotId) => {
  if (!isAdmin) return;

  if (!slotId.startsWith("q")) {
    return alert(
      "Admin: Só é possível inserir times na base da pirâmide (Quartas de Final). O restante avança pelas vitórias (✅)!",
    );
  }

  activeSlotId = slotId;

  const btnRemove = document.getElementById("btn-remove-team-modal");
  if (currentBracketState[slotId] && currentBracketState[slotId].teamId) {
    btnRemove.style.display = "flex";
  } else {
    btnRemove.style.display = "none";
  }

  const modalList = document.getElementById("modal-team-list");
  modalList.innerHTML = "";

  if (allTeams.length === 0) {
    modalList.innerHTML =
      '<p style="color:#888; text-align:center;">Nenhuma equipe cadastrada neste campeonato ainda.</p>';
  } else {
    allTeams.forEach((team) => {
      modalList.innerHTML += `<div class="modal-team-item" onclick="window.assignTeamToSlot('${team.id}')"><img src="${team.logo}"><span class="team-name" style="font-size: 1rem;">${team.name}</span></div>`;
    });
  }
  document.getElementById("select-team-modal").classList.add("open");
};

window.assignTeamToSlot = async (teamId) => {
  try {
    await setDoc(
      bracketRef,
      { [activeSlotId]: { teamId: teamId, status: null } },
      { merge: true },
    );
    window.closeModal("select-team-modal");
  } catch (e) {
    alert("Erro ao salvar chave.");
  }
};

window.clearSlot = async () => {
  if (!activeSlotId) return;
  try {
    await setDoc(bracketRef, { [activeSlotId]: null }, { merge: true });
    window.closeModal("select-team-modal");
  } catch (e) {
    alert("Erro ao limpar chave.");
  }
};

window.closeModal = (id) =>
  document.getElementById(id).classList.remove("open");
window.closeModalOut = (e, id) => {
  if (e.target.id === id) window.closeModal(id);
};
document.getElementById("user-profile-trigger").onclick = (e) => {
  e.stopPropagation();
  document.getElementById("user-submenu").classList.toggle("hidden");
};
window.onclick = () =>
  document.getElementById("user-submenu").classList.add("hidden");
document.getElementById("logout-btn").onclick = () => signOut(auth);

// Helper function
window.criarCampeonato = async (e) => {
  e.preventDefault();
  if (
    !confirm(
      `Deseja abrir as inscrições para o Campeonato ${window.nextCampId}?`,
    )
  )
    return;
  const refDoc = doc(db, "sistema", "geral");
  try {
    const snap = await getDoc(refDoc);
    if (!snap.exists()) {
      await setDoc(
        refDoc,
        {
          totalCampeonatos: window.nextCampId,
          deletedCamps: [],
          lockedCamps: [],
        },
        { merge: true },
      );
    } else {
      let updates = {};
      if (window.nextCampId > currentTotalCamps)
        updates.totalCampeonatos = window.nextCampId;
      else if (deletedCamps.includes(window.nextCampId))
        updates.deletedCamps = deletedCamps.filter(
          (id) => id !== window.nextCampId,
        );
      if (Object.keys(updates).length > 0) await updateDoc(refDoc, updates);
    }
    window.location.href = `teams.html?camp=${window.nextCampId}`;
  } catch (err) {
    alert("Erro ao criar campeonato. Permissão Negada.");
  }
};
