const ADMIN_UIDS = [
  "discord:1037035142860001400",
  "discord:1400218900284571689",
  "discord:743696235248091206"
];

const characters = [
  "Qualquer Assassino", "Qualquer Sobrevivente",
  
  // Assassinos
  "O Trapper", "A Wraith", "O Hillbilly", "A Nurse", "O Shape (Michael Myers)", 
  "A Hag", "O Doctor", "A Huntress", "O Cannibal", "O Nightmare (Freddy Krueger)", 
  "A Pig (Amanda Young)", "O Clown", "A Spirit", "A Legion", "A Plague", 
  "O Ghost Face (Danny Johnson)", "O Demogorgon", "O Oni", "O Deathslinger", 
  "O Executioner (Pyramid Head)", "O Blight", "Os Twins", "O Trickster", 
  "O Nemesis", "O Cenobite", "A Artist", "A Onryō", "O Dredge", 
  "O Mastermind (Albert Wesker)", "O Knight", "O Skull Merchant", "A Singularity", 
  "O Xenomorph", "O Good Guy (Chucky)", "O Unknown", "O Lich (Vecna)", 
  "O Dark Lord (Dracula)", "O Houndmaster", "O Ghoul (Ken Kaneki/Rize Kamashiro)", 
  "O Animatronic (Springtrap/William Afton)", "A Krasue", "O First (Henry Creel/001/Vecna)",
  
  // Sobreviventes
  "Dwight Fairfield", "Meg Thomas", "Claudette Morel", "Jake Park", "Nea Karlsson", 
  "Laurie Strode", "William 'Bill' Overbeck", "David King", "Feng Min", "Kate Denson", 
  "Adam Francis", "Zarina Kassir", "Mikaela Reid", "Renato Lyra", "Thalita Lyra", 
  "Sable Ward", "Aestri Yazar", "Trevor Belmont"
];

const levelLabels = { basico: "BÁSICO", intermediario: "INTERMEDIÁRIO", avancado: "AVANÇADO" };
const levelColors = { basico: "#51c878", intermediario: "#4aa8ff", avancado: "#b56cff" };
const levelRewards = { basico: "500 Auric Cells", intermediario: "1100 Auric Cells", avancado: "2250 Auric Cells" };

let currentUser = null;
let isAdmin = false;
let challenges = [];
let activeFilter = "all";

let app, auth, db, storage;

const $ = (id) => document.getElementById(id);
const escapeHtml = (value = "") => String(value).replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;" }[char]));

function showFeedback(element, message, success = true) {
  if (element) {
    element.textContent = message;
    element.style.color = success ? "#8be5a2" : "#ff7b83";
  }
}

function fillCharacterOptions() {
  const select = $("challenge-character");
  if (select) {
    select.insertAdjacentHTML("beforeend", characters.map((char) => `<option value="${char}">${char}</option>`).join(""));
  }
}

function challengeDate(value) {
  if (!value) return "Sem encerramento";
  const date = value?.toDate ? value.toDate() : new Date(value);
  return Number.isNaN(date.getTime()) ? "Sem encerramento" : date.toLocaleDateString("pt-BR");
}

function renderChallenges() {
  const list = $("challenge-list");
  if (!list) return;

  const visible = challenges.filter((item) => activeFilter === "all" || item.level === activeFilter);
  if (!visible.length) {
    list.innerHTML = `<div class="empty-state"><i class="fas fa-eye-slash"></i><p>Nenhum desafio encontrado neste nível.</p></div>`;
    populateSubmissionOptions([]);
    return;
  }

  list.innerHTML = visible.map((item) => {
    const image = item.image ? `url("${escapeHtml(item.image)}")` : "none";
    return `<article class="challenge-card" style="--level-color:${levelColors[item.level] || levelColors.basico};--card-image:${image}">
      ${item.image ? `<div class="challenge-card-image"></div>` : ""}
      <div class="challenge-card-body">
        <span class="challenge-level">${levelLabels[item.level] || "DESAFIO"}</span>
        <h3>${escapeHtml(item.title)}</h3>
        <div class="challenge-character-badge"><i class="fas fa-skull"></i><span>${escapeHtml(item.character)}</span></div>
        <p class="challenge-summary">${escapeHtml(item.description)}</p>
        <div class="challenge-card-footer"><span class="challenge-reward"><i class="fas fa-gem"></i> ${escapeHtml(item.reward)}</span><button class="challenge-open" data-open-challenge="${item.id}">VER DESAFIO</button></div>
      </div>
    </article>`;
  }).join("");
  populateSubmissionOptions(visible);
}

function populateSubmissionOptions(items) {
  const select = $("submission-challenge");
  if (select) {
    select.innerHTML = `<option value="">Selecione um desafio</option>` + items.map((item) => `<option value="${item.id}">${escapeHtml(item.title)} — ${escapeHtml(item.character)}</option>`).join("");
  }
}

function openChallenge(id) {
  const item = challenges.find((challenge) => challenge.id === id);
  if (!item) return;
  $("modal-level").textContent = `${levelLabels[item.level] || "DESAFIO"}  /  ${challengeDate(item.deadline)}`;
  $("modal-title").textContent = item.title;
  $("modal-character").textContent = item.character;
  $("modal-description").textContent = item.description;
  $("modal-rules").textContent = item.rules || "Nenhuma regra adicional foi registrada para este desafio.";
  $("modal-reward").innerHTML = `<i class="fas fa-gem"></i> ${escapeHtml(item.reward)}`;
  const submitBtn = $("modal-submit");
  if (submitBtn) {
    submitBtn.onclick = () => {
      const selectBox = $("submission-challenge");
      if (selectBox) selectBox.value = item.id;
      const modalEl = $("challenge-modal");
      if (modalEl) modalEl.hidden = true;
      const submitSection = $("submission-section");
      if (submitSection) submitSection.scrollIntoView({ behavior: "smooth" });
    };
  }
  $("challenge-modal").hidden = false;
}

function renderManageList() {
  const target = $("manage-list");
  if (!target) return;
  if (!challenges.length) {
    target.innerHTML = `<div class="empty-state">Nenhum desafio cadastrado.</div>`;
    return;
  }
  target.innerHTML = challenges.map((item) => `<div class="manage-row"><div><strong>${escapeHtml(item.title)}</strong><small>${escapeHtml(item.character)} · ${levelLabels[item.level]} · ${escapeHtml(item.reward)}</small></div><div class="row-actions"><button class="mini-btn" data-edit="${item.id}"><i class="fas fa-pen"></i></button><button class="mini-btn danger" data-delete="${item.id}"><i class="fas fa-trash"></i></button></div></div>`).join("");
}

function resetChallengeForm() {
  const form = $("challenge-form");
  if (!form) return;
  form.reset();
  $("challenge-id").value = "";
  $("challenge-reward").value = levelRewards["basico"];
  form.querySelector(".red-action span").textContent = "PUBLICAR DESAFIO";
}

function loadChallengeIntoForm(id) {
  const item = challenges.find((challenge) => challenge.id === id);
  if (!item) return;
  $("challenge-id").value = item.id;
  $("challenge-title").value = item.title || "";
  $("challenge-character").value = item.character || "";
  $("challenge-level").value = item.level || "basico";
  $("challenge-reward").value = item.reward || levelRewards[item.level || "basico"];
  $("challenge-description").value = item.description || "";
  $("challenge-rules").value = item.rules || "";
  $("challenge-image").value = item.image || "";
  $("challenge-deadline").value = item.deadline || "";
  $("challenge-form").querySelector(".red-action span").textContent = "SALVAR ALTERAÇÕES";
  $("admin-create").scrollIntoView({ behavior: "smooth" });
}

function listenToChallenges() {
  onSnapshot(collection(db, "desafios"), (snapshot) => {
    challenges = snapshot.docs.map((item) => ({ id: item.id, ...item.data() })).sort((a, b) => (a.createdAt?.seconds || 0) - (b.createdAt?.seconds || 0));
    renderChallenges();
    if (isAdmin) renderManageList();
  }, (error) => {
    const list = $("challenge-list");
    if (list) list.innerHTML = `<div class="empty-state"><i class="fas fa-triangle-exclamation"></i><p>Não foi possível carregar os desafios.</p></div>`;
    console.error(error);
  });
}

function listenToSubmissions() {
  if (!isAdmin) return;
  onSnapshot(collection(db, "submissoes"), (snapshot) => {
    const submissions = snapshot.docs.map((item) => ({ id: item.id, ...item.data() })).sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));

    const countEl = $("pending-count");
    if (countEl) countEl.textContent = submissions.filter((item) => item.status === "pending").length;

    const listEl = $("submission-list");
    if (listEl) {
      listEl.innerHTML = submissions.length ? submissions.map((item) => `<div class="submission-row"><div><strong>${escapeHtml(item.challengeTitle || "Desafio")}</strong><small>${escapeHtml(item.userName || item.userEmail || "Usuário")} · ${item.status === "approved" ? "Aprovada" : item.status === "rejected" ? "Recusada" : "Pendente"}</small></div><div class="row-actions"><a class="mini-btn" href="${escapeHtml(item.videoUrl || "#")}" target="_blank" rel="noopener"><i class="fas fa-play"></i></a>${item.status === "pending" ? `<button class="mini-btn approve" data-approve="${item.id}"><i class="fas fa-check"></i></button><button class="mini-btn danger" data-reject="${item.id}"><i class="fas fa-xmark"></i></button>` : ""}</div></div>`).join("") : `<div class="empty-state">Nenhuma prova recebida.</div>`;
    }
  });
}

async function uploadVideo(file, uid) {
  if (!file) return null;
  if (!file.type.startsWith("video/")) throw new Error("Selecione um arquivo de vídeo válido.");
  if (file.size > 300 * 1024 * 1024) throw new Error("O vídeo deve ter no máximo 300 MB.");
  const storageRef = ref(storage, `provas-desafios/${uid}/${Date.now()}-${file.name.replace(/[^a-zA-Z0-9._-]/g, "_")}`);
  const task = uploadBytesResumable(storageRef, file);

  const progressContainer = document.querySelector(".upload-progress");
  if (progressContainer) progressContainer.hidden = false;

  return new Promise((resolve, reject) => task.on("state_changed", (snapshot) => {
    const bar = $("upload-progress-bar");
    if (bar) bar.style.width = `${(snapshot.bytesTransferred / snapshot.totalBytes) * 100}%`;
  }, reject, async () => resolve(await getDownloadURL(task.snapshot.ref))));
}

async function handleSubmission(event) {
  event.preventDefault();
  const feedback = $("submission-feedback");

  if (!currentUser) {
    return showFeedback(feedback, "Você precisa estar logado para enviar uma prova.", false);
  }

  const selected = challenges.find((item) => item.id === $("submission-challenge").value);
  const link = $("submission-video-url").value.trim();
  const file = $("submission-video-file").files[0];

  if (!selected || (!link && !file)) return showFeedback(feedback, "Selecione um desafio e envie um link ou arquivo de vídeo.", false);

  const button = event.submitter;
  button.disabled = true;
  showFeedback(feedback, "Registrando sua prova...", true);

  try {
    const uploadedUrl = file ? await uploadVideo(file, currentUser.uid) : null;
    await addDoc(collection(db, "submissoes"), { challengeId: selected.id, challengeTitle: selected.title, userId: currentUser.uid, userName: currentUser.displayName || "Usuário", userEmail: currentUser.email || "", videoUrl: uploadedUrl || link, note: $("submission-note").value.trim(), status: "pending", createdAt: serverTimestamp() });
    event.target.reset();

    const progressContainer = document.querySelector(".upload-progress");
    if (progressContainer) progressContainer.hidden = true;

    const bar = $("upload-progress-bar");
    if (bar) bar.style.width = "0%";

    showFeedback(feedback, "Prova entregue. A Entidade fará a análise.", true);
  } catch (error) {
    console.error(error);
    showFeedback(feedback, error.message || "Não foi possível enviar a prova.", false);
  } finally {
    button.disabled = false;
  }
}

async function handleChallengeSave(event) {
  event.preventDefault();
  const feedback = $("admin-feedback");
  const data = { title: $("challenge-title").value.trim(), character: $("challenge-character").value, level: $("challenge-level").value, reward: $("challenge-reward").value.trim(), description: $("challenge-description").value.trim(), rules: $("challenge-rules").value.trim(), image: $("challenge-image").value.trim(), deadline: $("challenge-deadline").value || "", updatedAt: serverTimestamp() };

  if (!data.title || !data.character || !data.description) return showFeedback(feedback, "Preencha nome, personagem e objetivo.", false);

  try {
    const id = $("challenge-id").value;
    if (id) await updateDoc(doc(db, "desafios", id), data);
    else await addDoc(collection(db, "desafios"), { ...data, createdAt: serverTimestamp(), createdBy: currentUser.uid, active: true });

    resetChallengeForm();
    showFeedback(feedback, "Desafio salvo na Névoa.", true);
  } catch (error) {
    console.error(error);
    showFeedback(feedback, "Não foi possível salvar o desafio.", false);
  }
}

async function changeSubmissionStatus(id, status) {
  try {
    await updateDoc(doc(db, "submissoes", id), { status, reviewedAt: serverTimestamp(), reviewedBy: currentUser.uid });
  } catch (error) {
    console.error(error);
  }
}

function bindEvents() {
  fillCharacterOptions();

  const levelSelect = $("challenge-level");
  if (levelSelect) {
    levelSelect.addEventListener("change", (e) => {
      const rewardInput = $("challenge-reward");
      if (rewardInput) rewardInput.value = levelRewards[e.target.value] || levelRewards["basico"];
    });
  }

  document.addEventListener("click", (event) => {
    const open = event.target.closest("[data-open-challenge]");
    if (open) openChallenge(open.dataset.openChallenge);

    if (event.target.closest("[data-close-modal]")) {
      const modal = $("challenge-modal");
      if (modal) modal.hidden = true;
    }

    const filter = event.target.closest("[data-filter]");
    if (filter) {
      document.querySelectorAll(".filter-btn").forEach((button) => button.classList.remove("active"));
      filter.classList.add("active");
      activeFilter = filter.dataset.filter;
      renderChallenges();
    }

    const tab = event.target.closest("[data-admin-tab]");
    if (tab) {
      document.querySelectorAll(".admin-tab").forEach((button) => button.classList.remove("active"));
      document.querySelectorAll(".admin-view").forEach((view) => view.classList.remove("active"));
      tab.classList.add("active");
      const view = $("admin-" + tab.dataset.adminTab);
      if (view) view.classList.add("active");
    }

    const edit = event.target.closest("[data-edit]");
    if (edit) loadChallengeIntoForm(edit.dataset.edit);

    const remove = event.target.closest("[data-delete]");
    if (remove && confirm("Excluir este desafio?")) deleteDoc(doc(db, "desafios", remove.dataset.delete));

    const approve = event.target.closest("[data-approve]");
    if (approve) changeSubmissionStatus(approve.dataset.approve, "approved");

    const reject = event.target.closest("[data-reject]");
    if (reject) changeSubmissionStatus(reject.dataset.reject, "rejected");
  });

  document.querySelectorAll(".challenge-modal").forEach((modal) => modal.addEventListener("keydown", (event) => {
    if (event.key === "Escape") modal.hidden = true;
  }));

  const formSub = $("submission-form");
  if (formSub) formSub.addEventListener("submit", handleSubmission);

  const formChal = $("challenge-form");
  if (formChal) formChal.addEventListener("submit", handleChallengeSave);

  const clearBtn = $("clear-challenge");
  if (clearBtn) clearBtn.addEventListener("click", resetChallengeForm);
}

async function esperarFirebase() {
  return new Promise((resolve, reject) => {
    const inicio = Date.now();
    const intervalo = setInterval(() => {
      if (window.__firebaseApp && window.__firebaseAuth && window.__firebaseDb) {
        clearInterval(intervalo);
        resolve({
          app: window.__firebaseApp,
          auth: window.__firebaseAuth,
          db: window.__firebaseDb,
          storage: window.__firebaseStorage
        });
      } else if (Date.now() - inicio > 10000) {
        clearInterval(intervalo);
        reject(new Error("Firebase não inicializou em 10s. Verifique o script inline do desafios.html."));
      }
    }, 50);
  });
}

async function init() {
  try {
    const fb = await esperarFirebase();

    app = fb.app;
    auth = fb.auth;
    db = fb.db;
    storage = fb.storage;

    const { getFirestore, collection, addDoc, doc, updateDoc, deleteDoc, onSnapshot, serverTimestamp } = await import("https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js");
    const { getStorage, ref, uploadBytesResumable, getDownloadURL } = await import("https://www.gstatic.com/firebasejs/10.7.1/firebase-storage.js");
    const { onAuthStateChanged } = await import("https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js");

    window.__fs = { getFirestore, collection, addDoc, doc, updateDoc, deleteDoc, onSnapshot, serverTimestamp };
    window.__st = { getStorage, ref, uploadBytesResumable, getDownloadURL };

    window.__onUserReady = (user) => {
      currentUser = user;
      isAdmin = ADMIN_UIDS.includes(user.uid);

      if (isAdmin) {
        const adminPanel = $("admin-panel");
        if (adminPanel) adminPanel.hidden = false;
        listenToSubmissions();
      }
    };

    listenToChallenges();
    bindEvents();

    onAuthStateChanged(auth, (user) => {
      if (!user) return;
      window.__onUserReady(user);
    });

  } catch (e) {
    console.error("Falha ao inicializar desafios.js:", e);
  }
}

init();