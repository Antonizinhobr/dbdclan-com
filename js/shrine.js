async function fetchShrineData() {
  const grid = document.getElementById('shrine-grid');
  const previewIcons = document.getElementById('shrine-preview-icons');
  const datesBoxes = document.querySelectorAll('.shrine-dates');

  try {
    const agora = new Date();
    let dataInicio = new Date(agora);
    let diaSemana = dataInicio.getUTCDay(); 
    let diasParaTerca = (diaSemana >= 2) ? (diaSemana - 2) : (diaSemana + 5);
    
    if (diaSemana === 2 && agora.getUTCHours() < 15) {
        diasParaTerca += 7;
    }
    dataInicio.setUTCDate(dataInicio.getUTCDate() - diasParaTerca);
    dataInicio.setUTCHours(15, 0, 0, 0);

    const dataFim = new Date(dataInicio);
    dataFim.setUTCDate(dataFim.getUTCDate() + 7);

    const options = { day: '2-digit', month: 'short', year: 'numeric' };
    const formatarData = (data) => {
        let str = new Intl.DateTimeFormat('pt-BR', options).format(data);
        str = str.replace(/ de ([a-z])/g, (match, p1) => ` De ${p1.toUpperCase()}`);
        return str;
    };

    const textoData = `${formatarData(dataInicio)} &nbsp;&nbsp;<span style="color:#ff0000;">➔</span>&nbsp;&nbsp; ${formatarData(dataFim)}`;
    datesBoxes.forEach(box => box.innerHTML = textoData);

    const targetUrl = 'https://botdbdshrine.discloud.app/api/shrine';
    
    const response = await fetch(targetUrl);
    if (!response.ok) throw new Error('Falha na resposta do seu Bot');
    
    const dados = await response.json();
    if (!dados || !dados.data || !dados.data.perks) throw new Error('Estrutura de dados inválida');

    if (grid) renderShrineCards(grid, dados.data.perks);
    if (previewIcons) renderShrinePreview(previewIcons, dados.data.perks);

  } catch (error) {
    console.error("Erro na API. Usando fallback estático.", error);
    
    const staticFallback = [
        { name: "A Nurse's Calling", image: "perks/a-nurses-calling.png", character: "The Nurse" },
        { name: "Batteries Included", image: "perks/batteries-included.png", character: "The Good Guy" },
        { name: "Adrenaline", image: "perks/adrenaline.png", character: "Meg Thomas" },
        { name: "Road Life", image: "perks/road-life.png", character: "Vee Boonyasak" }
    ];
    if (grid) renderShrineCards(grid, staticFallback);
    if (previewIcons) renderShrinePreview(previewIcons, staticFallback);
  }
}

function renderShrinePreview(container, perksArray) {
    container.innerHTML = '';
    perksArray.forEach(perk => {
        const linkOriginalPerk = `https://cdn.nightlight.gg/img/${perk.image}`;
        const imgUrl = `https://wsrv.nl/?url=${encodeURIComponent(linkOriginalPerk)}`;

        const html = `
            <div class="mini-diamond-wrapper">
              <div class="mini-diamond-bg"></div>
              <img src="${imgUrl}" alt="${perk.name}" class="mini-shrine-perk-img" crossorigin="anonymous" onerror="this.src='../assets/icon.jpg'">
            </div>
        `;
        container.insertAdjacentHTML('beforeend', html);
    });
}

// PÁGINA COMPLETA
function renderShrineCards(gridElement, perksArray) {
    gridElement.innerHTML = '';
    
    const traducoesPersonagens = {
        "The Nurse": "A Enfermeira",
        "The Good Guy": "O Cara Legal",
        "The Trapper": "O Caçador",
        "The Wraith": "O Espectro",
        "The Hillbilly": "O Caipira",
        "The Shape": "O Espectro",
        "The Huntress": "A Caçadora",
        "The Doctor": "O Médico"
    };
    
    perksArray.forEach((perk, index) => {
      const num = String(index + 1).padStart(2, '0');
      const isKiller = perk.character && perk.character.startsWith('The ');
      const roleClass = isKiller ? 'killer-perk' : 'survivor-perk';
      const roleNome = isKiller ? 'Assassino' : 'Sobrevivente';
      
      let characterName = perk.character ? perk.character : 'Geral';
      if (traducoesPersonagens[characterName]) {
          characterName = traducoesPersonagens[characterName];
      }
      
      const linkOriginalPerk = `https://cdn.nightlight.gg/img/${perk.image}`;
      const imgUrl = `https://wsrv.nl/?url=${encodeURIComponent(linkOriginalPerk)}`;

      const charId = perk.character ? perk.character.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]/g, "_") : "";
      const linkOriginalPortrait = `https://cdn.nightlight.gg/img/portraits/${charId}.png`;
      const portraitUrl = `https://wsrv.nl/?url=${encodeURIComponent(linkOriginalPortrait)}`;

      const cardHTML = `
        <div class="shrine-card ${roleClass}">
          <div class="character-bg" style="background-image: url('${portraitUrl}')"></div>
          <div class="card-inner">
            <div class="card-number">${num}</div>
            <div class="diamond-wrapper">
              <div class="diamond-bg"></div>
              <img src="${imgUrl}" alt="${perk.name}" class="shrine-perk-img" crossorigin="anonymous" onerror="this.src='../assets/icon.jpg'">
            </div>
            <div class="shrine-card-content">
              <span class="tag-vantagem">VANTAGEM</span>
              <h3 class="shrine-perk-name">${perk.name}</h3>
            </div>
            <div class="shrine-card-footer">
              <div class="footer-col">
                <span class="footer-col-label">CATEGORIA</span>
                <span class="footer-col-value">${roleNome}</span>
              </div>
              <div class="footer-col" style="text-align: right;">
                <span class="footer-col-label">PERSONAGEM</span>
                <span class="footer-col-value">${characterName}</span>
              </div>
            </div>
          </div>
          <div class="card-corner-accent"></div>
        </div>
      `;
      gridElement.insertAdjacentHTML('beforeend', cardHTML);
    });
}

document.addEventListener("DOMContentLoaded", () => {
    fetchShrineData();
});