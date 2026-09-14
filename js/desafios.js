import {
  initializeApp,
  getApps,
  getApp,
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import {
  getAuth,
  onAuthStateChanged,
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import {
  getFirestore,
  collection,
  addDoc,
  doc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  serverTimestamp,
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyARpVKfzOMm-v0pv9-7w9xahvhItosrI2Q",
  authDomain: "dbd-camp.firebaseapp.com",
  projectId: "dbd-camp",
  messagingSenderId: "357760091556",
  appId: "1:357760091556:web:4d9191b487baf240e92d31",
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
const db = getFirestore(app);

const DISCORD_WEBHOOK_URL =
  "https://discord.com/api/webhooks/1548790410506407986/xmQtfi8mWwpMQ6pfwSsf_l0SUxVL1jPIqtH11COn9lDihtXz3xU5s5qTvN3FDTSgR3ir";
const DISCORD_ANNOUNCE_WEBHOOK_URL =
  "https://discord.com/api/webhooks/1548800396087136315/SM9L71rcgOf-pbCjEsAJj6bTcoGSCZe2UgWIAPUhRJf7rcPxqwVsyubQ8-XK3eZ5HGuP";

const ADMIN_UIDS = [
  "discord:1037035142860001400",
  "discord:1400218900284571689",
  "discord:743696235248091206",
];

const killers = [
  "Qualquer Assassino",
  "Trapper",
  "Espectro",
  "Hillbilly",
  "Nurse",
  "Michael Myers",
  "Hag",
  "Doctor",
  "Huntress",
  "Leatherface",
  "Freddy Krueger",
  "Pig",
  "Clown",
  "Spirit",
  "Legion",
  "Plague",
  "Ghost Face",
  "Demogorgon",
  "Oni",
  "Deathslinger",
  "Pyramid Head",
  "Blight",
  "Gêmeos",
  "Trickster",
  "Nemesis",
  "Pin Head",
  "Artista",
  "Sadako",
  "Draga",
  "Albert Wesker",
  "Cavaleiro",
  "Negociante de Crânios",
  "Singularidade",
  "O Xenomorph",
  "Chucky",
  "Desconhecido",
  "Lich",
  "Dracula",
  "Mestra da Matilha",
  "Ghoul",
  "Animatronic",
  "Krasue",
  "Vecna",
];

const survivors = [
  "Qualquer Sobrevivente",
  "Dwight Fairfield",
  "Meg Thomas",
  "Claudette Morel",
  "Jake Park",
  "Nea Karlsson",
  "Laurie Strode",
  "William 'Bill' Overbeck",
  "David King",
  "Feng Min",
  "Kate Denson",
  "Adam Francis",
  "Zarina Kassir",
  "Mikaela Reid",
  "Renato Lyra",
  "Thalita Lyra",
  "Sable Ward",
  "Aestri Yazar",
  "Trevor Belmont",
];

const levelLabels = {
  basico: "BÁSICO",
  intermediario: "INTERMEDIÁRIO",
  avancado: "AVANÇADO",
};
const levelColors = {
  basico: "#51c878",
  intermediario: "#4aa8ff",
  avancado: "#b56cff",
};
const levelRewards = {
  basico: "500 Auric Cells",
  intermediario: "1100 Auric Cells",
  avancado: "2250 Auric Cells",
};

let currentUser = null;
let isAdmin = false;
let challenges = [];
let activeFilter = "all";

const $ = (id) => document.getElementById(id);
const escapeHtml = (value = "") =>
  String(value).replace(
    /[&<>"']/g,
    (char) =>
      ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#039;",
      })[char],
  );

function showFeedback(element, message, success = true) {
  if (element) {
    element.textContent = message;
    element.style.color = success ? "#8be5a2" : "#ff7b83";
  }
}

function fillCharacterOptions() {
  const killerSelect = $("challenge-killer");
  const survSelect = $("challenge-survivor");

  if (killerSelect) {
    killerSelect.innerHTML =
      '<option value="">Não se aplica</option>' +
      killers
        .map((char) => `<option value="${char}">${char}</option>`)
        .join("");
  }

  if (survSelect) {
    survSelect.innerHTML =
      '<option value="">Não se aplica</option>' +
      survivors
        .map((char) => `<option value="${char}">${char}</option>`)
        .join("");
  }
}

function challengeDate(value) {
  if (!value) return "Sem encerramento";
  if (typeof value === "string") {
    const parts = value.split("-");
    if (parts.length === 3) return `${parts[2]}/${parts[1]}/${parts[0]}`;
    return value;
  }
  const date = value?.toDate ? value.toDate() : new Date(value);
  return Number.isNaN(date.getTime())
    ? "Sem encerramento"
    : date.toLocaleDateString("pt-BR");
}

function renderChallenges() {
  const list = $("challenge-list");
  if (!list) return;

  const visible = challenges.filter(
    (item) => activeFilter === "all" || item.level === activeFilter,
  );
  if (!visible.length) {
    list.innerHTML = `<div class="empty-state"><i class="fas fa-eye-slash"></i><p>Nenhum desafio encontrado neste nível.</p></div>`;
    populateSubmissionOptions([]);
    return;
  }

  list.innerHTML = visible
    .map((item) => {
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
    })
    .join("");
  populateSubmissionOptions(visible);
}

function populateSubmissionOptions(items) {
  const select = $("submission-challenge");
  if (select) {
    select.innerHTML =
      `<option value="">Selecione um desafio</option>` +
      items
        .map(
          (item) =>
            `<option value="${item.id}">${escapeHtml(item.title)} — ${escapeHtml(item.character)}</option>`,
        )
        .join("");
  }
}

function openChallenge(id) {
  const item = challenges.find((challenge) => challenge.id === id);
  if (!item) return;
  $("modal-level").textContent =
    `${levelLabels[item.level] || "DESAFIO"}  /  ${challengeDate(item.deadline)}`;
  $("modal-title").textContent = item.title;
  $("modal-character").textContent = item.character;
  $("modal-description").textContent = item.description;
  $("modal-rules").textContent =
    item.rules || "Nenhuma regra adicional foi registrada para este desafio.";
  $("modal-reward").innerHTML =
    `<i class="fas fa-gem"></i> ${escapeHtml(item.reward)}`;
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
  target.innerHTML = challenges
    .map(
      (item) =>
        `<div class="manage-row"><div><strong>${escapeHtml(item.title)}</strong><small>${escapeHtml(item.character)} · ${levelLabels[item.level]} · ${escapeHtml(item.reward)}</small></div><div class="row-actions"><button class="mini-btn" data-edit="${item.id}"><i class="fas fa-pen"></i></button><button class="mini-btn danger" data-delete="${item.id}"><i class="fas fa-trash"></i></button></div></div>`,
    )
    .join("");
}

function resetChallengeForm() {
  const form = $("challenge-form");
  if (!form) return;
  form.reset();
  $("challenge-id").value = "";
  $("challenge-reward").value = levelRewards["basico"];
  $("challenge-current-image").value = "";

  const killerSelect = $("challenge-killer");
  const survSelect = $("challenge-survivor");
  if (killerSelect) killerSelect.disabled = false;
  if (survSelect) survSelect.disabled = false;

  form.querySelector(".red-action span").textContent = "PUBLICAR DESAFIO";
}

function loadChallengeIntoForm(id) {
  const item = challenges.find((challenge) => challenge.id === id);
  if (!item) return;
  $("challenge-id").value = item.id;
  $("challenge-title").value = item.title || "";

  const char = item.character || "";
  const killerSelect = $("challenge-killer");
  const survSelect = $("challenge-survivor");

  killerSelect.value = "";
  survSelect.value = "";
  killerSelect.disabled = false;
  survSelect.disabled = false;

  if (killers.includes(char)) {
    killerSelect.value = char;
    survSelect.disabled = true;
  } else if (survivors.includes(char)) {
    survSelect.value = char;
    killerSelect.disabled = true;
  }

  $("challenge-level").value = item.level || "basico";
  $("challenge-reward").value =
    item.reward || levelRewards[item.level || "basico"];
  $("challenge-description").value = item.description || "";
  $("challenge-rules").value = item.rules || "";

  $("challenge-current-image").value = item.image || "";
  $("challenge-image-file").value = "";

  $("challenge-deadline").value = item.deadline || "";

  $("challenge-form").querySelector(".red-action span").textContent =
    "SALVAR ALTERAÇÕES";
  $("admin-create").classList.add("active");
  $("admin-create").scrollIntoView({ behavior: "smooth" });
}

function listenToChallenges() {
  onSnapshot(
    collection(db, "desafios"),
    (snapshot) => {
      challenges = snapshot.docs
        .map((item) => ({ id: item.id, ...item.data() }))
        .sort(
          (a, b) => (a.createdAt?.seconds || 0) - (b.createdAt?.seconds || 0),
        );
      renderChallenges();
      if (isAdmin) renderManageList();
    },
    (error) => {
      const list = $("challenge-list");
      if (list)
        list.innerHTML = `<div class="empty-state"><i class="fas fa-triangle-exclamation"></i><p>Não foi possível carregar os desafios.</p></div>`;
      console.error(error);
    },
  );
}

function listenToSubmissions() {
  if (!isAdmin) return;
  onSnapshot(collection(db, "submissoes"), (snapshot) => {
    const submissions = snapshot.docs
      .map((item) => ({ id: item.id, ...item.data() }))
      .sort(
        (a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0),
      );

    const countEl = $("pending-count");
    if (countEl)
      countEl.textContent = submissions.filter(
        (item) => item.status === "pending",
      ).length;

    const listEl = $("submission-list");
    if (listEl) {
      listEl.innerHTML = submissions.length
        ? submissions
            .map(
              (item) =>
                `<div class="submission-row"><div><strong>${escapeHtml(item.challengeTitle || "Desafio")}</strong><small>${escapeHtml(item.userName || item.userEmail || "Usuário")} · ${item.status === "approved" ? "Aprovada" : item.status === "rejected" ? "Recusada" : "Pendente"}</small></div><div class="row-actions"><a class="mini-btn" href="${escapeHtml(item.videoUrl || "#")}" target="_blank" rel="noopener"><i class="fas fa-play"></i></a>${item.status === "pending" ? `<button class="mini-btn approve" data-approve="${item.id}"><i class="fas fa-check"></i></button><button class="mini-btn danger" data-reject="${item.id}"><i class="fas fa-xmark"></i></button>` : ""}</div></div>`,
            )
            .join("")
        : `<div class="empty-state">Nenhuma prova recebida.</div>`;
    }
  });
}

async function sendToDiscordWebhook(challenge, link, file, note, user) {
  const url = DISCORD_WEBHOOK_URL + "?wait=true";
  const formData = new FormData();

  const now = new Date().toLocaleString("pt-BR");
  const discordId = user.uid.replace("discord:", "");

  const embed = {
    title: "🛡️ NOVA PROVA ENTREGUE!",
    color: 15277667,
    fields: [
      {
        name: "👤 Jogador",
        value: user.displayName || "Usuário",
        inline: true,
      },
      { name: "🆔 Discord ID", value: discordId, inline: true },
      { name: "⏰ Data de Envio", value: now, inline: true },
      { name: "🎯 Desafio Concluído", value: challenge.title, inline: false },
      { name: "🔪 Personagem", value: challenge.character, inline: true },
      {
        name: "📊 Dificuldade",
        value: levelLabels[challenge.level] || challenge.level,
        inline: true,
      },
      { name: "💎 Recompensa Esperada", value: challenge.reward, inline: true },
    ],
    footer: { text: "Painel de Administração • Refúgio da Névoa" },
  };

  if (note) {
    embed.fields.push({
      name: "📝 Observação do Jogador",
      value: note,
      inline: false,
    });
  }

  if (link) {
    embed.fields.push({
      name: "🔗 Link da Gravação",
      value: link,
      inline: false,
    });
  }

  let payload = { embeds: [embed] };

  if (file) {
    if (file.size > 500 * 1024 * 1024) {
      throw new Error(
        "O arquivo excede o limite de 500MB permitido pelo Discord. Por favor, envie o link do YouTube ou Google Drive.",
      );
    }
    formData.append("file", file);
    embed.fields.push({
      name: "📁 Arquivo Anexado",
      value: "Acesse o vídeo na mensagem desta notificação.",
      inline: false,
    });
  }

  formData.append("payload_json", JSON.stringify(payload));

  const response = await fetch(url, {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    throw new Error(
      "Falha ao enviar webhook. O arquivo pode ser pesado demais para a conexão atual.",
    );
  }

  const data = await response.json();

  if (data.attachments && data.attachments.length > 0) {
    return data.attachments[0].url;
  }
  return link;
}

async function handleSubmission(event) {
  event.preventDefault();
  const feedback = $("submission-feedback");

  if (!currentUser)
    return showFeedback(
      feedback,
      "Você precisa estar logado para enviar uma prova.",
      false,
    );

  const selected = challenges.find(
    (item) => item.id === $("submission-challenge").value,
  );
  const link = $("submission-video-url").value.trim();
  const file = $("submission-video-file").files[0];

  if (!selected || (!link && !file))
    return showFeedback(
      feedback,
      "Selecione um desafio e envie um link ou arquivo de vídeo.",
      false,
    );

  const button = event.submitter;
  button.disabled = true;
  button.querySelector("span").textContent = "ENVIANDO PARA O DISCORD...";
  showFeedback(
    feedback,
    "Realizando o upload da sua prova... Se o arquivo for grande, aguarde.",
    true,
  );

  try {
    const finalUrl = await sendToDiscordWebhook(
      selected,
      link,
      file,
      $("submission-note").value.trim(),
      currentUser,
    );

    await addDoc(collection(db, "submissoes"), {
      challengeId: selected.id,
      challengeTitle: selected.title,
      userId: currentUser.uid,
      userName: currentUser.displayName || "Usuário",
      userEmail: currentUser.email || "",
      videoUrl: finalUrl || link,
      note: $("submission-note").value.trim(),
      status: "pending",
      createdAt: serverTimestamp(),
    });

    event.target.reset();
    showFeedback(
      feedback,
      "Prova entregue e notificada no Discord. A Entidade fará a análise.",
      true,
    );
  } catch (error) {
    console.error(error);
    showFeedback(
      feedback,
      error.message || "Não foi possível enviar a prova.",
      false,
    );
  } finally {
    button.disabled = false;
    button.querySelector("span").textContent = "ENTREGAR PROVA";
  }
}

async function announceChallengeToDiscord(data, originalFile = null) {
  const url = DISCORD_ANNOUNCE_WEBHOOK_URL + "?wait=true";

  let embedColor = 5359736;
  if (data.level === "intermediario") embedColor = 4892927;
  if (data.level === "avancado") embedColor = 11889919;

  const embed = {
    author: {
      name: "REFÚGIO DA NÉVOA • ARQUIVO DA ENTIDADE",
    },
    title: `🔥 ${data.title}`,
    description:
      `**OBJETIVO PRINCIPAL**\n` +
      `> ${data.description}\n\n` +
      `**📜 REGRAS DA MISSÃO**\n` +
      `> ${data.rules || "Nenhuma regra adicional especificada."}`,
    color: embedColor,
    fields: [
      {
        name: "🔪 PERSONAGEM-ALVO",
        value: `**${data.character}**`,
        inline: true,
      },
      { name: "💎 RECOMPENSA", value: `**${data.reward}**`, inline: true },
      {
        name: "📊 DIFICULDADE",
        value: `**${levelLabels[data.level] || data.level}**`,
        inline: true,
      },
      {
        name: "⏳ ENCERRAMENTO",
        value: `**${challengeDate(data.deadline)}**`,
        inline: false,
      },
    ],
    timestamp: new Date().toISOString(),
    footer: {
      text: "Refúgio da Névoa • Envie sua prova pelo site para garantir a recompensa",
    },
  };

  const formData = new FormData();
  let imageBlob = originalFile;
  let fileName = originalFile?.name || "imagem-desafio.jpg";

  if (!imageBlob && data.image) {
    try {
      const imageResponse = await fetch(data.image);
      if (imageResponse.ok) {
        imageBlob = await imageResponse.blob();
        const contentType = imageBlob.type || "image/jpeg";
        const extension = contentType.split("/")[1] || "jpg";
        fileName = `desafio-${Date.now()}.${extension}`;
      }
    } catch (error) {
      console.warn("Não foi possível baixar a imagem do ImgBB:", error);
    }
  }

  if (imageBlob) {
    if (imageBlob.size > 10 * 1024 * 1024) {
      throw new Error(
        "A imagem precisa ter no máximo 10 MB para ser enviada ao Discord.",
      );
    }

    embed.image = { url: `attachment://${fileName}` };
    formData.append("files[0]", imageBlob, fileName);
  } else if (data.image && data.image.trim() !== "") {
    embed.image = { url: data.image.trim() };
  }

  const payload = {
    content: "@everyone <@&1549063748118126702> 🚨 **NOVO DESAFIO DA NÉVOA LANÇADO!** 🚨\nAcesse o site e envie sua prova para clamar a recompensa da Entidade!",
    embeds: [embed],
    allowed_mentions: { parse: ["everyone", "roles"] },
  };

  formData.append("payload_json", JSON.stringify(payload));

  const response = await fetch(url, {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error("Resposta do Discord:", errorText);
    throw new Error("O Discord recusou o anúncio do desafio.");
  }

  return await response.json();
}

async function handleChallengeSave(event) {
  event.preventDefault();
  const feedback = $("admin-feedback");
  const submitBtn = $("challenge-form").querySelector(".red-action");

  const killerVal = $("challenge-killer").value;
  const survVal = $("challenge-survivor").value;
  const selectedCharacter = killerVal || survVal;

  if (
    !$("challenge-title").value.trim() ||
    !selectedCharacter ||
    !$("challenge-description").value.trim()
  ) {
    return showFeedback(
      feedback,
      "Preencha o nome, escolha um personagem válido e defina o objetivo.",
      false,
    );
  }

  submitBtn.disabled = true;
  submitBtn.querySelector("span").textContent = "ENVIANDO PARA A NÉVOA...";

  try {
    let imageUrl = "";
    const fileInput = $("challenge-image-file");

    if (fileInput.files.length > 0) {
      const file = fileInput.files[0];
      const formData = new FormData();
      formData.append("image", file);

      const IMGBB_API_KEY = "02ac971f74c655e88eb932d14930342f";
      const response = await fetch(
        `https://api.imgbb.com/1/upload?key=${IMGBB_API_KEY}`,
        {
          method: "POST",
          body: formData,
        },
      );

      const imgbbData = await response.json();
      if (imgbbData.success) {
        imageUrl =
          imgbbData.data.image?.url ||
          imgbbData.data.display_url ||
          imgbbData.data.url;

        if (!imageUrl) {
          throw new Error("O ImgBB não retornou uma URL válida.");
        }
      } else {
        throw new Error(
          imgbbData.error?.message ||
            "O servidor de imagens recusou o arquivo.",
        );
      }
    } else {
      imageUrl = $("challenge-current-image").value || "";
    }

    const data = {
      title: $("challenge-title").value.trim(),
      character: selectedCharacter,
      level: $("challenge-level").value,
      reward: $("challenge-reward").value.trim(),
      description: $("challenge-description").value.trim(),
      rules: $("challenge-rules").value.trim(),
      image: imageUrl,
      deadline: $("challenge-deadline").value || "",
      updatedAt: serverTimestamp(),
    };

    const id = $("challenge-id").value;
    if (id) {
      await updateDoc(doc(db, "desafios", id), data);
      showFeedback(feedback, "Desafio salvo e atualizado na Névoa.", true);
    } else {
      data.createdAt = serverTimestamp();
      data.createdBy = currentUser.uid;
      data.active = true;
      await addDoc(collection(db, "desafios"), data);
      showFeedback(
        feedback,
        "Novo desafio criado! Anunciando no Discord...",
        true,
      );

      try {
        await announceChallengeToDiscord(data, fileInput.files[0] || null);
      } catch (e) {
        console.error("Falha ao anunciar no Discord", e);
      }
    }

    resetChallengeForm();
  } catch (error) {
    console.error(error);
    showFeedback(feedback, "Erro ao salvar desafio: " + error.message, false);
  } finally {
    submitBtn.disabled = false;
    submitBtn.querySelector("span").textContent = "PUBLICAR DESAFIO";
  }
}

async function changeSubmissionStatus(id, status) {
  try {
    await updateDoc(doc(db, "submissoes", id), {
      status,
      reviewedAt: serverTimestamp(),
      reviewedBy: currentUser.uid,
    });
  } catch (error) {
    console.error(error);
  }
}

function bindEvents() {
  fillCharacterOptions();

  const killerSelect = $("challenge-killer");
  const survSelect = $("challenge-survivor");

  if (killerSelect && survSelect) {
    killerSelect.addEventListener("change", (e) => {
      if (e.target.value !== "") {
        survSelect.value = "";
        survSelect.disabled = true;
      } else {
        survSelect.disabled = false;
      }
    });

    survSelect.addEventListener("change", (e) => {
      if (e.target.value !== "") {
        killerSelect.value = "";
        killerSelect.disabled = true;
      } else {
        killerSelect.disabled = false;
      }
    });
  }

  const levelSelect = $("challenge-level");
  if (levelSelect) {
    levelSelect.addEventListener("change", (e) => {
      const rewardInput = $("challenge-reward");
      if (rewardInput)
        rewardInput.value =
          levelRewards[e.target.value] || levelRewards["basico"];
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
      document
        .querySelectorAll(".filter-btn")
        .forEach((button) => button.classList.remove("active"));
      filter.classList.add("active");
      activeFilter = filter.dataset.filter;
      renderChallenges();
    }

    const tab = event.target.closest("[data-admin-tab]");
    if (tab) {
      document
        .querySelectorAll(".admin-tab")
        .forEach((button) => button.classList.remove("active"));
      document
        .querySelectorAll(".admin-view")
        .forEach((view) => view.classList.remove("active"));
      tab.classList.add("active");
      const view = $("admin-" + tab.dataset.adminTab);
      if (view) view.classList.add("active");
    }

    const edit = event.target.closest("[data-edit]");
    if (edit) loadChallengeIntoForm(edit.dataset.edit);

    const remove = event.target.closest("[data-delete]");
    if (remove && confirm("Excluir este desafio?"))
      deleteDoc(doc(db, "desafios", remove.dataset.delete));

    const approve = event.target.closest("[data-approve]");
    if (approve) changeSubmissionStatus(approve.dataset.approve, "approved");

    const reject = event.target.closest("[data-reject]");
    if (reject) changeSubmissionStatus(reject.dataset.reject, "rejected");
  });

  document.querySelectorAll(".challenge-modal").forEach((modal) =>
    modal.addEventListener("keydown", (event) => {
      if (event.key === "Escape") modal.hidden = true;
    }),
  );

  const formSub = $("submission-form");
  if (formSub) formSub.addEventListener("submit", handleSubmission);

  const formChal = $("challenge-form");
  if (formChal) formChal.addEventListener("submit", handleChallengeSave);

  const clearBtn = $("clear-challenge");
  if (clearBtn) clearBtn.addEventListener("click", resetChallengeForm);
}

document.addEventListener("DOMContentLoaded", () => {
  bindEvents();
  listenToChallenges();

  onAuthStateChanged(auth, (user) => {
    if (user) {
      currentUser = user;
      isAdmin = ADMIN_UIDS.includes(user.uid);

      if (isAdmin) {
        const adminPanel = $("admin-panel");
        if (adminPanel) adminPanel.hidden = false;
        listenToSubmissions();
      }
    }
  });
});
