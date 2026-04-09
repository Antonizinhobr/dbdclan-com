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
  deleteDoc,
  doc,
  serverTimestamp,
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

// LISTAS DE ADMINISTRAÇÃO UNIFICADA
const ADMIN_UIDS = [
    "discord:1400218900284571689",
    "discord:392062765323255828",
    "discord:644323555462479892",
    "discord:804843307568988180",
    "discord:361362105363857408"
];

const ADMIN_EMAILS = [
  "anthonnybalbino2017@gmail.com",
  "gabrielxz.j@gmail.com",
  "tilnickolas@gmail.com",
  "eduarda.soares7656@gmail.com",
];

let currentUser = null;
let allBuildsData = [];
let isAdmin = false; // Controle global de permissão

// ==========================================
// 1. DICIONÁRIO DE DESCRIÇÕES COMPLETO
// ==========================================

// === PERKS DBD GERAL ===
const descricoesCustomizadas = {
  "Ace In The Hole":
    "Ao retirar um item de um baú, há 100% de chance de que um acessório de raridade Muito Rara ou inferior esteja acoplado a ele.",
  Adrenaline:
    "Cura instantaneamente um estado de saúde e concede 150% de velocidade de movimento por 5 segundos quando os Portões de Saída são energizados.",
  Aftercare:
    "Você vê a aura de cada Sobrevivente que você resgatou do gancho, que te resgatou, que você curou ou que te curou.",
  Agitation:
    "Aumenta sua velocidade de movimento enquanto carrega um Sobrevivente em 18% e seu Raio de Terror em 12 metros.",
  Alert:
    "Sempre que o Assassino realizar a ação de quebrar um palete ou parede, ou danificar um gerador, a aura dele é revelada a você por 5 segundos.",
  "Alien Instinct":
    "Ao enganchar um Sobrevivente, a aura do Sobrevivente ferido mais distante é revelada por 5 segundos e ele fica com o status Inconsciente.",
  "All Points Spelled":
    "Revela a aura de totens próximos e, ao purificar um totem, você vê a aura do Assassino por um curto período.",
  "Any Means Necessary":
    "Você vê a aura de paletes derrubados. Pode levantar um palete derrubado de volta à sua posição original com um tempo de recarga.",
  Appraisal:
    "Comece a partida com 3 símbolos. Gaste um símbolo para procurar em um baú já aberto e encontrar um item.",
  Autodidact:
    "Você começa a partida com uma progressão de penalidade de -25% para Testes de Perícia ao curar Sobreviventes. Cada Teste de Perícia bem-sucedido concede símbolos que aumentam o bônus de progressão.",
  "Awakened Awarenesss":
    "Enquanto carrega um Sobrevivente, você vê a aura de outros Sobreviventes em um raio de 20 metros.",
  "baby Sitter":
    "Quando você resgata um Sobrevivente do gancho, ele não deixa marcas de rastro ou poças de sangue por 8 segundos, e você vê a aura do Assassino.",
  Bamboozle:
    "Sua velocidade de pulo é 15% mais rápida e realizar um pulo bloqueia o local de pulo para o Assassino por 16 segundos.",
  "Bardic Inspiration":
    "Ao ficar parado, realize uma performance de bardo que concede bônus de progressão em reparos de geradores para aliados próximos com base no resultado de um dado.",
  "Barbecue & Chilli":
    "Após enganchar um Sobrevivente, a aura de todos os outros Sobreviventes a mais de 40 metros do gancho é revelada por 4 segundos.",
  "batteries Included":
    "Enquanto estiver a 12 metros de um gerador concluído, você ganha 5% de Celeridade.",
  "Beast Of Prey":
    "Você ganha o status Indetectável após alcançar Sede de Sangue Tier 1. Concede bônus de Pontos de Sangue na categoria Caçada.",
  "Better Than New":
    "Após você curar outro Sobrevivente, ele ganha um bônus de 16% de velocidade em curar, abrir baús e purificar/abençoar totens até sofrer dano.",
  "better Together":
    "Enquanto você repara um gerador, a aura dele é revelada a todos os outros Sobreviventes em um raio de 32 metros.",
  "Bite The Bullet":
    "Você não faz barulho, incluindo gemidos de dor, enquanto se cura ou cura outros. Falhar em testes de perícia de cura não causa barulho.",
  "Bitter Murmur":
    "Sempre que um gerador é concluído, a aura dos Sobreviventes a 16 metros dele é revelada por 5 segundos. Quando o último gerador liga, todos aparecem por 10 segundos.",
  "Blast Mine":
    "Após reparar geradores por 40%, instale uma armadilha que atordoa o Assassino e o cega se ele chutar o gerador.",
  "Blood Echo":
    "Quando um Sobrevivente é enganchado, todos os outros Sobreviventes feridos sofrem de Hemorragia e Exaustão por 45 segundos.",
  "Hex Blood Favor":
    "Quando um Sobrevivente é atingido por um ataque básico, todos os paletes em um raio de 16 metros são bloqueados pela Entidade por 15 segundos.",
  "Blood Pact":
    "Quando você ou a Obsessão são feridos, vocês veem a aura um do outro. Após curar a Obsessão ou ser curado por ela, ambos ganham 7% de Celeridade.",
  "Blood Warden":
    "Assim que os Portões de Saída são abertos, enganchar um Sobrevivente bloqueia a saída para todos os Sobreviventes por 60 segundos.",
  Bloodhound:
    "Marcas de sangue fresco são consideravelmente mais visíveis do que o normal e podem ser rastreadas por 4 segundos a mais.",
  "Boil Over":
    "Seus esforços de resistência ao ser carregado aumentam os efeitos de balanço no Assassino e ocultam a aura de ganchos próximos.",
  Bond: "As auras dos aliados são reveladas a você quando eles estão em um raio de 36 metros.",
  "Boon Circle Of Healing":
    "Cria um Totem de Bênção onde todos os Sobreviventes dentro do raio ganham bônus de velocidade de cura e podem ver auras de aliados feridos.",
  "Dark Theory":
    "Abençoa um Totem Simples ou de Feitiço para criar um Totem de Bênção. Sobreviventes dentro do alcance ganham 2% de bónus de Celeridade.",
  "Boon Exponential":
    "Abençoa um Totem. Sobreviventes dentro do alcance do Totem têm um bónus de 100% na velocidade de recuperação e podem recuperar-se totalmente do estado agonizante.",
  Illumination:
    "Abençoa um Totem. Sobreviventes dentro do alcance veem as auras de todos os baús e geradores no mapa.",
  "Boon Shadow Step":
    "Abençoa um Totem. Sobreviventes dentro do alcance têm as suas marcas de rastro ocultas e as suas auras não podem ser lidas pelo Assassino.",
  "Borrowed Time":
    "Após resgatar um Sobrevivente do gancho, os efeitos de Resistência e Celeridade que ele recebe são prolongados por 10 segundos.",
  "Botany Knowledge":
    "Aumenta a velocidade de cura em 50%, mas reduz a eficiência dos itens de cura em 20%.",
  Breakdown:
    "Sempre que fores removido de um gancho, o gancho parte-se e a aura do Assassino é revelada para ti por 6 segundos.",
  Breakout:
    "Quando estiveres a 6 metros do Assassino enquanto ele carrega um Sobrevivente, ganhas 7% de Celeridade e o Sobrevivente carrega a barra de resistência 20% mais rápido.",
  "Brutal Strength":
    "Aumenta a velocidade com que destróis paletes, paredes e danificas geradores em 20%.",
  "Buckle Up":
    "Revela a aura de Sobreviventes em estado agonizante. Ao curar um Sobrevivente do estado agonizante, ambos ganham o status Resistência por 10 segundos.",
  "Built To Last":
    "Esconderes-te dentro de um armário por 12 segundos com um item vazio recarrega 99% das suas cargas.",
  "Call Of Brine":
    "Depois de chutar um gerador, este regride a 125% da velocidade normal e recebes uma notificação sempre que um Sobrevivente acertar um Teste de Perícia Bom.",
  "Calm Spirit":
    "Reduz as chances de alertar corvos em 100% e permite-te abrir baús e limpar totens silenciosamente, embora mais devagar.",
  "Champion Of Light":
    "Enquanto seguras uma lanterna, ganhas 5% de Celeridade. Cegar o Assassino faz com que ele sofra 20% de Lentidão por 6 segundos.",
  "Chemical Trap":
    "Após reparar geradores por 50%, podes instalar uma armadilha num palete caído que explode e abranda o Assassino se ele o destruir.",
  Claustrophobia:
    "Sempre que um gerador for concluído, todos os locais de salto de janelas num raio de 32 metros ficam bloqueados para todos os Sobreviventes por 30 segundos.",
  Clairvoyance:
    "Após purificar um totem, podes usar a tua mão vazia para ver as auras de geradores, baús, ganchos e as portas de saída num raio de 64 metros.",
  "Corrupt Intervention":
    "Os 3 geradores mais distantes de ti são bloqueados pela Entidade por 120 segundos no início da partida.",
  Coulrophobia:
    "Sobreviventes dentro do teu Raio de Terror curam 50% mais devagar e os Testes de Perícia de cura movem-se 50% mais rápido.",
  Counterforce:
    "Purificas totens 20% mais rápido. Após purificar um totem, vês a aura do totem mais distante e recebes um bónus de velocidade acumulável.",
  "Coup De Grace":
    "Sempre que um gerador é concluído, ganhas 2 símbolos. Consome um símbolo para aumentar a distância do teu próximo ataque de estocada em 80%.",
  "Dark Devotion":
    "Ao atingires a Obsessão com um ataque básico, o teu Raio de Terror é transferido para ela por 30 segundos e ficas Indetetável.",
  "Dark Sense":
    "Sempre que um gerador é concluído, a aura do Assassino é revelada para ti por 10 segundos se ele estiver num raio de 24 metros.",
  "Dead Hard":
    "Quando ferido, prime o botão de habilidade enquanto corres para ganhar 0,5 segundos de Resistência. Ativa-se após seres desenganchado.",
  "Dead Man Switch":
    "Após enganchar um Sobrevivente, qualquer gerador que um Sobrevivente pare de reparar antes de ser concluído será bloqueado pela Entidade por 30 segundos.",
  Deadlock:
    "Quando um gerador é concluído, a Entidade bloqueia o gerador com maior progresso por 30 segundos.",
  Deathbound:
    "Quando um Sobrevivente cura outro a mais de 32 metros de ti, o curador grita e sofre de Inconsciência quando estiver longe do curado.",
  Deception:
    "Interagir com um armário enquanto corres não te faz entrar, mas faz barulho e oculta as tuas marcas de rastro por 3 segundos.",
  "Decisive Strike":
    "Após seres desenganchado, se fores agarrado ou derrubado, podes acertar um Teste de Perícia para atordoar o Assassino por 5 segundos.",
  "Déjà Vu":
    "Revela a aura dos 3 geradores que estão mais próximos uns dos outros e concede 6% de bónus de velocidade de reparação neles.",
  Deliverance:
    "Após fazeres um resgate de gancho seguro, a tua próxima tentativa de fuga do gancho terá 100% de hipótese de sucesso.",
  "Desperate Measures":
    "Aumenta a velocidade de cura e de resgate de gancho em 14% para cada Sobrevivente ferido, deitado ou enganchado.",
  "Detective's Hunch":
    "Quando um gerador é concluído, as auras de geradores, baús e totens num raio de 64 metros são reveladas por 10 segundos.",
  Discordance:
    "Qualquer gerador num raio de 128 metros que esteja a ser reparado por 2 ou mais Sobreviventes é marcado com uma aura amarela e dispara um alerta.",
  Dissolution:
    "3 segundos após ferires um Sobrevivente, se ele saltar uma janela no teu Raio de Terror, o palete que ele saltou será destruído pela Entidade.",
  Distortion:
    "Começas com 3 símbolos. Sempre que a tua aura for revelada ao Assassino, um símbolo é gasto e a tua aura e rastro ficam ocultos por 10 segundos.",
  Distressing:
    "Aumenta o teu Raio de Terror em 26% e ganhas 100% mais Pontos de Sangue em eventos de Devoção.",
  Diversion:
    "Ativa-se após estares no Raio de Terror por 30 segundos. Prime o botão para atirar uma pedra que cria uma notificação de barulho para o Assassino.",
  Dramaturgy:
    "Enquanto corres saudável, ganhas Celeridade por 0.5s e recebes um efeito aleatório (pode ser um item, exposição ou grito).",
  "Dragon's Grip":
    "Após chutar um gerador, o próximo Sobrevivente que interagir com ele gritará e ficará Exposto por 60 segundos.",
  "Dying Light":
    "A tua Obsessão ganha 33% de velocidade de cura e resgate. Cada vez que enganchas alguém que não seja a Obsessão, todos sofrem uma penalidade de velocidade de reparação.",
  Empathy:
    "As auras de aliados feridos ou em estado agonizante são reveladas a ti num raio de 128 metros.",
  Enduring: "Reduz a duração do atordoamento por paletes em 50%.",
  Eruption:
    "Depois de chutar um gerador, a aura dele fica amarela. Quando derrubas um Sobrevivente, todos os geradores marcados explodem e perdem 10% de progresso.",
  Exultation:
    "Atordoar o Assassino com um palete aumenta a raridade do item que tens na mão e recarrega algumas cargas.",
  "Fast Track":
    "Sempre que um aliado é enganchado, ganhas símbolos. Consome os símbolos num Teste de Perícia Ótimo num gerador para ganhar bónus de progresso instantâneo.",
  Fearmonger:
    "Enquanto os Sobreviventes reparam geradores, sofrem de Cegueira e Exaustão. O efeito dura 5 segundos após pararem de reparar.",
  "Fire Up":
    "Cada vez que um gerador é concluído, ganhas um bónus acumulável de velocidade para pegar/soltar, destruir paletes e saltar janelas.",
  Flashbang:
    "Após reparar geradores por 50%, entra num armário para criar uma granada de luz que cega e atordoa o Assassino.",
  Fogwise:
    "Acertar um Teste de Perícia Ótimo enquanto reparas um gerador revela a aura do Assassino por 6 segundos.",
  "For The People":
    "Enquanto saudável, prime o botão de habilidade para curar instantaneamente um aliado de ferido para saudável (ou deitado para ferido) e ficares ferido e Quebrado.",
  "Forced Hesitation":
    "Quando um Sobrevivente é colocado no estado agonizante, todos os outros num raio de 16 metros sofrem de Lentidão por 10 segundos.",
  "Forced Penance":
    "Sobreviventes que levam um golpe de proteção sofrem do status Quebrado por 80 segundos.",
  "Franklin's Demise":
    "Ataques básicos fazem os Sobreviventes largar os seus itens. O item caído perde cargas se não for recuperado rapidamente.",
  "Friendly Competition":
    "Após terminares um gerador com outro Sobrevivente, ambos ganham 5% de bónus de velocidade de reparação por 75 segundos.",
  "Furtive Chase":
    "Quando enganchas a Obsessão, ficas Indetetável e ganhas 5% de Celeridade por 18 segundos. Quem fizer o resgate torna-se a nova Obsessão.",
  "Gear Head":
    "Após um Sobrevivente perder um estado de saúde, a aura de qualquer Sobrevivente que acertar um Teste de Perícia Bom num gerador é revelada por 10 segundos.",
  "Genetic Limits":
    "Quando um Sobrevivente termina uma ação de cura, ele sofre de Exaustão por 32 segundos.",
  "Gift Of Pain":
    "Quando um Sobrevivente é removido de um Gancho do Flagelo, ele sofre de Hemorragia e Dilaceração. Após curado, tem uma penalidade de 16% em reparação e cura.",
  "Grim Embrace":
    "Sempre que enganchas um Sobrevivente pela primeira vez, ganhas um símbolo. Com 4 símbolos, a Entidade bloqueia todos os geradores por 40 segundos.",
  guardian:
    "Quando você resgata um Sobrevivente do gancho, ele não deixa marcas de rastro ou poças de sangue por 8 segundos. Você vê a aura do Assassino por 8 segundos.",
  "Hangman's Trick":
    "Receba uma notificação quando um Sobrevivente começar a sabotar um gancho. Enquanto carrega um Sobrevivente, você vê a aura de qualquer Sobrevivente a 6 metros de um gancho.",
  Hardened:
    "Sempre que você for gritar, em vez disso, a aura do Assassino é revelada a você por 5 segundos e o grito é suprimido.",
  "Head On":
    "Enquanto estiver em um armário por 3 segundos, realize uma ação de saída rápida para atordoar o Assassino por 3 segundos se ele estiver ao alcance. Causa Exaustão.",
  "Hex Crowd Control":
    "Após um Sobrevivente realizar um pulo rápido em uma janela, a Entidade bloqueia essa janela por 14 segundos enquanto o Totem de Feitiço estiver de pé.",
  "Devour Hope":
    "Ganha símbolos quando Sobreviventes são resgatados. Com 3 símbolos, todos ficam Expostos. Com 5 símbolos, você pode matar Sobreviventes com suas próprias mãos.",
  "Hex Face The Darkness":
    "Ferir um Sobrevivente ativa o feitiço. Enquanto ativo, todos os outros Sobreviventes fora do seu Raio de Terror gritam intermitentemente e revelam suas posições.",
  "Haunted Ground":
    "Dois Totens de Feitiço aparecem. Se um for purificado, todos os Sobreviventes sofrem do status Exposto por 60 segundos.",
  "Secret Project":
    "Sempre que um Totem for abençoado ou purificado por um Sobrevivente, um gerador aleatório que esteja desbloqueado seja bloqueado pela Entidade por um período de 20/25/30 segundos. Além disso, sempre que houver qualquer número de geradores bloqueados no mapa, você ganha o efeito de status Indetectável por uma duração de 30 segundos.",
  "Hex Hive Mind":
    "Esta vantagem única do Primeiro cria um Totem Hex a partir de um Totem Sem Graça aleatório na primeira vez que você engancha qualquer Sobrevivente. Enquanto o feitiço estiver ativo, as auras dos geradores são destacadas para você, e a intensidade do brilho revela o progresso atual dos reparos. Assim que um total de 4 geradores forem concluídos, todos os geradores restantes explodem, perdendo 6/8/10% de progresso e iniciando a regressão, o que desativa a vantagem pelo restante da partida.",
  "Huntress Lullaby":
    "Sobreviventes recebem uma penalidade de regressão maior em testes de perícia falhos. Cada gancho encurta o tempo entre o aviso sonoro e o teste de perícia.",
  "No One Escapes Death":
    "Quando os portões são energizados, os Sobreviventes ficam Expostos e sua velocidade de movimento aumenta em 4% se houver um Totem Simples restante.",
  "Hex Pentimento":
    "Você pode ressuscitar totens destruídos. Cada Totem Renovado aplica uma penalidade aos Sobreviventes (reparo, cura, recuperação, portões ou bloqueio total).",
  "Hex Plaything":
    "O primeiro Sobrevivente enganchado fica Alheio até que ele mesmo purifique o Totem de Feitiço associado a ele.",
  "Hex Retribution":
    "Sobreviventes que interagirem com qualquer totem sofrem de Inconsciência. Se um Totem de Feitiço for purificado, a aura de todos é revelada por 15 segundos.",
  Ruin: "Enquanto o Totem estiver ativo, todos os geradores regridem automaticamente a 100% da velocidade normal sempre que não estiverem sendo reparados.",
  "The Third Seal":
    "Atingir um Sobrevivente com um ataque básico aplica o efeito de Cegueira, ocultando auras de aliados e ganchos para ele.",
  "Thrill Of The Hunt":
    "Reduz a velocidade de limpeza e bênção de totens dos Sobreviventes para cada totem restante e concede bônus de Pontos de Sangue em Caçada.",
  "two Can Play":
    "Sempre que você for cegado ou atordoado 2 vezes, se houver um Totem Simples, ele se torna um Feitiço que cega o próximo Sobrevivente que te atordoar.",
  "Hex Undying":
    "Sobreviventes próximos a totens têm suas auras reveladas. Se outro Totem de Feitiço for purificado, ele é transferido para o Totem de Undying.",
  "Highly Strung":
    "Quando o Assassino está a 12 metros de você, sua velocidade de pulo em janelas e paletes é aumentada em 5%.",
  Hoarder:
    "Gera 2 baús extras. Você recebe uma notificação quando um Sobrevivente interage com um baú ou pega um item em um raio de 64 metros.",
  Hope: "Assim que os Portões de Saída são energizados, você ganha 7% de Celeridade permanentemente.",
  Hubris:
    "Sempre que você for atordoado por um palete, o Sobrevivente que o atordoou sofre do status Exposto por 20 segundos.",
  "Human Greed":
    "Você vê a aura de baús fechados. Quando um Sobrevivente interage com um baú, ele grita e sua aura é revelada por 3 segundos.",
  Hyperfocus:
    "Após acertar um Teste de Perícia Ótimo, ganha símbolos que aumentam a chance de novos testes e a velocidade de progressão do bônus.",
  Hysteria:
    "Sempre que um Sobrevivente saudável perde um estado de saúde, todos os outros Sobreviventes feridos sofrem do status Inconsciente por 30 segundos.",
  "Im All Ears":
    "Sempre que um Sobrevivente realizar uma ação rápida em um raio de 48 metros, a aura dele é revelada a você por 6 segundos.",
  "Infectious Fright":
    "Quando um Sobrevivente é derrubado com um ataque básico, todos os outros no seu Raio de Terror gritam e revelam sua posição por 6 segundos.",
  "Inner Focus":
    "Você vê as marcas de rastro de outros aliados. Se um aliado perder vida perto de você, a aura do Assassino é revelada por 5 segundos.",
  "inner Strength":
    "Após purificar um totem, esconder-se em um armário por 8 segundos enquanto ferido cura você automaticamente para o estado saudável.",
  Insidious:
    "Ficar parado por 2 segundos concede o status Indetectável até que você se mova ou realize uma ação.",
  "Iron Grasp":
    "Reduz os efeitos do balanço do Sobrevivente em 75% e aumenta o tempo necessário para ele se libertar em 12%.",
  "Iron Maiden":
    "Você abre armários 20% mais rápido. Sobreviventes que saem de armários gritam e sofrem de Exposição por 30 segundos.",
  "Iron Will":
    "Reduz o volume dos gemidos de dor causados por ferimentos em 100% enquanto você não estiver sofrendo de Exaustão.",
  Kindred:
    "Enquanto você está no gancho, todos os aliados veem a aura uns dos outros. Se o Assassino estiver perto do gancho, a aura dele também é revelada.",
  "Knock Out":
    "Sobreviventes derrubados por ataques básicos não revelam suas auras para aliados distantes e sofrem de Cegueira e Lentidão.",
  Leader:
    "Aumenta a velocidade de cura, sabotagem, desenganchar, limpar totens e abrir portões dos aliados em 25% quando estão perto de você.",
  "Left Behind":
    "Se você for o último Sobrevivente na partida, você vê a aura da escotilha quando estiver a 32 metros de distância.",
  Leverage:
    "Cada vez que você engancha um Sobrevivente, ganha um símbolo. Cada símbolo reduz a velocidade de cura dos sobreviventes por 30 segundos após um gancho.",
  Lightborn:
    "Você é imune à cegueira de lanternas e granadas. A aura de qualquer Sobrevivente que tentar te cegar é revelada por 10 segundos.",
  Lightweight:
    "Suas marcas de rastro duram 5 segundos a menos e aparecem de forma mais inconsistente para o Assassino.",
  Lithe:
    "Após realizar um pulo rápido durante uma perseguição, você corre a 150% da velocidade por 3 segundos. Causa Exaustão.",
  "Low Profile":
    "Quando você é o último Sobrevivente restante, suas marcas de rastro e poças de sangue ficam ocultas por 90 segundos.",
  "Lucky Break":
    "Ao ser ferido, suas marcas de rastro e poças de sangue ficam ocultas por 60 segundos. O tempo é recarregado ao curar outros Sobreviventes.",
  "Lucky Star":
    "Ao entrar em um armário, você não deixa sangue e não faz barulho. Ao sair, vê a aura de aliados e do gerador mais próximo por 10 segundos.",
  "Mad Grit":
    "Enquanto carrega um Sobrevivente, ataques perdidos não têm tempo de recarga e ataques certeiros pausam a barra de resistência do carregado.",
  "made For This":
    "Enquanto ferido, você ganha 3% de Celeridade ao correr e ganha Resistência por 10 segundos após terminar de curar um aliado.",
  "Make Your Choice":
    "Quando um Sobrevivente é resgatado do gancho a 32 metros de você, o resgatador grita e sofre de Exposição por 60 segundos.",
  "Merciless Storm":
    "Quando um gerador atinge 90%, os Sobreviventes devem enfrentar testes de perícia contínuos. Se falharem ou pararem, o gerador é bloqueado.",
  "Mind Breaker":
    "Enquanto reparam geradores, os Sobreviventes sofrem dos status Cegueira e Exaustão. O efeito dura 5 segundos após pararem.",
  "Mirror Illusion":
    "Após reparar 50% de um gerador, crie uma cópia estática de si mesmo na frente de um gerador, baú ou totem por um curto período.",
  "Monstrous Shrine":
    "Transforma os ganchos do porão em Ganchos do Flagelo. Eles progridem a entidade 20% mais rápido se você estiver longe.",
  "No Mither":
    "Você começa a partida ferido e Quebrado, mas não deixa sangue, faz menos barulho e pode se levantar do chão sozinho infinitamente.",
  "No One Left Behind":
    "Assim que os portões são energizados, ganhe bônus de velocidade em cura e resgate, além de ver a aura de todos os aliados.",
  "Object Of Obsession":
    "Enquanto o Assassino vê sua aura, você vê a dele. Se for a Obsessão, sua velocidade de reparo e cura aumenta em 6%.",
  "Off The Record":
    "Após ser desenganchado, ganha Resistência por 80 segundos e suas marcas de rastro e gemidos de dor ficam ocultos.",
  "Open-Handed":
    "Aumenta o alcance de todas as habilidades de leitura de aura (suas e dos aliados) em 16 metros.",
  Oppression:
    "Ao chutar um gerador, outros 3 geradores aleatórios começam a regredir e exigem um teste de perícia difícil dos Sobreviventes.",
  Overcharge:
    "Após chutar um gerador, o próximo Sobrevivente que interagir com ele enfrentará um teste de perícia difícil. A regressão do gerador aumenta com o tempo.",
  Overcome:
    "Ao ser ferido por um ataque, você retém o bônus de velocidade de movimento por mais 2 segundos. Causa Exaustão.",
  "Play With Your Food":
    "Ao deixar sua Obsessão escapar de uma perseguição, você ganha um símbolo que aumenta sua velocidade em 5% (máximo 3 símbolos).",
  "Plot Twist":
    "Enquanto ferido, aperte o botão de habilidade enquanto agachado para entrar no estado agonizante silenciosamente. Você pode se curar sozinho e, ao levantar, fica saudável e ganha Celeridade.",
  Poised:
    "Após um gerador ser concluído, você não deixa marcas de rastro por 10 segundos.",
  "Potential Energy":
    "Após reparar um gerador por 8 segundos, pressione o botão de habilidade para carregar a perk. O progresso de reparo é convertido em símbolos que podem ser descarregados em outro gerador.",
  "Power of Two":
    "Ao curar outro Sobrevivente, ambos ganham 5% de Celeridade enquanto estiverem a 12 metros um do outro.",
  Predator:
    "As marcas de rastro deixadas pelos Sobreviventes ficam consideravelmente mais próximas umas das outras.",
  Premonition:
    "Receba um aviso sonoro quando olhar na direção do Assassino em um cone de 45 graus num raio de 36 metros.",
  "Proper Planning":
    "Quando um gerador é concluído, a aura do Assassino é revelada para você por 5 segundos.",
  Prowler:
    "Enquanto está no Raio de Terror do Assassino sem ser perseguido, sua velocidade de movimento agachado aumenta em 20%.",
  "Quick & Quiet":
    "Você realiza ações rápidas de saltar janelas ou entrar em armários sem fazer barulho. Possui tempo de recarga.",
  "Quick Gambit":
    "Enquanto você está sendo perseguido, outros Sobreviventes reparando geradores em um raio de 36 metros recebem um bônus de 8% na velocidade de reparação.",
  Rancor:
    "Revela a sua aura para a Obsessão por 5/4/3 segundos e mostra a localização de todos os sobreviventes por 3 segundos sempre que um gerador é concluído. Além disso, permite matar a Obsessão com as próprias mãos e aplica nela o efeito Exposição permanente assim que os portões de saída forem energizados.",
  "Reactive Healing":
    "Quando outro Sobrevivente perde um estado de saúde em um raio de 32 metros de você, ganhe instantaneamente 50% de progressão na sua barra de cura.",
  Reassurance:
    "Ao chegar perto de um Sobrevivente enganchado, aperte o botão para pausar o progresso da entidade dele por 30 segundos.",
  "Red Herring":
    "Após reparar um gerador por 3 segundos, ele fica marcado. Ao entrar em um armário, o gerador marcado faz um barulho alto para atrair o Assassino.",
  Relentless: "Reduz o tempo de recarga de ataques básicos perdidos em 30%.",
  "Repressed Alliance":
    "Após reparar geradores por 45 segundos, pressione o botão de habilidade para invocar a Entidade e bloquear o gerador por 30 segundos.",
  "Residual Manifest":
    "Após realizar uma ação de cegueira no Assassino, ele sofre do status Cegueira por 30 segundos. Permite vasculhar baús para encontrar uma lanterna.",
  Resilience:
    "Concede 9% de bônus de velocidade em reparos, curas, saltos e sabotagens enquanto você estiver ferido.",
  Resurgence:
    "Ganhe instantaneamente 50% de progresso de cura após ser desenganchado ou se desenganchar sozinho.",
  "Rookie Spirit":
    "Enquanto repara geradores, você vê a aura de todos os geradores em regressão no mapa.",
  Ruthless:
    "O tempo de recuperação de ataques básicos bem-sucedidos é reduzido em 9%.",
  Saboteur:
    "Veja a aura de ganchos próximos quando um aliado é carregado. Permite sabotar ganchos sem uma caixa de ferramentas.",
  "Flood Of Rage":
    "Quando um Sobrevivente é resgatado de um Gancho do Flagelo, as auras de todos os outros Sobreviventes são reveladas por 7 segundos.",
  "Pain Resonance":
    "Comece com 4 símbolos. Ao enganchar um Sobrevivente em um Gancho do Flagelo pela primeira vez, o gerador com mais progresso explode e perde 25% de progresso.",
  "Self Care":
    "Desbloqueia a habilidade de se curar sem um item de cura a 35% da velocidade normal.",
  "Self- Preservation":
    "Sempre que um aliado próximo é atingido, suas marcas de rastro, poças de sangue e gemidos de dor são ocultados por 10 segundos.",
  "Septic Touch":
    "Sobreviventes realizando a ação de cura dentro do seu Raio de Terror sofrem de Cegueira e Exaustão.",
  Shadowborn:
    "Sua visão é mais nítida e você ganha 15% de Celeridade por 10 segundos após ser cegado.",
  "Shattered Hope":
    "Permite destruir um Totem de Bênção. Ao destruí-lo, a aura de todos os sobreviventes no raio do totem é revelada.",
  "situational Awareness":
    "Enquanto repara um gerador, a aura dele é revelada para outros sobreviventes. Você vê a aura de todos os aliados se um for derrubado.",
  "Slippery Meat":
    "Aumenta suas chances de se libertar do gancho em 4% e concede tentativas extras.",
  "Sloppy Butcher":
    "Ataques básicos causam Hemorragia e Dilaceração, aumentando a regressão da cura e o tempo necessário para curar.",
  "Small Game":
    "Receba um aviso sonoro quando olhar na direção de um totem em um cone de 45 graus.",
  "Smash Hit":
    "Após atordoar o Assassino com um palete, você corre a 150% da velocidade por 4 segundos. Causa Exaustão.",
  "Sole Survivor":
    "Sua aura não pode ser lida pelo Assassino a certas distâncias para cada aliado morto. Se for o último, repara e abre portões mais rápido.",
  Solidarity:
    "Enquanto ferido, curar um aliado também cura você a uma taxa de 50% de conversão.",
  "Soul Guard":
    "Ganhe o status Resistência por 8 segundos após ser curado ou se levantar do estado agonizante. Pode se levantar sozinho se houver um Feitiço ativo.",
  "Spies From The Shadows":
    "Corvos assustados em um raio de 36 metros enviam um alerta visual para o Assassino.",
  "Come And Get Me":
    "Após desenganchar um sobrevivente, permite ativar uma habilidade que oculta grunhidos, sangue e marcas de arranhões de sobreviventes feridos próximos por alguns segundos, mas revela sua aura ao assassino temporariamente.",
  "Spine Chill":
    "Receba uma notificação se o Assassino estiver olhando na sua direção em um raio de 36 metros. Aumenta a velocidade de interações se ele estiver perto.",
  "Spirit Fury":
    "Após quebrar 2 paletes, a próxima vez que for atordoado por um palete, a Entidade o quebra instantaneamente.",
  "Sprint Burst":
    "Ao começar a correr, alcance 150% da velocidade por 3 segundos. Causa Exaustão por 40 segundos.",
  "Stake Out":
    "Para cada 15 segundos dentro do Raio de Terror do Assassino sem ser perseguido, ganhe um símbolo. Transforma Testes Bons em Ótimos.",
  Starstruck:
    "Enquanto carrega um Sobrevivente, todos os outros Sobreviventes no seu Raio de Terror sofrem de Exposição.",
  "Still Sight":
    "Após ficar parado por 4 segundos, veja a aura do Assassino e de geradores/baús próximos até se mover.",
  "Strength In Shadows":
    "Ao estar no porão, você pode se curar sem itens a 70% da velocidade. Após a cura, veja a aura do Assassino por 10 segundos.",
  Stridor:
    "Gemidos de dor dos sobreviventes são 50% mais altos e a respiração regular é 25% mais alta.",
  "Superior Anatomy":
    "Quando um Sobrevivente pula uma janela perto de você, sua próxima velocidade de pulo aumenta em 40%.",
  Surge:
    "Derrubar um Sobrevivente com um ataque básico faz todos os geradores em um raio de 32 metros explodirem e perderem 8% de progresso.",
  Surveillance:
    "Geradores em regressão aparecem com aura branca. Quando a regressão para, a aura fica amarela por 16 segundos.",
  Technician:
    "Reduz o barulho das reparações. Falhar em testes de perícia não causa explosão, mas penaliza o progresso do gerador em dobro.",
  Tenacity:
    "Sua velocidade de rastejar é aumentada em 50% e você pode se recuperar enquanto se move.",
  "Tension Release":
    "Sempre que o Assassino quebra um palete ou parede, sua velocidade de movimento aumenta em 1% permanentemente (até um máximo).",
  Terminus:
    "Quando os portões são energizados, todos os sobreviventes feridos, deitados ou enganchados sofrem do status Quebrado até os portões abrirem.",
  "Territorial Imperative":
    "A aura de um Sobrevivente é revelada quando ele entra no porão e você está a mais de 32 metros de distância.",
  Thwack:
    "Após enganchar um Sobrevivente, a próxima vez que você quebrar um palete ou parede, sobreviventes próximos gritam e revelam sua aura.",
  Tinkerer:
    "Quando um gerador atinge 70% de progresso, você recebe um alerta e ganha o status Indetectável por 16 segundos.",
  "Trail Of Torment":
    "Após chutar um gerador, você fica Indetectável até o gerador parar de regredir ou um Sobrevivente ser ferido.",
  Troublemaker:
    "Enquanto é perseguido pelo Assassino, você vê a aura do gerador com mais progresso.",
  Unbound:
    "Após quebrar um palete, sua velocidade de pulo em janelas aumenta em 15% por 10 segundos.",
  Unbreakable:
    "Concede a habilidade de se recuperar totalmente do estado agonizante uma vez por partida e aumenta a velocidade de recuperação.",
  Undone:
    "Ganha símbolos quando Sobreviventes falham em Testes de Perícia. Use os símbolos para reduzir o progresso de um gerador ao chutá-lo.",
  "Unnerving Presence":
    "Sobreviventes no seu Raio de Terror têm 10% mais chance de ativar Testes de Perícia e as zonas de sucesso são reduzidas em 60%.",
  Unrelenting: "Reduz o tempo de recarga de ataques básicos perdidos em 30%.",
  "Urban Evasion":
    "Sua velocidade de movimento ao agachar é aumentada em 100%.",
  Vigil:
    "Você e seus aliados em um raio de 8 metros recuperam-se de Exaustão, Hemorragia, Dilaceração, Impedimento e Cegueira 30% mais rápido.",
  Visionary: "Você vê a aura de geradores em um raio de 32 metros.",
  "Wandering Eye":
    "É ativada sempre que você inicia uma perseguição a um Sobrevivente. Ao ser desencadeada, as auras de todos os outros Sobreviventes feridos que estiverem em um raio de 20 metros da sua localização são reveladas por 5 segundos. A habilidade possui um tempo de recarga de 40/35/30 segundos entre as ativações.",
  "Scourge Hook Jagged Compass":
    "Transforma 4 ganchos aleatórios em Ganchos da Praga, revelando as auras deles para você em branco no início da partida. Sempre que um Sobrevivente é resgatado de um gancho comum, esse gancho é convertido em um novo Gancho Flagelo. Além disso, ao pendurar um Sobrevivente em um Gancho da Praga, a aura do gerador com o progresso mais avançado fica destacada em amarelo por 6/8/10 segundos.",
  Ravenous:
    "Esta vantagem única do Krasue concede uma ficha sempre que você engancha um Sobrevivente pela primeira vez, acumulando até um máximo de 4 fichas. Ao atingir o limite de 4 fichas, todos os Sobreviventes gritam e sofrem o efeito de status Exposto por uma duração de 40/50/60 segundos.",
  "Phantom Fear":
    "Esta vantagem única do Animatrônico faz com que qualquer Sobrevivente dentro do seu Raio de Terror que olhar diretamente para você grite e tenha a própria aura revelada por 2 segundos. A habilidade possui um tempo de recarga de 80/70/60 segundos após ser ativada.",
  "Nothing But Misery":
    "Esta vantagem única do Ghoul faz com que um Totem Apagado aleatório se transforme em um Totem Hex após você causar dano 8 vezes com ataques básicos aos Sobreviventes. Enquanto a maldição estiver ativa, qualquer Sobrevivente atingido por um ataque básico sofre uma penalidade de -5% na sua velocidade de movimento por um período de 10/12,5/15 segundos. Os efeitos da maldição persistem até que o Totem da Maldição seja purificado ou abençoado por um Sobrevivente.",
  "No Quarter":
    "Esta vantagem exclusiva do Mestre dos Cães é ativada sempre que um Sobrevivente atinge 75% de progresso em qualquer tipo de cura. A partir desse momento, o Sobrevivente enfrenta um fluxo contínuo de Testes de Habilidade até concluir a ação. Caso ele falhe em um teste ou interrompa a cura de qualquer forma, sofrerá com o efeito de status Quebrado por um período de 20/25/30 segundos.",
  "None Are Free":
    "Esta vantagem única do Ghoul acumula fichas sempre que você engancha um Sobrevivente pela primeira vez, podendo chegar a um máximo de 4 fichas. Assim que todos os geradores são concluídos, a Entidade bloqueia todas as janelas e paletes verticais do mapa por um período cumulativo de 12/14/16 segundos por ficha, totalizando até 48/56/64 segundos de bloqueio no nível máximo.",
  "Wake Up":
    "Uma vez que todos os geradores são concluídos, você vê a aura dos portões de saída e os abre 25% mais rápido.",
  "We'll Make It":
    "Após resgatar alguém do gancho, sua velocidade de cura aumenta em 100% por 90 segundos.",
  Whispers:
    "Você ouve a voz da Entidade quando um Sobrevivente está em um raio de 32 metros de você.",
  "Windows Of Opportunity":
    "As auras de janelas, paletes e paredes quebráveis são reveladas a você em um raio de 32 metros.",
  Wiretap:
    "Após reparar um gerador por 3 segundos, instale uma escuta. Se o Assassino estiver perto desse gerador, a aura dele é revelada a todos.",
  "Wyrm's Grip":
    "Enquanto carrega um sobrevivente, a barra de resistência não progride enquanto você estiver perto de um gerador.",
  "Zanshin Tactics":
    "As auras de paletes, paredes e janelas são reveladas a você em um raio de 32 metros.",
  "Background Player":
    "Quando outro sobrevivente é retirado do gancho ou pego pelo assassino, você corre a 150% da velocidade por 4 segundos.",
  "Blood Rush":
    "Uma vez por partida, quando estiver enganchado pela última vez, recupere-se instantaneamente da Exaustão ao custo de um estado de saúde.",
  "Cut Through Uselessness":
    "Aumenta a velocidade com que você abre baús e limpa totens em 50%.",
  Deadbolt:
    "Depois que um Sobrevivente é atingido por um ataque básico, a Entidade bloqueia o gerador que ele estava reparando por um curto período.",
  "Death Throes":
    "Ao colocar um Sobrevivente no estado agonizante, outros sobreviventes próximos sofrem de Inconsciência.",
  Dominance:
    "A primeira vez que cada Totem ou Baú for interagido por um Sobrevivente, a Entidade o bloqueia por um curto período.",
  "Echoes of Fear":
    "Quando um sobrevivente é enganchado, o raio de terror do assassino ecoa em locais aleatórios do mapa por 15 segundos.",
  "Eyes Of Belmont":
    "Sempre que um gerador é concluído, a aura do assassino é revelada para você por um tempo prolongado.",
  Finesse:
    "Enquanto estiver saudável, sua velocidade de pulo rápido é 20% maior. Tem um tempo de recarga.",
  "Game Over":
    "Quando o último gerador é ligado, a Entidade bloqueia a escotilha por 30 segundos se ela estiver aberta.",
  "Machine Learning":
    "Após chutar um gerador, o próximo que você chutar fica marcado. Quando o marcado é concluído, você ganha Celeridade e Indetectável.",
  "Moment Of Glory":
    "Após ser ferido, a perk ativa. Se você sobreviver por 60 segundos, você é curado automaticamente um estado de saúde.",
  "No Way Out":
    "Para cada Sobrevivente enganchado pela primeira vez, você ganha um símbolo. Quando o primeiro portão é tocado, a Entidade bloqueia ambos os portões.",
  "Nowhere To Hide":
    "Sempre que você chuta um gerador, a aura de todos os sobreviventes em um raio de 24 metros é revelada por 5 segundos.",
  "Overwhelming Presence":
    "Sobreviventes no seu Raio de Terror consomem itens 100% mais rápido.",
  "Pack Resilience":
    "Enquanto estiver a 6 metros de outro sobrevivente, ambos sofrem de Hemorragia 50% mais devagar.",
  "Pick Me Up":
    "Enquanto estiver no estado agonizante, veja a aura de todos os sobreviventes e rasteje 30% mais rápido.",
  "Poisonous Touch":
    "Sempre que você fere um sobrevivente com um ataque básico, ele sofre do status de Exaustão por um curto período.",
  "Power Struggle":
    "Enquanto é carregado pelo Assassino, se sua barra de resistência atingir 15%, você pode derrubar um palete para se libertar.",
  "Rapid Brutality":
    "Você não ganha mais Sede de Sangue, mas acertar um ataque básico concede 5% de Celeridade por 10 segundos.",
  Realignment:
    "Após ser atingido pelo Assassino, sua próxima ação de cura ou reparo ganha um bônus de 5%.",
  "Remember Me":
    "Cada vez que você atinge a Obsessão, o tempo de abertura dos portões de saída aumenta para os outros sobreviventes em 4 segundos.",
  "Renewed Focus":
    "Enquanto é perseguido pelo assassino, as auras de geradores em regressão são reveladas para você.",
  scavenger:
    "Ao usar um item vazio, acerte testes de perícia ótimos para recarregar o item totalmente. Reduz a velocidade de reparo temporariamente.",
  "Scene Partner":
    "Enquanto estiver no raio de terror do Assassino, olhar para ele faz você gritar, mas revela a aura dele por um curto período.",
  "second Wind":
    "Após curar um aliado pelo equivalente a um estado de saúde, a perk ativa. Ao ser desenganchado, você se cura automaticamente após 20 segundos.",
  "A Nurses Calling":
    "As auras de Sobreviventes que estão curando ou sendo curados são reveladas a você quando estão em um raio de 28 metros.",
  "Balanced Landing":
    "Ao cair de grandes alturas, você reduz o tempo de tontura em 75% e corre a 150% da velocidade por 3 segundos. Causa Exaustão.",
  Camaraderie:
    "Enquanto estiver no gancho na fase de luta, o cronômetro de resistência é pausado por 34 segundos se um aliado chegar a 16 metros de você.",
  "Corrective Action":
    "Você começa com 1 símbolo. Sempre que um aliado falha em um Teste de Perícia enquanto repara com você, o erro é convertido em um acerto Bom.",
  "Dance With Me":
    "Ao realizar um pulo rápido ou sair de um armário correndo, você não deixa marcas de rastro por 3 segundos. Possui tempo de recarga.",
  "Dark Arrogance":
    "Aumenta a sua velocidade de pulo em janelas em 25%, mas aumenta a duração da cegueira e o atordoamento por paletes em 25%.",
  "Darkness Revelated":
    "Ao abrir um armário, a aura de todos os Sobreviventes em um raio de 8 metros de qualquer armário no mapa é revelada por 5 segundos.",
  Deadline:
    "Enquanto estiver ferido, Testes de Perícia aparecem com 10% mais frequência ao reparar ou curar, mas as penalidades por erro são maiores.",
  Deerstalker:
    "As auras de Sobreviventes no estado agonizante são reveladas a você quando estão em um raio de 32 metros.",
  "Empathic Connection":
    "Sempre que um aliado estiver ferido, ele vê a sua aura em um raio de 96 metros. Você cura aliados 10% mais rápido.",
  Fixated:
    "Você vê suas próprias marcas de rastro o tempo todo e caminha 20% mais rápido enquanto não estiver ferido.",
  "Flip Flop":
    "Enquanto estiver no estado agonizante, 50% do seu progresso de recuperação é convertido em progresso de resistência ao ser carregado pelo Assassino.",
  "friends Till The End":
    "Ao enganchar um Sobrevivente que não seja a Obsessão, a Obsessão fica Exposta e a aura dela é revelada. Se enganchar a Obsessão, outro se torna o alvo.",
  "Game Afoot":
    "Enquanto persegue a Obsessão, chutar um gerador ou quebrar um palete concede 5% de Celeridade. O Sobrevivente com mais tempo de perseguição vira a Obsessão.",
  "Invocation Weaving Spiders":
    "Ao realizar uma invocação no porão, você fica ferido e Quebrado pelo resto da partida, mas reduz permanentemente o progresso necessário de todos os geradores.",
  "Languid Touch":
    "Sempre que um Sobrevivente assusta um corvo em um raio de 36 metros de você, ele sofre do status de Exaustão por 10 segundos.",
  "Lethal Pursuer":
    "No início da partida, as auras de todos os Sobreviventes são reveladas por 9 segundos. Estende a duração de qualquer outra leitura de aura em 2 segundos.",
  "Light Footed":
    "Enquanto estiver saudável, seus passos correndo são completamente silenciosos. Possui tempo de recarga após realizar um pulo rápido.",
  "Mettle of Man":
    "Após receber 3 golpes de proteção, a próxima vez que você for sofrer um ferimento que te derrubaria, o golpe é ignorado.",
  "Monitor And Abuse":
    "Enquanto estiver em uma perseguição, seu Raio de Terror aumenta em 8 metros. Caso contrário, seu Raio de Terror é reduzido em 8 metros.",
  Nemesis:
    "Sempre que um Sobrevivente te atordoar com um palete ou armário, ele se torna a Obsessão e sofre do status Alheio por 60 segundos.",
  Overzealous:
    "Após purificar ou abençoar um totem, sua velocidade de reparo de gerador aumenta em 10%. O bônus dobra se for um totem de feitiço.",
  "Parental Guidance":
    "Após realizar um resgate de gancho, curar um aliado ou quebrar um totem, suas marcas de rastro, poças de sangue e gemidos de dor somem por 7 segundos.",
  Pharmacy:
    "Vasculhar baús é 80% mais rápido e garante um Kit Médico de Emergência verde no seu primeiro baú concluído.",
  "Plunderer's Instinct":
    "A aura de baús e itens caídos no mapa é revelada a você em um raio de 32 metros. Aumenta a chance de encontrar itens de maior raridade.",
  "Pop Goes The Weasel":
    "Após enganchar um Sobrevivente, o próximo gerador que você chutar perde instantaneamente 20% do progresso atual.",
  "Prove Thyself":
    "Para cada Sobrevivente reparando o mesmo gerador que você em um raio de 4 metros, ganhe um bônus de 10% na velocidade de reparação.",
  "Save The Best For Last":
    "Ganhe um símbolo para cada ataque básico em Sobreviventes que não sejam a Obsessão. Cada símbolo reduz o tempo de recarga de ataques bem-sucedidos.",
  Specialist:
    "Sempre que você abrir ou revirar um baú, ganhe um símbolo. Consome símbolos para aumentar permanentemente o progresso máximo de um gerador ao repará-lo.",
  Streetwise:
    "Reduz a taxa de consumo de carga de itens para você e seus aliados em um raio de 8 metros em 25%.",
  "Teamwork Power Of Two":
    "Ao curar outro sobrevivente, concede a ambos um efeito temporário que melhora a mobilidade e cooperação por alguns segundos.",
  "Teamwork Collective Stealth":
    "Sempre que um Sobrevivente terminar de curar você, nenhum de vocês deixará marcas de rastro enquanto estiverem a 12 metros um do outro.",
  Thanatophobia:
    "Para cada Sobrevivente ferido, deitado ou enganchado, todos os Sobreviventes recebem uma penalidade acumulável de velocidade em reparo e sabotagem.",
  "This Is Not Happening":
    "Aumenta as zonas de sucesso de Testes de Perícia Ótimos em 30% quando você está ferido.",
  "Thrilling Tremors":
    "Após pegar um Sobrevivente, todos os geradores que não estão sendo reparados são bloqueados pela Entidade por 16 segundos.",
  troubleshooter:
    "Enquanto você é perseguido, veja a aura do gerador com mais progresso. Após derrubar um palete, veja a aura do Assassino por 6 segundos.",
  "Ultimate Weapon":
    "Sempre que você abrir um armário, Sobreviventes que entrarem no seu Raio de Terror gritarão e sofrerão do status de Cegueira por 30 segundos.",
  Unforeseen:
    "Ao chutar um gerador, seu Raio de Terror é transferido para ele por 30 segundos e você ganha o status Indetectável.",
  "Up The Ante":
    "Para cada Sobrevivente ainda vivo, ganhe um bônus de 3% de Sorte para todos os Sobreviventes restantes.",
  "Weave Attunement":
    "Sempre que um item é esgotado ou largado, a aura dele é revelada. Sobreviventes perto de itens no chão têm suas auras reveladas a você.",
  Wicked:
    "Suas tentativas de se libertar do gancho no porão sempre têm 100% de sucesso. Após ser desenganchado, veja a aura do Assassino por 20 segundos.",
  "Hex Wretched Fate":
    "Após um gerador ser concluído, um Totem Simples se torna um Feitiço que reduz a velocidade de reparo da Obsessão em 33%.",
  "Animal Instincts":
    "Você vê a aura de itens e baús em um raio de 48 metros quando um Sobrevivente é ferido.",
  "Aura of Restoration":
    "Após purificar um totem, todos os geradores em um raio de 24 metros têm sua aura revelada e mostram o progresso por cor.",
  "Best Performance":
    "Após ser curado por outro Sobrevivente, ambos ganham 5% de bónus de velocidade em todas as ações cooperativas por 60 segundos.",
  "Boundless Energy":
    "Ao terminar de correr por 15 segundos, seu próximo salto de janela ou palete é 10% mais rápido.",
  "Breakneck Speed":
    "Enquanto estiver sendo perseguido por mais de 30 segundos, ganhe 5% de progressão instantânea ao tocar em um gerador.",
  "Calculated Risk":
    "Se você acertar um Teste de Perícia Ótimo enquanto o Assassino estiver a 12 metros, o progresso do gerador aumenta em 3% extras.",
  "Covert Action":
    "Ao entrar em um armário durante uma perseguição, você fica indetetável e seus gemidos são suprimidos por 5 segundos.",
  "Deadly Precision":
    "Aumenta a precisão de ataques especiais e reduz o tempo de recuperação de ataques falhos em 5%.",
  "Deep Focus":
    "Ao reparar um gerador sozinho, Testes de Perícia Ótimos dão um bônus de 1% a mais de progresso.",
  "Emergency Exit":
    "Quando você é o último sobrevivente, a velocidade de abertura da escotilha e dos portões aumenta em 15%.",
  "Fatal Flaw":
    "Quando a Obsessão é curada, o Assassino recebe uma notificação e vê a aura do curador por 4 segundos.",
  "Golden Opportunity":
    "Você vê a aura de todos os baús de ouro e itens especiais em mapas de evento.",
  "Hidden Cache":
    "Sempre que você vasculha um baú, ganha um bônus de 10% de velocidade de reparo pelos próximos 30 segundos.",
  "Improvised Tools":
    "Permite sabotar um gancho sem caixa de ferramentas, mas a uma velocidade reduzida em 50%.",
  "Last Ditch Effort":
    "Se você for o único sobrevivente ferido, sua velocidade de salto aumenta em 10%.",
  "Master Mechanic":
    "Reparar geradores com uma caixa de ferramentas aumenta a eficiência do item em 15%.",
  "Natural Talent":
    "Aumenta a velocidade de cura em 5% para cada aliado ferido, até um máximo de 20%.",
  "Quiet Ambush":
    "Sair de um armário agachado suprime seu Raio de Terror por 2 segundos.",
  "Hex Overture Of Doom":
    "Esta vantagem única do Krasue cria um Totem Hex que amaldiçoa o gerador mais distante da sua localização, destacando a aura dele em amarelo. Quando um Sobrevivente repara esse gerador por pelo menos 5 segundos, seu Raio de Terror de 32 metros é transferido para o gerador e você ganha o efeito Indetectável por 20/25/30 segundos. Se o gerador amaldiçoado for concluído, a maldição passa para o próximo gerador mais distante, persistindo enquanto o Totem da Maldição estiver de pé.",
  "Cut Loose":
    "Suprime a notificação de ruído alto e os efeitos sonoros de saltos rápidos por 4/5/6 segundos após realizar um salto rápido durante uma perseguição.",
  "Rapid Recovery":
    "Sua barra de recuperação no estado agonizante aumenta 15% mais rápido quando o Assassino está fora de um raio de 24 metros.",
  "Sharp Eye":
    "Aumenta a distância de leitura de aura de todas as suas perks em 4 metros.",
  "We See You":
    "Revela a aura do Assassino para todos os Sobreviventes por um tempo determinado após você acumular 4 fichas, que são ganhas sempre que o Assassino revela a sua aura.",
  "Teamwork Soft Spoken":
    "Aumenta a velocidade de reparo em 5% e reduz o ruído do gerador em 15/20/25% para cada colega que estiver reparando o mesmo gerador que você.",
  "Teamwork Full Circuit":
    "Aumenta a velocidade de reparo em 5% e expande a zona de teste de habilidade positiva em 15/20/25% para cada colega ao reparar um gerador em conjunto.",
  "Were Gonna Live Forever":
    "Aumenta a velocidade de cura em +100% ao curar sobreviventes moribundos e concede o efeito Resistência por 6/8/10 segundos a quem você levantar.",
  "Bada Bada Boom":
    "Instala uma armadilha em uma janela que, ao ser saltada pelo Assassino, aplica uma penalidade de -50% de Impedimento por 6 segundos.",
  "Teamwork Throw Down":
    "Concede o efeito de status Resistência a todos os sobreviventes feridos em um raio de 24 metros por 6/8/10 segundos sempre que você cegar ou atordoar o Assassino com uma paleta.",
  "Under the Radar":
    "Enquanto estiver agachado e parado por 3 segundos, sua aura não pode ser lida pelo Assassino.",
  "Valiant Rescue":
    "Após tirar alguém do gancho com sucesso, você ganha 5% de Celeridade por 10 segundos.",
  Haywire:
    "Esta vantagem exclusiva do Animatrônico é ativada sempre que um Sobrevivente interrompe a abertura de um Portão de Saída que já possua pelo menos 80% de progresso. Quando isso ocorre, o portão começa a regredir a uma taxa de 80/90/100% da velocidade normal de abertura. Além disso, enquanto o progresso diminui, os Sobreviventes podem ver as luzes no topo do interruptor piscando de forma aleatória.",
  "Forever Entwined":
    "Esta vantagem única do Ghoul concede uma ficha sempre que um Sobrevivente sofre dano, acumulando até um máximo de 6/7/8 fichas. Cada ficha aumenta em +4% a velocidade das suas ações de soltar, pendurar e pegar um Sobrevivente, permitindo atingir um bónus total de até 24/28/32%.",
  "All Shaking Thunder":
    "Esta vantagem única do Mestre dos Cães é ativada por 8/12/16 segundos logo após você cair de uma altura. Enquanto estiver ativa, ela aumenta o alcance do seu Ataque de Estocada em +75%. A habilidade possui um tempo de recarga curto de apenas 5 segundos após o uso.",
  "Dragons Grip":
    "Aplica o efeito Exposto por 60 segundos e revela a localização por 4 segundos do primeiro Sobrevivente que interagir com um gerador que você danificou anteriormente.",
  "Cruel Confinement":
    "Bloqueia todos os locais de salto (janelas) do mapa para todos os Sobreviventes por 20/25/30 segundos sempre que um gerador for concluído.",
  "B B Q And Chili":
    "Revela a aura de todos os Sobreviventes que estiverem a mais de 60/50/40 metros de distância de um gancho por 5 segundos, sempre que um Sobrevivente for pendurado nele.",
  "Deja Vu":
    "Revela permanentemente as auras dos 3 geradores mais próximos entre si e aumenta a velocidade de reparo nesses geradores em 4/5/6%.",
  "Help Wanted":
    "Esta vantagem faz com que, ao danificar um gerador, ele se torne um Gerador Comprometido. Quando os Sobreviventes terminam de reparar esse gerador, você ganha um bônus de +25% na velocidade de recuperação de ataques básicos que acertarem o alvo, com o efeito durando por 40/50/60 segundos.",
  "Shoulder The Burden":
    "Troca um estado de gancho com outro sobrevivente ao desenganchá-lo, fazendo você gritar e sofrer o efeito de status Exposição por 60/50/40 segundos.",
  "Rapid Response":
    "Revela a aura do Assassino por 2 segundos sempre que você fica exausto e permite ativar voluntariamente o efeito de status Exaustão ao realizar uma saída apressada de um armário.",
  "Invocation Treacherous Crows":
    "Revela a aura do Assassino para todos os Sobreviventes sempre que ele assusta um corvo dentro do Raio de Terror, após concluir um ritual de 60 segundos no porão que te deixa ferido e com o efeito Quebrado.",
  "Extrasensory Perception":
    "Revela as auras de Sobreviventes, do Assassino e de diversos objetos em um raio de 44 metros, concedendo também os efeitos Elusivo e Alheio após agachar-se por 4 segundos.",
  "Duty Of Care":
    "Concede +25% de Aceleração por 4/5/6 segundos a todos os outros Sobreviventes em um raio de 12 metros sempre que você sofrer um Golpe de Proteção enquanto estiver saudável.",
  "Do No Harm":
    "Aumenta a velocidade de cura e o bônus de progresso em testes de perícia ótimos ao curar outros Sobreviventes, com base no número de estágios de gancho que eles já acumularam.",
  "Well Make It":
    "Aumenta a velocidade de Cura Altruísta em +100% por 30/60/90 segundos logo após você desenganchar outro Sobrevivente.",
  "Turn Back The Clock":
    "Após você pendurar um Sobrevivente, a habilidade fique ativa por um período de 40/50/60 segundos. Durante esse tempo, ao pressionar o botão de Habilidade Ativa perto de um gerador (dentro de 20 metros), ele explodirá imediatamente, perdendo 10% de progresso e iniciando o processo de regressão.",
  "No Holds Barred":
    "Esta vantagem geral para Assassinos faz com que, toda vez que um gerador é concluído, a Entidade bloqueie o gerador que tiver o maior progresso atual por 15/20/25 segundos. Durante esse período, a aura do gerador bloqueado fica destacada em branco para você.",
  Thatanophobia:
    "Esta vantagem única da Enfermeira aplica uma penalidade cumulativa de 1/1,5/2% na velocidade de reparar, sabotar e limpar para cada sobrevivente que esteja ferido, moribundo ou pendurado em um gancho, podendo chegar a um máximo de 4/6/8%. Além disso, se todos os 4 sobreviventes estiverem simultaneamente em algum desses estados negativos, a penalidade total de velocidade de ação recebe um bônus adicional de mais 12%.",
  "Machine Learning":
    "Esta vantagem faz com que, ao danificar um gerador, ele se torne um Gerador Comprometido, destacando a aura dele em amarelo para você. Se você chutar outro gerador, o estado de comprometimento é transferido para o novo alvo. Assim que um Sobrevivente concluir o reparo desse gerador específico, você ganha os efeitos de status Indetectável e um bônus de +10% de Aceleração por uma duração de 35/40/45 segundos, sendo a habilidade desativada logo após o uso.",
  "Scourge Hook Gift Of Pain":
    "Esta vantagem transforma 4 ganchos aleatórios em Ganchos da Praga, que têm suas auras reveladas em branco para você no início da partida. Quando um Sobrevivente é desenganchado de um desses ganchos, ele sofre imediatamente os efeitos de status Hemorragia e Mutilado até que seja curado. Além disso, assim que a cura for concluída, o Sobrevivente recebe uma penalidade de 7/8/9% na velocidade das ações de cura e reparo, efeito que persiste até que ele seja ferido novamente.",
  "Hangmans Trick":
    "Revela a aura de todos os Sobreviventes que estiverem a 8/10/12 metros de um Gancho da Praga sempre que estiveres a carregar um Sobrevivente no ombro.",
  "Generator Overcharge":
    "Aplica uma sobretaxa ao danificar um gerador, forçando o próximo Sobrevivente que interagir com ele a enfrentar um Teste de Perícia difícil que causa regressão instantânea de 2/3/4% em caso de falha. Além disso, aumenta a velocidade de regressão do gerador de 85% para 130% pelos próximos 30 segundos.",
  "Franklins Loss":
    "Faz com que os seus ataques básicos derrubem os itens dos Sobreviventes, que perdem cargas lentamente e têm as suas auras reveladas num raio de 32 metros.",
  "Clean Break":
    "Impede que você seja curado por outros sobreviventes, mas permite que você se recupere sozinho do estado ferido para o estado saudável após um tempo determinado.",
  "Change Of Plan":
    "Gasta uma ficha dentro de um armário para transformar uma Caixa de Ferramentas esgotada em um Kit Médico da mesma raridade com cargas que duram 80/90/100 segundos.",
  "Teamwork Toughen Up":
    "Suprime seus grunhidos de dor, poças de sangue e marcas de arranhão por 20/25/30 segundos sempre que outro Sobrevivente próximo a você cegar ou atordoar o Assassino.",
  "Road Life":
    "Ao reparar um gerador enquanto estiver ferida, você acumula pontos de progressão para cada Ótimo Teste de Perícia (Great Skill Check) bem-sucedido. Após atingir o acúmulo máximo de pontos, você pode usá-los para se curar instantaneamente em um estado de saúde. Note que falhar em um Teste de Perícia faz com que você perca vários pontos acumulados.",
  "One Two Three Four":
    "Inicia uma Performance de até 15 segundos ao pressionar o botão de habilidade ativa enquanto estiver parado, fortalecendo Sobreviventes em um raio de 16 metros.",
  "Last Stand":
    "Atordoa o Assassino por 3 segundos ao realizar um salto rápido após carregar o efeito permanecendo no Raio de Terror por um tempo determinado sem ser perseguido.",
  "Ghost Notes":
    "Enquanto você estiver com Exaustão, faz suas marcas de arranhões desaparecerem mais rápido e aumenta a velocidade de recuperação desse efeito, sem causar Exaustão por si só.",
  Conviction:
    "Após curar outro sobrevivente, permite se recuperar totalmente do estado moribundo uma vez, aplicando Quebrado em si e fazendo você retornar automaticamente ao estado de morte após alguns segundos.",
  "Apocalyptic Ingenuity":
    "Revela auras de paletes quebrados próximos e, após vasculhar 2 baús, permite reconstruir um palete quebrado como palete frágil, que se quebra instantaneamente ao cair.",
  "Plunderers Instinct":
    "Instinto de Saqueador é uma vantagem que revela as auras de baús, itens e sobreviventes dentro de 32/48/64 metros e aumenta em 50% as chances de encontrar itens de maior raridade nos baús.",
  "Mirrored Illusion":
    "Ilusão de Espelhamento é uma que, após reparar 20% dos geradores, permite criar uma ilusão estática próxima a um Baú, Portão de Saída, Gerador ou Totem, que dura 40/50/60 segundos.",
  "Detectives Hunch":
    "Palpite do Detetive é uma  habilidade que, sempre que um gerador é concluído, revela por 20 segundos as auras de baús, geradores e totens em até 32/48/64 metros da sua posição.",

  // === ITENS DE SURV ===
  Flashlight:
    "Uma lanterna padrão. Pode ser usada para cegar o Assassino se mirada nos olhos, fazendo-o largar um Sobrevivente.",
  Medkit:
    "Uma caixa de primeiros socorros. Permite que você se cure sem precisar de outro Sobrevivente.",
  Toolbox:
    "Uma caixa de ferramentas. Aumenta a velocidade de reparo de geradores e permite sabotar ganchos.",
  Map: "Um mapa que rastreia auras de objetivos que você já encontrou.",
  Key: "Uma chave que pode ser consumida para abrir a escotilha se ela tiver surgido.",

  // === ADD-ONS DE LANTERNA ===
  battery: "Adiciona 2 segundos de uso à lanterna.",
  "heavy Duty Battery": "Adiciona 4 segundos de uso à lanterna.",
  "long Life Battery": "Adiciona 6 segundos de uso à lanterna.",
  "focus Lens": "Aumenta ligeiramente o alcance do feixe da lanterna.",
  "wide Lens": "Alarga consideravelmente o feixe da lanterna.",
  "high- End Sapphire Lens":
    "Aumenta moderadamente o alcance e a potência do feixe.",
  "intense Halogen":
    "Aumenta consideravelmente o brilho e a duração da cegueira causada.",
  "odd Bulb":
    "Aumenta tremendamente o consumo de bateria, mas aumenta muito o brilho.",
  "tir Optic":
    "Aumenta moderadamente o brilho do feixe e a duração da cegueira.",
  "Rubber Grip": "Aumenta a precisão da lanterna.",
  "leather Grip": "Suprime tremores ao mirar com a lanterna.",
  "power Bulb":
    "Aumenta o brilho do feixe de luz em 20%  e a duração da cegueira em 10%",
  "low Amp Filament": "Reduz a taxa de esgotamento da bateria em 24%",
  "leather Grip": "Aumenta a precisão da mira em 20%",
  "rubber Grip": "Aumenta a precisão da mira em 40%",

  // === ADD-ONS DE MEDKIT ===
  "abdominal Dressing": "Aumenta a velocidade de cura em 15%.",
  bandages: "Adiciona 8 cargas ao Kit Médico.",
  "butterfly Tape": "Aumenta a velocidade de cura em 5%.",
  "gel Dressings": "Adiciona 16 cargas ao Kit Médico.",
  "self Adherent Wrap":
    "Aumenta a velocidade de cura em 5% e aumenta a velocidade de progressão do item em 5%.",
  sponge: "Aumenta o tamanho da zona de sucesso dos Testes de Perícia em 20%.",
  "styptic Agent":
    "Pressione o botão de Ação Secundária enquanto cura para usar o Agente Hemoestático. O Sobrevivente ganha o efeito de status Resistência por 8 segundos. Consome o Kit Médico.",
  "surgical Suture":
    "Aumenta a chance de acionar um Teste de Perícia em 10% e aumenta a progressão de bônus por acerto em Teste de Perícia Ótimo em 10%.",
  syringe:
    "Pressione o botão de Ação Secundária enquanto cura para consumir o Kit. O Sobrevivente irá se curar da exaustão que estiver aplicada como status ao mesmo.",
  scissors: "Aumenta a velocidade de cura em 15%.",
  "gause Roll": "Adiciona 12 cargas ao Kit Médico.",
  gloves:
    "Aumenta a progressão de bônus por acerto em Teste de Perícia Ótimo em 10%.",
  "need And Thread":
    "Aumenta a chance de acionar um Teste de Perícia e o bônus por acerto Ótimo. Concede 100% de Pontos de Sangue bônus em testes ótimos.",

  // === ADD-ONS DE CAIXA DE FERRAMENTAS ===
  "brand New Part":
    "Peça Novinha. Ao instalar, substitui o reparo por Testes de Perícia difíceis. Concede até 15% de progresso no gerador. Consome a caixa.",
  "clean Rag": "Aumenta a velocidade de reparo da Caixa de Ferramentas em 20%.",
  "cutting Wire":
    "Aumenta a velocidade de sabotagem da Caixa de Ferramentas em 15%.",
  "grip Wrench":
    "Aumenta a velocidade de sabotagem da Caixa de Ferramentas em 20%.",
  instructions:
    "Elimina os Testes de Perícia durante o reparo com a Caixa de Ferramentas. Aumenta a eficiência, mas não dá bônus de velocidade.",
  "metal Saw":
    "Aumenta a velocidade de sabotagem da Caixa de Ferramentas em 25%.",
  "protective Gloves":
    "Impede que o Assassino receba notificação de explosão ao sabotar um gancho.",
  scraps: "Adiciona 8 cargas à Caixa de Ferramentas.",
  "socket Swivels":
    "Aumenta a velocidade de reparo da Caixa de Ferramentas em 30%.",
  "spool Of Wire": "Adiciona 12 cargas à Caixa de Ferramentas.",
  "spring Clamp":
    "Suprime o som de reparo do gerador enquanto usa a Caixa de Ferramentas. Reduz a distância que o som é ouvido.",

  // === ADD-ONS DE MAPA ===
  "black Silk Cord": "Desbloqueia a capacidade de rastrear a Escotilha.",
  "crystal Bead":
    "Todos os Sobreviventes veem a aura gerada pelo Mapa quando você o usa.",
  "glass Bead":
    "Pressione o botão de Ação Secundária para criar um marcador de luz que pode ser visto por todos os Sobreviventes.",
  "map Addendum": "Adiciona 5 segundos de uso ao Mapa.",
  "odd Stamp": "Aumenta o alcance de rastreamento do Mapa em 12 metros.",
  "red Twine":
    "Desbloqueia a capacidade de rastrear Pertences do Assassino (armadilhas, totens, etc).",
  "retardant Jelly": "Reduz a taxa de queima do Mapa em 20%.",
  "unusual Stamp": "Aumenta o alcance de rastreamento do Mapa em 8 metros.",
  "yellow Wire": "Desbloqueia a capacidade de rastrear Portões de Saída.",

  // === ADD-ONS DE KEY ===
  "eroded Token": "Aumenta o alcance de leitura de aura da Chave em 24 metros.",
  "gold Token": "Aumenta o alcance de leitura de aura da Chave em 48 metros.",
  "prayer Beads": "Adiciona 15 segundos de uso à Chave.",
  "prayer Rope": "Adiciona 10 segundos de uso à Chave.",
  "scratched Pearl":
    "Aumenta o alcance de leitura de aura da Chave em 12 metros.",
  "blood Amber":
    "Permite ver a aura do Assassino ao custo de um consumo muito maior da Chave.",
  "milky Glass":
    "Protege a Chave da perda ao abrir a escotilha (consome este add-on em vez da chave).",
  "unique Wedding Ring":
    "Revela a aura da Obsessão o tempo todo. Reduz a chance de você ser a Obsessão.",
  "weaved Ring":
    "Você não perde a Chave se morrer na partida (consome este add-on em vez da chave).",

  // === ADD-ONS DA ARTISTA ===
  automaticdrawing:
    "Automatic Drawing. Reduz o tempo de recarga dos Corvos em 1.5s.",
  charcoalstick: "Charcoal Stick. Aumenta a duração da aura do Corvo em 0.5s.",
  choclocorn:
    "Choclo Corn. Aumenta a duração que os Corvos permanecem ociosos.",
  darkestink: "Darkest Ink. Reduz o tempo de recarga dos Corvos.",
  festeringcarrion: "Festering Carrion. Reduz o tempo de recarga dos Corvos.",
  gardenofrot:
    "Garden of Rot. Ao repelir Corvos, o Sobrevivente sofre Exaustão.",
  inkegg: "Ink Egg. Aumenta o número máximo de Corvos em 1.",
  iridescentfeather:
    "Iridescent Feather. Concede o status Indetectável enquanto Corvos estiverem em recarga.",
  matiasbabyshoes:
    "Matias' Baby Shoes. Mostra a aura de Sobreviventes próximos a Corvos ociosos.",
  ogriefolover:
    "O Grief, O Lover. Sobreviventes atingidos por Corvos sofrem de Cegueira.",
  oilpaints: "Oil Paints. Aumenta a velocidade de Killer Instinct dos Corvos.",
  severedhands:
    "Severed Hands. Qualquer Sobrevivente perto de outro que for atingido por Corvos também é atingido.",
  severedtongue:
    "Severed Tongue. Reduz a velocidade do Sobrevivente enquanto ele repele os Corvos.",
  silverbell:
    "Silver Bell. Sobreviventes sofrem do status Inconsciente ao repelir Corvos.",
  stilllifecrow:
    "Still Life Crow. Aumenta a duração que os Corvos permanecem ociosos.",
  thicktar: "Thick Tar. Aumenta o tempo necessário para repelir Corvos.",
  thornynest:
    "Thorny Nest. Sobreviventes atingidos por Corvos sofrem de Hemorragia e Destroçados.",
  untitledagony:
    "Untitled Agony. Sobreviventes atingidos por Corvos sofrem de Lentidão.",
  velvetfabric: "Velvet Fabric. A aura do rastro do Corvo muda de cor.",
  vibrantobituary: "Vibrant Obituary. Aumenta a duração do Killer Instinct.",

  // === ADD-ONS DO BLIGHT (Flagelo) - ATUALIZADO ===
  adrenalinevial:
    "Adrenaline Vial. Aumenta o máximo de fichas de Arremetida em 2, a velocidade em 5% e o ângulo de visão em 20°. Reduz a taxa de curva em 0.5°/s.",
  alchemistsring:
    "Alchemist's Ring. Aumenta a duração da Arremetida em 20% para cada Arremetida Letal consecutiva.",
  blightedcrow:
    "Blighted Crow. Aumenta a velocidade de movimento durante uma Arremetida em 3% acumulável para cada Arremetida Letal consecutiva.",
  blightedrat:
    "Blighted Rat. Aumenta a velocidade de movimento durante uma Arremetida em 2% acumulável para cada Arremetida Letal consecutiva.",
  cankerthorn:
    "Canker Thorn. Reduz a duração da Fadiga após uma Arremetida em 0.5 segundos.",
  chippedmonocle:
    "Chipped Monocle. Exibe a localização alvo de uma Colisão enquanto carrega a Arremetida.",
  compoundseven:
    "Compound Seven. Faz você virar automaticamente para o Sobrevivente mais próximo num raio de 16 metros após uma Colisão.",
  compoundthirtythree:
    "Compound Thirty-Three. Aumenta a taxa de curva e a duração da Arremetida em 11%. A Corrupção do Flagelo é limitada a 5 fichas.",
  compoundtwentyone:
    "Compound Twenty-One. Revela a aura de Sobreviventes num raio de 8 metros de uma Colisão por 3.5 segundos.",
  foxglove:
    "Foxglove. Reduz a duração da Fadiga após uma Arremetida em 0.25 segundos.",
  iridescentblighttag:
    "Iridescent Blight Tag. Aumenta a velocidade da Arremetida em 10% e o ângulo de visão em 20°. A Corrupção do Flagelo é limitada a 3 fichas.",
  placebotablet:
    "Placebo Tablet. Reduz a velocidade de movimento da Arremetida em 15%. Concede 100% de Pontos de Sangue bônus em eventos de Arremetida.",
  plaguebile:
    "Plague Bile. Aumenta a taxa de curva durante uma Arremetida em 10%.",
  pustuladust:
    "Pustula Dust. Aumenta a janela de oportunidade para realizar uma Arremetida em Cadeia em 0.75 segundos.",
  rosetonic:
    "Rose Tonic. Aumenta a janela de oportunidade para realizar uma Arremetida em Cadeia em 1 segundo.",
  shreddednotes:
    "Shredded Notes. Reduz o tempo de recarga por ficha de poder em 0.33 segundos.",
  soulchemical:
    "Soul Chemical. Aumenta a velocidade inicial de movimento da Arremetida em 5%.",
  summoningstone:
    "Summoning Stone. Aumenta a duração inicial da Arremetida em 0.5 segundos.",
  umbrasalts:
    "Umbra Salts. Aumenta a taxa de curva durante uma Arremetida em 15%.",
  vigosjournal:
    "Vigo's Journal. Concede o efeito de status Indetectável enquanto estiver realizando uma Arremetida.",

  // === ADD-ONS DO CHUCKY (O Cara Legal) ===
  automaticscrewdriver:
    "Automatic Screwdriver. Reduz o tempo de recarga do Modo Hidey-Ho em 8% após errar um ataque Slice & Dice.",
  dolleyes:
    "Doll Eyes. Quando em Modo Hidey-Ho, as auras de todas as Janelas e Paletes derrubados são reveladas a você num raio de 20 metros.",
  electriccarvingknife:
    "Electric Carving Knife. Reduz o tempo de recarga de ataques Slice & Dice errados para 95% da duração padrão.",
  goodguybox:
    "Good Guy Box. Reduz o tempo de recarga de ataques Slice & Dice bem-sucedidos para 93% da duração padrão.",
  hairspraycandle:
    "Hair Spray & Candle. Reduz a penalidade da barra de poder de Ataques Básicos durante o Modo Hidey-Ho em 20%.",
  hardhat:
    "Hard Hat. Quebra instantaneamente Paletes ao realizar um Scamper (passar por baixo) neles.",
  iridescentamulet:
    "Iridescent Amulet. Aumenta a duração do Modo Hidey-Ho em 50%, mas Ataques Básicos encerram o modo imediatamente.",
  jumprope:
    "Jump Rope. Aumenta a duração do Slice & Dice para 108% da duração padrão.",
  mirrorshards:
    "Mirror Shards. Permite ver os Passos Ilusórios perto dos Sobreviventes.",
  pileofnails:
    "Pile of Nails. Concede o status Indetectável por 3 segundos após encerrar manualmente o Modo Hidey-Ho.",
  plasticbag:
    "Plastic Bag. Sobreviventes que andam através de um Passo Ilusório sofrem de Exaustão por 15 segundos.",
  portabletv:
    "Portable TV. Aumenta a duração do Slice & Dice para 170% quando os Portões de Saída são energizados.",
  powerdrill:
    "Power Drill. Reduz o tempo de recarga do Modo Hidey-Ho em 10% após um ataque Slice & Dice bem-sucedido.",
  ratpoison:
    "Rat Poison. Enquanto realiza um Slice & Dice, as auras de todos os Sobreviventes num raio de 12 metros são reveladas por 5 segundos.",
  runningshoes:
    "Running Shoes. Realizar um Scamper concede 2% de Celeridade por 5 segundos.",
  silkpillow:
    "Silk Pillow. Reduz permanentemente seu Raio de Terror em 6 metros, mas aumenta o tempo de carga do Slice & Dice em 50%.",
  straightrazor:
    "Straight Razor. Sobreviventes atingidos por Slice & Dice sofrem de Hemorragia e Dilaceração por 80 segundos.",
  strobinglight:
    "Strobing Light. Reduz seu Raio de Terror em 8 metros quando o Modo Hidey-Ho está em recarga.",
  tinyscalpel:
    "Tiny Scalpel. Quando em Modo Hidey-Ho, as Poças de Sangue aparecem em vermelho brilhante.",
  yardstick:
    "Yardstick. Realizar um Scamper revela a aura de todos os Sobreviventes num raio de 16 metros por 3 segundos.",

  // === ADD-ONS DO CLOWN (O Palhaço) ===
  bottleofchloroform:
    "Bottle of Chloroform. Aumenta o tamanho e a propagação das nuvens de gás de Intoxicação em 20%.",
  cheapginbottle:
    "Cheap Gin Bottle. Aumenta a força do efeito de Celeridade do Revigoramento em 3% extra.",
  cigarbox:
    "Cigar Box. Revela a aura de outros jogadores num raio de 16m enquanto você estiver sob efeito do Revigoramento.",
  ether15vol:
    "Ether 15 Vol%. Aumenta a duração da Intoxicação do sobrevivente em 1 segundo.",
  fingerlessparadegloves:
    "Fingerless Parade Gloves. Aumenta a velocidade de arremesso da garrafa em 25% e reduz o ângulo em 15°.",
  flaskofbleach:
    "Flask of Bleach. Aumenta a penalidade de Lentidão da Intoxicação em 4% adicionais.",
  garishmakeupkit:
    "Garish Make-Up Kit. Aumenta a duração do efeito de Revigoramento em 2 segundos.",
  kerosenecan:
    "Kerosene Can. Sobreviventes intoxicados sofrem do status Cegueira por 30 segundos.",
  partybottle:
    "Party Bottle. Garrafas emitem confete ao quebrar. Acertar sobreviventes diretamente concede 100% de pontos de sangue extras na categoria Deviousness.",
  redheadspinkiefinger:
    "Redhead's Pinkie Finger. Acertar um sobrevivente diretamente com a garrafa aplica o status Exposto enquanto ele estiver intoxicado. Reduz o limite de garrafas em 1.",
  robinfeather:
    "Robin Feather. Reduz o tempo de recarga entre arremessos em 40%.",
  smellyinnersoles:
    "Smelly Inner Soles. Aumenta a velocidade de movimento enquanto recarrega garrafas em 66%.",
  solventjug:
    "Solvent Jug. Aumenta a duração do efeito de Revigoramento em 1 segundo.",
  spiritofhartshorn:
    "Spirit of Hartshorn. Aumenta o tamanho e a propagação das nuvens de gás de Revigoramento em 20%.",
  starlingfeather:
    "Starling Feather. Reduz o tempo de recarga entre arremessos em 50%.",
  stickysodabottle:
    "Sticky Soda Bottle. Aumenta a força do efeito de Celeridade do Revigoramento em 2% extra.",
  sulphuricacidvial:
    "Sulphuric Acid Vial. Sobreviventes intoxicados sofrem do status Dilacerado por 70 segundos.",
  tattoosmiddlefinger:
    "Tattoo's Middle Finger. Revela a aura de sobreviventes intoxicados ou revigorados por 6 segundos.",
  thickcorkstopper:
    "Thick Cork Stopper. Reduz o tempo de recarga das garrafas em 0.5 segundos.",
  vhsporn:
    "VHS Porn. Inverte as cores das nuvens de gás (Tônico fica amarelo, Antídoto fica roxo).",

  // === ADD-ONS DO DEATHSLINGER (O Mercenário) ===
  barbedwire:
    "Barbed Wire. Aumenta o tempo necessário para se curar da Ferida Profunda em 3.5 segundos.",
  bayshorescigar:
    "Bayshore's Cigar. Reduz a duração do atordoamento quando Sobreviventes se libertam da corrente em 0.75 segundos.",
  bayshoresgoldtooth:
    "Bayshore's Gold Tooth. Aumenta a velocidade de puxar o arpão em 5%.",
  chewingtobacco:
    "Chewing Tobacco. Reduz a duração do atordoamento quando Sobreviventes se libertam da corrente em 0.25 segundos.",
  goldcreekwhiskey:
    "Gold Creek Whiskey. Reduz seu Raio de Terror em 8 metros enquanto estiver mirando.",
  hellshireiron:
    "Hellshire Iron. Concede o status Indetectável enquanto um Sobrevivente estiver arpoado. O efeito persiste por 10s após o arpão soltar.",
  honeylocustthorn:
    "Honey Locust Thorn. Sobreviventes que se libertam da corrente sofrem do status Dilacerado por 70 segundos.",
  iridescentcoin:
    "Iridescent Coin. Sobreviventes ficam Expostos enquanto arpoados, se atingidos a pelo menos 12 metros de distância.",
  jawsmasher:
    "Jaw Smasher. Aumenta sua velocidade de movimento em 1.5% enquanto estiver mirando.",
  marshalsbadge:
    "Marshal's Badge. Reduz seu Raio de Terror em 4 metros enquanto estiver mirando.",
  modifiedammobelt:
    "Modified Ammo Belt. Reduz o tempo de recarga da arma em 0.25 segundos.",
  poisonoakleaves:
    "Poison Oak Leaves. Aumenta o tempo necessário para se curar da Ferida Profunda em 1.5 segundos.",
  prisonchain:
    "Prison Chain. Aumenta o tempo necessário para o Sobrevivente quebrar a corrente em 10%.",
  ricketychain:
    "Rickety Chain. Concede 50% mais Pontos de Sangue em eventos de Arpão. Aumenta a velocidade que Sobreviventes quebram a corrente em 33%.",
  rustedspike:
    "Rusted Spike. Sobreviventes arpoados atingidos sofrem do status Dilacerado por 60 segundos.",
  snakeoil: "Snake Oil. Aumenta a velocidade de puxar o arpão em 2.5%.",
  spitpolishrag:
    "Spit Polish Rag. Reduz o tempo de recarga de tiros errados em 0.25 segundos.",
  tinoilcan:
    "Tin Oil Can. Reduz o tempo de recarga de tiros errados em 0.5 segundos.",
  wantedposter:
    "Wanted Poster. Aumenta sua velocidade de movimento em 3% enquanto estiver mirando.",
  wardenskeys:
    "Warden's Keys. Reduz o tempo de recarga da arma em 0.35 segundos.",

  // === ADD-ONS DO DEMOGORGON ===
  barbsglasses:
    "Barb's Glasses. Reduz o tempo de recarga de ataques Despedaçar bem-sucedidos em Paletes ou Paredes Quebráveis em 10%.",
  blackheart:
    "Black Heart. Reduz o tempo de recarga de ataques Despedaçar bem-sucedidos em Sobreviventes em 10%.",
  brasscaselighter:
    "Brass Case Lighter. Sobreviventes sofrem de Cegueira enquanto fecham Portais e por mais 60 segundos.",
  deerlung:
    "Deer Lung. Aumenta a velocidade de teleporte pelo Mundo Invertido em 30%, mas reduz o número de Portais em 2.",
  elevenssoda:
    "Eleven's Soda. Revela a aura de geradores sendo reparados em amarelo enquanto você viaja pelo Mundo Invertido.",
  leproselichen:
    "Leprose Lichen. Revela a aura de todos os Sobreviventes enquanto viaja pelo Mundo Invertido. O efeito persiste por 3s após sair se o sobrevivente estiver perto de um portal ativo.",
  lifeguardwhistle:
    "Lifeguard Whistle. Aumenta o número de Portais disponíveis em 2.",
  mewsguts:
    "Mew's Guts. Reduz o tempo de recarga de ataques Despedaçar errados em 11% e aumenta o número de Portais em 1.",
  ratliver:
    "Rat Liver. Aumenta sua velocidade de movimento enquanto carrega o ataque Do Abismo em 3.5%.",
  rattail: "Rat Tail. Aumenta a velocidade de abertura de Portais em 50%.",
  redmoss:
    "Red Moss. Aumenta a duração do Indetectável ao sair de um portal em 8s e suprime o som, mas o teleporte é 15% mais lento.",
  rottengreentripe:
    "Rotten Green Tripe. Aumenta a velocidade de teleporte pelo Mundo Invertido em 15%.",
  rottenpumpkin:
    "Rotten Pumpkin. Ao teleportar, o Portal de origem é destruído e você ganha 200 Pontos de Sangue adicionais.",
  stickylining:
    "Sticky Lining. Aumenta o raio de detecção dos Portais ativos em 2.5 metros.",
  thornyvines:
    "Thorny Vines. Aumenta o raio de detecção dos Portais em 1 metro e aumenta o tempo para os Sobreviventes fecharem portais em 8%.",
  unknownegg:
    "Unknown Egg. Reduz o tempo de recuperação do poder Do Abismo em 2.5 segundos.",
  upsidedownresin:
    "Upside Down Resin. Aumenta o tempo necessário para os Sobreviventes fecharem Portais em 20%.",
  vermilionwebcap:
    "Vermilion Webcap. Aumenta a duração do efeito Indetectável após sair de um Portal em 3 segundos.",
  violetwaxcap:
    "Violet Waxcap. Aumenta a duração do efeito Indetectável após sair de um Portal em 1 segundo.",
  viscouswebbing:
    "Viscous Webbing. Aumenta o tempo necessário para os Sobreviventes fecharem Portais em 10%.",

  // === ADD-ONS DO DOCTOR (O Médico) ===
  calmcartersnotes:
    '"Calm" - Carter\'s Notes. Aumenta seu Raio de Terror em 8 metros quando a Explosão Estática está pronta e reduz em 8 metros quando está em recarga.',
  calmclassi:
    '"Calm" - Class I. Aumenta seu Raio de Terror em 4 metros quando a Explosão Estática está pronta e reduz em 4 metros quando está em recarga.',
  calmclassii:
    '"Calm" - Class II. Aumenta seu Raio de Terror em 6 metros quando a Explosão Estática está pronta e reduz em 6 metros quando está em recarga.',
  disciplinecartersnotes:
    '"Discipline" - Carter\'s Notes. Reduz o atraso da detonação da Terapia de Choque em 0.2s. Na Loucura II, Sobreviventes veem a Mancha Vermelha atrás deles durante a perseguição.',
  disciplineclassii:
    '"Discipline" - Class II. Reduz o atraso da detonação da Terapia de Choque em 0.1s. Na Loucura II, Sobreviventes veem a Mancha Vermelha atrás deles durante a perseguição.',
  disciplineclassiii:
    '"Discipline" - Class III. Reduz o atraso da detonação da Terapia de Choque em 0.15s. Na Loucura II, Sobreviventes veem a Mancha Vermelha atrás deles durante a perseguição.',
  highstimuluselectrode:
    "High Stimulus Electrode. Aumenta o alcance do ataque de Terapia de Choque em 4 metros.",
  interviewtape:
    "Interview Tape. Transforma a área da Terapia de Choque em um feixe de 2 metros de largura por 24 metros de comprimento.",
  iridescentking:
    "Iridescent King. Sobreviventes sofrem aleatoriamente das aflições de Calm, Discipline, Order e Restraint e Pallets Dropadas são substituídas por Pallets Ilusórias.",
  iridescentqueen:
    "Iridescent Queen. Sobreviventes atingidos por Terapia de Choque ganham Carga Estática. Se ficarem a 4m de outro Sobrevivente, ambos recebem um choque.",
  mapleknight:
    "Maple Knight. Revela a área de efeito do ataque de Terapia de Choque.",
  mouldyelectrode:
    "Mouldy Electrode. Aumenta o alcance do ataque de Terapia de Choque em 2 metros.",
  ordercartersnotes:
    '"Order" - Carter\'s Notes. Reduz o tempo de recarga da Explosão Estática em 3 segundos. Paletes quebradas são substituídas por Paletes Ilusórias.',
  orderclassi:
    '"Order" - Class I. Reduz o tempo de recarga da Explosão Estática em 2 segundos. Paletes quebradas são substituídas por Paletes Ilusórias.',
  orderclassii:
    '"Order" - Class II. Reduz o tempo de recarga da Explosão Estática em 2.5 segundos. Paletes quebradas são substituídas por Paletes Ilusórias.',
  polishedelectrode:
    "Polished Electrode. Aumenta o alcance do ataque de Terapia de Choque em 3 metros.",
  restraintcartersnotes:
    '"Restraint" - Carter\'s Notes. Revela a aura de Sobreviventes por 3 segundos quando o nível de Loucura aumenta. Cria Médicos Ilusórios.',
  restraintclassii:
    '"Restraint" - Class II. Revela a aura de Sobreviventes por 1 segundo quando o nível de Loucura aumenta. Cria Médicos Ilusórios.',
  restraintclassiii:
    '"Restraint" - Class III. Revela a aura de Sobreviventes por 2 segundos quando o nível de Loucura aumenta. Cria Médicos Ilusórios.',
  scrappedtape:
    "Scrapped Tape. Transforma a área da Terapia de Choque em um anel, colocado a 8 metros na frente do Médico.",

  // === ADD-ONS DO DRÁCULA (The Dark Lord) ===
  alucardsshield:
    "Alucard's Shield. Quando um Portão de Saída é aberto, Pilares de Chamas surgem continuamente dentro da área do portão.",
  bloodfilledgoblet:
    "Blood-Filled Goblet. Aumenta a duração dos Orbes de Odor em 60%.",
  cerberustalon:
    "Cerberus Talon. Aumenta a distância de revelação de aura dos Orbes de Odor em 100%.",
  clocktowergear:
    "Clock Tower Gear. Reduz o tempo de recarga da habilidade de Metamorfose em 5%.",
  cubeofzoe:
    "Cube of Zoe. Quando um gerador é concluído, Pilares de Chamas surgem continuamente ao redor do Drácula por 10 segundos.",
  forceofecho:
    "Force of Echo. Aumenta a taxa de aparecimento de Orbes de Odor em 10%.",
  iridescentringofvlad:
    "Iridescent Ring of Vlad. Faz com que os Pilares de Chamas persigam (home-in) os Sobreviventes próximos.",
  killerdoll:
    "Killer Doll. Aumenta o bônus de redução de recarga ao coletar Orbes de Odor em 30%.",
  lapislazuli:
    "Lapis Lazuli. Após teleportar para uma janela, a Entidade a bloqueia para todos os Sobreviventes por 8 segundos.",
  magicalticket:
    "Magical Ticket. Aumenta a velocidade de Teleporte (Forma de Morcego) em 10%.",
  medusashair:
    "Medusa's Hair. Sobreviventes num raio de 8m do destino do seu Teleporte sofrem 8% de Lentidão por 4 segundos.",
  moonstonenecklace:
    "Moonstone Necklace. Reduz seu Raio de Terror em 8 metros (nas Formas de Vampiro e Lobo).",
  pocketwatch:
    "Pocket Watch. Recarrega instantaneamente a habilidade de Teleporte após quebrar uma Palete.",
  rubycirclet:
    "Ruby Circlet. Reduz o tempo de recarga do ataque Fogo do Inferno em 5%.",
  sunglasses:
    "Sunglasses. Aumenta o número de Pilares de Chamas em 1, mas aumenta o tempo de carga do ataque em 25%.",
  sylphfeather:
    "Sylph Feather. Quebrar uma Palete concede 1 Ficha (máx 5). Reduz a recarga do Fogo do Inferno em 5% por ficha (até -25%).",
  travellershat:
    "Traveller's Hat. Reduz o tempo de transição entre as Formas em 5%.",
  wargsfang:
    "Warg's Fang. Na Forma de Lobo, quando o Bote fica disponível, revela a aura de Sobreviventes cujos Orbes você coletou por 5s.",
  whitewolfmedallion:
    "White Wolf Medallion. Aumenta a duração do Instinto Assassino na Forma de Lobo em 1 segundo.",
  wingedboots:
    "Winged Boots. Aumenta o alcance do Teleporte (Forma de Morcego) em 20%.",

  // === ADD-ONS DA DRAGA (The Dredge) ===
  airfreshener:
    "Air Freshener. Aumenta o número de Fichas de Energia disponíveis para 4.",
  boatkey:
    "Boat Key. Aumenta a velocidade de Teletransporte durante o dia em 3 m/s. Aciona todas as fechaduras ativas nos armários romperem assim que os portões de saída são alimentados.",
  brokendoll: "Broken Doll. Aumenta a duração do Anoitecer em 20 segundos.",
  burntletters:
    "Burnt Letters. Aumenta em 25% as cargas adicionadas ao medidor de Anoitecer por ferir Sobreviventes.",
  caffeinetablets:
    "Caffeine Tablets. As Auras de armários trancados ficam destacadas em amarelo enquanto você carrega o Crepúsculo ou se teletransporta.",
  destroyedpillow:
    "Destroyed Pillow. Reduz o tempo de recarga de Crepúsculo em 2.5 segundos durante o Anoitecer.",
  fallenshingle:
    "Fallen Shingle. Aumenta a taxa de carregamento do medidor de Anoitecer em 15% por segundo ao usar Reinado das Trevas.",
  fieldrecorder:
    "Field Recorder. Faz com que o Julgamento comece ao Anoitecer. Faz com que o Anoitecer seja ativado automaticamente assim que o último Gerador está concluído. Os sobreviventes sofrem de Exaustão por 15 segundos após entrar em contato com o Remanescente.",
  followerscowl:
    "Follower's Cowl. Retornar ao Remanescente ativa o Instinto Assassino durante o dia.",
  haddiescalendar:
    "Haddie's Calendar. Reduz o tempo de saída de armários trancados em 0.4 segundos.",
  iridescentwoodenplank:
    "Iridescent Wooden Plank. Os sobreviventes sofrem com a Exposição durante os últimos 12 segundos do Anoitecer.",
  lavaliermicrophone:
    "Lavalier Microphone. As Auras de todos os Sobreviventes são reveladas para você por 3 segundos após consumir o último Token de Poder. Causa todos os armários a uma distância de até 6 metros dos Sobreviventes abrirem e fecharem as portas ao entrar nelas por teletransporte.",
  malthinkersskull:
    "Malthinker's Skull. Aumenta a taxa de carregamento do medidor de Anoitecer em 25% por segundo enquanto os Sobreviventes estiverem feridos.",
  mortarandpestle:
    "Mortar and Pestle. Você emerge do Remanescente virado para a sua direção no momento da Teletransportação, em vez daquela em que você havia colocado o Remanescente.",
  ottomarianwriting:
    "Ottomarian Writing. Reduz o tempo de recarga de Crepúsculo em 2 segundos durante o dia.",
  sacrificialknife:
    "Sacrificial Knife. Bloqueia todos os locais do Cofre num raio de 16 metros do Armário do qual você emerge por 5 segundos.",
  tillingblade:
    "Tilling Blade. Os sobreviventes sofrem de Cegueira, Hemorragia e Dilaceração por 80 segundos após sofrer ferimentos durante o Anoitecer.",
  warhelmet:
    "War Helmet. Aumenta a duração do Instinto Assassino em 1.5 segundos durante o Anoitecer.",
  woodenplank:
    "Wooden Plank. Aumenta em 25% as cargas adicionadas ao medidor de Anoitecer ao pendurar sobreviventes.",
  worrystone:
    "Worry Stone. As Auras de Sobreviventes trancando um Armário são reveladas a você por 6 segundos.",

  // === ADD-ONS DO FREDDY (The Nightmare) ===
  blackbox:
    "Black Box. Bloqueia Portões de Saída abertos por 15 segundos para Sobreviventes que estão no Mundo dos Sonhos.",
  bluedress:
    "Blue Dress. Revela a aura de Sobreviventes que falham em Testes de Perícia por 4 segundos. Aumenta levemente a penalidade de regressão.",
  catblock:
    "Cat Block. Usar a Projeção Onírica ativa o Instinto Assassino por 4 segundos em Sobreviventes num raio de 16m do gerador.",
  classphoto:
    "Class Photo. Todos os geradores jorram sangue durante a Projeção Onírica e a Casca não aparece. Impede o cancelamento da Projeção.",
  gardenrake:
    "Garden Rake. Substitui as Caixas de Sonho por Paletes Oníricas. Começa a partida com 7 Paletes Oníricas.",
  greendress:
    "Green Dress. Revela a aura de Sobreviventes que falham em Testes de Perícia por 3 segundos. Aumenta a penalidade de regressão.",
  jumprope:
    "Jump Rope. Aumenta o volume dos gemidos de dor de Sobreviventes feridos no Mundo dos Sonhos em 50%.",
  kidsdrawing:
    "Kid's Drawing. Reduz a penalidade de velocidade causada pelas Caixas de Sonho em 10%. Concede pontos de sangue extras.",
  nancysmasterpiece:
    "Nancy's Masterpiece. Reduz o tempo de recarga da Projeção Onírica em 3% (até -12%) para cada Sobrevivente dormindo.",
  nancyssketch:
    "Nancy's Sketch. Reduz o tempo de recarga da Projeção Onírica em 2% (até -8%) para cada Sobrevivente dormindo.",
  outdoorrope:
    "Outdoor Rope. Aumenta o alcance audível dos ruídos de reparo dos Sobreviventes no Mundo dos Sonhos em 8 metros.",
  paintthinner:
    "Paint Thinner. Substitui as Caixas de Sonho por Paletes Oníricas. Revela a aura de Sobreviventes que interagem com Paletes Oníricas por 6 segundos.",
  pillbottle:
    "Pill Bottle. Reduz a distância de visibilidade intermitente (12 a 24m) e invisibilidade total (24m) do Freddy para Sobreviventes acordados.",
  prototypeclaws:
    "Prototype Claws. Substitui as Caixas de Sonho por Paletes Oníricas. Revela a aura de Sobreviventes que interagem com Paletes Oníricas por 4 segundos.",
  redpaintbrush:
    "Red Paint Brush. Todos os Sobreviventes começam a partida no Mundo dos Sonhos. Falhar em testes de perícia não acorda os Sobreviventes.",
  sheepblock:
    "Sheep Block. Sobreviventes que interagem com uma Armadilha de Sonho ou Palete sofrem de Cegueira por 60 segundos.",
  swingchains:
    "Swing Chains. Aumenta o volume dos passos de Sobreviventes no Mundo dos Sonhos em 50%.",
  unicornblock:
    "Unicorn Block. Sobreviventes que interagem com uma Armadilha de Sonho ou Palete sofrem de Cegueira por 90 segundos.",
  woolshirt:
    "Wool Shirt. Aumenta a penalidade de regressão por falhar em Testes de Perícia de reparo e cura em 4%.",
  zblock:
    "Z Block. Usar a Projeção Onírica ativa o Instinto Assassino por 6 segundos em Sobreviventes num raio de 16m do gerador.",

  // === ADD-ONS DO GHOST FACE ===
  cheapcologne:
    "Cheap Cologne. Aumenta a duração da Marca nos Sobreviventes em 10 segundos.",
  chewedpen:
    "Chewed Pen. Aumenta o tempo necessário para ser revelado por Sobreviventes no Estado Agonizante para 3 segundos.",
  cinchstraps:
    "Cinch Straps. O Manto da Noite permanece ativo após errar um Ataque Básico.",
  driverslicense:
    "Driver's License. Ao marcar um Sobrevivente reparando, o gerador explode, perde 20% de progresso e é bloqueado por 15 segundos.",
  droplegknifesheath:
    "Drop-Leg Knife Sheath. Concede 10% de Celeridade por 5 segundos após marcar um Sobrevivente.",
  ghostfacecaughtontape:
    "Ghost Face Caught on Tape. Recarrega instantaneamente o Manto da Noite ao derrubar um Sobrevivente com um ataque básico.",
  headlinecutouts:
    "Headline Cut-Outs. Aumenta sua velocidade de movimento enquanto Persegue (Stalking) em 40%.",
  knifebeltclip:
    "Knife Belt Clip. Reduz seu Raio de Terror em 12 metros enquanto estiver agachado.",
  lastingperfume:
    "Lasting Perfume. Aumenta o tempo necessário para ser revelado por Sobreviventes no Gancho para 3 segundos.",
  leatherknifesheath:
    "Leather Knife Sheath. Aumenta sua velocidade de movimento agachado em 10%.",
  markedmap:
    "Marked Map. Aumenta a duração do Instinto Assassino em 2 segundos.",
  nightvisionmonocular:
    "Night Vision Monocular. Sobreviventes que te revelam sofrem de Exaustão por 10 segundos.",
  olsensaddressbook:
    "Olsen's Address Book. As auras de Sobreviventes Marcados realizando ações rápidas são reveladas a você por 5 segundos.",
  olsensjournal:
    "Olsen's Journal. Sobreviventes Marcados sofrem do status Alheio (Oblivious).",
  olsenswallet:
    "Olsen's Wallet. Recarrega instantaneamente o Manto da Noite ao quebrar uma Parede ou Palete.",
  outdoorsecuritycamera:
    "Outdoor Security Camera. Revela a aura de todos os Sobreviventes por 7 segundos ao derrubar um Sobrevivente Marcado.",
  philly: "Philly. Reduz o tempo necessário para marcar Sobreviventes em 20%.",
  telephotolens:
    "Telephoto Lens. Sobreviventes que te revelam sofrem do status Alheio (Oblivious) por 60 segundos.",
  victimsdetailedroutine:
    "Victim's Detailed Routine. Sobreviventes sofrem de Exaustão por 5 segundos após serem marcados.",
  walleyesmatchbook:
    "Walleye's Matchbook. Reduz o tempo de recuperação do Manto da Noite em 6 segundos.",

  // === ADD-ONS DO GHOUL (Kaneki) ===
  amonsnecktie:
    "Gravata de Amon. Ao executar o Salto Médio, as Auras de Paletes e Janelas são reveladas a você em um raio de 32 metros.",
  anteikuapron:
    "Avental Anteiku. Reduz o tempo de deslizamento após o Salto de Kagune em 50%.",
  aogiritreerobe:
    "Manto da Árvore Aogiri. Sempre que um gerador for concluído no Modo Enraivecido, concede o efeito Indetectável por 20 segundos.",
  bloodstainedhandkerchief:
    "Lenço manchado de sangue. Aumenta o alcance máximo dos Saltos Kagune em 1 metro.",
  brokenchain:
    "Corrente quebrada. Reduz o tempo de recarga do Salto Kagune em 1,4 segundos por ficha quando fora do Modo Enfurecido.",
  ccgidcard:
    "Cartão de Identificação CCG. Executar um Salto Kagune revela as Auras de todos os Sobreviventes afetados pela Marca Kagune em um raio de 24 metros por 3 segundos.",
  freshcoffee:
    "Café fresco. Aumenta a velocidade de movimento durante os Saltos de Kagune em 2 m/s.",
  hidesheadphones:
    "Fones de ouvido do Hide. Sobreviventes afetados pela Marca Kagune sofrem com a Inconsciência até que a marca seja removida.",
  hinamisumbrella:
    "O guarda-chuva de Hinami. Aumenta em 10 segundos o tempo adicionado à contagem regressiva para cada ataque de agarramento perfeitamente executado.",
  iridescenteyepatch:
    "Adesivo iridescente para os olhos. Desbloqueia o potencial no terceiro Salto de Kagune consecutivo enquanto estiver no Modo Enraivecido: se usado para saltar sobre uma palete caída, ele a quebra instantaneamente.",
  kanekissatchel:
    "Mochila do Kaneki. Aumenta a velocidade de movimento do terceiro Salto Kagune consecutivo em 4,2 m/s.",
  kanekiswallet:
    "A carteira de Kaneki. Aumenta em 3 segundos a janela de oportunidade para realizar saltos de Kagune consecutivos.",
  madosglove:
    "Luva de Mado. Os sobreviventes afetados pela Marca Kagune sofrem de Exaustão por 15 segundos após sua remoção.",
  redheadedcentipede:
    "Centopeia de Cabeça Vermelha. Executar uma ação de Salto enquanto estiver no Modo Enfurecido bloqueia essa janela para todos os Sobreviventes por 10 segundos.",
  redspiderlily:
    "Lírio-aranha-vermelho. Sobreviventes atingidos por um Ataque Básico enquanto estiverem no Modo Enfurecido sofrem de Hemorragia por 60 segundos.",
  rizesglasses:
    "Óculos de Rize. Ao entrar no Modo Enfurecido, as Auras de Sobreviventes saudáveis que estão atualmente reparando um Gerador são reveladas a você por 8 segundos.",
  taiyaki: "Taiyaki. Aumenta a contagem regressiva em 5 segundos.",
  theblackgoatsegg:
    "O Ovo da Cabra Preta. Concluir com sucesso o evento de tempo rápido durante um ataque de agarramento concede um bônus de 100% de Pontos de Sangue.",
  tortureapparatus:
    "Aparelhos de tortura. Sempre que o Modo Enfurecido terminar, concede 5% de Aceleração por 6 segundos.",
  yamorismask:
    "Máscara de Yamori. Pendurar um Sobrevivente no gancho enquanto estiver no Modo Enfurecido faz com que todos os Sobreviventes a mais de 40 metros gritem e revelem sua localização por 3 segundos.",

  // === ADD-ONS DA HAG (A Bruxa) ===
  bloodiedmud:
    "Bloodied Mud. Reduz o alcance de ativação das Armadilhas Fantasma em 30% (aumenta a chance de não ser queimada por lanternas).",
  bloodiedwater:
    "Bloodied Water. Reduz o alcance de ativação das Armadilhas Fantasma em 20%.",
  bogwater:
    "Bog Water. Reduz o alcance de ativação das Armadilhas Fantasma em 10%.",
  crackedturtleegg:
    "Cracked Turtle Egg. Aumenta a duração da ativação das Armadilhas Fantasma em 30%.",
  cypressnecklet:
    "Cypress Necklet. Aumenta a velocidade de instalação das Armadilhas Fantasma em 15%.",
  deadflymud:
    "Dead Fly Mud. Aumenta o alcance de teleporte para armadilhas ativadas em 10%.",
  disfiguredear:
    "Disfigured Ear. Sobreviventes sofrem do status Ensurdecido por 6 segundos após ativar uma Armadilha Fantasma.",
  dragonflywings:
    "Dragonfly Wings. Aumenta o alcance de teleporte para armadilhas ativadas em 12.5%.",
  driedcicada:
    "Dried Cicada. Aumenta o alcance de teleporte para armadilhas ativadas em 15%.",
  grandmasheart:
    "Grandma's Heart. Suprime seu Raio de Terror quando as armadilhas são ativadas. Aumenta o alcance do Raio de Terror Falso dos fantasmas para 16 metros.",
  halfeggshell:
    "Half Eggshell. Aumenta a duração da ativação das Armadilhas Fantasma em 25%.",
  mintrag:
    "Mint Rag. Permite teleportar para qualquer Armadilha Fantasma não ativada no mapa (Recarga de 10s).",
  powderedeggshell:
    "Powdered Eggshell. Aumenta a duração da ativação das Armadilhas Fantasma em 20%.",
  pussywillowcatkins:
    "Pussy Willow Catkins. Revela a aura de Sobreviventes que ativam Armadilhas Fantasma por 3 segundos.",
  ropenecklet:
    "Rope Necklet. Aumenta a velocidade de instalação das Armadilhas Fantasma em 10%.",
  rustyshackles:
    "Rusty Shackles. As Armadilhas Fantasma não geram Fantasmas de Lama nem dão indicação visual de ativação aos Sobreviventes.",
  scarredhand:
    "Scarred Hand. Fantasmas de Lama têm colisão e bloqueiam caminhos. Desabilita a capacidade de teleporte. Concede 300% mais Pontos de Sangue em Deviousness.",
  swamporchidnecklet:
    "Swamp Orchid Necklet. Aumenta a velocidade de instalação das Armadilhas Fantasma em 20%.",
  waterloggedshoe:
    "Waterlogged Shoe. Aumenta permanentemente a velocidade de movimento para 4.73 m/s (+7.5%). Sobreviventes na área da armadilha sofrem 9% de Lentidão. Desabilita teleporte.",
  willowwreath:
    "Willow Wreath. Revela a aura de Sobreviventes que ativam Armadilhas Fantasma por 5 segundos.",

  // === ADD-ONS DO HILLBILLY (O Caipira) ===
  apexmuffler:
    "Apex Muffler. A Motosserra fica completamente silenciosa para todos os Sobreviventes fora do seu Raio de Terror.",
  begrimedchains:
    "Begrimed Chains. Sobreviventes atingidos pela Motosserra sofrem de Hemorragia e Dilaceração por 70 segundos.",
  cloggedintake: "Clogged Intake. Aumenta a duração do modo Sobrecarga em 15%.",
  counterweight:
    "Counterweight. Reduz a taxa de curva inicial da Motosserra durante a Corrida em 70%.",
  crackedprimerbulb:
    "Cracked Primer Bulb. Aumenta a taxa de carregamento do medidor de Sobrecarga em 15%. Sobreviventes atingidos sofrem apenas um estado de dano (não derruba instantaneamente).",
  dadsboots:
    "Dad's Boots. Aumenta a velocidade de curva durante a Corrida de Motosserra em 20%.",
  discardedairfilter:
    "Discarded Air Filter. Aumenta o tempo que leva para o medidor de Sobrecarga começar a decair em 20%.",
  filthyslippers:
    "Filthy Slippers. Ganha o efeito Indetectável após manter uma Corrida de Motosserra por 2 segundos, até parar de correr.",
  greasedthrottle:
    "Greased Throttle. Reduz o tempo de recarga após usar a Motosserra em 5% (quando não estiver em Sobrecarga).",
  highspeedidlerscrew:
    "High-Speed Idler Screw. Aumenta o tempo que leva para o medidor de Sobrecarga começar a decair em 30%.",
  iridescentengravings:
    "Iridescent Engravings. Aumenta a velocidade de movimento durante a Corrida de Motosserra em 20%, mas aumenta o tempo de carga em 12%.",
  loprochains:
    "LoPro Chains. Permite continuar a Corrida de Motosserra através de Paredes Quebráveis e Paletes. Sobreviventes atingidos 5s após quebrar algo sofrem apenas um estado de dano (ou Ferida Profunda se já feridos).",
  lowkickbackchains:
    "Low Kickback Chains. Reduz o tempo de recarga após bater em um obstáculo durante a Corrida de Motosserra em 15%.",
  offbrandmotoroil:
    "Off-Brand Motor Oil. Aumenta a taxa de carregamento do medidor de Sobrecarga em 15%.",
  raggedengine:
    "Ragged Engine. Reduz a velocidade de dissipação do medidor de Sobrecarga quando não está usando a Motosserra em 30%.",
  spikedboots:
    "Spiked Boots. Aumenta a velocidade de curva durante a Corrida de Motosserra em 30%.",
  steeltoeboots:
    "Steel Toe Boots. Reduz o tempo de recarga após bater em um obstáculo durante a Corrida de Motosserra em 10%.",
  thermalcasing:
    "Thermal Casing. Reduz a velocidade de dissipação do medidor de Sobrecarga quando não está usando a Motosserra em 20%.",
  thethompsonsmix:
    "The Thompson's Mix. Reduz o tempo de recarga após usar a Motosserra em 10% (quando não estiver em Sobrecarga).",
  tunedcarburettor:
    "Tuned Carburettor. Aumenta a velocidade de carga da Motosserra em 20%, mas reduz sua velocidade de movimento base para 4.4 m/s.",

  // === ADD-ONS DA MESTRA DA MATILHA (The Houndmaster) ===
  barleymeal:
    "Barley Meal. Aumenta a distância do Caminho de Perseguição Inicial em 20%.",
  belayingpins:
    "Belaying Pins. Sobreviventes afetados pelo Faro de Cão também sofrem do status Alheio (Oblivious) por 20 segundos.",
  creaturesbone:
    "Creature's Bone. Reduz a duração do Atordoamento do Cão em 50%.",
  fattymeat:
    "Fatty Meat. Sobreviventes afetados pelo Faro de Cão gritam periodicamente a cada 15 segundos, mas sem revelar sua localização exata para a Mestra.",
  gunpowdertin:
    "Gunpowder Tin. Aumenta a velocidade de quebrar Paredes/Paletes e danificar Geradores em 40% por 20s após um Sobrevivente ser afetado pelo Faro de Cão.",
  iridescentwheelhandle:
    "Iridescent Wheel Handle. Aumenta a duração do Cão na Localização Alvo do Comando de Busca em 20%. Concede Indetectável enquanto o Cão cumpre o Comando de Busca.",
  knottedrope:
    "Knotted Rope. Reduz o tempo de recarga de Ataques Básicos bem-sucedidos em 10% contra Sobreviventes agarrados pelo Cão.",
  leatherharness:
    "Leather Harness. Sempre que um Gerador é concluído, aumenta a velocidade de Perseguição do Cão em 20% por 30 segundos. (Efeito permanente após todos os geradores).",
  marlinspike:
    "Marlinspike. Sobreviventes num raio de 20 metros do Cão agarrando um Sobrevivente tornam-se afetados pelo Faro de Cão.",
  shipfigurehead:
    "Ship Figurehead. Aumenta seu Raio de Terror em 8m enquanto o Cão te segue. Reduz seu Raio de Terror em 8m enquanto o Cão está longe.",
  smokedsnapper: "Smoked Snapper. Reduz o tempo de recuperação do Poder em 5%.",
  spikedcollar:
    "Spiked Collar. Sobreviventes feridos enquanto agarrados pelo Cão sofrem de Hemorragia e Dilaceração por 45 segundos.",
  spyglass:
    "Spyglass. As auras de Sobreviventes afetados pelo Faro de Cão são reveladas por 3 segundos após o efeito terminar.",
  stickypitch:
    "Sticky Pitch. Aumenta sua velocidade de movimento em 2% enquanto caminha ao longo do Caminho de Busca.",
  tornnovel:
    "Torn Novel. As auras de Sobreviventes num raio de 10m do Cão são reveladas a você. O efeito persiste por 2s após sair da habilidade.",
  trainersbook:
    "Trainer's Book. Aumenta a duração do efeito de Faro de Cão em 35%.",
  trainingbell:
    "Training Bell. A aura do Sobrevivente responsável por atordoar o Cão é revelada a você por 5 segundos.",
  unfinishedmap:
    "Unfinished Map. Sobreviventes afetados pelo Faro de Cão sofrem de Exaustão por 15 segundos.",
  waterskin:
    "Waterskin. Aumenta a distância do Caminho de Perseguição Redirecionado em 20%.",
  youngcoconut:
    "Young Coconut. Aumenta a velocidade de Perseguição do Cão em 5%.",

  // === ADD-ONS DA HUNTRESS (A Caçadora) ===
  amanitatoxin:
    "Amanita Toxin. Sobreviventes atingidos por Machadinhas sofrem do status Cegueira por 60 segundos.",
  bandagedhaft:
    "Bandaged Haft. Reduz o tempo de recarga entre arremessos sucessivos de Machadinhas em 10%.",
  begrimedhead:
    "Begrimed Head. Sobreviventes atingidos por Machadinhas sofrem de Hemorragia e Dilaceração por 80 segundos.",
  coarsestone:
    "Coarse Stone. Aumenta o volume dos Gemidos de Dor de Sobreviventes feridos por Machadinhas em 50%.",
  deerskingloves:
    "Deerskin Gloves. Aumenta a velocidade de recarregar Machadinhas em Armários em 20%.",
  flowerbabushka:
    "Flower Babushka. Reduz o tempo de preparação (Wind-up) das Machadinhas em 0.1 segundos.",
  glowingconcoction:
    "Glowing Concoction. A aura de Sobreviventes atingidos por Machadinhas é revelada a você por 5 segundos.",
  infantrybelt:
    "Infantry Belt. Acertar um Sobrevivente com uma Machadinha concede 3% de Celeridade por 5 segundos.",
  iridescenthead:
    "Iridescent Head. Sobreviventes atingidos por Machadinhas entram automaticamente no Estado Agonizante. Reduz a capacidade máxima de Machadinhas em 1 (não acumulável).",
  leatherloop:
    "Leather Loop. Acertar um Sobrevivente com uma Machadinha concede 2% de Celeridade por 5 segundos.",
  mannagrassbraid:
    "Manna Grass Braid. Reduz o tempo de preparação (Wind-up) das Machadinhas em 8%.",
  oakhaft:
    "Oak Haft. Reduz o tempo de recarga entre arremessos sucessivos de Machadinhas em 20%.",
  roseroot: "Rose Root. Aumenta a velocidade do projétil da Machadinha em 20%.",
  rustyhead:
    "Rusty Head. Sobreviventes atingidos por Machadinhas sofrem do status Dilacerado por 70 segundos.",
  shinypin:
    "Shiny Pin. Aumenta a velocidade de movimento enquanto prepara Machadinhas em 5%.",
  soldiersputtee:
    "Soldier's Puttee. Aumenta a velocidade de movimento da Caçadora para 4.6 m/s quando ela está sem Machadinhas.",
  venomousconcoction:
    "Venomous Concoction. Sobreviventes atingidos por Machadinhas sofrem de Exaustão por 5 segundos.",
  weightedhead:
    "Weighted Head. Sobreviventes atingidos por Machadinhas sofrem do status Incapacitado por 10 segundos.",
  woodenfox:
    "Wooden Fox. Concede o status Indetectável por 30 segundos após recarregar em um Armário.",
  yellowedcloth:
    "Yellowed Cloth. Aumenta a velocidade do projétil da Machadinha em 10%.",

  // === ADD-ONS DO KNIGHT (O Cavaleiro) ===
  battleaxehead:
    "Battle Axe Head. Reduz o tempo de recarga após invocar o Carnifex em 20%.",
  blacksmithshammer:
    "Blacksmith's Hammer. Sobreviventes danificados por um Guarda durante uma Caçada sofrem do status Quebrado por 60 segundos.",
  brokenhilt:
    "Broken Hilt. Sobreviventes danificados por um Guarda sofrem de Hemorragia e Dilaceração por 70 segundos.",
  calltoarms:
    "Call to Arms. Aumenta o comprimento máximo do Caminho de Patrulha em 10 metros. Aumenta a velocidade de movimento ao desenhar o Caminho em 2.2 m/s.",
  coldsteelmanacles:
    "Cold Steel Manacles. Reduz o tempo de recarga após invocar o Carcereiro (Jailer) em 20%.",
  driedhorsemeat:
    "Dried Horsemeat. Aumenta a duração de uma Caçada em 4 segundos.",
  flintandsteel:
    "Flint and Steel. Invocar o Carnifex revela a aura de todos os Sobreviventes num raio de 24 metros de Paletes inteiras por 8 segundos.",
  grimironmask:
    "Grim Iron Mask. Sobreviventes detectados por um Guarda durante a Fase de Patrulha sofrem de Cegueira por 75 segundos.",
  grittylump:
    "Gritty Lump. Aumenta a velocidade de movimento dos Guardas durante a Fase de Patrulha em 9%.",
  healingpoultice:
    "Healing Poultice. Invocar o Assassino revela a aura de todos os Sobreviventes num raio de 8 metros do local de surgimento dele por 8 segundos.",
  iridescentcompanybanner:
    "Iridescent Company Banner. Bloqueia janelas no Caminho de Patrulha por 25s após invocar um Guarda. Bloqueia janelas e Portões de Saída para o Sobrevivente Caçado.",
  ironworkerstongs:
    "Ironworker's Tongs. Sobreviventes sofrem do status Alheio (Oblivious) por 60 segundos se um Guarda falhar em danificá-los durante uma Caçada.",
  jailerschimes:
    "Jailer's Chimes. Revela a aura de Sobreviventes que cruzam o Caminho de Patrulha do Carcereiro por 8 segundos.",
  knightscontract:
    "Knight's Contract. Faz com que um Guarda permaneça por 8 segundos após completar uma Ordem, iniciando uma Caçada se detectar um Sobrevivente nesse tempo.",
  mapoftherealm:
    "Map of the Realm. Aumenta o alcance de visão de um Guarda durante a Fase de Patrulha em 2 metros.",
  pillagedmead:
    "Pillaged Mead. Reduz a duração da ação de Quebrar ou Danificar de um Guarda em 10%.",
  sharpenedmount:
    "Sharpened Mount. Aumenta a duração do surgimento do Estandarte em 15%.",
  tatteredtabard:
    "Tattered Tabard. Aumenta a duração da Fase de Patrulha em 8 segundos.",
  townwatchstorch:
    "Town Watch's Torch. Concede o status Indetectável durante uma Caçada (enquanto um Guarda persegue).",
  treatedblade:
    "Treated Blade. Reduz o tempo de recarga após invocar o Assassino em 20%.",

  // === ADD-ONS DA KRASUE ===
  brokentiara:
    "Broken Tiara. Sobreviventes sofrem do status Alheio (Oblivious) enquanto estiverem sob o efeito do Fungo Brilhante.",
  chickenhead:
    "Chicken Head. Todos os Sobreviventes começam a partida afligidos por Sanguessuga I. Aumenta a contagem inicial de Fungo Brilhante em 2.",
  chunkofmalai:
    "Chunk of Malai. Aplica uma penalidade de eficiência de -8% por Sobrevivente Sanguessuga à taxa de esgotamento do Medidor de Sanguessuga (até -32%).",
  crumpledsheetmusic:
    "Crumpled Sheet Music. Acertar um Sobrevivente com uma Glândula Sanguessuga concede instantaneamente 12 Cargas ao Voo Impetuoso (Headlong Flight).",
  defectivemetronome:
    "Defective Metronome. Sobreviventes sofrem do status Exausto enquanto estiverem sob efeito do Fungo Brilhante.",
  dulledknife:
    "Dulled Knife. Reduz a taxa de consumo do Voo Impetuoso em 25%. Sobreviventes comendo Fungo ganham 5% de Celeridade e o status Elusivo por 5 segundos.",
  firstlibretto:
    "First Libretto. Ao enganchar um Sobrevivente Sanguessuga, reduz a taxa de consumo do Voo Impetuoso em 30% por 15 segundos.",
  framednewspaper:
    "Framed Newspaper. Aumenta a capacidade de carga do Voo Impetuoso em 6 cargas e a taxa de recarga em 15%. Aumenta o limiar de ativação para 50%.",
  janjirashand:
    "Janjira's Hand. Sempre que um Gerador é concluído, o Voo Impetuoso ganha 2 cargas instantaneamente e a recarga aumenta em 25% por 15s. (Efeito permanente após o último gerador).",
  lorenzasremains:
    "Lorenza's Remains. Sobreviventes afligidos por Sanguessuga sofrem efeitos: Tier I (Cegueira), Tier II (4% de Lentidão).",
  lucklessmouse:
    "Luckless Mouse. Aumenta a capacidade de carga do Voo Impetuoso em 2 cargas.",
  mysteriouselixir:
    "Mysterious Elixir. Atingir Janelas com uma Glândula Sanguessuga as deixa Marcadas. Pular uma janela marcada a bloqueia por 10 segundos.",
  pigseye:
    "Pig's Eye. Sobreviventes comendo Fungo Brilhante a mais de 40 metros têm sua aura revelada por 6 segundos.",
  queenssceptre:
    "Queen's Sceptre. Acertar um Sobrevivente com o Chicote Intestinal faz com que uma Glândula Sanguessuga espirre da localização dele.",
  rottenswine:
    "Rotten Swine. Atingir Paredes, Geradores ou Paletes com uma Glândula Sanguessuga os deixa Marcados. Aumenta a velocidade de quebrar/danificar objetos marcados em 15%.",
  shreddedgown:
    "Shredded Gown. Revela a aura de Sobreviventes a 8 metros de um Fungo Brilhante ou segurando um, por 5 segundos ao usar a Trama Corpórea.",
  spatteredhandkerchief:
    "Spattered Handkerchief. Quando os Portões são energizados, todos os Sobreviventes sofrem de Sanguessuga I e Fungos param de surgir.",
  stickylozenge:
    "Sticky Lozenge. Exibe uma prévia da zona de impacto enquanto carrega a habilidade Regurgitar.",
  theatrebinoculars:
    "Theatre Binoculars. Acertar um Sobrevivente não-Sanguessuga com o Chicote Intestinal revela a aura de todos os outros Sobreviventes num raio de 24m por 6 segundos.",
  wrigglingparasite:
    "Wriggling Parasite. Aumenta a taxa de carregamento do Medidor de Sanguessuga em 16%.",

  // === ADD-ONS DO LEATHERFACE (The Cannibal) ===
  awardwinningchilli:
    "Award-winning Chilli. Aumenta a duração da Corrida de Motosserra em 0.2s por Ficha consumida. Aumenta a janela de oportunidade da corrida em 0.2s.",
  begrimedchains:
    "Begrimed Chains. Sobreviventes atingidos pela Motosserra derrubam o item que estiverem segurando.",
  carburettortuningguide:
    "Carburettor Tuning Guide. Iniciar uma Corrida de Motosserra consome automaticamente todas as fichas, combinando suas durações. Aumenta a duração (+0.5s/ficha) e reduz a velocidade (-2%).",
  chainsawfile:
    "Chainsaw File. Reduz a duração do acesso de raiva (Tantrum) em 0.25 segundos.",
  chilli:
    "Chilli. Aumenta a duração da Corrida de Motosserra em 0.15s por Ficha consumida. Aumenta a janela de oportunidade da corrida em 0.15s.",
  depthgaugerake:
    "Depth Gauge Rake. Aumenta as Fichas de Poder em +1. Reduz a velocidade de recarga (-18%) e a velocidade de movimento durante a corrida (-2%).",
  grislychains:
    "Grisly Chains. Sobreviventes atingidos pela Motosserra sofrem do status Dilacerado (Mangled) por 70 segundos.",
  homemademuffler:
    "Homemade Muffler. Reduz a duração do acesso de raiva (Tantrum) em 0.5 segundos.",
  iridescentflesh:
    "Iridescent Flesh. Recarrega instantaneamente todas as Fichas de Poder ao acertar um Sobrevivente com a Motosserra. Reduz a duração máxima do Tantrum para 3s.",
  knifescratches:
    "Knife Scratches. Aumenta a velocidade de movimento durante a Corrida de Motosserra em 1.5%. Aumenta o tempo de carga em 10%.",
  lightchassis:
    "Light Chassis. A aura de Sobreviventes num raio de 8 metros é revelada enquanto você carrega a Motosserra.",
  longguidebar:
    "Long Guide Bar. Aumenta o limite antes que acelerar a serra cause um acesso de raiva em 2 segundos.",
  primerbulb:
    "Primer Bulb. Reduz o tempo de recarga das Fichas de Poder em 1 segundo.",
  rustedchains:
    "Rusted Chains. Sobreviventes atingidos pela Motosserra sofrem do status Quebrado (Broken) por 90 segundos.",
  shoplubricant:
    "Shop Lubricant. A aura de Sobreviventes derrubados pela Motosserra fica oculta para outros Sobreviventes por 20 segundos (se não houver ninguém por perto).",
  sparkplug:
    "Spark Plug. Reduz o tempo de recarga das Fichas de Poder em 0.5 segundos.",
  speedlimiter:
    "Speed Limiter. Concede 100% mais Pontos de Sangue em eventos de Motosserra. Sobreviventes atingidos sofrem apenas um estado de dano.",
  thebeastsmarks:
    "The Beast's Marks. Aumenta a velocidade de movimento durante a Corrida de Motosserra em 2%. Aumenta o tempo de carga em 12%.",
  thegrease:
    "The Grease. Aumenta o limite antes que acelerar a serra cause um acesso de raiva em 3 segundos.",
  vegetableoil:
    "Vegetable Oil. Reduz a duração do tempo de recarga da Motosserra em 0.3 segundos.",

  // === ADD-ONS DO LEGION (O Legião) ===
  bffs: "BFFs. Ganha Fichas por acertos no Frenesi. Se tiver 15+ Fichas quando os Portões forem energizados, ganha 6% de Celeridade fora do poder.",
  defacedsmileypin:
    "Defaced Smiley Pin. Sobreviventes sofrem do status Dilacerado (Mangled) por 60 segundos após se emendarem.",
  etchedruler:
    "Etched Ruler. Sobreviventes atingidos por um Corte Feral sofrem do status Alheio (Oblivious) por 60 segundos.",
  filthyblade:
    "Filthy Blade. Aumenta o tempo necessário para os Sobreviventes se emendarem em 4 segundos.",
  franksmixtape:
    "Frank's Mix Tape. Pausa o medidor de poder ao quebrar objetos. Aumenta a velocidade de danificar geradores em 20% e quebrar paredes em 30% durante o Frenesi.",
  friendshipbracelet:
    "Friendship Bracelet. Aumenta a duração do ataque (Lunge) durante os Cortes Ferais em 0.3 segundos.",
  fumingmixtape:
    "Fuming Mix Tape. Durante o Frenesi, a intensidade da aura dos geradores indica o progresso. Geradores não reparados começam a regredir.",
  iridescentbutton:
    "Iridescent Button. Durante o Frenesi Feral, pular uma Palete faz com que ela quebre instantaneamente.",
  joeysmixtape:
    "Joey's Mix Tape. Sobreviventes sofrem de Hemorragia até serem totalmente curados após se emendarem.",
  juliesmixtape:
    "Julie's Mix Tape. Recarrega instantaneamente o Frenesi Feral se você for atordoado (Stun) enquanto o usa.",
  mischieflist:
    "Mischief List. Aumenta a duração do Frenesi Feral em 2 segundos.",
  muralsketch:
    "Mural Sketch. Aumenta o bônus de velocidade de movimento por acerto consecutivo no Frenesi em +0.3 m/s (máximo +1.2 m/s).",
  neversleeppills:
    "Never-Sleep Pills. Aumenta a duração do Frenesi em 10s, mas reduz a velocidade base do Frenesi para 4.6 m/s. Concede muitos Pontos de Sangue extras.",
  scratchedruler:
    "Scratched Ruler. Reduz o tempo de recuperação do Frenesi Feral em 5 segundos.",
  smileyfacepin:
    "Smiley Face Pin. Sobreviventes sofrem do status Cegueira por 60 segundos após se emendarem.",
  stabwoundsstudy:
    "Stab Wounds Study. A aura de Sobreviventes é revelada a você por 4 segundos após eles terminarem de se emendar.",
  stolensketchbook:
    "Stolen Sketch Book. Sobreviventes atingidos por um segundo (ou mais) Corte Feral em cadeia derrubam o item que estão segurando.",
  stylishsunglasses:
    "Stylish Sunglasses. Revela a aura de Sobreviventes que estão se emendando num raio de 24 metros.",
  susiesmixtape:
    "Susie's Mix Tape. Aumenta o raio de detecção do Instinto Assassino em 20 metros.",
  thelegionpin:
    "The Legion Pin. Sobreviventes sofrem do status Quebrado (Broken) por 60 segundos após se emendarem.",

  // === ADD-ONS DO MICHAEL MYERS (The Shape) ===
  blondhair:
    "Blond Hair. Aumenta a duração das Marcas de Arranhão e Poças de Sangue em 100% no Modo Espreitar.",
  boyfriendsmemo:
    "Boyfriend's Memo. Aumenta o alcance de Espreitar em 8 metros.",
  deadrabbit:
    "Dead Rabbit. Reduz o Raio de Terror no Modo Perseguidor em 25% e aumenta no Modo Maldade Encarnada em 25%.",
  fragranttuftofhair:
    "Fragrant Tuft of Hair. Sobreviventes sofrem de Exposto. Aumenta o alcance do Bote em 50%. Desabilita o Golpe de Massacre.",
  glassfragment:
    "Glass Fragment. Aumenta a velocidade de movimento do Golpe de Massacre em 5%. Reduz a velocidade de carga em 10%.",
  hairbow: "Hair Bow. Aumenta a duração da Maldade Encarnada em 20 segundos.",
  hairbrush:
    "Hair Brush. Aumenta a velocidade de ação de quebrar a próxima Palete em 50% quando a Maldade Encarnada ativa.",
  jewellery:
    "Jewellery. Aumenta a velocidade de ganho de poder ao Espreitar em 10%.",
  jewellerybox:
    "Jewellery Box. Aumenta a velocidade de ganho de poder ao Espreitar em 30%. Reduz o alcance em 16 metros.",
  myersmemorial:
    "Myers Memorial. Aumenta a velocidade de Pegar e Enganchar Sobreviventes em 40% durante a Maldade Encarnada.",
  judithsjournal:
    "Judith's Journal. Aumenta a velocidade de ganho de poder ao Espreitar a Obsessão em 40%.",
  judithstombstone:
    "Judith's Tombstone. Enganchar um Sobrevivente durante Maldade Encarnada recarrega sua duração. Limita a duração máxima a 40 segundos.",
  lockofhair:
    "Lock of Hair. Segure o botão de Habilidade para encerrar Maldade Encarnada prematuramente, convertendo 50% da duração restante em progresso.",
  memorialflower:
    "Memorial Flower. Aumenta a velocidade de movimento enquanto Espreita para 4.4 m/s.",
  mirrorshard:
    "Mirror Shard. Aumenta a duração base do Golpe de Massacre em 0.25 segundos. Reduz a velocidade de carga em 25%.",
  reflectivefragment:
    "Reflective Fragment. Acertos bem-sucedidos com Golpe de Massacre adicionam 20 segundos à duração da Maldade Encarnada.",
  scratchedmirror:
    "Scratched Mirror. Revela a aura de todos os Sobreviventes num raio de 32m enquanto Espreita. O Mal Interior não pode passar do Tier I.",
  tackyearrings:
    "Tacky Earrings. Aumenta a velocidade de movimento enquanto Espreita em 20%.",
  tombstonepiece:
    "Tombstone Piece. Ativar Maldade Encarnada concede o status Indetectável por 20 segundos.",
  vanitymirror:
    "Vanity Mirror. Quando Maldade Encarnada termina, a aura de todos os Sobreviventes é revelada a você por 4 segundos.",

  // === ADD-ONS DO NEMESIS (O Nêmesis) ===
  adminwristband:
    "Admin Wristband. Aumenta o alcance de detecção de sobreviventes pelos Zumbis em 4 metros. Aumenta o campo de visão dos Zumbis em 17.5 graus.",
  adrenalineinjector:
    "Adrenaline Injector. Aumenta a duração do Instinto Assassino após um Sobrevivente usar uma Vacina em 3 segundos.",
  briansintestine:
    "Brian's Intestine. Aumenta a velocidade de movimento dos Zumbis em 0.25 m/s.",
  brokenrecoverycoin:
    "Broken Recovery Coin. Reduz o número de Caixas de Suprimentos no ambiente em 1.",
  damagedsyringe:
    "Damaged Syringe. Aumenta o tempo de injeção das Vacinas em 5 segundos.",
  depletedinkribbon:
    "Depleted Ink Ribbon. Reduz o tempo de respawn de Zumbis desintegrados em 5 segundos. Aumenta a velocidade de movimento dos Zumbis em 0.5 m/s. Quando os Portões são energizados, Zumbis renascem na área de saída.",
  iridescentumbrellabadge:
    "Iridescent Umbrella Badge. Sobreviventes sofrem do status Exposto por 60 segundos após usar uma Vacina.",
  jillssandwich:
    "Jill's Sandwich. As auras de Sobreviventes desbloqueando uma Caixa de Suprimentos são reveladas a você por 12 segundos após o sucesso.",
  lickertongue:
    "Licker Tongue. Aumenta a duração do efeito de Lentidão (Hindered) ao se tornar Contaminado em 1 segundo.",
  marvinsblood:
    "Marvin's Blood. Aumenta o ganho de Taxa de Mutação ao atingir Sobreviventes com o Golpe de Tentáculo em +0.5 pontos.",
  mikhailseye:
    "Mikhail's Eye. Aumenta a velocidade de movimento dos Zumbis em 0.35 m/s.",
  neparasite:
    "Ne-a Parasite. Sobreviventes sofrem do status Alheio (Oblivious) por 60 segundos após se tornarem Contaminados ou até se curarem com Vacina.",
  plant43vines:
    "Plant 43 Vines. Aumenta o tempo de abertura de Caixas de Suprimentos em 4 segundos.",
  serotonininjector:
    "Serotonin Injector. Concede o status Indetectável por 15 segundos após um Zumbi ser desintegrado por qualquer meio.",
  shatteredstarsbadge:
    "Shattered S.T.A.R.S. Badge. Aumenta a velocidade de movimento dos Zumbis em 1.5 m/s por 60 segundos cada vez que um Gerador é concluído.",
  starsfieldcombatmanual:
    "S.T.A.R.S. Field Combat Manual. A aura dos Zumbis é destacada em amarelo por 6 segundos quando eles atingem um Sobrevivente.",
  tvirussample:
    "T-Virus Sample. Aumenta o ganho de Taxa de Mutação ao atingir Zumbis com o Golpe de Tentáculo em +1 ponto.",
  tyrantgore:
    "Tyrant Gore. Reduz o tempo de respawn de Zumbis desintegrados em 7.5 segundos. Aumenta o ganho de Mutação ao atingir Zumbis em +0.75 pontos.",
  visitorwristband:
    "Visitor Wristband. Aumenta o alcance de detecção de sobreviventes pelos Zumbis em 2 metros. Aumenta o campo de visão dos Zumbis em 10 graus.",
  zombieheart:
    "Zombie Heart. Aumenta o ganho de Taxa de Mutação ao atingir Zumbis com o Golpe de Tentáculo em +0.75 pontos.",

  // === ADD-ONS DA NURSE (A Enfermeira) ===
  anxiousgasp:
    "Anxious Gasp. Teleportar passando a 1 metro de um Sobrevivente faz com que ele grite e revele sua localização. Concede pontos de sangue extras.",
  ataxicrespiration: "Ataxic Respiration. Reduz a duração da Fadiga em 7%.",
  badmankeepsake:
    "Bad Man Keepsake. Sobreviventes atingidos por um Ataque Especial têm a aura revelada por 60s se estiverem curando ou sendo curados num raio de 28m.",
  badmanslastbreath:
    '"Bad Man\'s" Last Breath. Atingir um Sobrevivente com um Ataque Especial concede o status Indetectável por 25 segundos. Possui recarga de 45s.',
  campbellslastbreath:
    "Campbell's Last Breath. Ao reaparecer de um Blink totalmente carregado, você realiza automaticamente outro Blink com carga total na direção que está olhando.",
  catatonicboystreasure:
    "Catatonic Boy's Treasure. Reduz a Fadiga extra causada por Blinks em Cadeia em 65%.",
  darkcincture:
    "Dark Cincture. Aumenta a velocidade de movimento durante a janela de oportunidade de Blink em Cadeia em 30%.",
  dullbracelet:
    "Dull Bracelet. Reduz o alcance máximo do Blink em 20%. Concede 100% de Pontos de Sangue bônus em pontuações de Blink Preciso.",
  fragilewheeze:
    "Fragile Wheeze. Sobreviventes atingidos por um Ataque Especial sofrem do status Dilacerado (Mangled) por 70 segundos.",
  heavypanting:
    "Heavy Panting. Estende a duração do Bote (Lunge) de Ataques Especiais para 130% (aumenta alcance em 30%) após o segundo ou terceiro Blink.",
  jennerslastbreath:
    "Jenner's Last Breath. Permite pressionar o botão de Habilidade Ativa para retornar imediatamente à posição original após esgotar os Blinks. Recarrega 1 Carga.",
  kavanaghslastbreath:
    "Kavanagh's Last Breath. Ao sucumbir à Fadiga, Sobreviventes num raio de 8 metros sofrem do status Cegueira por 60 segundos.",
  matchbox:
    "Matchbox. Aumenta a velocidade de movimento base para 4.4 m/s. Reduz a quantidade de Blinks para 1.",
  metalspoon:
    "Metal Spoon. Aumenta o volume dos gemidos de dor de Sobreviventes atingidos por um Ataque Especial em 50% por 60 segundos.",
  plaidflannel:
    "Plaid Flannel. Permite visualizar o local de aterrissagem do Blink.",
  pocketwatch:
    "Pocket Watch. Aumenta a duração da janela de oportunidade de Blink em Cadeia em 0.2 segundos.",
  spasmodicbreath:
    "Spasmodic Breath. Atingir um Sobrevivente com um Ataque Especial aumenta sua velocidade de movimento para 4.6 m/s por 60 segundos, mas desabilita o Blink.",
  tornbookmark:
    "Torn Bookmark. Aumenta a quantidade de cargas de Blink em +1. Aumenta o tempo de recarga das cargas em 30%.",
  whitenitcomb:
    "White Nit Comb. Reduz a duração do Bote de Ataques Especiais em 0.15s (o que reduz o alcance do ataque em 50%). Concede 100% de BP bônus.",
  woodenhorse:
    "Wooden Horse. Reduz a Fadiga extra aplicada por errar Ataques Especiais em 0.5 segundos.",

  // === ADD-ONS DO ONI (The Oni) ===
  akitoscrutch:
    "Akito's Crutch. Aumenta a velocidade de movimento durante a Investida Demoníaca em 1 m/s.",
  blackenedtoenail:
    "Blackened Toenail. Aumenta sua velocidade de movimento enquanto absorve Orbes de Sangue em 0.4 m/s.",
  bloodysash:
    "Bloody Sash. Aumenta sua velocidade de movimento enquanto absorve Orbes de Sangue em 0.7 m/s.",
  childswoodensword:
    "Child's Wooden Sword. Aumenta o alcance de visualização da aura dos Orbes de Sangue em 3 metros.",
  chippedsaihai:
    "Chipped Saihai. Aumenta a duração da Fúria Sangrenta em 6 segundos.",
  crackedsakazuki:
    "Cracked Sakazuki. Reduz o tempo de ativação e desativação da Fúria Sangrenta em 0.5 segundos.",
  inklion:
    "Ink Lion. Reduz o tempo de ativação/desativação da Fúria Sangrenta em 0.5s. Reduz a penalidade do medidor ao derrubar sobreviventes em 2 segundos.",
  iridescentfamilycrest:
    "Iridescent Family Crest. Errar um Golpe Demoníaco e acertar o chão faz Sobreviventes num raio de 24m gritarem e revelarem sua localização.",
  kanaianzentalisman:
    "Kanai-Anzen Talisman. Aumenta a velocidade de movimento durante a Investida Demoníaca em 0.64 m/s.",
  lionfang: "Lion Fang. Aumenta a duração da Fúria Sangrenta em 10 segundos.",
  paperlantern:
    "Paper Lantern. Aumenta a velocidade com que os Orbes de Sangue flutuam até você em 4 m/s durante a absorção.",
  polishedmaedate:
    "Polished Maedate. Aumenta a taxa de carregamento passivo da Fúria Sangrenta em 0.1 c/s.",
  renjirosbloodyglove:
    "Renjiro's Bloody Glove. Revela a aura de Sobreviventes que tocam em Orbes de Sangue por 2s (acumula). Orbes tornam-se visíveis para Sobreviventes e são absorvidos ao toque.",
  rottingrope:
    "Rotting Rope. Aumenta o alcance de visualização da aura dos Orbes de Sangue em 2 metros.",
  scalpedtopknot:
    "Scalped Topknot. Reduz o tempo de carregamento da Investida Demoníaca em 0.5 segundos.",
  shatteredwakizashi:
    "Shattered Wakizashi. Aumenta a taxa de carregamento passivo da Fúria Sangrenta em 0.2 c/s.",
  splinteredhull:
    "Splintered Hull. Aumenta a frequência de aparecimento de Orbes de Sangue de feridos em 33%. Sobreviventes geram +1 orbe extra em interações.",
  tearsoakedtenugui:
    "Tear-Soaked Tenugui. Reduz a penalidade do medidor de poder ao derrubar Sobreviventes durante a Fúria Sangrenta em 4 segundos.",
  woodenonimask:
    "Wooden Oni Mask. Aumenta a frequência de aparecimento de Orbes de Sangue de feridos em 14%. Sobreviventes geram +1 orbe extra em interações.",
  yamaokasashimono:
    "Yamaoka Sashimono. Aumenta a duração da Fúria Sangrenta em 8 segundos.",

  // === ADD-ONS DA SADAKO (The Onryō) ===
  bloodyfingernails:
    "Bloody Fingernails. Aumenta a duração do Impulso de Velocidade após usar a Projeção em 50%.",
  cabinsign:
    "Cabin Sign. Reduz o tempo para as TVs ligarem novamente após a Projeção em 4.5 segundos.",
  clumpofhair:
    "Clump of Hair. Reduz o limite de distância para invisibilidade total enquanto Desmanifestada em 6 metros.",
  distortedphoto:
    "Distorted Photo. Sobreviventes num raio de 16m que testemunham sua Manifestação gritam e revelam suas auras por 4 segundos.",
  iridescentvideotape:
    "Iridescent Videotape. A Projeção não desliga mais as TVs, mas não aplica Condenação. Aumenta o tempo para TVs ligarem após serem desligadas por Sobreviventes em 20%.",
  motherscomb:
    "Mother's Comb. Destaca a aura de todas as TVs desligadas em amarelo. TVs sendo desligadas ativam uma notificação sonora.",
  mothersmirror:
    "Mother's Mirror. Aumenta a duração da invisibilidade intermitente após se Manifestar em 2 segundos.",
  oldnewspaper:
    "Old Newspaper. Aumenta a duração da invisibilidade total após se Manifestar em 33%.",
  reikoswatch:
    "Reiko's Watch. Aumenta a duração da invisibilidade total enquanto Desmanifestada em 25%.",
  remotecontrol:
    "Remote Control. Revela a aura de Sobreviventes num raio de 12m de TVs ligadas por 7 segundos após usar Projeção.",
  ricketypinwheel:
    "Rickety Pinwheel. Sobreviventes sofrem do status Alheio (Oblivious) quando estão a 8 metros de TVs ligadas. O efeito persiste por 7s após desligar a TV.",
  ringdrawing:
    "Ring Drawing. Enganchar um Sobrevivente carregando uma Fita VHS faz com que todos os outros ganhem 1 Ficha de Condenação.",
  seasoakedcloth:
    "Sea-Soaked Cloth. Sobreviventes sofrem do status Cegueira quando estão a 8 metros de TVs ligadas. O efeito persiste por 7s após desligar a TV.",
  tapeeditingdeck:
    "Tape Editing Deck. Todos os Sobreviventes começam a partida com uma Fita VHS e devem levá-la à TV mais distante. Revela a aura de quem insere a fita por 6 segundos.",
  telephone:
    "Telephone. Sobreviventes sofrem 3% de Lentidão (Hindered) por 3 segundos se você se Manifestar a 7 metros deles.",
  vcr: "VCR. Faz com que todas as TVs reproduzam os efeitos de Projeção ao usar a habilidade de Projeção.",
  videotapecopy:
    "Videotape Copy. Aumenta o raio ao redor das TVs no qual os Sobreviventes ganham Condenação pela Projeção em 2 metros.",
  wellstone:
    "Well Stone. Reduz o tempo para as TVs ligarem novamente após a Projeção em 7 segundos.",
  wellwater:
    "Well Water. Aumenta a duração do status Indetectável em 2 segundos após se Manifestar.",
  yoichisfishingnet:
    "Yoichi's Fishing Net. Sobreviventes sofrem do status Cegueira após adquirir pelo menos 4 Fichas de Condenação.",

  // === ADD-ONS DA PIG (A Porca) ===
  amandasletter:
    "Amanda's Letter. Enquanto estiver agachada, você vê a aura de Sobreviventes num raio de 16 metros. Reduz a quantidade de Armadilhas de Urso Reversas em 2.",
  amandassecret:
    "Amanda's Secret. Sobreviventes que removem a Armadilha de Urso Reversa ativam uma notificação sonora e têm sua aura revelada por 6 segundos.",
  bagofgears:
    "Bag of Gears. Aumenta a velocidade de colocar a Armadilha de Urso Reversa em 50%. Reduz a velocidade de busca nas Caixas Jigsaw em 14%.",
  combatstraps:
    "Combat Straps. Aumenta a velocidade de transição para o estado Agachado em 10%.",
  crateofgears:
    "Crate of Gears. Aumenta a velocidade de colocar a Armadilha de Urso Reversa em 50%. Reduz a velocidade de busca nas Caixas Jigsaw em 25%.",
  facemask:
    "Face Mask. Sobreviventes com uma Armadilha de Urso Reversa sofrem do status Cegueira.",
  interlockingrazor:
    "Interlocking Razor. Se um Sobrevivente ferido falhar num Teste de Perícia na Caixa Jigsaw, ele sofre do status Ferida Profunda.",
  jigsawsannotatedplan:
    "Jigsaw's Annotated Plan. Aumenta a quantidade de Armadilhas em +1. Aumenta o tempo de morte da armadilha em 10s. Cada gerador concluído reduz o tempo das armadilhas ativas em 10s.",
  jigsawssketch:
    "Jigsaw's Sketch. Aumenta a quantidade de Armadilhas em +1. Revela a aura de geradores sendo reparados por Sobreviventes com armadilha em amarelo.",
  johnsmedicalfile:
    "John's Medical File. Aumenta sua velocidade de movimento enquanto estiver Agachada em 10%.",
  lastwill:
    "Last Will. Aumenta a velocidade de movimento durante a Corrida de Emboscada em 6%. Aumenta o tempo de carga da Emboscada em 33%.",
  razorwires:
    "Razor Wires. Sobreviventes saudáveis que falham num Teste de Perícia na Caixa Jigsaw ficam feridos. Aumenta a dificuldade dos Testes de Perícia em 20%.",
  rulessetno2:
    "Rules Set No.2. Desabilita a visualização da aura das Caixas Jigsaw para os Sobreviventes até que a Armadilha deles se torne ativa.",
  rustyattachments:
    "Rusty Attachments. Sobreviventes com uma Armadilha de Urso Reversa sofrem do status Dilacerado (Mangled).",
  shatteredsyringe:
    "Shattered Syringe. Reduz o tempo de recarga de Ataques de Emboscada errados em 10%.",
  slowreleasetoxin:
    "Slow-Release Toxin. Sobreviventes com uma Armadilha de Urso Reversa sofrem do status Exaustão.",
  tamperedtimer:
    "Tampered Timer. Reduz o tempo de morte da Armadilha de Urso Reversa em 20 segundos.",
  utilityblades:
    "Utility Blades. Sobreviventes com uma Armadilha de Urso Reversa sofrem do status Hemorragia.",
  videotape:
    "Video Tape. Todos os Sobreviventes começam a partida com a Armadilha de Urso Reversa instalada.",
  workshopgrease:
    "Workshop Grease. Aumenta a velocidade de carga da Emboscada em 50%. Reduz o tempo de recarga de Ataques de Emboscada errados em 10%.",

  // === ADD-ONS DO PINHEAD (The Cenobite) ===
  bentnail:
    "Bent Nail. Concede 100% de Pontos de Sangue bônus em eventos de Correntes. Reduz o número de Correntes bônus geradas em 1 ao acertar com a Corrente Possuída.",
  burningcandle:
    "Burning Candle. Reduz o tempo para iniciar a Caçada de Correntes em 3 segundos.",
  chattererstooth:
    "Chatterer's Tooth. Revela a aura da Configuração do Lamento. Pegar a Configuração desativa a Caçada de Correntes atual e concede o status Indetectável por 25 segundos.",
  engineersfang:
    "Engineer's Fang. Atingir um Sobrevivente saudável com a Corrente Possuída causa dano, mas não o prende. Aumenta o tempo de fechamento do Portal em 0.25s. Reduz correntes bônus em 1.",
  flickeringtelevision:
    "Flickering Television. Aumenta o alcance máximo de lançamento do Portal em 4 metros.",
  franksheart:
    "Frank's Heart. Aumenta o alcance máximo de lançamento do Portal em 8 metros.",
  greasyblacklens:
    "Greasy Black Lens. Revela a aura de Sobreviventes atingidos por uma Corrente Possuída por 6 segundos.",
  impalingwire:
    "Impaling Wire. Se um Sobrevivente usar o ambiente para quebrar uma corrente, uma Corrente bônus adicional aparece para atacá-lo.",
  iridescentlamentconfiguration:
    "Iridescent Lament Configuration. Oculta a aura da Configuração do Lamento de Sobreviventes que estejam a mais de 24 metros dela (fora da Caçada de Correntes).",
  larrysblood:
    "Larry's Blood. Aumenta o alcance máximo da Corrente Possuída em 4 metros.",
  larrysremains:
    "Larry's Remains. Aumenta o tempo de resolução da Configuração do Lamento em 2 segundos.",
  leatherstrip:
    "Leather Strip. Reduz o tempo de recarga da Corrente Possuída em 0.15 segundos.",
  liquifiedgore:
    "Liquified Gore. Aumenta o tempo de resolução da Configuração do Lamento em 1 segundo.",
  livelycrickets:
    "Lively Crickets. Aumenta a velocidade de curva da Corrente Possuída em 10%.",
  originalpain:
    "Original Pain. Sobreviventes sofrem do status Ferida Profunda (Deep Wound) ao se libertarem da Corrente Possuída.",
  skeweredrat:
    "Skewered Rat. Reduz o tempo de recarga da Corrente Possuída em 0.45 segundos.",
  sliceoffrank:
    "Slice of Frank. Sobreviventes sofrem do status Exaustão enquanto carregam a Configuração do Lamento.",
  spoiledmeal:
    "Spoiled Meal. Aumenta o alcance máximo da Corrente Possuída em 2 metros.",
  torturepillar:
    "Torture Pillar. Reduz o tempo para iniciar a Caçada de Correntes em 6 segundos.",
  wrigglingmaggots:
    "Wriggling Maggots. Aumenta a velocidade de curva da Corrente Possuída em 15%.",

  // === ADD-ONS DA PLAGUE (A Praga) ===
  ashenapple:
    "Ashen Apple. Faz com que 1 Fonte de Devoção apareça no estado Corrompido no início da partida. Aumenta o número de Fontes de Devoção disponíveis em 1.",
  blackincense:
    "Black Incense. Auras de Sobreviventes Infectados que estão vomitando são reveladas a você por 3 segundos.",
  blessedapple:
    "Blessed Apple. Faz com que 1 Fonte de Devoção apareça no estado Corrompido no início da partida.",
  devoteesamulet:
    "Devotee's Amulet. Aumenta a duração do Expurgo Corrompido em 20 segundos.",
  emeticpotion:
    "Emetic Potion. Aumenta o ganho de Infecção ao atingir Sobreviventes com o Expurgo Vil em 30%.",
  exorcismamulet:
    "Exorcism Amulet. Aumenta a duração do Expurgo Corrompido em 10 segundos.",
  haematiteseal:
    "Haematite Seal. Aumenta a duração da Infecção em objetos atingidos pelo Expurgo Vil em 30 segundos.",
  healingsalve:
    "Healing Salve. Reduz o tempo de recarga do Expurgo Vil e do Expurgo Corrompido em 0.25 segundos.",
  incensedointment:
    "Incensed Ointment. Ingerir a Corrupção de uma fonte faz com que todos os Sobreviventes no seu Raio de Terror gritem e revelem suas localizações.",
  infectedemetic:
    "Infected Emetic. Aumenta o ganho de Infecção ao atingir Sobreviventes com o Expurgo Vil em 40%.",
  iridescentseal:
    "Iridescent Seal. Você entra automaticamente no modo Expurgo Corrompido sempre que um Gerador é concluído. Reduz a duração do Expurgo Corrompido em 20 segundos.",
  limestoneseal:
    "Limestone Seal. Aumenta a duração da Infecção em objetos atingidos pelo Expurgo Vil em 20 segundos.",
  olibanumincense:
    "Olibanum Incense. As auras de Sobreviventes se purificando em uma Fonte de Devoção são reveladas a você por 4 segundos.",
  potenttincture:
    "Potent Tincture. Reduz o tempo de recarga do Expurgo Vil e do Expurgo Corrompido em 0.4 segundos.",
  prayertabletfragment:
    "Prayer Tablet Fragment. Aumenta a duração da Infecção em objetos em 40s. Aumenta a Infecção ganha por interações em 100%. O Expurgo Vil não afeta mais Sobreviventes diretamente (apenas objetos).",
  prophylacticamulet:
    "Prophylactic Amulet. Reduz o número de Fontes de Devoção disponíveis no mapa em 2.",
  rubbingoil:
    "Rubbing Oil. Aumenta a velocidade de carga (preparação) do Expurgo Vil e Expurgo Corrompido em 50%.",
  severedtoe:
    "Severed Toe. Aumenta a taxa de Infecção ganha por Sobreviventes ao realizar interações em 50%.",
  vileemetic:
    "Vile Emetic. Aumenta a velocidade do projétil do Expurgo Vil e Expurgo Corrompido em 10%.",
  worshiptablet:
    "Worship Tablet. Aumenta a velocidade de ingestão da Corrupção nas Fontes em 100%. Aumenta a velocidade de movimento enquanto segura o Expurgo Corrompido para 4.4 m/s.",

  // === ADD-ONS DO PYRAMID HEAD (The Executioner) ===
  blackstrap:
    "Black Strap. Aumenta o alcance do ataque Punição dos Condenados em 0.5 metros.",
  burningmanpainting:
    "Burning Man Painting. Aumenta o alcance do ataque Punição dos Condenados em 1.5 metros.",
  cinderellamusicbox:
    "Cinderella Music Box. Aumenta a duração das Trilhas de Atormentamento no ambiente em 15 segundos.",
  copperring:
    "Copper Ring. Aumenta a duração dos Ritos de Julgamento em 1 segundo.",
  crimsonceremonybook:
    "Crimson Ceremony Book. Sobreviventes atingidos por Punição dos Condenados sofrem de Hemorragia e Dilaceração (Mangled) por 80 segundos.",
  deadbutterfly:
    "Dead Butterfly. Reduz o tempo de recuperação dos Ritos de Julgamento em 2 segundos.",
  forgottenvideotape:
    "Forgotten Videotape. Reduz o tempo de recuperação dos Ritos de Julgamento em 3 segundos.",
  iridescentsealofmetatron:
    "Iridescent Seal of Metatron. Ao enviar um Sobrevivente para uma Jaula de Expiação, a aura de todos os outros Sobreviventes sofrendo de Atormentamento é revelada por 6 segundos.",
  leadring:
    "Lead Ring. Aumenta a duração das Trilhas de Atormentamento no ambiente em 10 segundos.",
  leopardprintfabric:
    "Leopard-Print Fabric. Aumenta a duração do Instinto Assassino em 0.5 segundos.",
  lostmemoriesbook:
    "Lost Memories Book. Sobreviventes sofrem do status Alheio (Oblivious) por 15 segundos quando afetados por Atormentamento.",
  mannequinfoot:
    "Mannequin Foot. Aumenta a duração das Trilhas de Atormentamento no ambiente em 20 segundos.",
  mistydayremainsofjudgement:
    "Misty Day, Remains of Judgement. Aumenta a duração do Instinto Assassino em 1 segundo.",
  obsidiangoblet:
    "Obsidian Goblet. Concede o status Indetectável enquanto você estiver pisando em uma Trilha de Atormentamento.",
  rustcolouredegg:
    "Rust-Coloured Egg. Sobreviventes feridos sofrem do status Cegueira por 60 segundos quando afetados por Atormentamento.",
  scarletegg:
    "Scarlet Egg. Aumenta a duração do Instinto Assassino em 3 segundos.",
  spearhead:
    "Spearhead. Aumenta a duração dos Ritos de Julgamento em 1.5 segundos.",
  tabletoftheoppressor:
    "Tablet of the Oppressor. Aumenta a duração dos Ritos de Julgamento em 2 segundos.",
  valtielsectphotograph:
    "Valtiel Sect Photograph. Reduz o tempo de recuperação dos Ritos de Julgamento em 4 segundos.",
  waxdoll:
    "Wax Doll. Aumenta o alcance do ataque Punição dos Condenados em 1 metro.",

  // === ADD-ONS DA SINGULARIDADE (The Singularity) ===
  androidarm:
    "Android Arm. Aumenta a distância de propagação do Fluxo Temporal entre Sobreviventes em 2 metros. Aumenta a velocidade de propagação em 25%.",
  brokensecuritykey:
    "Broken Security Key. Reduz o tempo de reinicialização de Biopodes desativados em 15%.",
  crematedremains:
    "Cremated Remains. Sobreviventes afetados pelo Fluxo Temporal sofrem do status Cegueira.",
  crewmanifest:
    "Crew Manifest. A aura de um Sobrevivente com Fluxo infectando outro é revelada por 8 segundos. Aumenta a distância de propagação do Fluxo em 2 metros.",
  cryogel:
    "Cryo Gel. Sobreviventes com Fluxo atingidos por Ataque Básico sofrem de Hemorragia por 60 segundos.",
  deniedrequisitionform:
    "Denied Requisition Form. Todos os Sobreviventes começam a partida infectados com Fluxo Temporal. Aumenta o tempo de impressão do primeiro lote de EMPs em 30 segundos.",
  diagnostictoolconstruction:
    "Diagnostic Tool (Construction). A aura de Sobreviventes pegando um EMP é revelada a você por 8 segundos.",
  diagnostictoolrepair:
    "Diagnostic Tool (Repair). Aumenta o alcance de mira dos Biopodes em 4 metros.",
  foreignplantfibres:
    "Foreign Plant Fibres. Reduz a duração da penalidade de velocidade de movimento após ser atordoado por uma Palete durante o Modo Sobrecarga em 20%.",
  heavywater:
    "Heavy Water. Reduz o alcance de revelação de aura das Caixas de Suprimentos em 8 metros.",
  hologramgenerator:
    "Hologram Generator. Após teleportar para um Sobrevivente com Fluxo de um Biopode, ele sofre do status Alheio (Oblivious) por 60 segundos.",
  hyperawarenessspray:
    "Hyperawareness Spray. Faz com que todos os Sobreviventes com Fluxo ouçam um Raio de Terror falso próximo.",
  iridescentcrystalshard:
    "Iridescent Crystal Shard. A aura de Sobreviventes num raio de 10 metros de um Biopode recém-colocado é revelada por 6 segundos.",
  kidsballglove:
    "Kid's Ball Glove. Aumenta a duração do Modo Sobrecarga em 8%.",
  livewires:
    "Live Wires. Faz com que Sobreviventes gritem e interrompam a interação atual após removerem o Fluxo Temporal.",
  nanomachinegel:
    "Nanomachine Gel. Reduz o tempo de recarga dos Biopodes após marcar um Sobrevivente com Fluxo Temporal em 15%.",
  nutritionalslurry:
    "Nutritional Slurry. Aumenta o número de Biopodes carregados em 2.",
  somafamilyphoto:
    "Soma Family Photo. Infligir Fluxo Temporal de um Biopode aplica 3% de Lentidão por 3 segundos. Se ferido, o Sobrevivente sofre Ferida Profunda.",
  spentoxygentank:
    "Spent Oxygen Tank. Sobreviventes com Fluxo Temporal sofrem do status Exaustão por 6 segundos.",
  ultrasonicsensor:
    "Ultrasonic Sensor. Sair de um Biopode dentro de 2s após afligir um Sobrevivente com Fluxo reduz seu Raio de Terror em 12 metros por 12 segundos.",

  // === ADD-ONS DA SKULL MERCHANT (A Negociante de Crânios) ===
  adaptivelighting:
    "Iluminação Ajustável. Reduz a duração do efeito Indetectável em 10%. Aumenta a duração do efeito Celeridade em 10%.",
  adivalenteissue1:
    "Adi Valente Nº 1. Atingir um Sobrevivente dentro da Zona Ativa de um Drone inflige o status Cegueira por 60 segundos.",
  advancedmovementprediction:
    "Predição de Movimento Avançada. Revela a aura de Sobreviventes com uma Armadilha de Garra por 6 segundos quando realizam um salto rápido.",
  brownnoisegenerator:
    "Gerador de Ruído Marrom. Sobreviventes com uma Armadilha de Garra sofrem do status Alheio (Oblivious) a menos que estejam sendo perseguidos.",
  expiredbatteries:
    "Baterias Expiradas. Sobreviventes com uma Armadilha de Garra sofrem do status Lentidão em 5% adicionais, mas a duração da bateria da armadilha é reduzida em 50%.",
  geographicalreadout:
    "Leitura Geográfica. Aumenta a velocidade de quebrar Paletes/Paredes e danificar Geradores em 20% enquanto você tem um Drone implantado.",
  highcurrentupgrade:
    "Melhoria de Alta Corrente. Aumenta a duração da revelação de auras no Radar em 1 segundo.",
  highpowerfloodlight:
    "Holofote de Alta Potência. Sobreviventes que entram na Zona Ativa de um Drone sofrem do status Cegueira por 60 segundos.",
  infraredupgrade:
    "Melhoria de Infravermelho. Ao verificar o Radar, revela a aura de Sobreviventes detectados por 4 segundos.",
  iridescentunpublishedmanuscript:
    "Manuscrito Não Publicado Iridescente. Drones ganham um Raio de Terror de 32m. Ao desativar um drone, você ganha o status Indetectável por 15 segundos.",
  loosescrew:
    "Parafuso Solto. Sobreviventes escaneados por um Drone sofrem do status Exaustão por 6 segundos.",
  lowpowermode:
    "Modo de Economia de Energia. Reduz o tempo de recarga da Ordem de Drone em 25%.",
  powderedglass:
    "Vidro Moído. Sobreviventes escaneados por um Drone sofrem do status Dilacerado e Hemorragia por 70 segundos.",
  prototyperotor:
    "Protótipo de Rotor. Aumenta a velocidade de rotação dos Drones em 10%.",
  randomisedstrobes:
    "Estroboscópios Randomizados. Aumenta a duração do efeito de Lentidão ao ser escaneado em 1 segundo.",
  shotgunspeakers:
    "Auto-Falantes Shotgun. Sobreviventes com uma Armadilha de Garra não recebem o aviso sonoro antes de Testes de Perícia.",
  stereoremotemic:
    "Microfone Remoto Estéreo. Reduz a duração do estado desativado dos Drones em 25%.",
  supercharge:
    "Supercarga. Aumenta a duração da bateria da Armadilha de Garra em 15%.",
  ultrasonicspeaker:
    "Auto-Falante Ultrassônico. Reduz a duração do efeito Indetectável em 50%. Aumenta a velocidade de quebrar/danificar em 40%.",
  vitaltargetingprocesser:
    "Processador de Mira Vital. Aumenta o efeito de Lentidão (Hindered) aplicado por Armadilhas de Garra em 3%.",

  // === ADD-ONS DA SPIRIT (A Espírito) ===
  driedcherryblossom:
    "Dried Cherry Blossom. Sobreviventes num raio de 3 metros de você durante a Locomoção ativam o Instinto Assassino. Marcas de Arranhão não são mais visíveis durante a Locomoção.",
  furin:
    "Furin. Faz com que todos os Sobreviventes ouçam o som da Locomoção Espiritual (Phase-Walk), independentemente da distância.",
  giftedbamboocomb:
    "Gifted Bamboo Comb. Aumenta a velocidade de carregamento da Assombração de Yamaoka em 15%.",
  juniperbonsai:
    "Juniper Bonsai. Reduz o tempo de recarga do Faseamento Passivo em 1 segundo. Aumenta a duração do Faseamento Passivo em 50%.",
  kaiuntalisman:
    "Kaiun Talisman. Aumenta a duração da Locomoção Espiritual em 1 segundo.",
  katanatsuba:
    "Katana Tsuba. Estende a duração da invisibilidade ao reaparecer da Locomoção em 0.2s. Aumenta a velocidade de movimento ao reaparecer em 5%.",
  kintsugiteacup:
    "Kintsugi Teacup. Recarrega instantaneamente a Assombração de Yamaoka após quebrar uma Parede ou Palete.",
  motherdaughterring:
    "Mother-Daughter Ring. Aumenta sua velocidade de movimento durante a Locomoção Espiritual em 25%. Marcas de Arranhão não são mais visíveis durante a Locomoção.",
  mothersglasses:
    "Mother's Glasses. Sobreviventes que chegam a 2 metros da Casca (Husk) durante a Locomoção ativam o Instinto Assassino.",
  muddysportsdaycap:
    "Muddy Sports Day Cap. Aumenta sua velocidade de movimento durante a Locomoção Espiritual em 10%.",
  origamicrane:
    "Origami Crane. Aumenta a taxa de recarga da Assombração de Yamaoka em 20%.",
  rinsbrokenwatch:
    "Rin's Broken Watch. Aumenta a taxa de recarga da Assombração de Yamaoka em 30%.",
  rustyflute:
    "Rusty Flute. Aumenta a taxa de recarga da Assombração de Yamaoka em 40%.",
  senkohanabi:
    "Senko Hanabi. A Casca explode ao encerrar a Locomoção, bloqueando locais de Pulo num raio de 4 metros por 5 segundos.",
  shiawaseamulet:
    "Shiawase Amulet. Aumenta a duração da Locomoção Espiritual em 0.5 segundos.",
  uchiwa:
    "Uchiwa. Recarrega instantaneamente a Assombração de Yamaoka após ser atordoada por uma Palete.",
  wakizashisaya:
    "Wakizashi Saya. Permite pressionar o botão de Habilidade Ativa durante a Locomoção para retornar instantaneamente à localização da Casca.",
  whitehairribbon:
    "White Hair Ribbon. Aumenta a velocidade de carregamento da Assombração de Yamaoka em 20%.",
  yakuyokeamulet:
    "Yakuyoke Amulet. Aumenta a duração da Locomoção Espiritual em 3.5 segundos. Reduz sua velocidade de movimento durante a Locomoção em 15%.",
  zori: "Zōri. Aumenta sua velocidade de movimento durante a Locomoção Espiritual em 5%.",

  // === ADD-ONS DO SPRINGTRAP (William Afton) ===
  accesspanel:
    "Access Panel. O Machado de Incêndio pode viajar através de Portas de Segurança e sair pela porta conectada. Sobreviventes a 4m da porta ativam Instinto Assassino.",
  bonniesguitarstrings:
    "Bonnie's Guitar Strings. Revela a aura da intensidade dos geradores enquanto viaja entre Portas. Remove instantaneamente o efeito Indetectável ao sair de uma porta.",
  celebrateposter:
    "Celebrate! Poster. Concede 12% de Celeridade e 20% de velocidade de Pulo se estiver num raio de 32m de um Sobrevivente com o machado cravado.",
  chicasbib:
    "Chica's Bib. Sobreviventes sofrem do status Exaustão enquanto estiverem dentro da Área de Efeito do machado. O efeito persiste por 5 segundos ao sair.",
  endocpu:
    "Endo CPU. Aumenta a velocidade de quebrar Paletes/Paredes e danificar Geradores em 40% enquanto estiver na Área de Efeito. O efeito persiste por 5 segundos.",
  fazcoin:
    "Faz-Coin. O Machado de Incêndio emite um Raio de Terror de 24m. Concede o status Indetectável por 10 segundos ao arremessar o machado.",
  foxyshook:
    "Foxy's Hook. Concede 7% de Celeridade (Haste) enquanto estiver dentro da Área de Efeito do machado. O efeito persiste por 6 segundos.",
  freddyshat:
    "Freddy's Hat. Aumenta o peso do Machado de Incêndio em 100%, modificando sua trajetória balística.",
  greasypaperplate:
    "Greasy Paper Plate. Aumenta o tempo necessário para o Sobrevivente remover o machado cravado em 15%.",
  helpwantedad:
    "Help Wanted Ad. Exibe a trajetória inicial de arremesso do Machado de Incêndio enquanto você prepara o ataque.",
  iridescentremnant:
    "Iridescent Remnant. Ao viajar por uma Porta de Segurança, bloqueia todas as Paletes em pé num raio de 32m da porta de destino por 12 segundos.",
  lootbag:
    "Loot Bag. Bloqueia os Portões de Saída para o Sobrevivente com o machado cravado e para qualquer outro sobrevivente num raio de 12m dele.",
  officephone:
    "Office Phone. Se estiver a 24m do Sobrevivente com machado: revela a aura do machado e causa Alheio (Oblivious). Se o alvo estiver ferido, causa Quebrado (Broken).",
  partyhat:
    "Party Hat. Aumenta o tamanho máximo da Área de Efeito em 250% e o tempo de expansão em 2.5s. Reduz a duração da área em 20%.",
  purpleguydrawing:
    "Purple Guy Drawing. A aura do Sobrevivente com machado é revelada por 3s se ele fizer uma ação rápida. Revela a aura por 6s após remover o machado.",
  restaurantmenu:
    "Restaurant Menu. Reduz o tempo mínimo de recuperação do Machado de Incêndio no ambiente em 20%.",
  rippedcurtain:
    "Ripped Curtain. Sobreviventes atingidos pelo Machado sofrem de Hemorragia e Dilaceração (Mangled) por 60 segundos.",
  rottenpizza:
    "Rotten Pizza. Aumenta a duração do Instinto Assassino causado pelo Machado de Incêndio em 100%.",
  securityguardsbadge:
    "Security Guard's Badge. Aumenta a duração do efeito Indetectável em 25% (totalizando 25s) após sair de uma Porta de Segurança.",
  streamers:
    "Streamers. Aumenta sua velocidade de movimento enquanto viaja através das Portas de Segurança em 15%.",

  // === ADD-ONS DO TRAPPER (O Caçador) ===
  "4coilspringkit":
    "4-Coil Spring Kit. Aumenta o tempo de Desarme da Armadilha de Urso em 33%.",
  bearoil: "Bear Oil. Colocar uma Armadilha de Urso é silencioso.",
  bloodycoil:
    "Bloody Coil. Quando um Sobrevivente saudável desarma uma Armadilha, a Mola Sangrenta cobra seu preço, colocando o Sobrevivente no estado Ferido.",
  coffeegrounds:
    "Coffee Grounds. Aumenta a força do efeito de Celeridade (Haste) após colocar uma armadilha em 5%.",
  fasteningtools:
    "Fastening Tools. Aumenta os tempos de Resgate e Fuga da Armadilha em 25%. Aumenta a velocidade de armar a Armadilha em 50%.",
  honingstone:
    "Honing Stone. Sobreviventes presos na Armadilha que se libertarem sozinhos entram no Estado Agonizante.",
  iridescentstone:
    "Iridescent Stone. Rearma automaticamente uma Armadilha desarmada aleatória a cada 30 segundos.",
  lengthenedjaws:
    "Lengthened Jaws. Sobreviventes que escapam da Armadilha sofrem de Ferida Profunda.",
  makeshiftwrap:
    "Makeshift Wrap. Você não fica mais preso em suas próprias Armadilhas; elas são desarmadas automaticamente ao passar por cima.",
  oilycoil:
    "Oily Coil. Ao redefinir (resetar) uma Armadilha, revela a aura do último Sobrevivente a desarmá-la por 5 segundos.",
  rustedjaws:
    "Rusted Jaws. Sobreviventes feridos pela Armadilha sofrem do status Dilacerado (Mangled) por 70 segundos.",
  secondarycoil:
    "Secondary Coil. Aumenta o tempo de Desarme da Armadilha em 50%.",
  serratedjaws:
    "Serrated Jaws. Sobreviventes feridos pela Armadilha sofrem de Hemorragia até serem curados.",
  tarbottle:
    "Tar Bottle. Escurece a Armadilha de Urso, tornando-a mais difícil de ver.",
  tensionspring:
    "Tension Spring. A Armadilha se reabre automaticamente 2 segundos após um Sobrevivente escapar dela.",
  trapperbag: "Trapper Bag. Aumenta o número de Armadilhas carregadas em +1.",
  trappergloves:
    "Trapper Gloves. Aumenta a velocidade de armar a Armadilha em 30%.",
  trappersack:
    "Trapper Sack. Você começa com todas as Armadilhas no inventário. Você não pode mais pegar Armadilhas do chão (apenas rearmá-las).",
  waxbrick:
    "Wax Brick. Aumenta os tempos de Resgate e Fuga da Armadilha em 33%.",

  // === ADD-ONS DO TRICKSTER (O Trapaça) ===
  bloodyboa: "Bloody Boa. Aumenta o número de Lâminas carregadas em +8.",
  cagedheartshoes:
    "Caged Heart Shoes. Aumenta sua velocidade de movimento no Estado de Arremesso em 0.1 m/s.",
  cutthruusingle:
    "Cut Thru U Single. Lâminas perfuram o primeiro Sobrevivente atingido e continuam viajando. O segundo Sobrevivente atingido recebe apenas 0.5 Cargas no Medidor de Laceração.",
  deaththroescompilation:
    "Death Throes Compilation. A aura de Sobreviventes atingidos durante o Evento Principal é revelada a você por 6 segundos.",
  diamondcufflinks:
    "Diamond Cufflinks. Auras de Sobreviventes que estão a um acerto da Laceração máxima são reveladas a você por 6 segundos.",
  edgeofrevivalalbum:
    "Edge of Revival Album. Lâminas se estilhaçam ao atingir o ambiente, adicionando 0.5 Cargas de Laceração aos Sobreviventes próximos.",
  fizzspinsoda:
    "Fizz-Spin Soda. Aumenta o tempo antes que um Combo termine durante o Evento Principal em 15%.",
  infernowires: "Inferno Wires. Aumenta a duração do Evento Principal em 40%.",
  iridescentphotocard:
    "Iridescent Photocard. Ganha 1% de Celeridade acumulável (até 7%) para cada acerto consecutivo de Lâmina. O efeito é perdido ao errar uma Lâmina ou danificar um Sobrevivente.",
  jiwoonsautograph:
    "Ji-Woon's Autograph. Aumenta o tempo antes que um Combo termine durante o Evento Principal em 10%.",
  killingpartchords:
    "Killing Part Chords. Aumenta sua velocidade de movimento no Estado de Arremesso em 0.04 m/s.",
  luckyblade:
    "Lucky Blade. Aumenta a duração do Evento Principal em 0.3 segundos para cada Acerto de Lâmina bem-sucedido.",
  melodiousmurder:
    "Melodious Murder. Reduz o tempo de Recarga em Armários em 20%.",
  mementoblades:
    "Memento Blades. Aumenta a taxa de arremesso de Lâminas em 10%.",
  ontargetsingle:
    "On Target Single. Aumenta o tempo que leva para o Medidor de Laceração começar a decair em 2 segundos.",
  ripperbrace:
    "Ripper Brace. Aumenta o tempo que leva para o Medidor de Laceração começar a decair em 3 segundos.",
  tequilamoonrock:
    "Tequila Moonrock. Aumenta a duração do Evento Principal em 60%.",
  trickblades:
    "Trick Blades. Faz com que as Lâminas ricocheteiem no ambiente até 2 vezes.",
  trickpouch: "Trick Pouch. Aumenta o número de Lâminas carregadas em +4.",
  waitingforyouwatch:
    "Waiting For You Watch. Aumenta a duração do Evento Principal em 0.4 segundos para cada Acerto de Lâmina bem-sucedido.",

  // === ADD-ONS DOS TWINS (Os Gêmeos) ===
  babyteeth:
    "Baby Teeth. Sobreviventes sofrem do status Cegueira por 30 segundos após removerem Victor.",
  bloodyblackhood:
    "Bloody Black Hood. Reduz o tempo de transição ao trocar de volta para a Charlotte em 0.5 segundos.",
  catfigurine:
    "Cat Figurine. Permite ver o local alvo do Bote (Pounce) enquanto carrega o ataque.",
  catseye:
    "Cat's Eye. Suprime todos os ruídos feitos pelo Victor enquanto segura o carregamento de um Bote.",
  ceremonialcandelabrum:
    "Ceremonial Candelabrum. Aumenta o tempo necessário para Esmagar o Victor em 0.2 segundos enquanto controla a Charlotte.",
  dropofperfume:
    "Drop of Perfume. Sobreviventes sofrem do status Alheio (Oblivious) quando estão dentro do alcance do Grito do Victor enquanto você controla a Charlotte.",
  foreststew:
    "Forest Stew. Aumenta sua velocidade de movimento enquanto controla o Victor em 0.6 m/s.",
  iridescentpendant:
    "Iridescent Pendant. Se um Sobrevivente esmagar o Victor enquanto a Charlotte está no controle, ele sofre do status Exposto por 45 segundos.",
  madeleinesglove:
    "Madeleine's Glove. Aumenta o raio do Grito do Victor em 4 metros.",
  madeleinesscarf:
    "Madeleine's Scarf. Aumenta sua velocidade de movimento enquanto controla o Victor em 0.3 m/s.",
  rustedneedle:
    "Rusted Needle. Remover um Victor agarrado faz com que o Sobrevivente sofra de Hemorragia até ser totalmente curado.",
  sewersludge:
    "Sewer Sludge. Aumenta o tempo necessário para remover um Victor agarrado em 2 segundos.",
  silencingcloth:
    "Silencing Cloth. Após acordar do Estado Adormecido, Charlotte ganha o status Indetectável por 20 segundos.",
  souredmilk: "Soured Milk. Aumenta o raio do Grito do Victor em 2 metros.",
  spinningtop:
    "Spinning Top. Sobreviventes atingidos por um Bote derrubam o item que estão segurando.",
  stalebiscuit:
    "Stale Biscuit. Reduz o tempo de recarga de um Bote em 0.4 segundos.",
  tinyfingernail:
    "Tiny Fingernail. Reduz o tempo de Desprendimento do Victor em 0.25 segundos.",
  toysword: "Toy Sword. Reduz o tempo de carregamento do Bote em 0.1 segundo.",
  victorssoldier:
    "Victor's Soldier. A aura de Sobreviventes é revelada a você por 6 segundos após eles esmagarem o Victor (enquanto você controla a Charlotte).",
  weightyrattle:
    "Weighty Rattle. Remover um Victor agarrado faz com que o Sobrevivente sofra do status Quebrado (Broken) por 20 segundos.",

  // === ADD-ONS DO UNKNOWN (O Desconhecido) ===
  blurryphoto:
    "Blurry Photo. Após Teleportar, você recupera sua velocidade total de movimento 15% mais rápido.",
  bmovieposter:
    "B-Movie Poster. Sobreviventes danificados pelo UVX sofrem do status Quebrado (Broken) por 30 segundos.",
  capturedbythedark:
    "Captured by the Dark. Todos os Sobreviventes começam a partida no estado Enfraquecido. Reduz o número máximo de Alucinações coexistentes em 1.",
  deviceofundisclosedorigin:
    "Device of Undisclosed Origin. Sobreviventes entrando no alcance da aura de uma Alucinação sofrem do status Alheio (Oblivious).",
  discardedmilkcarton:
    "Discarded Milk Carton. Aumenta a força do Quique dos Projéteis UVX: aumenta o quique em 8% e reduz a fricção em 15%.",
  footprintcast:
    "Footprint Cast. Reduz o tempo de surgimento da próxima Alucinação em 15 segundos quando um Sobrevivente se torna Enfraquecido.",
  frontpagearticle:
    "Front-Page Article. Reduz o tempo de surgimento da próxima Alucinação em 50% após quebrar uma Parede ou Palete.",
  homemademask:
    "Homemade Mask. Sobreviventes que dissipam uma Alucinação com sucesso sofrem do status Cegueira por 60 segundos.",
  hypnotistswatch:
    "Hypnotist's Watch. Sobreviventes atingidos por um Projétil UVX no ar sofrem do status Exaustão por 10 segundos.",
  iridescentossreport:
    "Iridescent OSS Report. Reduz o tempo de recarga do Teleporte em 5 segundos. Aumenta o tempo de duração da Isca (Decoy) em 10s. Iscas ganham Raio de Terror e Mancha Vermelha.",
  lastknownrecording:
    "Last Known Recording. Reduz o alcance da aura das Alucinações em 25%.",
  notebookoftheories:
    "Notebook of Theories. Aumenta a duração do status Lentidão (Hindered) em 2 segundos para Sobreviventes atingidos por um Projétil UVX no ar.",
  obscuregamecartridge:
    "Obscure Game Cartridge. Aumenta a velocidade de quebrar Paredes/Paletes, danificar Geradores e pular Janelas em 30% por 20s após Teleportar.",
  puncturedeyeball:
    "Punctured Eyeball. Sobreviventes que dissipam uma Alucinação enquanto estão Feridos e Enfraquecidos sofrem do status Ferida Profunda.",
  rabbitsfoot:
    "Rabbit's Foot. Poças de Sangue ficam vermelho vivo enquanto carrega o UVX. Sobreviventes danificados pelo UVX sofrem de Hemorragia por 30 segundos.",
  serumvial:
    "Serum Vial. Sobreviventes entrando no alcance da aura de uma Alucinação sofrem do status Exaustão por 10 segundos.",
  sketchattempt:
    "Sketch Attempt. Sobreviventes atingidos pela Área de Explosão do UVX sofrem do status Alheio (Oblivious) por 20 segundos.",
  slashedbackpack:
    "Slashed Backpack. Atingir uma Alucinação com UVX cria uma Área de Explosão e destrói a alucinação. Reduz o tempo de respawn da próxima Alucinação em 75% após destruir uma desta forma.",
  vanishingbox:
    "Vanishing Box. Sobreviventes que completam um Gerador tornam-se Enfraquecidos. Aumenta o tempo de surgimento de Alucinações em 80%.",
  victimsmap:
    "Victim's Map. Sobreviventes que realizam com sucesso a ação de Encarar o Desconhecido ativam o Instinto Assassino por 3 segundos.",

  // === ADD-ONS DO LICH (Vecna) ===
  bagofholding:
    "Bag of Holding. 2 Baús do Tesouro têm garantia de rolar um 1 no Dado. Abrir Baús causa o status Alheio (Oblivious) por 15 segundos.",
  bootsofspeed:
    "Boots of Speed. O Feitiço Mão do Mago concede 5% de Celeridade (Haste) por 2 segundos.",
  cloakofelvenkind:
    "Cloak of Elvenkind. Reduz o Raio de Terror em 8 metros enquanto o Feitiço Voo está ativo. O efeito persiste por 6 segundos.",
  cloakofinvisibility:
    "Cloak of Invisibility. Concede o status Indetectável por 10 segundos quando todos os Feitiços estão em tempo de recarga.",
  crystalball:
    "Crystal Ball. Aumenta a duração do Instinto Assassino em 3 segundos após um Sobrevivente ser revelado pela Esfera de Dissipação.",
  dragontoothdagger:
    "Dragontooth Dagger. Atingir Sobreviventes segurando um Item Mágico com um Ataque Básico causa Hemorragia e Dilaceração por 45 segundos.",
  glasseye:
    "Glass Eye. Aumenta o raio da Esfera de Dissipação em 2 metros. Aumenta a velocidade de movimento da Esfera em 10%.",
  iridescentbookofviledarkness:
    "Iridescent Book of Vile Darkness. Usar Voo através de uma Janela a bloqueia por 45s. Reduz a altura das Entidades Voadoras em 0.7m (atinge agachados). Reduz o número de Entidades em 3.",
  lanternofrevealing:
    "Lantern of Revealing. As auras de Sobreviventes que escaparam por pouco das Entidades Voadoras do Voo dos Condenados são reveladas por 3 segundos.",
  ornatehorn:
    "Ornate Horn. Aumenta o número de Entidades Voadoras invocadas pelo Voo dos Condenados em +1.",
  pearlofpower:
    "Pearl of Power. Reduz o tempo de recarga atual de todos os Feitiços em 5 segundos após um Ataque Básico bem-sucedido.",
  potionofspeed:
    "Potion of Speed. Reduz o tempo de recarga de interação após conjurar o Feitiço Voo em 0.35 segundos.",
  ravensfeather:
    "Raven's Feather. Aumenta a duração do Feitiço Voo em 0.5 segundos.",
  ringofspellstoring:
    "Ring of Spell Storing. Reduz permanentemente o tempo de recarga de todos os Feitiços em 4 segundos.",
  ringoftelekinesis:
    "Ring of Telekinesis. Usar a Mão do Mago em uma Palete em pé aumenta sua velocidade de Pulo em 10% pelos próximos 8 segundos.",
  robeofeyes:
    "Robe of Eyes. As auras de Sobreviventes num raio de 8 metros de um Baú do Tesouro são reveladas a você por 3 segundos após conjurar um Feitiço.",
  staffofwithering:
    "Staff of Withering. Entrar no raio da Esfera de Dissipação faz com que os Sobreviventes sofram de Exaustão por 20 segundos.",
  tatteredheadband:
    "Tattered Headband. Aumenta o alcance de voo das Entidades Voadoras invocadas pelo Voo dos Condenados em 4 metros.",
  trickstersglove:
    "Trickster's Glove. Aumenta o tempo que uma Palete em pé é segurada pela Mão do Mago em 0.5 segundos.",
  vorpalsword:
    "Vorpal Sword. Entrar no raio da Esfera de Dissipação causa o status Quebrado por 30s. A Mão do Mago quebra Paletes derrubadas em vez de levantá-las (ação leva 4s para completar).",

  // === ADD-ONS DO MASTERMIND (Albert Wesker) ===
  bullhorn:
    "Bullhorn. Sobreviventes sofrem do status Alheio (Oblivious) por 30 segundos após usarem um Spray de Primeiros Socorros.",
  chalicegold:
    "Chalice (Gold). Aumenta a duração restante de uma Arremetida em 50% após colidir com um Sobrevivente.",
  darksunglasses:
    "Dark Sunglasses. Concede o status Indetectável por 20 segundos sempre que um Sobrevivente atinge a Infecção Crítica.",
  egggold:
    "Egg (Gold). Aumenta a duração da janela de oportunidade para a segunda Arremetida (Chain Bound) em 50%.",
  greenherb:
    "Green Herb. Aumenta a taxa de Infecção aplicada ao colidir com Sobreviventes durante uma Arremetida em 30%.",
  helicopterstick:
    "Helicopter Stick. A aura de Sobreviventes é revelada a você por 8 segundos após usarem um Spray de Primeiros Socorros.",
  iridescenturoborosvial:
    "Iridescent Uroboros Vial. Sobreviventes começam a partida infectados com Uroboros. Sobreviventes sofrem do status Exposto por 30 segundos ao atingir a Infecção Crítica.",
  jewelbeetle:
    "Jewel Beetle. Concede 100% de Pontos de Sangue bônus. Reduz a duração restante da Arremetida em 50% após colidir com um Sobrevivente.",
  labphoto:
    "Lab Photo. Permite quebrar Paredes ou Paletes colidindo com elas durante uma Arremetida. Remove a capacidade de pular Paletes usando o poder.",
  leathergloves: "Leather Gloves. Reduz o tempo de recarga do Poder em 10%.",
  lionmedallion:
    "Lion Medallion. Aumenta a distância de arremesso de Sobreviventes agarrados durante a Arremetida em 30%.",
  loosecrank:
    "Loose Crank. Aumenta sua velocidade de movimento durante a janela de oportunidade para a segunda Arremetida em 8%.",
  maidenmedallion:
    "Maiden Medallion. Sobreviventes sofrem do status Cegueira por 60 segundos ao atingir a Infecção Crítica.",
  portablesafe:
    "Portable Safe. Sobreviventes feridos pela Arremetida Virulenta sofrem de Hemorragia até serem totalmente curados.",
  redherb:
    "Red Herb. Aumenta o tempo necessário para usar o Spray de Primeiros Socorros em 2 segundos.",
  rpdshoulderwalkie:
    "R.P.D. Shoulder Walkie. Reduz a duração da primeira Arremetida em 20%. Aumenta a duração da segunda Arremetida em 20%.",
  unicommedallion:
    "Unicorn Medallion. Aumenta a duração da primeira Arremetida em 20%. Reduz a duração da segunda Arremetida em 20%.",
  uroborostendril:
    "Uroboros Tendril. Aumenta sua velocidade de movimento enquanto carrega a Arremetida Virulenta em 5%.",
  uroborosvirus:
    "Uroboros Virus. A aura de Sobreviventes é revelada a você por 4 segundos quando eles atingem a Infecção Crítica.",
  videoconferencedevice:
    "Video Conference Device. Reduz o tempo do cronômetro de Infecção passiva dos Sobreviventes em 30% (a infecção sobe mais rápido).",

  // === ADD-ONS DO WRAITH (O Espectro) ===
  allseeingblood:
    '"All Seeing" - Blood. Auras de Sobreviventes num raio de 8 metros são reveladas enquanto você está Camuflado.',
  allseeingspirit:
    '"All Seeing" - Spirit. Revela a intensidade da aura dos Geradores de acordo com o progresso de reparo enquanto Camuflado.',
  blindwarriormud:
    '"Blind Warrior" - Mud. Sobreviventes atingidos por um Ataque Surpresa sofrem do status Cegueira por 60 segundos.',
  blindwarriorwhite:
    '"Blind Warrior" - White. Sobreviventes atingidos por um Ataque Surpresa sofrem de Hemorragia e Dilaceração (Mangled) por 70 segundos.',
  blinkmud: '"Blink" - Mud. Reduz o tempo para se Camuflar em 40%.',
  blinkwhite: '"Blink" - White. Reduz o tempo para se Camuflar em 60%.',
  boneclapper:
    "Bone Clapper. Sobreviventes não conseguem distinguir a distância e a direção do som do Sino dos Lamentos.",
  coxcombedclapper:
    "Coxcombed Clapper. O Sino dos Lamentos torna-se completamente silencioso.",
  shadowdanceblood:
    '"Shadow Dance" - Blood. Aumenta a velocidade de pular janelas, quebrar paletes/paredes e danificar geradores em 60% enquanto Camuflado.',
  shadowdancewhite:
    '"Shadow Dance" - White. Aumenta a velocidade de pular janelas, quebrar paletes/paredes e danificar geradores em 40% enquanto Camuflado.',
  swifthuntblood:
    '"Swift Hunt" - Blood. Reduz o tempo para Descamuflar em 12%.',
  swifthuntmud: '"Swift Hunt" - Mud. Reduz o tempo para Descamuflar em 8%.',
  swifthuntwhite:
    '"Swift Hunt" - White. Reduz o tempo para Descamuflar em 10%.',
  thebeastsoot:
    '"The Beast" - Soot. Seu Raio de Terror não é mais suprimido enquanto camuflado. Concede 100% de Pontos de Sangue bônus em ações de Espreitar e Ataque Surpresa.',
  theghostsoot:
    '"The Ghost" - Soot. Seu Raio de Terror e Mancha Vermelha permanecem suprimidos por 6 segundos após descamuflar.',
  thehoundsoot:
    '"The Hound" - Soot. Poças de Sangue aparecem em vermelho vivo enquanto você está Camuflado.',
  theserpentsoot:
    '"The Serpent" - Soot. Quebrar Paredes, Paletes ou danificar Geradores faz com que você se descamufle automaticamente.',
  windstormblood:
    '"Windstorm" - Blood. Aumenta sua velocidade de movimento enquanto Camuflado em 9%.',
  windstormmud:
    '"Windstorm" - Mud. Aumenta sua velocidade de movimento enquanto Camuflado em 5%.',
  windstormwhite:
    '"Windstorm" - White. Aumenta sua velocidade de movimento enquanto Camuflado em 7%.',

  // === ADD-ONS DO XENOMORPH (O Xenomorfo) ===
  acidicblood:
    "Acidic Blood. Enquanto estiver no Modo Rastejador, ser atordoado até 20s após sair dos Túneis causa dano ao Sobrevivente (remove 1 estado de saúde ou aplica Ferida Profunda).",
  ashsinnards:
    "Ash's Innards. Aumenta o tempo de reaparecimento das Torretas de Chamas Remotas em 15 segundos.",
  brettscap:
    "Brett's Cap. Sempre que uma Torreta de Chamas Remota for destruída, causa Cegueira em todos os sobreviventes num raio de 16 metros por 25 segundos.",
  catcarrier:
    "Cat Carrier. Concede o status Indetectável por 30 segundos ao sair do Modo Rastejador (se estiver perto de uma Torreta).",
  cerealrations:
    "Cereal Rations. Ao estar dentro dos Túneis, as auras de Torretas de Chamas Remotas implantadas são reveladas a você por 3 segundos.",
  crewheadset:
    "Crew Headset. Aumenta o alcance de detecção de passos de sobreviventes dentro dos túneis em 6 metros.",
  drinkingbird:
    "Drinking Bird. Aumenta a duração do Instinto Assassino em 3 segundos após sair dos Túneis.",
  emergencyhelmet:
    "Emergency Helmet. Aumenta a resistência contra Torretas de Chamas Remotas antes de ser retirado do Modo Rastejador em 15%.",
  harpoongun:
    "Harpoon Gun. Acertar um Sobrevivente nos 30s seguintes à saída dos Túneis faz com que todos os outros a mais de 16m gritem e revelem sua localização.",
  improvisedcattleprod:
    "Improvised Cattle Prod. Quando um gerador é concluído, Sobreviventes a menos de 10m de uma Estação de Controle têm a aura revelada por 15 segundos.",
  kaneshelmet:
    "Kane's Helmet. Os sobreviventes atingidos por um Ataque de Cauda sofrem do efeito Dilacerado (Mangled) por 70 segundos.",
  lambertsstarmap:
    "Lambert's Star Map. Reduz o alcance de ataque das Torretas de Chamas Remotas em 2 metros.",
  lightwand:
    "Light Wand. Aumenta o tempo de inatividade temporário das Torres de Chamas Remotas em 3 segundos sempre que você sair dos túneis.",
  moultedskin:
    "Moulted Skin. Após implantar uma Torre de Chamas Remota, os sobreviventes sofrem de Exaustão por 30 segundos.",
  multipurposehatchet:
    "Multipurpose Hatchet. Os sobreviventes atingidos por um Ataque de Cauda sofrem de Hemorragia até a cura completa.",
  ovomorph:
    "Ovomorph. Aumenta a taxa de carregamento do Modo Rastejador em 25% quando fora dos túneis.",
  parkersheadband:
    "Parker's Headband. Concede 5% de Celeridade (Haste) por 3 segundos após sair dos túneis.",
  ripleyswatch:
    "Ripley's Watch. Faz com que Torretas de Chamas Remotas se autodestruam após te tirarem do Modo Rastejador.",
  elfdestructbolt:
    "Self-Destruct Bolt. Aumenta a velocidade de salto de janelas/paletes no Modo Rastejante em 30%.",
  semiotickeyboard:
    "Semiotic Keyboard. Sobreviventes num raio de 16m de uma Torreta veem a intensidade da aura dos Geradores revelando o progresso de reparo.",

  // === ADD-ONS DO VECNA (Stranger Things Concept) - ARQUIVOS RENOMEADOS ===
  beadmaze:
    "Bead Maze. A segunda fase do cronômetro do Quebra-Mundos (Worldbreaker) é aumentada em 3 segundos para cada Sobrevivente vivo.",
  blackwidowspider:
    "Black Widow Spider. A aura do Sobrevivente mais distante (a mais de 36 metros) é revelada a você por 3 segundos.",
  bloodyrollerskate:
    "Bloody Roller Skate. Concede 20% de Celeridade (Haste) por 2 segundos após usar o Ataque do Submundo (Undergate Attack).",
  brokenskateboard:
    "Broken Skateboard. Após a ativação do Quebra-Mundos, aumenta a velocidade de Pulo em 30% por 60 segundos.",
  chesspiece:
    "Chess Piece. O Ataque de Vinha ganha duas cargas, mas tem seu raio de ataque reduzido em 50%. Aumenta o tempo de recarga da habilidade Mundo Invertido em 15 segundos.",
  clockhands:
    "Clock Hands. Sobreviventes ganham o status Alheio (Oblivious) enquanto interagem com os Relógios de Pêndulo e por 12 segundos após a interação.",
  electrodecap:
    "Electrode Cap. No início da segunda fase do Quebra-Mundos, Sobreviventes a mais de 26 metros de distância têm suas auras reveladas por 6 segundos.",
  electroshockcollar:
    "Electroshock Collar. Ao sair do Mundo Invertido, todos os locais de Pulo num raio de 32 metros são bloqueados por 12 segundos.",
  forgeddeathcertificate:
    "Forged Death Certificate. Cada Ficha de Quebra-Mundos colocada em um Sobrevivente reduz seu Raio de Terror em 12 metros até a próxima ativação do Modo Quebra-Mundos.",
  guttedsupercom:
    "Gutted Supercom. A aura de um Sobrevivente atingido pelo Ataque de Vinha é revelada a você por 1.5 segundos.",
  iridescentsoteriachip:
    "Iridescent Soteria Chip. Ao ativar, concede Indetectável. Revela a aura de Sobreviventes com pelo menos uma Ficha num raio de 12m. Dura até realizar um ataque ou o poder acabar.",
  "mid-centuryradio":
    "Mid-Century Radio. Sobreviventes a mais de 32 metros de distância têm suas auras reveladas enquanto interagem com Relógios de Pêndulo.",
  necktendril:
    "Neck Tendril. Enquanto no modo Quebra-Mundos, Sobreviventes atingidos pelo Ataque de Vinha sofrem de Hemorragia e Dilaceração (Mangled) por 70 segundos.",
  orderlyid:
    "Orderly ID. Enquanto não estiver no modo Quebra-Mundos, o alcance de mira do Ataque de Vinha é aumentado em 2 metros.",
  pizzagoggles:
    "Pizza Goggles. A área de alcance do efeito do Ataque do Submundo é reduzida em 90%, e seu tempo de recarga é reduzido em 20 segundos.",
  rabbitremains:
    "Rabbit Remains. Sobreviventes que estiverem ou entrarem na área de efeito do Ataque do Submundo ganham o status Exaustão por 20 segundos.",
  shatteredwristrocket:
    "Shattered Wrist Rocket. A explosão do Ataque do Submundo (Undergate) quebra Paletes instantaneamente e danifica Geradores.",
  smashedcassettedeck:
    "Smashed Cassette Deck. Todos os Sobreviventes começam com uma ficha. Quando o poder ativa pela primeira vez, eles perdem a ficha. 1 Relógio a menos aparece no mapa.",
  stainedglassmural:
    "Stained Glass Mural. Enquanto estiver em recarga, quebrar Paletes e Paredes Quebráveis diminui o tempo de recarga em 12 segundos.",
  victorsrazorblade:
    "Victor's Razor Blade. Ao final do Quebra-Mundos, Sobreviventes feridos ganham o status Quebrado (Broken) por 20 segundos.",
};

const survivorAddonFiles = {
  Flashlight: [
    "IconAddon_battery.png",
    "IconAddon_focusLens.png",
    "IconAddon_heavyDutyBattery.png",
    "IconAddon_high-EndSapphireLens.png",
    "IconAddon_intenseHalogen.png",
    "IconAddon_leatherGrip.png",
    "IconAddon_longLifeBattery.png",
    "IconAddon_lowAmpFilament.png",
    "IconAddon_oddBulb.png",
    "IconAddon_powerBulb.png",
    "IconAddon_rubberGrip.png",
    "IconAddon_tirOptic.png",
    "IconAddon_wideLens.png",
  ],

  Medkit: [
    "IconAddon_abdominalDressing.png",
    "IconAddon_bandages.png",
    "IconAddon_butterflyTape.png",
    "IconAddon_gelDressings.png",
    "IconAddon_selfAdherentWrap.png",
    "IconAddon_sponge.png",
    "IconAddon_stypticAgent.png",
    "IconAddon_surgicalSuture.png",
    "iconAddon_syringe.png",
    "iconAddon_scissors.png",
    "iconAddon_gauseRoll.png",
    "iconAddon_gloves.png",
    "iconAddon_needAndThread.png",
  ],

  Toolbox: [
    "IconAddon_brandNewPart.png",
    "IconAddon_cleanRag.png",
    "IconAddon_cuttingWire.png",
    "IconAddon_gripWrench.png",
    "IconAddon_instructions.png",
    "iconAddon_metalSaw.png",
    "IconAddon_protectiveGloves.png",
    "IconAddon_scraps.png",
    "IconAddon_socketSwivels.png",
    "iconAddon_spoolOfWire.png",
    "IconAddon_springClamp.png",
  ],

  Map: [
    "IconAddon_blackSilkCord.png",
    "IconAddon_crystalBead.png",
    "IconAddon_glassBead.png",
    "IconAddon_mapAddendum.png",
    "IconAddon_oddStamp.png",
    "IconAddon_redTwine.png",
    "IconAddon_retardantJelly.png",
    "IconAddon_unusualStamp.png",
    "IconAddon_yellowWire.png",
  ],

  Key: [
    "IconAddon_erodedToken.png",
    "IconAddon_goldToken.png",
    "IconAddon_prayerBeads.png",
    "IconAddon_prayerRope.png",
    "IconAddon_scratchedPearl.png",
    "IconAddon_bloodAmber.png",
    "IconAddon_milkyGlass.png",
    "IconAddon_uniqueWeddingRing.png",
    "IconAddon_weavedRing.png",
  ],
};

const killerAddonFiles = {
  Artista: [
    "automaticdrawing.png",
    "charcoalstick.png",
    "choclocorn.png",
    "darkestink.png",
    "festeringcarrion.png",
    "gardenofrot.png",
    "inkegg.png",
    "iridescentfeather.png",
    "matiasbabyshoes.png",
    "ogriefolover.png",
    "oilpaints.png",
    "severedhands.png",
    "severedtongue.png",
    "silverbell.png",
    "stilllifecrow.png",
    "thicktar.png",
    "thornynest.png",
    "untitledagony.png",
    "velvetfabric.png",
    "vibrantobituary.png",
  ],

  Blight: [
    "adrenalinevial.png",
    "alchemistsring.png",
    "blightedcrow.png",
    "blightedrat.png",
    "cankerthorn.png",
    "chippedmonocle.png",
    "compoundseven.png",
    "compoundthirtythree.png",
    "compoundtwentyone.png",
    "foxglove.png",
    "iridescentblighttag.png",
    "placebotablet.png",
    "plaguebile.png",
    "pustuladust.png",
    "rosetonic.png",
    "shreddednotes.png",
    "soulchemical.png",
    "summoningstone.png",
    "umbrasalts.png",
    "vigosjournal.png",
  ],

  Chucky: [
    "automaticscrewdriver.png",
    "dolleyes.png",
    "electriccarvingknife.png",
    "goodguybox.png",
    "hairspraycandle.png",
    "hardhat.png",
    "iridescentamulet.png",
    "jumprope.png",
    "mirrorshards.png",
    "pileofnails.png",
    "plasticbag.png",
    "portabletv.png",
    "powerdrill.png",
    "ratpoison.png",
    "runningshoes.png",
    "silkpillow.png",
    "straightrazor.png",
    "strobinglight.png",
    "tinyscalpel.png",
    "yardstick.png",
  ],

  Clow: [
    "bottleofchloroform.png",
    "cheapginbottle.png",
    "cigarbox.png",
    "ether15vol.png",
    "fingerlessparadegloves.png",
    "flaskofbleach.png",
    "garishmakeupkit.png",
    "kerosenecan.png",
    "partybottle.png",
    "redheadspinkiefinger.png",
    "robinfeather.png",
    "smellyinnersoles.png",
    "solventjug.png",
    "spiritofhartshorn.png",
    "starlingfeather.png",
    "stickysodabottle.png",
    "sulphuricacidvial.png",
    "tattoosmiddlefinger.png",
    "thickcorkstopper.png",
    "vhsporn.png",
  ],

  Deathslinger: [
    "barbedwire.png",
    "bayshorescigar.png",
    "bayshoresgoldtooth.png",
    "chewingtobacco.png",
    "goldcreekwhiskey.png",
    "hellshireiron.png",
    "honeylocustthorn.png",
    "iridescentcoin.png",
    "jawsmasher.png",
    "marshalsbadge.png",
    "modifiedammobelt.png",
    "poisonoakleaves.png",
    "prisonchain.png",
    "ricketychain.png",
    "rustedspike.png",
    "snakeoil.png",
    "spitpolishrag.png",
    "tinoilcan.png",
    "wantedposter.png",
    "wardenskeys.png",
  ],

  Demogorgon: [
    "barbsglasses.png",
    "blackheart.png",
    "brasscaselighter.png",
    "deerlung.png",
    "elevenssoda.png",
    "leproselichen.png",
    "lifeguardwhistle.png",
    "mewsguts.png",
    "ratliver.png",
    "rattail.png",
    "redmoss.png",
    "rottengreentripe.png",
    "rottenpumpkin.png",
    "stickylining.png",
    "thornyvines.png",
    "unknownegg.png",
    "upsidedownresin.png",
    "vermilionwebcap.png",
    "violetwaxcap.png",
    "viscouswebbing.png",
  ],

  Doctor: [
    "calmcartersnotes.png",
    "calmclassi.png",
    "calmclassii.png",
    "disciplinecartersnotes.png",
    "disciplineclassii.png",
    "disciplineclassiii.png",
    "highstimuluselectrode.png",
    "interviewtape.png",
    "iridescentking.png",
    "iridescentqueen.png",
    "mapleknight.png",
    "mouldyelectrode.png",
    "ordercartersnotes.png",
    "orderclassi.png",
    "orderclassii.png",
    "polishedelectrode.png",
    "restraintcartersnotes.png",
    "restraintclassii.png",
    "restraintclassiii.png",
    "scrappedtape.png",
  ],

  Drácula: [
    "alucardsshield.png",
    "bloodfilledgoblet.png",
    "cerberustalon.png",
    "clocktowergear.png",
    "cubeofzoe.png",
    "forceofecho.png",
    "iridescentringofvlad.png",
    "killerdoll.png",
    "lapislazuli.png",
    "magicalticket.png",
    "medusashair.png",
    "moonstonenecklace.png",
    "pocketwatch.png",
    "rubycirclet.png",
    "sunglasses.png",
    "sylphfeather.png",
    "travellershat.png",
    "wargsfang.png",
    "whitewolfmedallion.png",
    "wingedboots.png",
  ],

  Draga: [
    "airfreshener.png",
    "boatkey.png",
    "brokendoll.png",
    "burntletters.png",
    "caffeinetablets.png",
    "destroyedpillow.png",
    "fallenshingle.png",
    "fieldrecorder.png",
    "followerscowl.png",
    "haddiescalendar.png",
    "iridescentwoodenplank.png",
    "lavaliermicrophone.png",
    "malthinkersskull.png",
    "mortarandpestle.png",
    "ottomarianwriting.png",
    "sacrificialknife.png",
    "tillingblade.png",
    "warhelmet.png",
    "woodenplank.png",
    "worrystone.png",
  ],

  Freddy: [
    "blackbox.png",
    "bluedress.png",
    "catblock.png",
    "classphoto.png",
    "gardenrake.png",
    "greendress.png",
    "jumprope.png",
    "kidsdrawing.png",
    "nancysmasterpiece.png",
    "nancyssketch.png",
    "outdoorrope.png",
    "paintthinner.png",
    "pillbottle.png",
    "prototypeclaws.png",
    "redpaintbrush.png",
    "sheepblock.png",
    "swingchains.png",
    "unicornblock.png",
    "woolshirt.png",
    "zblock.png",
  ],

  Ghostface: [
    "cheapcologne.png",
    "chewedpen.png",
    "cinchstraps.png",
    "driverslicense.png",
    "droplegknifesheath.png",
    "ghostfacecaughtontape.png",
    "headlinecutouts.png",
    "knifebeltclip.png",
    "lastingperfume.png",
    "leatherknifesheath.png",
    "markedmap.png",
    "nightvisionmonocular.png",
    "olsensaddressbook.png",
    "olsensjournal.png",
    "olsenswallet.png",
    "outdoorsecuritycamera.png",
    "philly.png",
    "telephotolens.png",
    "victimsdetailedroutine.png",
    "walleyesmatchbook.png",
  ],

  Ghoul: [
    "amonsnecktie.png",
    "anteikuapron.png",
    "aogiritreerobe.png",
    "bloodstainedhandkerchief.png",
    "brokenchain.png",
    "ccgidcard.png",
    "freshcoffee.png",
    "hidesheadphones.png",
    "hinamisumbrella.png",
    "iridescenteyepatch.png",
    "kanekissatchel.png",
    "kanekiswallet.png",
    "madosglove.png",
    "redheadedcentipede.png",
    "redspiderlily.png",
    "rizesglasses.png",
    "taiyaki.png",
    "theblackgoatsegg.png",
    "tortureapparatus.png",
    "yamorismask.png",
  ],

  Hag: [
    "bloodiedmud.png",
    "bloodiedwater.png",
    "bogwater.png",
    "crackedturtleegg.png",
    "cypressnecklet.png",
    "deadflymud.png",
    "disfiguredear.png",
    "dragonflywings.png",
    "driedcicada.png",
    "grandmasheart.png",
    "halfeggshell.png",
    "mintrag.png",
    "powderedeggshell.png",
    "pussywillowcatkins.png",
    "ropenecklet.png",
    "rustyshackles.png",
    "scarredhand.png",
    "swamporchidnecklet.png",
    "waterloggedshoe.png",
    "willowwreath.png",
  ],

  Hillbilly: [
    "apexmuffler.png",
    "begrimedchains.png",
    "cloggedintake.png",
    "counterweight.png",
    "crackedprimerbulb.png",
    "dadsboots.png",
    "discardedairfilter.png",
    "filthyslippers.png",
    "greasedthrottle.png",
    "highspeedidlerscrew.png",
    "iridescentengravings.png",
    "loprochains.png",
    "lowkickbackchains.png",
    "offbrandmotoroil.png",
    "raggedengine.png",
    "spikedboots.png",
    "steeltoeboots.png",
    "thermalcasing.png",
    "thethompsonsmix.png",
    "tunedcarburettor.png",
  ],

  Houndmaster: [
    "barleymeal.png",
    "belayingpins.png",
    "creaturesbone.png",
    "fattymeat.png",
    "gunpowdertin.png",
    "iridescentwheelhandle.png",
    "knottedrope.png",
    "leatherharness.png",
    "marlinspike.png",
    "shipfigurehead.png",
    "smokedsnapper.png",
    "spikedcollar.png",
    "spyglass.png",
    "stickypitch.png",
    "tornnovel.png",
    "trainersbook.png",
    "trainingbell.png",
    "unfinishedmap.png",
    "waterskin.png",
    "youngcoconut.png",
  ],

  Huntress: [
    "amanitatoxin.png",
    "bandagedhaft.png",
    "begrimedhead.png",
    "coarsestone.png",
    "deerskingloves.png",
    "flowerbabushka.png",
    "glowingconcoction.png",
    "infantrybelt.png",
    "iridescenthead.png",
    "leatherloop.png",
    "mannagrassbraid.png",
    "oakhaft.png",
    "roseroot.png",
    "rustyhead.png",
    "shinypin.png",
    "soldiersputtee.png",
    "venomousconcoction.png",
    "weightedhead.png",
    "woodenfox.png",
    "yellowedcloth.png",
  ],

  Knight: [
    "battleaxehead.png",
    "blacksmithshammer.png",
    "brokenhilt.png",
    "calltoarms.png",
    "coldsteelmanacles.png",
    "driedhorsemeat.png",
    "flintandsteel.png",
    "grimironmask.png",
    "grittylump.png",
    "healingpoultice.png",
    "iridescentcompanybanner.png",
    "ironworkerstongs.png",
    "jailerschimes.png",
    "knightscontract.png",
    "mapoftherealm.png",
    "pillagedmead.png",
    "sharpenedmount.png",
    "tatteredtabard.png",
    "townwatchstorch.png",
    "treatedblade.png",
  ],

  Krasue: [
    "brokentiara.png",
    "chickenhead.png",
    "chunkofmalai.png",
    "crumpledsheetmusic.png",
    "defectivemetronome.png",
    "dulledknife.png",
    "firstlibretto.png",
    "framednewspaper.png",
    "janjirashand.png",
    "lorenzasremains.png",
    "lucklessmouse.png",
    "mysteriouselixir.png",
    "pigseye.png",
    "queenssceptre.png",
    "rottenswine.png",
    "shreddedgown.png",
    "spatteredhandkerchief.png",
    "stickylozenge.png",
    "theatrebinoculars.png",
    "wrigglingparasite.png",
  ],

  Leatherface: [
    "awardwinningchilli.png",
    "begrimedchains.png",
    "carburettortuningguide.png",
    "chainsawfile.png",
    "chilli.png",
    "depthgaugerake.png",
    "grislychains.png",
    "homemademuffler.png",
    "iridescentflesh.png",
    "knifescratches.png",
    "lightchassis.png",
    "longguidebar.png",
    "primerbulb.png",
    "rustedchains.png",
    "shoplubricant.png",
    "sparkplug.png",
    "speedlimiter.png",
    "thebeastsmarks.png",
    "thegrease.png",
    "vegetableoil.png",
  ],

  Legion: [
    "bffs.png",
    "defacedsmileypin.png",
    "etchedruler.png",
    "filthyblade.png",
    "franksmixtape.png",
    "friendshipbracelet.png",
    "fumingmixtape.png",
    "iridescentbutton.png",
    "joeysmixtape.png",
    "juliesmixtape.png",
    "mischieflist.png",
    "muralsketch.png",
    "neversleeppills.png",
    "scratchedruler.png",
    "smileyfacepin.png",
    "stabwoundsstudy.png",
    "stolensketchbook.png",
    "stylishsunglasses.png",
    "susiesmixtape.png",
    "thelegionpin.png",
  ],

  Shape: [
    "blondhair.png",
    "boyfriendsmemo.png",
    "deadrabbit.png",
    "fragranttuftofhair.png",
    "glassfragment.png",
    "hairbow.png",
    "hairbrush.png",
    "jewellery.png",
    "jewellerybox.png",
    "myersmemorial.png",
    "judithsjournal.png",
    "judithstombstone.png",
    "lockofhair.png",
    "memorialflower.png",
    "mirrorshard.png",
    "reflectivefragment.png",
    "scratchedmirror.png",
    "tackyearrings.png",
    "tombstonepiece.png",
    "vanitymirror.png",
  ],

  Nemesis: [
    "adminwristband.png",
    "adrenalineinjector.png",
    "briansintestine.png",
    "brokenrecoverycoin.png",
    "damagedsyringe.png",
    "depletedinkribbon.png",
    "iridescentumbrellabadge.png",
    "jillssandwich.png",
    "lickertongue.png",
    "marvinsblood.png",
    "mikhailseye.png",
    "neparasite.png",
    "plant43vines.png",
    "serotonininjector.png",
    "shatteredstarsbadge.png",
    "starsfieldcombatmanual.png",
    "tvirussample.png",
    "tyrantgore.png",
    "visitorwristband.png",
    "zombieheart.png",
  ],

  Nurse: [
    "anxiousgasp.png",
    "ataxicrespiration.png",
    "badmankeepsake.png",
    "badmanslastbreath.png",
    "campbellslastbreath.png",
    "catatonicboystreasure.png",
    "darkcincture.png",
    "dullbracelet.png",
    "fragilewheeze.png",
    "heavypanting.png",
    "jennerslastbreath.png",
    "kavanaghslastbreath.png",
    "matchbox.png",
    "metalspoon.png",
    "plaidflannel.png",
    "pocketwatch.png",
    "spasmodicbreath.png",
    "tornbookmark.png",
    "whitenitcomb.png",
    "woodenhorse.png",
  ],

  Oni: [
    "akitoscrutch.png",
    "blackenedtoenail.png",
    "bloodysash.png",
    "childswoodensword.png",
    "chippedsaihai.png",
    "crackedsakazuki.png",
    "inklion.png",
    "iridescentfamilycrest.png",
    "kanaianzentalisman.png",
    "lionfang.png",
    "paperlantern.png",
    "polishedmaedate.png",
    "renjirosbloodyglove.png",
    "rottingrope.png",
    "scalpedtopknot.png",
    "shatteredwakizashi.png",
    "splinteredhull.png",
    "tearsoakedtenugui.png",
    "woodenonimask.png",
    "yamaokasashimono.png",
  ],

  Sadako: [
    "bloodyfingernails.png",
    "cabinsign.png",
    "clumpofhair.png",
    "distortedphoto.png",
    "iridescentvideotape.png",
    "motherscomb.png",
    "mothersmirror.png",
    "oldnewspaper.png",
    "reikoswatch.png",
    "remotecontrol.png",
    "ricketypinwheel.png",
    "ringdrawing.png",
    "seasoakedcloth.png",
    "tapeeditingdeck.png",
    "telephone.png",
    "vcr.png",
    "videotapecopy.png",
    "wellstone.png",
    "wellwater.png",
    "yoichisfishingnet.png",
  ],

  Pig: [
    "amandasletter.png",
    "amandassecret.png",
    "bagofgears.png",
    "combatstraps.png",
    "crateofgears.png",
    "facemask.png",
    "interlockingrazor.png",
    "jigsawsannotatedplan.png",
    "jigsawssketch.png",
    "johnsmedicalfile.png",
    "lastwill.png",
    "razorwires.png",
    "rulessetno2.png",
    "rustyattachments.png",
    "shatteredsyringe.png",
    "slowreleasetoxin.png",
    "tamperedtimer.png",
    "utilityblades.png",
    "videotape.png",
    "workshopgrease.png",
  ],

  Pinhead: [
    "bentnail.png",
    "burningcandle.png",
    "chattererstooth.png",
    "engineersfang.png",
    "flickeringtelevision.png",
    "franksheart.png",
    "greasyblacklens.png",
    "impalingwire.png",
    "iridescentlamentconfiguration.png",
    "larrysblood.png",
    "larrysremains.png",
    "leatherstrip.png",
    "liquifiedgore.png",
    "livelycrickets.png",
    "originalpain.png",
    "skeweredrat.png",
    "sliceoffrank.png",
    "spoiledmeal.png",
    "torturepillar.png",
    "wrigglingmaggots.png",
  ],

  Plague: [
    "ashenapple.png",
    "blackincense.png",
    "blessedapple.png",
    "devoteesamulet.png",
    "emeticpotion.png",
    "exorcismamulet.png",
    "haematiteseal.png",
    "healingsalve.png",
    "incensedointment.png",
    "infectedemetic.png",
    "iridescentseal.png",
    "limestoneseal.png",
    "olibanumincense.png",
    "potenttincture.png",
    "prayertabletfragment.png",
    "prophylacticamulet.png",
    "rubbingoil.png",
    "severedtoe.png",
    "vileemetic.png",
    "worshiptablet.png",
  ],

  Piramide: [
    "blackstrap.png",
    "burningmanpainting.png",
    "cinderellamusicbox.png",
    "copperring.png",
    "crimsonceremonybook.png",
    "deadbutterfly.png",
    "forgottenvideotape.png",
    "iridescentsealofmetatron.png",
    "leadring.png",
    "leopardprintfabric.png",
    "lostmemoriesbook.png",
    "mannequinfoot.png",
    "mistydayremainsofjudgement.png",
    "obsidiangoblet.png",
    "rustcolouredegg.png",
    "scarletegg.png",
    "spearhead.png",
    "tabletoftheoppressor.png",
    "valtielsectphotograph.png",
    "waxdoll.png",
  ],

  Singularity: [
    "androidarm.png",
    "brokensecuritykey.png",
    "crematedremains.png",
    "crewmanifest.png",
    "cryogel.png",
    "deniedrequisitionform.png",
    "diagnostictoolconstruction.png",
    "diagnostictoolrepair.png",
    "foreignplantfibres.png",
    "heavywater.png",
    "hologramgenerator.png",
    "hyperawarenessspray.png",
    "iridescentcrystalshard.png",
    "kidsballglove.png",
    "livewires.png",
    "nanomachinegel.png",
    "nutritionalslurry.png",
    "somafamilyphoto.png",
    "spentoxygentank.png",
    "ultrasonicsensor.png",
  ],

  Adriana: [
    "adaptivelighting.png",
    "adivalenteissue1.png",
    "advancedmovementprediction.png",
    "brownnoisegenerator.png",
    "expiredbatteries.png",
    "geographicalreadout.png",
    "highcurrentupgrade.png",
    "highpowerfloodlight.png",
    "infraredupgrade.png",
    "iridescentunpublishedmanuscript.png",
    "loosescrew.png",
    "lowpowermode.png",
    "powderedglass.png",
    "prototyperotor.png",
    "randomisedstrobes.png",
    "shotgunspeakers.png",
    "stereoremotemic.png",
    "supercharge.png",
    "ultrasonicspeaker.png",
    "vitaltargetingprocessor.png",
  ],

  Spirit: [
    "driedcherryblossom.png",
    "furin.png",
    "giftedbamboocomb.png",
    "juniperbonsai.png",
    "kaiuntalisman.png",
    "katanatsuba.png",
    "kintsugiteacup.png",
    "motherdaughterring.png",
    "mothersglasses.png",
    "muddysportsdaycap.png",
    "origamicrane.png",
    "rinsbrokenwatch.png",
    "rustyflute.png",
    "senkohanabi.png",
    "shiawaseamulet.png",
    "uchiwa.png",
    "wakizashisaya.png",
    "whitehairribbon.png",
    "yakuyokeamulet.png",
    "zori.png",
  ],

  Springtrap: [
    "accesspanel.png",
    "bonniesguitarstrings.png",
    "celebrateposter.png",
    "chicasbib.png",
    "endocpu.png",
    "fazcoin.png",
    "foxyshook.png",
    "freddyshat.png",
    "greasypaperplate.png",
    "helpwantedad.png",
    "iridescentremnant.png",
    "lootbag.png",
    "officephone.png",
    "partyhat.png",
    "purpleguydrawing.png",
    "restaurantmenu.png",
    "rippedcurtain.png",
    "rottenpizza.png",
    "securityguardsbadge.png",
    "streamers.png",
  ],

  Trapper: [
    "4coilspringkit.png",
    "bearoil.png",
    "bloodycoil.png",
    "coffeegrounds.png",
    "fasteningtools.png",
    "honingstone.png",
    "iridescentstone.png",
    "lengthenedjaws.png",
    "makeshiftwrap.png",
    "oilycoil.png",
    "paddedjaws.png",
    "rustedjaws.png",
    "secondarycoil.png",
    "serratedjaws.png",
    "tarbottle.png",
    "tensionspring.png",
    "trapperbag.png",
    "trappergloves.png",
    "trappersack.png",
    "waxbrick.png",
  ],

  Trickster: [
    "bloodyboa.png",
    "cagedheartshoes.png",
    "cutthruusingle.png",
    "deaththroescompilation.png",
    "diamondcufflinks.png",
    "edgeofrevivalalbum.png",
    "fizzspinsoda.png",
    "infernowires.png",
    "iridescentphotocard.png",
    "jiwoonsautograph.png",
    "killingpartchords.png",
    "luckyblade.png",
    "melodiousmurder.png",
    "mementoblades.png",
    "ontargetsingle.png",
    "ripperbrace.png",
    "tequilamoonrock.png",
    "trickblades.png",
    "trickpouch.png",
    "waitingforyouwatch.png",
  ],

  Twins: [
    "babyteeth.png",
    "bloodyblackhood.png",
    "catfigurine.png",
    "catseye.png",
    "ceremonialcandelabrum.png",
    "dropofperfume.png",
    "foreststew.png",
    "iridescentpendant.png",
    "madeleinesglove.png",
    "madeleinesscarf.png",
    "rustedneedle.png",
    "sewersludge.png",
    "silencingcloth.png",
    "souredmilk.png",
    "spinningtop.png",
    "stalebiscuit.png",
    "tinyfingernail.png",
    "toysword.png",
    "victorssoldier.png",
    "weightyrattle.png",
  ],

  Unknown: [
    "blurryphoto.png",
    "bmovieposter.png",
    "capturedbythedark.png",
    "deviceofundisclosedorigin.png",
    "discardedmilkcarton.png",
    "footprintcast.png",
    "frontpagearticle.png",
    "homemademask.png",
    "hypnotistswatch.png",
    "iridescentossreport.png",
    "lastknownrecording.png",
    "notebookoftheories.png",
    "obscuregamecartridge.png",
    "puncturedeyeball.png",
    "rabbitsfoot.png",
    "serumvial.png",
    "sketchattempt.png",
    "slashedbackpack.png",
    "vanishingbox.png",
    "victimsmap.png",
  ],

  Lich: [
    "bagofholding.png",
    "bootsofspeed.png",
    "cloakofelvenkind.png",
    "cloakofinvisibility.png",
    "crystalball.png",
    "dragontoothdagger.png",
    "glasseye.png",
    "iridescentbookofviledarkness.png",
    "lanternofrevealing.png",
    "ornatehorn.png",
    "pearlofpower.png",
    "potionofspeed.png",
    "ravensfeather.png",
    "ringofspellstoring.png",
    "ringoftelekinesis.png",
    "robeofeyes.png",
    "staffofwithering.png",
    "tatteredheadband.png",
    "trickstersglove.png",
    "vorpalsword.png",
  ],

  Wesker: [
    "bullhorn.png",
    "chalicegold.png",
    "darksunglasses.png",
    "egggold.png",
    "greenherb.png",
    "helicopterstick.png",
    "iridescenturoborosvial.png",
    "jewelbeetle.png",
    "labphoto.png",
    "leathergloves.png",
    "lionmedallion.png",
    "loosecrank.png",
    "maidenmedallion.png",
    "portablesafe.png",
    "redherb.png",
    "rpdshoulderwalkie.png",
    "unicornmedallion.png",
    "uroborostendril.png",
    "uroborosvirus.png",
    "videoconferencedevice.png",
  ],

  Wraith: [
    "allseeingblood.png",
    "allseeingspirit.png",
    "blindwarriormud.png",
    "blindwarriorwhite.png",
    "blinkmud.png",
    "blinkwhite.png",
    "boneclapper.png",
    "coxcombedclapper.png",
    "shadowdanceblood.png",
    "shadowdancewhite.png",
    "swifthuntblood.png",
    "swifthuntmud.png",
    "swifthuntwhite.png",
    "thebeastsoot.png",
    "theghostsoot.png",
    "thehoundsoot.png",
    "theserpentsoot.png",
    "windstormblood.png",
    "windstormmud.png",
    "windstormwhite.png",
  ],

  Xenomorph: [
    "acidicblood.png",
    "ashsinnards.png",
    "brettscap.png",
    "catcarrier.png",
    "cerealrations.png",
    "crewheadset.png",
    "drinkingbird.png",
    "emergencyhelmet.png",
    "harpoongun.png",
    "improvisedcattleprod.png",
    "kaneshelmet.png",
    "lambertsstarmap.png",
    "lightwand.png",
    "moultedskin.png",
    "multipurposehatchet.png",
    "ovomorph.png",
    "parkersheadband.png",
    "ripleyswatch.png",
    "selfdestructbolt.png",
    "semiotickeyboard.png",
  ],

  Vecna: [
    "beadmaze.png",
    "blackwidowspider.png",
    "bloodyrollerskate.png",
    "brokenskateboard.png",
    "chesspiece.png",
    "clockhands.png",
    "electrodecap.png",
    "electroshockcollar.png",
    "forgeddeathcertificate.png",
    "guttedsupercom.png",
    "iridescentsoteriachip.png",
    "mid-centuryradio.png",
    "necktendril.png",
    "orderlyid.png",
    "pizzagoggles.png",
    "rabbitremains.png",
    "shatteredwristrocket.png",
    "smashedcassettedeck.png",
    "stainedglassmural.png",
    "victorsrazorblade.png",
  ],
};

const survivorPerkFiles = [
  "iconPerks_AceInTheHole.png",
  "iconPerks_Adrenaline.png",
  "iconPerks_Aftercare.png",
  "iconPerks_Alert.png",
  "iconPerks_AnyMeansNecessary.png",
  "iconPerks_Appraisal.png",
  "iconPerks_Autodidact.png",
  "iconPerks_babySitter.png",
  "iconPerks_BackgroundPlayer.png",
  "iconPerks_BalancedLanding.png",
  "iconPerks_BardicInspiration.png",
  "iconPerks_BetterThanNew.png",
  "iconPerks_betterTogether.png",
  "iconPerks_BiteTheBullet.png",
  "iconPerks_BlastMine.png",
  "iconPerks_BloodPact.png",
  "iconPerks_BloodRush.png",
  "iconPerks_BoilOver.png",
  "iconPerks_Bond.png",
  "iconPerks_BoonCircleOfHealing.png",
  "iconPerks_BoonShadowStep.png",
  "iconPerks_BorrowedTime.png",
  "iconPerks_BotanyKnowledge.png",
  "iconPerks_Breakdown.png",
  "iconPerks_Breakout.png",
  "iconPerks_BuckleUp.png",
  "iconPerks_BuiltToLast.png",
  "iconPerks_CalmSpirit.png",
  "iconPerks_Camaraderie.png",
  "iconPerks_ChemicalTrap.png",
  "iconPerks_Clairvoyance.png",
  "iconPerks_Counterforce.png",
  "iconPerks_CutLoose.png",
  "iconPerks_DanceWithMe.png",
  "iconPerks_DarkSense.png",
  "iconPerks_DarkTheory.png",
  "iconPerks_DeadHard.png",
  "iconPerks_Deception.png",
  "iconPerks_DecisiveStrike.png",
  "iconPerks_DejaVu.png",
  "iconPerks_Deliverance.png",
  "iconPerks_DesperateMeasures.png",
  "iconPerks_DetectivesHunch.png",
  "iconPerks_Distortion.png",
  "iconPerks_Diversion.png",
  "iconPerks_Dramaturgy.png",
  "iconPerks_EmpathicConnection.png",
  "iconPerks_Empathy.png",
  "iconPerks_Exultation.png",
  "iconPerks_EyesOfBelmont.png",
  "iconPerks_FastTrack.png",
  "iconPerks_Finesse.png",
  "iconPerks_Fixated.png",
  "iconPerks_Flashbang.png",
  "iconPerks_FlipFlop.png",
  "iconPerks_Fogwise.png",
  "iconPerks_ForThePeople.png",
  "iconPerks_FriendlyCompetition.png",
  "iconPerks_guardian.png",
  "iconPerks_Hardened.png",
  "iconPerks_HeadOn.png",
  "iconPerks_Hope.png",
  "iconPerks_Hyperfocus.png",
  "iconPerks_innerStrength.png",
  "iconPerks_IronWill.png",
  "iconPerks_Kindred.png",
  "iconPerks_Leader.png",
  "iconPerks_LeftBehind.png",
  "iconPerks_LightFooted.png",
  "iconPerks_Lightweight.png",
  "iconPerks_Lithe.png",
  "iconPerks_LowProfile.png",
  "iconPerks_LuckyBreak.png",
  "iconPerks_LuckyStar.png",
  "IconPerks_madeForThis.png",
  "iconPerks_MirroredIllusion.png",
  "iconPerks_MomentOfGlory.png",
  "iconPerks_NoMither.png",
  "iconPerks_NoOneLeftBehind.png",
  "iconPerks_ObjectOfObsession.png",
  "iconPerks_OffTheRecord.png",
  "iconPerks_Overzealous.png",
  "iconPerks_ParentalGuidance.png",
  "iconPerks_Pharmacy.png",
  "iconPerks_PlotTwist.png",
  "iconPerks_PlunderersInstinct.png",
  "iconPerks_Poised.png",
  "iconPerks_PotentialEnergy.png",
  "iconPerks_PowerStruggle.png",
  "iconPerks_Premonition.png",
  "iconPerks_ProveThyself.png",
  "iconPerks_QuickAndQuiet.png",
  "iconPerks_ReactiveHealing.png",
  "iconPerks_Reassurance.png",
  "iconPerks_RedHerring.png",
  "iconPerks_RepressedAlliance.png",
  "iconPerks_ResidualManifest.png",
  "iconPerks_Resilience.png",
  "iconPerks_Resurgence.png",
  "iconPerks_RookieSpirit.png",
  "iconPerks_Saboteur.png",
  "IconPerks_scavenger.png",
  "iconPerks_ScenePartner.png",
  "iconPerks_secondWind.png",
  "iconPerks_Self-Preservation.png",
  "iconPerks_SelfCare.png",
  "iconPerks_situationalAwareness.png",
  "iconPerks_SlipperyMeat.png",
  "iconPerks_SmallGame.png",
  "iconPerks_SmashHit.png",
  "iconPerks_SoleSurvivor.png",
  "iconPerks_Solidarity.png",
  "iconPerks_SoulGuard.png",
  "iconPerks_Specialist.png",
  "iconPerks_SpineChill.png",
  "iconPerks_SprintBurst.png",
  "iconPerks_StakeOut.png",
  "iconPerks_StillSight.png",
  "iconPerks_Streetwise.png",
  "iconPerks_TeamworkCollectiveStealth.png",
  "iconPerks_TeamworkPowerOfTwo.png",
  "iconPerks_Technician.png",
  "iconPerks_Tenacity.png",
  "iconPerks_ThisIsNotHappening.png",
  "IconPerks_troubleshooter.png",
  "iconPerks_Unbreakable.png",
  "iconPerks_UpTheAnte.png",
  "iconPerks_UrbanEvasion.png",
  "iconPerks_Vigil.png",
  "iconPerks_Visionary.png",
  "iconPerks_QuickGambit.png",
  "iconPerks_WakeUp.png",
  "iconPerks_WellMakeIt.png",
  "iconPerks_WereGonnaLiveForever.png",
  "iconPerks_WindowsOfOpportunity.png",
  "iconPerks_Wiretap.png",
  "iconsPerks_ChampionOfLight.png",
  "iconsPerks_Deadline.png",
  "iconsPerks_Illumination.png",
  "iconsPerks_InvocationWeavingSpiders.png",
  "iconsPerks_StrengthInShadows.png",
  "iconsPerks_Wicked.png",
  "IconPerks_BoonExponential.png",
  "IconPerks_CorrectiveAction.png",
  "IconPerks_Overcome.png",
  "IconPerks_ApocalypticIngenuity.png",
  "IconPerks_ComeAndGetMe.png",
  "IconPerks_Conviction.png",
  "IconPerks_GhostNotes.png",
  "IconPerks_LastStand.png",
  "IconPerks_OneTwoThreeFour.png",
  "IconPerks_RoadLife.png",
  "IconPerks_TeamworkThrowDown.png",
  "IconPerks_TeamworkToughenUp.png",
  "IconsPerks_BadaBadaBoom.png",
  "IconsPerks_ChangeOfPlan.png",
  "IconsPerks_CleanBreak.png",
  "IconsPerks_DoNoHarm.png",
  "IconsPerks_DutyOfCare.png",
  "IconsPerks_ExtrasensoryPerception.png",
  "IconsPerks_InvocationTreacherousCrows.png",
  "IconsPerks_RapidResponse.png",
  "IconsPerks_ShoulderTheBurden.png",
  "IconsPerks_TeamworkFullCircuit.png",
  "IconsPerks_TeamworkSoftSpoken.png",
  "IconsPerks_WeSeeYou.png",
];

const killerPerkFiles = [
  "iconPerks_Agitation.png",
  "iconPerks_AlienInstinct.png",
  "iconPerks_ANursesCalling.png",
  "iconPerks_AwakenedAwarenesss.png",
  "iconPerks_Bamboozle.png",
  "iconPerks_batteriesIncluded.png",
  "iconPerks_BBQAndChili.png",
  "iconPerks_BeastOfPrey.png",
  "iconPerks_BitterMurmur.png",
  "iconPerks_BloodEcho.png",
  "iconPerks_Bloodhound.png",
  "iconPerks_BloodWarden.png",
  "iconPerks_BrutalStrength.png",
  "iconPerks_CallOfBrine.png",
  "iconPerks_CorruptIntervention.png",
  "iconPerks_Coulrophobia.png",
  "iconPerks_CoupDeGrace.png",
  "iconPerks_CruelConfinement.png",
  "iconPerks_DarkArrogance.png",
  "iconPerks_DarkDevotion.png",
  "iconPerks_DarknessRevelated.png",
  "iconPerks_Deadlock.png",
  "iconPerks_DeadManSwitch.png",
  "iconPerks_Deathbound.png",
  "iconPerks_Deerstalker.png",
  "iconPerks_DevourHope.png",
  "iconPerks_Discordance.png",
  "iconPerks_Dissolution.png",
  "iconPerks_Distressing.png",
  "iconPerks_Dominance.png",
  "iconPerks_DragonsGrip.png",
  "iconPerks_DyingLight.png",
  "iconPerks_Enduring.png",
  "iconPerks_Eruption.png",
  "iconPerks_FireUp.png",
  "iconPerks_FloodOfRage.png",
  "IconPerks_ForcedHesitation.png",
  "iconPerks_ForcedPenance.png",
  "iconPerks_FranklinsLoss.png",
  "iconPerks_friendsTillTheEnd.png",
  "iconPerks_FurtiveChase.png",
  "iconPerks_GameAfoot.png",
  "iconPerks_GearHead.png",
  "iconPerks_GeneratorOvercharge.png",
  "IconPerks_GeneticLimits.png",
  "iconPerks_HangmansTrick.png",
  "iconPerks_Rancor.png",
  "iconPerks_HauntedGround.png",
  "iconPerks_HexBloodFavor.png",
  "iconPerks_HexCrowdControl.png",
  "iconPerks_HexFaceTheDarkness.png",
  "iconPerks_HexPlaything.png",
  "iconPerks_HexRetribution.png",
  "iconPerks_HexUndying.png",
  "iconPerks_HexWretchedFate.png",
  "iconPerks_Hoarder.png",
  "iconPerks_Hubris.png",
  "iconPerks_HumanGreed.png",
  "iconPerks_HuntressLullaby.png",
  "iconPerks_Hysteria.png",
  "iconPerks_ImAllEars.png",
  "iconPerks_InfectiousFright.png",
  "iconPerks_InnerFocus.png",
  "iconPerks_Insidious.png",
  "iconPerks_IronGrasp.png",
  "iconPerks_IronMaiden.png",
  "iconPerks_KnockOut.png",
  "iconPerks_LanguidTouch.png",
  "iconPerks_LethalPursuer.png",
  "iconPerks_Leverage.png",
  "iconPerks_Lightborn.png",
  "iconPerks_MadGrit.png",
  "iconPerks_MakeYourChoice.png",
  "iconPerks_MercilessStorm.png",
  "iconPerks_MindBreaker.png",
  "iconPerks_MonitorAndAbuse.png",
  "iconPerks_MonstrousShrine.png",
  "iconPerks_Nemesis.png",
  "iconPerks_NoOneEscapesDeath.png",
  "iconPerks_NoWayOut.png",
  "iconPerks_NowhereToHide.png",
  "iconPerks_Oppression.png",
  "iconPerks_OverwhelmingPresence.png",
  "iconPerks_PlayWithYourFood.png",
  "iconPerks_PopGoesTheWeasel.png",
  "iconPerks_Predator.png",
  "iconPerks_RapidBrutality.png",
  "iconPerks_RememberMe.png",
  "iconPerks_Ruin.png",
  "iconPerks_SaveTheBestForLast.png",
  "iconPerks_ScourgeHookGiftOfPain.png",
  "IconPerks_MachineLearning.png",
  "iconPerks_SepticTouch.png",
  "iconPerks_Shadowborn.png",
  "iconPerks_SloppyButcher.png",
  "iconPerks_SpiesFromTheShadows.png",
  "iconPerks_SpiritFury.png",
  "iconPerks_Starstruck.png",
  "iconPerks_Stridor.png",
  "iconPerks_SuperiorAnatomy.png",
  "iconPerks_Surge.png",
  "iconPerks_Surveillance.png",
  "iconPerks_Terminus.png",
  "iconPerks_TerritorialImperative.png",
  "iconPerks_Thatanophobia.png",
  "iconPerks_TheThirdSeal.png",
  "iconPerks_ThrillingTremors.png",
  "iconPerks_ThrillOfTheHunt.png",
  "iconPerks_Thwack.png",
  "iconPerks_Tinkerer.png",
  "iconPerks_TrailOfTorment.png",
  "iconPerks_twoCanPlay.png",
  "iconPerks_UltimateWeapon.png",
  "iconPerks_Unbound.png",
  "iconPerks_Undone.png",
  "iconPerks_Unforeseen.png",
  "iconPerks_UnnervingPresence.png",
  "iconPerks_Unrelenting.png",
  "iconPerks_WeaveAttunement.png",
  "iconPerks_Whispers.png",
  "iconPerks_ZanshinTactics.png",
  "IconPerks_GrimEmbrace.png",
  "IconPerks_HexPentimento.png",
  "IconPerks_PainResonance.png",
  "IconPerks_AllShakingThunder.png",
  "IconPerks_ForeverEntwined.png",
  "IconPerks_Haywire.png",
  "IconPerks_HelpWanted.png",
  "IconPerks_HexOvertureOfDoom.png",
  "IconPerks_NoHoldsBarred.png",
  "IconPerks_NoneAreFree.png",
  "IconPerks_NoQuarter.png",
  "IconPerks_NothingButMisery.png",
  "IconPerks_PhantomFear.png",
  "IconPerks_Ravenous.png",
  "IconPerks_ScourgeHookJaggedCompass.png",
  "IconPerks_WanderingEye.png",
  "IconsPerks_HexHiveMind.png",
  "IconsPerks_SecretProject.png",
  "IconsPerks_TurnBackTheClock.png",
];

const survivorFiles = [
  "Ace.png",
  "Ada Wong.png",
  "Adam.png",
  "Aestri.png",
  "Allan Wake.png",
  "Ash.png",
  "Bill.png",
  "Cheryl.png",
  "Claudette.png",
  "David King.png",
  "David Tapp.png",
  "Dustin.png",
  "Dwight.png",
  "Ellen Ripley.png",
  "Elodie.png",
  "Felix.png",
  "Feng Min.png",
  "Gabriel Soma.png",
  "Haddie.png",
  "Jake.png",
  "Jane.png",
  "Jeff.png",
  "Jill.png",
  "Jonag.png",
  "Kate.png",
  "Lara Croft.png",
  "Leon.png",
  "Meg.png",
  "Michonne.png",
  "Mikaela.png",
  "Nancy.png",
  "Nea.png",
  "Nickolas Cage.png",
  "Onze.png",
  "Orela.png",
  "Quentin.png",
  "Rebeca.png",
  "Renato.png",
  "Rick Grimes.png",
  "Sable.png",
  "Steve.png",
  "Taurie.png",
  "Thalita.png",
  "Trevor Belmont.png",
  "Vee.png",
  "Vittoria.png",
  "Yoichi.png",
  "Yui Kimura.png",
  "Yun Jin.png",
  "Zarina.png",
];

const killerFiles = [
  "Wesker.png",
  "Pinhead.png",
  "Shape.png",
  "Artista.png",
  "Blight.png",
  "Clow.png",
  "Deathslinger.png",
  "Demogorgon.png",
  "Unknown.png",
  "Doctor.png",
  "Draga.png",
  "Freddy.png",
  "Ghostface.png",
  "Hag.png",
  "Hillbilly.png",
  "Huntress.png",
  "Krasue.png",
  "Leatherface.png",
  "Legion.png",
  "Lich.png",
  "Houndmaster.png",
  "Adriana.png",
  "Nemesis.png",
  "Nurse.png",
  "Xenomorph.png",
  "Chucky.png",
  "Knight.png",
  "Oni.png",
  "Twins.png",
  "Pig.png",
  "Piramide.png",
  "Plague.png",
  "Sadako.png",
  "Singularity.png",
  "Spirit.png",
  "Drácula.png",
  "Ghoul.png",
  "Springtrap.png",
  "Trapper.png",
  "Trickster.png",
  "Vecna.png",
  "Wraith.png",
];

const itemFiles = [
  "Flashlight.png",
  "Medkit.png",
  "Toolbox.png",
  "Map.png",
  "Key.png",
];

const ADDONS_DB = {
    automaticdrawing:
      "Automatic Drawing. Reduz o tempo de recarga dos Corvos em 1.5s.",
    charcoalstick:
      "Charcoal Stick. Aumenta a duração da aura do Corvo em 0.5s.",
    choclocorn:
      "Choclo Corn. Aumenta a duração que os Corvos permanecem ociosos.",
    darkestink: "Darkest Ink. Reduz o tempo de recarga dos Corvos.",
    festeringcarrion: "Festering Carrion. Reduz o tempo de recarga dos Corvos.",
    gardenofrot:
      "Garden of Rot. Ao repelir Corvos, o Sobrevivente sofre Exaustão.",
    inkegg: "Ink Egg. Aumenta o número máximo de Corvos em 1.",
    iridescentfeather:
      "Iridescent Feather. Concede o status Indetectável enquanto Corvos estiverem em recarga.",
    matiasbabyshoes:
      "Matias' Baby Shoes. Mostra a aura de Sobreviventes próximos a Corvos ociosos.",
    ogriefolover:
      "O Grief, O Lover. Sobreviventes atingidos por Corvos sofrem de Cegueira.",
    oilpaints:
      "Oil Paints. Aumenta a velocidade de Killer Instinct dos Corvos.",
    severedhands:
      "Severed Hands. Qualquer Sobrevivente perto de outro que for atingido por Corvos também é atingido.",
    severedtongue:
      "Severed Tongue. Reduz a velocidade do Sobrevivente enquanto ele repele os Corvos.",
    silverbell:
      "Silver Bell. Sobreviventes sofrem do status Inconsciente ao repelir Corvos.",
    stilllifecrow:
      "Still Life Crow. Aumenta a duração que os Corvos permanecem ociosos.",
    thicktar: "Thick Tar. Aumenta o tempo necessário para repelir Corvos.",
    thornynest:
      "Thorny Nest. Sobreviventes atingidos por Corvos sofrem de Hemorragia e Destroçados.",
    untitledagony:
      "Untitled Agony. Sobreviventes atingidos por Corvos sofrem de Lentidão.",
    velvetfabric: "Velvet Fabric. A aura do rastro do Corvo muda de cor.",
    vibrantobituary: "Vibrant Obituary. Aumenta a duração do Killer Instinct.",

    // === ADD-ONS DO BLIGHT (Flagelo) - ATUALIZADO ===
    adrenalinevial:
      "Adrenaline Vial. Aumenta o máximo de fichas de Arremetida em 2, a velocidade em 5% e o ângulo de visão em 20°. Reduz a taxa de curva em 0.5°/s.",
    alchemistsring:
      "Alchemist's Ring. Aumenta a duração da Arremetida em 20% para cada Arremetida Letal consecutiva.",
    blightedcrow:
      "Blighted Crow. Aumenta a velocidade de movimento durante uma Arremetida em 3% acumulável para cada Arremetida Letal consecutiva.",
    blightedrat:
      "Blighted Rat. Aumenta a velocidade de movimento durante uma Arremetida em 2% acumulável para cada Arremetida Letal consecutiva.",
    cankerthorn:
      "Canker Thorn. Reduz a duração da Fadiga após uma Arremetida em 0.5 segundos.",
    chippedmonocle:
      "Chipped Monocle. Exibe a localização alvo de uma Colisão enquanto carrega a Arremetida.",
    compoundseven:
      "Compound Seven. Faz você virar automaticamente para o Sobrevivente mais próximo num raio de 16 metros após uma Colisão.",
    compoundthirtythree:
      "Compound Thirty-Three. Aumenta a taxa de curva e a duração da Arremetida em 11%. A Corrupção do Flagelo é limitada a 5 fichas.",
    compoundtwentyone:
      "Compound Twenty-One. Revela a aura de Sobreviventes num raio de 8 metros de uma Colisão por 3.5 segundos.",
    foxglove:
      "Foxglove. Reduz a duração da Fadiga após uma Arremetida em 0.25 segundos.",
    iridescentblighttag:
      "Iridescent Blight Tag. Aumenta a velocidade da Arremetida em 10% e o ângulo de visão em 20°. A Corrupção do Flagelo é limitada a 3 fichas.",
    placebotablet:
      "Placebo Tablet. Reduz a velocidade de movimento da Arremetida em 15%. Concede 100% de Pontos de Sangue bônus em eventos de Arremetida.",
    plaguebile:
      "Plague Bile. Aumenta a taxa de curva durante uma Arremetida em 10%.",
    pustuladust:
      "Pustula Dust. Aumenta a janela de oportunidade para realizar uma Arremetida em Cadeia em 0.75 segundos.",
    rosetonic:
      "Rose Tonic. Aumenta a janela de oportunidade para realizar uma Arremetida em Cadeia em 1 segundo.",
    shreddednotes:
      "Shredded Notes. Reduz o tempo de recarga por ficha de poder em 0.33 segundos.",
    soulchemical:
      "Soul Chemical. Aumenta a velocidade inicial de movimento da Arremetida em 5%.",
    summoningstone:
      "Summoning Stone. Aumenta a duração inicial da Arremetida em 0.5 segundos.",
    umbrasalts:
      "Umbra Salts. Aumenta a taxa de curva durante uma Arremetida em 15%.",
    vigosjournal:
      "Vigo's Journal. Concede o efeito de status Indetectável enquanto estiver realizando uma Arremetida.",

    // === ADD-ONS DO CHUCKY (O Cara Legal) ===
    automaticscrewdriver:
      "Automatic Screwdriver. Reduz o tempo de recarga do Modo Hidey-Ho em 8% após errar um ataque Slice & Dice.",
    dolleyes:
      "Doll Eyes. Quando em Modo Hidey-Ho, as auras de todas as Janelas e Paletes derrubados são reveladas a você num raio de 20 metros.",
    electriccarvingknife:
      "Electric Carving Knife. Reduz o tempo de recarga de ataques Slice & Dice errados para 95% da duração padrão.",
    goodguybox:
      "Good Guy Box. Reduz o tempo de recarga de ataques Slice & Dice bem-sucedidos para 93% da duração padrão.",
    hairspraycandle:
      "Hair Spray & Candle. Reduz a penalidade da barra de poder de Ataques Básicos durante o Modo Hidey-Ho em 20%.",
    hardhat:
      "Hard Hat. Quebra instantaneamente Paletes ao realizar um Scamper (passar por baixo) neles.",
    iridescentamulet:
      "Iridescent Amulet. Aumenta a duração do Modo Hidey-Ho em 50%, mas Ataques Básicos encerram o modo imediatamente.",
    jumprope:
      "Jump Rope. Aumenta a duração do Slice & Dice para 108% da duração padrão.",
    mirrorshards:
      "Mirror Shards. Permite ver os Passos Ilusórios perto dos Sobreviventes.",
    pileofnails:
      "Pile of Nails. Concede o status Indetectável por 3 segundos após encerrar manualmente o Modo Hidey-Ho.",
    plasticbag:
      "Plastic Bag. Sobreviventes que andam através de um Passo Ilusório sofrem de Exaustão por 15 segundos.",
    portabletv:
      "Portable TV. Aumenta a duração do Slice & Dice para 170% quando os Portões de Saída são energizados.",
    powerdrill:
      "Power Drill. Reduz o tempo de recarga do Modo Hidey-Ho em 10% após um ataque Slice & Dice bem-sucedido.",
    ratpoison:
      "Rat Poison. Enquanto realiza um Slice & Dice, as auras de todos os Sobreviventes num raio de 12 metros são reveladas por 5 segundos.",
    runningshoes:
      "Running Shoes. Realizar um Scamper concede 2% de Celeridade por 5 segundos.",
    silkpillow:
      "Silk Pillow. Reduz permanentemente seu Raio de Terror em 6 metros, mas aumenta o tempo de carga do Slice & Dice em 50%.",
    straightrazor:
      "Straight Razor. Sobreviventes atingidos por Slice & Dice sofrem de Hemorragia e Dilaceração por 80 segundos.",
    strobinglight:
      "Strobing Light. Reduz seu Raio de Terror em 8 metros quando o Modo Hidey-Ho está em recarga.",
    tinyscalpel:
      "Tiny Scalpel. Quando em Modo Hidey-Ho, as Poças de Sangue aparecem em vermelho brilhante.",
    yardstick:
      "Yardstick. Realizar um Scamper revela a aura de todos os Sobreviventes num raio de 16 metros por 3 segundos.",

    // === ADD-ONS DO CLOWN (O Palhaço) ===
    bottleofchloroform:
      "Bottle of Chloroform. Aumenta o tamanho e a propagação das nuvens de gás de Intoxicação em 20%.",
    cheapginbottle:
      "Cheap Gin Bottle. Aumenta a força do efeito de Celeridade do Revigoramento em 3% extra.",
    cigarbox:
      "Cigar Box. Revela a aura de outros jogadores num raio de 16m enquanto você estiver sob efeito do Revigoramento.",
    ether15vol:
      "Ether 15 Vol%. Aumenta a duração da Intoxicação do sobrevivente em 1 segundo.",
    fingerlessparadegloves:
      "Fingerless Parade Gloves. Aumenta a velocidade de arremesso da garrafa em 25% e reduz o ângulo em 15°.",
    flaskofbleach:
      "Flask of Bleach. Aumenta a penalidade de Lentidão da Intoxicação em 4% adicionais.",
    garishmakeupkit:
      "Garish Make-Up Kit. Aumenta a duração do efeito de Revigoramento em 2 segundos.",
    kerosenecan:
      "Kerosene Can. Sobreviventes intoxicados sofrem do status Cegueira por 30 segundos.",
    partybottle:
      "Party Bottle. Garrafas emitem confete ao quebrar. Acertar sobreviventes diretamente concede 100% de pontos de sangue extras na categoria Deviousness.",
    redheadspinkiefinger:
      "Redhead's Pinkie Finger. Acertar um sobrevivente diretamente com a garrafa aplica o status Exposto enquanto ele estiver intoxicado. Reduz o limite de garrafas em 1.",
    robinfeather:
      "Robin Feather. Reduz o tempo de recarga entre arremessos em 40%.",
    smellyinnersoles:
      "Smelly Inner Soles. Aumenta a velocidade de movimento enquanto recarrega garrafas em 66%.",
    solventjug:
      "Solvent Jug. Aumenta a duração do efeito de Revigoramento em 1 segundo.",
    spiritofhartshorn:
      "Spirit of Hartshorn. Aumenta o tamanho e a propagação das nuvens de gás de Revigoramento em 20%.",
    starlingfeather:
      "Starling Feather. Reduz o tempo de recarga entre arremessos em 50%.",
    stickysodabottle:
      "Sticky Soda Bottle. Aumenta a força do efeito de Celeridade do Revigoramento em 2% extra.",
    sulphuricacidvial:
      "Sulphuric Acid Vial. Sobreviventes intoxicados sofrem do status Dilacerado por 70 segundos.",
    tattoosmiddlefinger:
      "Tattoo's Middle Finger. Revela a aura de sobreviventes intoxicados ou revigorados por 6 segundos.",
    thickcorkstopper:
      "Thick Cork Stopper. Reduz o tempo de recarga das garrafas em 0.5 segundos.",
    vhsporn:
      "VHS Porn. Inverte as cores das nuvens de gás (Tônico fica amarelo, Antídoto fica roxo).",

    // === ADD-ONS DO DEATHSLINGER (O Mercenário) ===
    barbedwire:
      "Barbed Wire. Aumenta o tempo necessário para se curar da Ferida Profunda em 3.5 segundos.",
    bayshorescigar:
      "Bayshore's Cigar. Reduz a duração do atordoamento quando Sobreviventes se libertam da corrente em 0.75 segundos.",
    bayshoresgoldtooth:
      "Bayshore's Gold Tooth. Aumenta a velocidade de puxar o arpão em 5%.",
    chewingtobacco:
      "Chewing Tobacco. Reduz a duração do atordoamento quando Sobreviventes se libertam da corrente em 0.25 segundos.",
    goldcreekwhiskey:
      "Gold Creek Whiskey. Reduz seu Raio de Terror em 8 metros enquanto estiver mirando.",
    hellshireiron:
      "Hellshire Iron. Concede o status Indetectável enquanto um Sobrevivente estiver arpoado. O efeito persiste por 10s após o arpão soltar.",
    honeylocustthorn:
      "Honey Locust Thorn. Sobreviventes que se libertam da corrente sofrem do status Dilacerado por 70 segundos.",
    iridescentcoin:
      "Iridescent Coin. Sobreviventes ficam Expostos enquanto arpoados, se atingidos a pelo menos 12 metros de distância.",
    jawsmasher:
      "Jaw Smasher. Aumenta sua velocidade de movimento em 1.5% enquanto estiver mirando.",
    marshalsbadge:
      "Marshal's Badge. Reduz seu Raio de Terror em 4 metros enquanto estiver mirando.",
    modifiedammobelt:
      "Modified Ammo Belt. Reduz o tempo de recarga da arma em 0.25 segundos.",
    poisonoakleaves:
      "Poison Oak Leaves. Aumenta o tempo necessário para se curar da Ferida Profunda em 1.5 segundos.",
    prisonchain:
      "Prison Chain. Aumenta o tempo necessário para o Sobrevivente quebrar a corrente em 10%.",
    ricketychain:
      "Rickety Chain. Concede 50% mais Pontos de Sangue em eventos de Arpão. Aumenta a velocidade que Sobreviventes quebram a corrente em 33%.",
    rustedspike:
      "Rusted Spike. Sobreviventes arpoados atingidos sofrem do status Dilacerado por 60 segundos.",
    snakeoil: "Snake Oil. Aumenta a velocidade de puxar o arpão em 2.5%.",
    spitpolishrag:
      "Spit Polish Rag. Reduz o tempo de recarga de tiros errados em 0.25 segundos.",
    tinoilcan:
      "Tin Oil Can. Reduz o tempo de recarga de tiros errados em 0.5 segundos.",
    wantedposter:
      "Wanted Poster. Aumenta sua velocidade de movimento em 3% enquanto estiver mirando.",
    wardenskeys:
      "Warden's Keys. Reduz o tempo de recarga da arma em 0.35 segundos.",

    // === ADD-ONS DO DEMOGORGON ===
    barbsglasses:
      "Barb's Glasses. Reduz o tempo de recarga de ataques Despedaçar bem-sucedidos em Paletes ou Paredes Quebráveis em 10%.",
    blackheart:
      "Black Heart. Reduz o tempo de recarga de ataques Despedaçar bem-sucedidos em Sobreviventes em 10%.",
    brasscaselighter:
      "Brass Case Lighter. Sobreviventes sofrem de Cegueira enquanto fecham Portais e por mais 60 segundos.",
    deerlung:
      "Deer Lung. Aumenta a velocidade de teleporte pelo Mundo Invertido em 30%, mas reduz o número de Portais em 2.",
    elevenssoda:
      "Eleven's Soda. Revela a aura de geradores sendo reparados em amarelo enquanto você viaja pelo Mundo Invertido.",
    leproselichen:
      "Leprose Lichen. Revela a aura de todos os Sobreviventes enquanto viaja pelo Mundo Invertido. O efeito persiste por 3s após sair se o sobrevivente estiver perto de um portal ativo.",
    lifeguardwhistle:
      "Lifeguard Whistle. Aumenta o número de Portais disponíveis em 2.",
    mewsguts:
      "Mew's Guts. Reduz o tempo de recarga de ataques Despedaçar errados em 11% e aumenta o número de Portais em 1.",
    ratliver:
      "Rat Liver. Aumenta sua velocidade de movimento enquanto carrega o ataque Do Abismo em 3.5%.",
    rattail: "Rat Tail. Aumenta a velocidade de abertura de Portais em 50%.",
    redmoss:
      "Red Moss. Aumenta a duração do Indetectável ao sair de um portal em 8s e suprime o som, mas o teleporte é 15% mais lento.",
    rottengreentripe:
      "Rotten Green Tripe. Aumenta a velocidade de teleporte pelo Mundo Invertido em 15%.",
    rottenpumpkin:
      "Rotten Pumpkin. Ao teleportar, o Portal de origem é destruído e você ganha 200 Pontos de Sangue adicionais.",
    stickylining:
      "Sticky Lining. Aumenta o raio de detecção dos Portais ativos em 2.5 metros.",
    thornyvines:
      "Thorny Vines. Aumenta o raio de detecção dos Portais em 1 metro e aumenta o tempo para os Sobreviventes fecharem portais em 8%.",
    unknownegg:
      "Unknown Egg. Reduz o tempo de recuperação do poder Do Abismo em 2.5 segundos.",
    upsidedownresin:
      "Upside Down Resin. Aumenta o tempo necessário para os Sobreviventes fecharem Portais em 20%.",
    vermilionwebcap:
      "Vermilion Webcap. Aumenta a duração do efeito Indetectável após sair de um Portal em 3 segundos.",
    violetwaxcap:
      "Violet Waxcap. Aumenta a duração do efeito Indetectável após sair de um Portal em 1 segundo.",
    viscouswebbing:
      "Viscous Webbing. Aumenta o tempo necessário para os Sobreviventes fecharem Portais em 10%.",

    // === ADD-ONS DO DOCTOR (O Médico) ===
    calmcartersnotes:
      '"Calm" - Carter\'s Notes. Aumenta seu Raio de Terror em 8 metros quando a Explosão Estática está pronta e reduz em 8 metros quando está em recarga.',
    calmclassi:
      '"Calm" - Class I. Aumenta seu Raio de Terror em 4 metros quando a Explosão Estática está pronta e reduz em 4 metros quando está em recarga.',
    calmclassii:
      '"Calm" - Class II. Aumenta seu Raio de Terror em 6 metros quando a Explosão Estática está pronta e reduz em 6 metros quando está em recarga.',
    disciplinecartersnotes:
      '"Discipline" - Carter\'s Notes. Reduz o atraso da detonação da Terapia de Choque em 0.2s. Na Loucura II, Sobreviventes veem a Mancha Vermelha atrás deles durante a perseguição.',
    disciplineclassii:
      '"Discipline" - Class II. Reduz o atraso da detonação da Terapia de Choque em 0.1s. Na Loucura II, Sobreviventes veem a Mancha Vermelha atrás deles durante a perseguição.',
    disciplineclassiii:
      '"Discipline" - Class III. Reduz o atraso da detonação da Terapia de Choque em 0.15s. Na Loucura II, Sobreviventes veem a Mancha Vermelha atrás deles durante a perseguição.',
    highstimuluselectrode:
      "High Stimulus Electrode. Aumenta o alcance do ataque de Terapia de Choque em 4 metros.",
    interviewtape:
      "Interview Tape. Transforma a área da Terapia de Choque em um feixe de 2 metros de largura por 24 metros de comprimento.",
    iridescentking:
      "Iridescent King. Sobreviventes sofrem aleatoriamente das aflições de Calm, Discipline, Order e Restraint e Pallets Dropadas são substituídas por Pallets Ilusórias.",
    iridescentqueen:
      "Iridescent Queen. Sobreviventes atingidos por Terapia de Choque ganham Carga Estática. Se ficarem a 4m de outro Sobrevivente, ambos recebem um choque.",
    mapleknight:
      "Maple Knight. Revela a área de efeito do ataque de Terapia de Choque.",
    mouldyelectrode:
      "Mouldy Electrode. Aumenta o alcance do ataque de Terapia de Choque em 2 metros.",
    ordercartersnotes:
      '"Order" - Carter\'s Notes. Reduz o tempo de recarga da Explosão Estática em 3 segundos. Paletes quebradas são substituídas por Paletes Ilusórias.',
    orderclassi:
      '"Order" - Class I. Reduz o tempo de recarga da Explosão Estática em 2 segundos. Paletes quebradas são substituídas por Paletes Ilusórias.',
    orderclassii:
      '"Order" - Class II. Reduz o tempo de recarga da Explosão Estática em 2.5 segundos. Paletes quebradas são substituídas por Paletes Ilusórias.',
    polishedelectrode:
      "Polished Electrode. Aumenta o alcance do ataque de Terapia de Choque em 3 metros.",
    restraintcartersnotes:
      '"Restraint" - Carter\'s Notes. Revela a aura de Sobreviventes por 3 segundos quando o nível de Loucura aumenta. Cria Médicos Ilusórios.',
    restraintclassii:
      '"Restraint" - Class II. Revela a aura de Sobreviventes por 1 segundo quando o nível de Loucura aumenta. Cria Médicos Ilusórios.',
    restraintclassiii:
      '"Restraint" - Class III. Revela a aura de Sobreviventes por 2 segundos quando o nível de Loucura aumenta. Cria Médicos Ilusórios.',
    scrappedtape:
      "Scrapped Tape. Transforma a área da Terapia de Choque em um anel, colocado a 8 metros na frente do Médico.",

    // === ADD-ONS DO DRÁCULA (The Dark Lord) ===
    alucardsshield:
      "Alucard's Shield. Quando um Portão de Saída é aberto, Pilares de Chamas surgem continuamente dentro da área do portão.",
    bloodfilledgoblet:
      "Blood-Filled Goblet. Aumenta a duração dos Orbes de Odor em 60%.",
    cerberustalon:
      "Cerberus Talon. Aumenta a distância de revelação de aura dos Orbes de Odor em 100%.",
    clocktowergear:
      "Clock Tower Gear. Reduz o tempo de recarga da habilidade de Metamorfose em 5%.",
    cubeofzoe:
      "Cube of Zoe. Quando um gerador é concluído, Pilares de Chamas surgem continuamente ao redor do Drácula por 10 segundos.",
    forceofecho:
      "Force of Echo. Aumenta a taxa de aparecimento de Orbes de Odor em 10%.",
    iridescentringofvlad:
      "Iridescent Ring of Vlad. Faz com que os Pilares de Chamas persigam (home-in) os Sobreviventes próximos.",
    killerdoll:
      "Killer Doll. Aumenta o bônus de redução de recarga ao coletar Orbes de Odor em 30%.",
    lapislazuli:
      "Lapis Lazuli. Após teleportar para uma janela, a Entidade a bloqueia para todos os Sobreviventes por 8 segundos.",
    magicalticket:
      "Magical Ticket. Aumenta a velocidade de Teleporte (Forma de Morcego) em 10%.",
    medusashair:
      "Medusa's Hair. Sobreviventes num raio de 8m do destino do seu Teleporte sofrem 8% de Lentidão por 4 segundos.",
    moonstonenecklace:
      "Moonstone Necklace. Reduz seu Raio de Terror em 8 metros (nas Formas de Vampiro e Lobo).",
    pocketwatch:
      "Pocket Watch. Recarrega instantaneamente a habilidade de Teleporte após quebrar uma Palete.",
    rubycirclet:
      "Ruby Circlet. Reduz o tempo de recarga do ataque Fogo do Inferno em 5%.",
    sunglasses:
      "Sunglasses. Aumenta o número de Pilares de Chamas em 1, mas aumenta o tempo de carga do ataque em 25%.",
    sylphfeather:
      "Sylph Feather. Quebrar uma Palete concede 1 Ficha (máx 5). Reduz a recarga do Fogo do Inferno em 5% por ficha (até -25%).",
    travellershat:
      "Traveller's Hat. Reduz o tempo de transição entre as Formas em 5%.",
    wargsfang:
      "Warg's Fang. Na Forma de Lobo, quando o Bote fica disponível, revela a aura de Sobreviventes cujos Orbes você coletou por 5s.",
    whitewolfmedallion:
      "White Wolf Medallion. Aumenta a duração do Instinto Assassino na Forma de Lobo em 1 segundo.",
    wingedboots:
      "Winged Boots. Aumenta o alcance do Teleporte (Forma de Morcego) em 20%.",

    // === ADD-ONS DA DRAGA (The Dredge) ===
    airfreshener:
      "Air Freshener. Aumenta o número de Fichas de Energia disponíveis para 4.",
    boatkey:
      "Boat Key. Aumenta a velocidade de Teletransporte durante o dia em 3 m/s. Aciona todas as fechaduras ativas nos armários romperem assim que os portões de saída são alimentados.",
    brokendoll: "Broken Doll. Aumenta a duração do Anoitecer em 20 segundos.",
    burntletters:
      "Burnt Letters. Aumenta em 25% as cargas adicionadas ao medidor de Anoitecer por ferir Sobreviventes.",
    caffeinetablets:
      "Caffeine Tablets. As Auras de armários trancados ficam destacadas em amarelo enquanto você carrega o Crepúsculo ou se teletransporta.",
    destroyedpillow:
      "Destroyed Pillow. Reduz o tempo de recarga de Crepúsculo em 2.5 segundos durante o Anoitecer.",
    fallenshingle:
      "Fallen Shingle. Aumenta a taxa de carregamento do medidor de Anoitecer em 15% por segundo ao usar Reinado das Trevas.",
    fieldrecorder:
      "Field Recorder. Faz com que o Julgamento comece ao Anoitecer. Faz com que o Anoitecer seja ativado automaticamente assim que o último Gerador está concluído. Os sobreviventes sofrem de Exaustão por 15 segundos após entrar em contato com o Remanescente.",
    followerscowl:
      "Follower's Cowl. Retornar ao Remanescente ativa o Instinto Assassino durante o dia.",
    haddiescalendar:
      "Haddie's Calendar. Reduz o tempo de saída de armários trancados em 0.4 segundos.",
    iridescentwoodenplank:
      "Iridescent Wooden Plank. Os sobreviventes sofrem com a Exposição durante os últimos 12 segundos do Anoitecer.",
    lavaliermicrophone:
      "Lavalier Microphone. As Auras de todos os Sobreviventes são reveladas para você por 3 segundos após consumir o último Token de Poder. Causa todos os armários a uma distância de até 6 metros dos Sobreviventes abrirem e fecharem as portas ao entrar nelas por teletransporte.",
    malthinkersskull:
      "Malthinker's Skull. Aumenta a taxa de carregamento do medidor de Anoitecer em 25% por segundo enquanto os Sobreviventes estiverem feridos.",
    mortarandpestle:
      "Mortar and Pestle. Você emerge do Remanescente virado para a sua direção no momento da Teletransportação, em vez daquela em que você havia colocado o Remanescente.",
    ottomarianwriting:
      "Ottomarian Writing. Reduz o tempo de recarga de Crepúsculo em 2 segundos durante o dia.",
    sacrificialknife:
      "Sacrificial Knife. Bloqueia todos os locais do Cofre num raio de 16 metros do Armário do qual você emerge por 5 segundos.",
    tillingblade:
      "Tilling Blade. Os sobreviventes sofrem de Cegueira, Hemorragia e Dilaceração por 80 segundos após sofrer ferimentos durante o Anoitecer.",
    warhelmet:
      "War Helmet. Aumenta a duração do Instinto Assassino em 1.5 segundos durante o Anoitecer.",
    woodenplank:
      "Wooden Plank. Aumenta em 25% as cargas adicionadas ao medidor de Anoitecer ao pendurar sobreviventes.",
    worrystone:
      "Worry Stone. As Auras de Sobreviventes trancando um Armário são reveladas a você por 6 segundos.",

    // === ADD-ONS DO FREDDY (The Nightmare) ===
    blackbox:
      "Black Box. Bloqueia Portões de Saída abertos por 15 segundos para Sobreviventes que estão no Mundo dos Sonhos.",
    bluedress:
      "Blue Dress. Revela a aura de Sobreviventes que falham em Testes de Perícia por 4 segundos. Aumenta levemente a penalidade de regressão.",
    catblock:
      "Cat Block. Usar a Projeção Onírica ativa o Instinto Assassino por 4 segundos em Sobreviventes num raio de 16m do gerador.",
    classphoto:
      "Class Photo. Todos os geradores jorram sangue durante a Projeção Onírica e a Casca não aparece. Impede o cancelamento da Projeção.",
    gardenrake:
      "Garden Rake. Substitui as Caixas de Sonho por Paletes Oníricas. Começa a partida com 7 Paletes Oníricas.",
    greendress:
      "Green Dress. Revela a aura de Sobreviventes que falham em Testes de Perícia por 3 segundos. Aumenta a penalidade de regressão.",
    jumprope:
      "Jump Rope. Aumenta o volume dos gemidos de dor de Sobreviventes feridos no Mundo dos Sonhos em 50%.",
    kidsdrawing:
      "Kid's Drawing. Reduz a penalidade de velocidade causada pelas Caixas de Sonho em 10%. Concede pontos de sangue extras.",
    nancysmasterpiece:
      "Nancy's Masterpiece. Reduz o tempo de recarga da Projeção Onírica em 3% (até -12%) para cada Sobrevivente dormindo.",
    nancyssketch:
      "Nancy's Sketch. Reduz o tempo de recarga da Projeção Onírica em 2% (até -8%) para cada Sobrevivente dormindo.",
    outdoorrope:
      "Outdoor Rope. Aumenta o alcance audível dos ruídos de reparo dos Sobreviventes no Mundo dos Sonhos em 8 metros.",
    paintthinner:
      "Paint Thinner. Substitui as Caixas de Sonho por Paletes Oníricas. Revela a aura de Sobreviventes que interagem com Paletes Oníricas por 6 segundos.",
    pillbottle:
      "Pill Bottle. Reduz a distância de visibilidade intermitente (12 a 24m) e invisibilidade total (24m) do Freddy para Sobreviventes acordados.",
    prototypeclaws:
      "Prototype Claws. Substitui as Caixas de Sonho por Paletes Oníricas. Revela a aura de Sobreviventes que interagem com Paletes Oníricas por 4 segundos.",
    redpaintbrush:
      "Red Paint Brush. Todos os Sobreviventes começam a partida no Mundo dos Sonhos. Falhar em testes de perícia não acorda os Sobreviventes.",
    sheepblock:
      "Sheep Block. Sobreviventes que interagem com uma Armadilha de Sonho ou Palete sofrem de Cegueira por 60 segundos.",
    swingchains:
      "Swing Chains. Aumenta o volume dos passos de Sobreviventes no Mundo dos Sonhos em 50%.",
    unicornblock:
      "Unicorn Block. Sobreviventes que interagem com uma Armadilha de Sonho ou Palete sofrem de Cegueira por 90 segundos.",
    woolshirt:
      "Wool Shirt. Aumenta a penalidade de regressão por falhar em Testes de Perícia de reparo e cura em 4%.",
    zblock:
      "Z Block. Usar a Projeção Onírica ativa o Instinto Assassino por 6 segundos em Sobreviventes num raio de 16m do gerador.",

    // === ADD-ONS DO GHOST FACE ===
    cheapcologne:
      "Cheap Cologne. Aumenta a duração da Marca nos Sobreviventes em 10 segundos.",
    chewedpen:
      "Chewed Pen. Aumenta o tempo necessário para ser revelado por Sobreviventes no Estado Agonizante para 3 segundos.",
    cinchstraps:
      "Cinch Straps. O Manto da Noite permanece ativo após errar um Ataque Básico.",
    driverslicense:
      "Driver's License. Ao marcar um Sobrevivente reparando, o gerador explode, perde 20% de progresso e é bloqueado por 15 segundos.",
    droplegknifesheath:
      "Drop-Leg Knife Sheath. Concede 10% de Celeridade por 5 segundos após marcar um Sobrevivente.",
    ghostfacecaughtontape:
      "Ghost Face Caught on Tape. Recarrega instantaneamente o Manto da Noite ao derrubar um Sobrevivente com um ataque básico.",
    headlinecutouts:
      "Headline Cut-Outs. Aumenta sua velocidade de movimento enquanto Persegue (Stalking) em 40%.",
    knifebeltclip:
      "Knife Belt Clip. Reduz seu Raio de Terror em 12 metros enquanto estiver agachado.",
    lastingperfume:
      "Lasting Perfume. Aumenta o tempo necessário para ser revelado por Sobreviventes no Gancho para 3 segundos.",
    leatherknifesheath:
      "Leather Knife Sheath. Aumenta sua velocidade de movimento agachado em 10%.",
    markedmap:
      "Marked Map. Aumenta a duração do Instinto Assassino em 2 segundos.",
    nightvisionmonocular:
      "Night Vision Monocular. Sobreviventes que te revelam sofrem de Exaustão por 10 segundos.",
    olsensaddressbook:
      "Olsen's Address Book. As auras de Sobreviventes Marcados realizando ações rápidas são reveladas a você por 5 segundos.",
    olsensjournal:
      "Olsen's Journal. Sobreviventes Marcados sofrem do status Alheio (Oblivious).",
    olsenswallet:
      "Olsen's Wallet. Recarrega instantaneamente o Manto da Noite ao quebrar uma Parede ou Palete.",
    outdoorsecuritycamera:
      "Outdoor Security Camera. Revela a aura de todos os Sobreviventes por 7 segundos ao derrubar um Sobrevivente Marcado.",
    philly:
      "Philly. Reduz o tempo necessário para marcar Sobreviventes em 20%.",
    telephotolens:
      "Telephoto Lens. Sobreviventes que te revelam sofrem do status Alheio (Oblivious) por 60 segundos.",
    victimsdetailedroutine:
      "Victim's Detailed Routine. Sobreviventes sofrem de Exaustão por 5 segundos após serem marcados.",
    walleyesmatchbook:
      "Walleye's Matchbook. Reduz o tempo de recuperação do Manto da Noite em 6 segundos.",

    // === ADD-ONS DO GHOUL (Kaneki) ===
    amonsnecktie:
      "Gravata de Amon. Ao executar o Salto Médio, as Auras de Paletes e Janelas são reveladas a você em um raio de 32 metros.",
    anteikuapron:
      "Avental Anteiku. Reduz o tempo de deslizamento após o Salto de Kagune em 50%.",
    aogiritreerobe:
      "Manto da Árvore Aogiri. Sempre que um gerador for concluído no Modo Enraivecido, concede o efeito Indetectável por 20 segundos.",
    bloodstainedhandkerchief:
      "Lenço manchado de sangue. Aumenta o alcance máximo dos Saltos Kagune em 1 metro.",
    brokenchain:
      "Corrente quebrada. Reduz o tempo de recarga do Salto Kagune em 1,4 segundos por ficha quando fora do Modo Enfurecido.",
    ccgidcard:
      "Cartão de Identificação CCG. Executar um Salto Kagune revela as Auras de todos os Sobreviventes afetados pela Marca Kagune em um raio de 24 metros por 3 segundos.",
    freshcoffee:
      "Café fresco. Aumenta a velocidade de movimento durante os Saltos de Kagune em 2 m/s.",
    hidesheadphones:
      "Fones de ouvido do Hide. Sobreviventes afetados pela Marca Kagune sofrem com a Inconsciência até que a marca seja removida.",
    hinamisumbrella:
      "O guarda-chuva de Hinami. Aumenta em 10 segundos o tempo adicionado à contagem regressiva para cada ataque de agarramento perfeitamente executado.",
    iridescenteyepatch:
      "Adesivo iridescente para os olhos. Desbloqueia o potencial no terceiro Salto de Kagune consecutivo enquanto estiver no Modo Enraivecido: se usado para saltar sobre uma palete caída, ele a quebra instantaneamente.",
    kanekissatchel:
      "Mochila do Kaneki. Aumenta a velocidade de movimento do terceiro Salto Kagune consecutivo em 4,2 m/s.",
    kanekiswallet:
      "A carteira de Kaneki. Aumenta em 3 segundos a janela de oportunidade para realizar saltos de Kagune consecutivos.",
    madosglove:
      "Luva de Mado. Os sobreviventes afetados pela Marca Kagune sofrem de Exaustão por 15 segundos após sua remoção.",
    redheadedcentipede:
      "Centopeia de Cabeça Vermelha. Executar uma ação de Salto enquanto estiver no Modo Enfurecido bloqueia essa janela para todos os Sobreviventes por 10 segundos.",
    redspiderlily:
      "Lírio-aranha-vermelho. Sobreviventes atingidos por um Ataque Básico enquanto estiverem no Modo Enfurecido sofrem de Hemorragia por 60 segundos.",
    rizesglasses:
      "Óculos de Rize. Ao entrar no Modo Enfurecido, as Auras de Sobreviventes saudáveis que estão atualmente reparando um Gerador são reveladas a você por 8 segundos.",
    taiyaki: "Taiyaki. Aumenta a contagem regressiva em 5 segundos.",
    theblackgoatsegg:
      "O Ovo da Cabra Preta. Concluir com sucesso o evento de tempo rápido durante um ataque de agarramento concede um bônus de 100% de Pontos de Sangue.",
    tortureapparatus:
      "Aparelhos de tortura. Sempre que o Modo Enfurecido terminar, concede 5% de Aceleração por 6 segundos.",
    yamorismask:
      "Máscara de Yamori. Pendurar um Sobrevivente no gancho enquanto estiver no Modo Enfurecido faz com que todos os Sobreviventes a mais de 40 metros gritem e revelem sua localização por 3 segundos.",

    // === ADD-ONS DA HAG (A Bruxa) ===
    bloodiedmud:
      "Bloodied Mud. Reduz o alcance de ativação das Armadilhas Fantasma em 30% (aumenta a chance de não ser queimada por lanternas).",
    bloodiedwater:
      "Bloodied Water. Reduz o alcance de ativação das Armadilhas Fantasma em 20%.",
    bogwater:
      "Bog Water. Reduz o alcance de ativação das Armadilhas Fantasma em 10%.",
    crackedturtleegg:
      "Cracked Turtle Egg. Aumenta a duração da ativação das Armadilhas Fantasma em 30%.",
    cypressnecklet:
      "Cypress Necklet. Aumenta a velocidade de instalação das Armadilhas Fantasma em 15%.",
    deadflymud:
      "Dead Fly Mud. Aumenta o alcance de teleporte para armadilhas ativadas em 10%.",
    disfiguredear:
      "Disfigured Ear. Sobreviventes sofrem do status Ensurdecido por 6 segundos após ativar uma Armadilha Fantasma.",
    dragonflywings:
      "Dragonfly Wings. Aumenta o alcance de teleporte para armadilhas ativadas em 12.5%.",
    driedcicada:
      "Dried Cicada. Aumenta o alcance de teleporte para armadilhas ativadas em 15%.",
    grandmasheart:
      "Grandma's Heart. Suprime seu Raio de Terror quando as armadilhas são ativadas. Aumenta o alcance do Raio de Terror Falso dos fantasmas para 16 metros.",
    halfeggshell:
      "Half Eggshell. Aumenta a duração da ativação das Armadilhas Fantasma em 25%.",
    mintrag:
      "Mint Rag. Permite teleportar para qualquer Armadilha Fantasma não ativada no mapa (Recarga de 10s).",
    powderedeggshell:
      "Powdered Eggshell. Aumenta a duração da ativação das Armadilhas Fantasma em 20%.",
    pussywillowcatkins:
      "Pussy Willow Catkins. Revela a aura de Sobreviventes que ativam Armadilhas Fantasma por 3 segundos.",
    ropenecklet:
      "Rope Necklet. Aumenta a velocidade de instalação das Armadilhas Fantasma em 10%.",
    rustyshackles:
      "Rusty Shackles. As Armadilhas Fantasma não geram Fantasmas de Lama nem dão indicação visual de ativação aos Sobreviventes.",
    scarredhand:
      "Scarred Hand. Fantasmas de Lama têm colisão e bloqueiam caminhos. Desabilita a capacidade de teleporte. Concede 300% mais Pontos de Sangue em Deviousness.",
    swamporchidnecklet:
      "Swamp Orchid Necklet. Aumenta a velocidade de instalação das Armadilhas Fantasma em 20%.",
    waterloggedshoe:
      "Waterlogged Shoe. Aumenta permanentemente a velocidade de movimento para 4.73 m/s (+7.5%). Sobreviventes na área da armadilha sofrem 9% de Lentidão. Desabilita teleporte.",
    willowwreath:
      "Willow Wreath. Revela a aura de Sobreviventes que ativam Armadilhas Fantasma por 5 segundos.",

    // === ADD-ONS DO HILLBILLY (O Caipira) ===
    apexmuffler:
      "Apex Muffler. A Motosserra fica completamente silenciosa para todos os Sobreviventes fora do seu Raio de Terror.",
    begrimedchains:
      "Begrimed Chains. Sobreviventes atingidos pela Motosserra sofrem de Hemorragia e Dilaceração por 70 segundos.",
    cloggedintake:
      "Clogged Intake. Aumenta a duração do modo Sobrecarga em 15%.",
    counterweight:
      "Counterweight. Reduz a taxa de curva inicial da Motosserra durante a Corrida em 70%.",
    crackedprimerbulb:
      "Cracked Primer Bulb. Aumenta a taxa de carregamento do medidor de Sobrecarga em 15%. Sobreviventes atingidos sofrem apenas um estado de dano (não derruba instantaneamente).",
    dadsboots:
      "Dad's Boots. Aumenta a velocidade de curva durante a Corrida de Motosserra em 20%.",
    discardedairfilter:
      "Discarded Air Filter. Aumenta o tempo que leva para o medidor de Sobrecarga começar a decair em 20%.",
    filthyslippers:
      "Filthy Slippers. Ganha o efeito Indetectável após manter uma Corrida de Motosserra por 2 segundos, até parar de correr.",
    greasedthrottle:
      "Greased Throttle. Reduz o tempo de recarga após usar a Motosserra em 5% (quando não estiver em Sobrecarga).",
    highspeedidlerscrew:
      "High-Speed Idler Screw. Aumenta o tempo que leva para o medidor de Sobrecarga começar a decair em 30%.",
    iridescentengravings:
      "Iridescent Engravings. Aumenta a velocidade de movimento durante a Corrida de Motosserra em 20%, mas aumenta o tempo de carga em 12%.",
    loprochains:
      "LoPro Chains. Permite continuar a Corrida de Motosserra através de Paredes Quebráveis e Paletes. Sobreviventes atingidos 5s após quebrar algo sofrem apenas um estado de dano (ou Ferida Profunda se já feridos).",
    lowkickbackchains:
      "Low Kickback Chains. Reduz o tempo de recarga após bater em um obstáculo durante a Corrida de Motosserra em 15%.",
    offbrandmotoroil:
      "Off-Brand Motor Oil. Aumenta a taxa de carregamento do medidor de Sobrecarga em 15%.",
    raggedengine:
      "Ragged Engine. Reduz a velocidade de dissipação do medidor de Sobrecarga quando não está usando a Motosserra em 30%.",
    spikedboots:
      "Spiked Boots. Aumenta a velocidade de curva durante a Corrida de Motosserra em 30%.",
    steeltoeboots:
      "Steel Toe Boots. Reduz o tempo de recarga após bater em um obstáculo durante a Corrida de Motosserra em 10%.",
    thermalcasing:
      "Thermal Casing. Reduz a velocidade de dissipação do medidor de Sobrecarga quando não está usando a Motosserra em 20%.",
    thethompsonsmix:
      "The Thompson's Mix. Reduz o tempo de recarga após usar a Motosserra em 10% (quando não estiver em Sobrecarga).",
    tunedcarburettor:
      "Tuned Carburettor. Aumenta a velocidade de carga da Motosserra em 20%, mas reduz sua velocidade de movimento base para 4.4 m/s.",

    // === ADD-ONS DA MESTRA DA MATILHA (The Houndmaster) ===
    barleymeal:
      "Barley Meal. Aumenta a distância do Caminho de Perseguição Inicial em 20%.",
    belayingpins:
      "Belaying Pins. Sobreviventes afetados pelo Faro de Cão também sofrem do status Alheio (Oblivious) por 20 segundos.",
    creaturesbone:
      "Creature's Bone. Reduz a duração do Atordoamento do Cão em 50%.",
    fattymeat:
      "Fatty Meat. Sobreviventes afetados pelo Faro de Cão gritam periodicamente a cada 15 segundos, mas sem revelar sua localização exata para a Mestra.",
    gunpowdertin:
      "Gunpowder Tin. Aumenta a velocidade de quebrar Paredes/Paletes e danificar Geradores em 40% por 20s após um Sobrevivente ser afetado pelo Faro de Cão.",
    iridescentwheelhandle:
      "Iridescent Wheel Handle. Aumenta a duração do Cão na Localização Alvo do Comando de Busca em 20%. Concede Indetectável enquanto o Cão cumpre o Comando de Busca.",
    knottedrope:
      "Knotted Rope. Reduz o tempo de recarga de Ataques Básicos bem-sucedidos em 10% contra Sobreviventes agarrados pelo Cão.",
    leatherharness:
      "Leather Harness. Sempre que um Gerador é concluído, aumenta a velocidade de Perseguição do Cão em 20% por 30 segundos. (Efeito permanente após todos os geradores).",
    marlinspike:
      "Marlinspike. Sobreviventes num raio de 20 metros do Cão agarrando um Sobrevivente tornam-se afetados pelo Faro de Cão.",
    shipfigurehead:
      "Ship Figurehead. Aumenta seu Raio de Terror em 8m enquanto o Cão te segue. Reduz seu Raio de Terror em 8m enquanto o Cão está longe.",
    smokedsnapper:
      "Smoked Snapper. Reduz o tempo de recuperação do Poder em 5%.",
    spikedcollar:
      "Spiked Collar. Sobreviventes feridos enquanto agarrados pelo Cão sofrem de Hemorragia e Dilaceração por 45 segundos.",
    spyglass:
      "Spyglass. As auras de Sobreviventes afetados pelo Faro de Cão são reveladas por 3 segundos após o efeito terminar.",
    stickypitch:
      "Sticky Pitch. Aumenta sua velocidade de movimento em 2% enquanto caminha ao longo do Caminho de Busca.",
    tornnovel:
      "Torn Novel. As auras de Sobreviventes num raio de 10m do Cão são reveladas a você. O efeito persiste por 2s após sair da habilidade.",
    trainersbook:
      "Trainer's Book. Aumenta a duração do efeito de Faro de Cão em 35%.",
    trainingbell:
      "Training Bell. A aura do Sobrevivente responsável por atordoar o Cão é revelada a você por 5 segundos.",
    unfinishedmap:
      "Unfinished Map. Sobreviventes afetados pelo Faro de Cão sofrem de Exaustão por 15 segundos.",
    waterskin:
      "Waterskin. Aumenta a distância do Caminho de Perseguição Redirecionado em 20%.",
    youngcoconut:
      "Young Coconut. Aumenta a velocidade de Perseguição do Cão em 5%.",

    // === ADD-ONS DA HUNTRESS (A Caçadora) ===
    amanitatoxin:
      "Amanita Toxin. Sobreviventes atingidos por Machadinhas sofrem do status Cegueira por 60 segundos.",
    bandagedhaft:
      "Bandaged Haft. Reduz o tempo de recarga entre arremessos sucessivos de Machadinhas em 10%.",
    begrimedhead:
      "Begrimed Head. Sobreviventes atingidos por Machadinhas sofrem de Hemorragia e Dilaceração por 80 segundos.",
    coarsestone:
      "Coarse Stone. Aumenta o volume dos Gemidos de Dor de Sobreviventes feridos por Machadinhas em 50%.",
    deerskingloves:
      "Deerskin Gloves. Aumenta a velocidade de recarregar Machadinhas em Armários em 20%.",
    flowerbabushka:
      "Flower Babushka. Reduz o tempo de preparação (Wind-up) das Machadinhas em 0.1 segundos.",
    glowingconcoction:
      "Glowing Concoction. A aura de Sobreviventes atingidos por Machadinhas é revelada a você por 5 segundos.",
    infantrybelt:
      "Infantry Belt. Acertar um Sobrevivente com uma Machadinha concede 3% de Celeridade por 5 segundos.",
    iridescenthead:
      "Iridescent Head. Sobreviventes atingidos por Machadinhas entram automaticamente no Estado Agonizante. Reduz a capacidade máxima de Machadinhas em 1 (não acumulável).",
    leatherloop:
      "Leather Loop. Acertar um Sobrevivente com uma Machadinha concede 2% de Celeridade por 5 segundos.",
    mannagrassbraid:
      "Manna Grass Braid. Reduz o tempo de preparação (Wind-up) das Machadinhas em 8%.",
    oakhaft:
      "Oak Haft. Reduz o tempo de recarga entre arremessos sucessivos de Machadinhas em 20%.",
    roseroot:
      "Rose Root. Aumenta a velocidade do projétil da Machadinha em 20%.",
    rustyhead:
      "Rusty Head. Sobreviventes atingidos por Machadinhas sofrem do status Dilacerado por 70 segundos.",
    shinypin:
      "Shiny Pin. Aumenta a velocidade de movimento enquanto prepara Machadinhas em 5%.",
    soldiersputtee:
      "Soldier's Puttee. Aumenta a velocidade de movimento da Caçadora para 4.6 m/s quando ela está sem Machadinhas.",
    venomousconcoction:
      "Venomous Concoction. Sobreviventes atingidos por Machadinhas sofrem de Exaustão por 5 segundos.",
    weightedhead:
      "Weighted Head. Sobreviventes atingidos por Machadinhas sofrem do status Incapacitado por 10 segundos.",
    woodenfox:
      "Wooden Fox. Concede o status Indetectável por 30 segundos após recarregar em um Armário.",
    yellowedcloth:
      "Yellowed Cloth. Aumenta a velocidade do projétil da Machadinha em 10%.",

    // === ADD-ONS DO KNIGHT (O Cavaleiro) ===
    battleaxehead:
      "Battle Axe Head. Reduz o tempo de recarga após invocar o Carnifex em 20%.",
    blacksmithshammer:
      "Blacksmith's Hammer. Sobreviventes danificados por um Guarda durante uma Caçada sofrem do status Quebrado por 60 segundos.",
    brokenhilt:
      "Broken Hilt. Sobreviventes danificados por um Guarda sofrem de Hemorragia e Dilaceração por 70 segundos.",
    calltoarms:
      "Call to Arms. Aumenta o comprimento máximo do Caminho de Patrulha em 10 metros. Aumenta a velocidade de movimento ao desenhar o Caminho em 2.2 m/s.",
    coldsteelmanacles:
      "Cold Steel Manacles. Reduz o tempo de recarga após invocar o Carcereiro (Jailer) em 20%.",
    driedhorsemeat:
      "Dried Horsemeat. Aumenta a duração de uma Caçada em 4 segundos.",
    flintandsteel:
      "Flint and Steel. Invocar o Carnifex revela a aura de todos os Sobreviventes num raio de 24 metros de Paletes inteiras por 8 segundos.",
    grimironmask:
      "Grim Iron Mask. Sobreviventes detectados por um Guarda durante a Fase de Patrulha sofrem de Cegueira por 75 segundos.",
    grittylump:
      "Gritty Lump. Aumenta a velocidade de movimento dos Guardas durante a Fase de Patrulha em 9%.",
    healingpoultice:
      "Healing Poultice. Invocar o Assassino revela a aura de todos os Sobreviventes num raio de 8 metros do local de surgimento dele por 8 segundos.",
    iridescentcompanybanner:
      "Iridescent Company Banner. Bloqueia janelas no Caminho de Patrulha por 25s após invocar um Guarda. Bloqueia janelas e Portões de Saída para o Sobrevivente Caçado.",
    ironworkerstongs:
      "Ironworker's Tongs. Sobreviventes sofrem do status Alheio (Oblivious) por 60 segundos se um Guarda falhar em danificá-los durante uma Caçada.",
    jailerschimes:
      "Jailer's Chimes. Revela a aura de Sobreviventes que cruzam o Caminho de Patrulha do Carcereiro por 8 segundos.",
    knightscontract:
      "Knight's Contract. Faz com que um Guarda permaneça por 8 segundos após completar uma Ordem, iniciando uma Caçada se detectar um Sobrevivente nesse tempo.",
    mapoftherealm:
      "Map of the Realm. Aumenta o alcance de visão de um Guarda durante a Fase de Patrulha em 2 metros.",
    pillagedmead:
      "Pillaged Mead. Reduz a duração da ação de Quebrar ou Danificar de um Guarda em 10%.",
    sharpenedmount:
      "Sharpened Mount. Aumenta a duração do surgimento do Estandarte em 15%.",
    tatteredtabard:
      "Tattered Tabard. Aumenta a duração da Fase de Patrulha em 8 segundos.",
    townwatchstorch:
      "Town Watch's Torch. Concede o status Indetectável durante uma Caçada (enquanto um Guarda persegue).",
    treatedblade:
      "Treated Blade. Reduz o tempo de recarga após invocar o Assassino em 20%.",

    // === ADD-ONS DA KRASUE ===
    brokentiara:
      "Broken Tiara. Sobreviventes sofrem do status Alheio (Oblivious) enquanto estiverem sob o efeito do Fungo Brilhante.",
    chickenhead:
      "Chicken Head. Todos os Sobreviventes começam a partida afligidos por Sanguessuga I. Aumenta a contagem inicial de Fungo Brilhante em 2.",
    chunkofmalai:
      "Chunk of Malai. Aplica uma penalidade de eficiência de -8% por Sobrevivente Sanguessuga à taxa de esgotamento do Medidor de Sanguessuga (até -32%).",
    crumpledsheetmusic:
      "Crumpled Sheet Music. Acertar um Sobrevivente com uma Glândula Sanguessuga concede instantaneamente 12 Cargas ao Voo Impetuoso (Headlong Flight).",
    defectivemetronome:
      "Defective Metronome. Sobreviventes sofrem do status Exausto enquanto estiverem sob efeito do Fungo Brilhante.",
    dulledknife:
      "Dulled Knife. Reduz a taxa de consumo do Voo Impetuoso em 25%. Sobreviventes comendo Fungo ganham 5% de Celeridade e o status Elusivo por 5 segundos.",
    firstlibretto:
      "First Libretto. Ao enganchar um Sobrevivente Sanguessuga, reduz a taxa de consumo do Voo Impetuoso em 30% por 15 segundos.",
    framednewspaper:
      "Framed Newspaper. Aumenta a capacidade de carga do Voo Impetuoso em 6 cargas e a taxa de recarga em 15%. Aumenta o limiar de ativação para 50%.",
    janjirashand:
      "Janjira's Hand. Sempre que um Gerador é concluído, o Voo Impetuoso ganha 2 cargas instantaneamente e a recarga aumenta em 25% por 15s. (Efeito permanente após o último gerador).",
    lorenzasremains:
      "Lorenza's Remains. Sobreviventes afligidos por Sanguessuga sofrem efeitos: Tier I (Cegueira), Tier II (4% de Lentidão).",
    lucklessmouse:
      "Luckless Mouse. Aumenta a capacidade de carga do Voo Impetuoso em 2 cargas.",
    mysteriouselixir:
      "Mysterious Elixir. Atingir Janelas com uma Glândula Sanguessuga as deixa Marcadas. Pular uma janela marcada a bloqueia por 10 segundos.",
    pigseye:
      "Pig's Eye. Sobreviventes comendo Fungo Brilhante a mais de 40 metros têm sua aura revelada por 6 segundos.",
    queenssceptre:
      "Queen's Sceptre. Acertar um Sobrevivente com o Chicote Intestinal faz com que uma Glândula Sanguessuga espirre da localização dele.",
    rottenswine:
      "Rotten Swine. Atingir Paredes, Geradores ou Paletes com uma Glândula Sanguessuga os deixa Marcados. Aumenta a velocidade de quebrar/danificar objetos marcados em 15%.",
    shreddedgown:
      "Shredded Gown. Revela a aura de Sobreviventes a 8 metros de um Fungo Brilhante ou segurando um, por 5 segundos ao usar a Trama Corpórea.",
    spatteredhandkerchief:
      "Spattered Handkerchief. Quando os Portões são energizados, todos os Sobreviventes sofrem de Sanguessuga I e Fungos param de surgir.",
    stickylozenge:
      "Sticky Lozenge. Exibe uma prévia da zona de impacto enquanto carrega a habilidade Regurgitar.",
    theatrebinoculars:
      "Theatre Binoculars. Acertar um Sobrevivente não-Sanguessuga com o Chicote Intestinal revela a aura de todos os outros Sobreviventes num raio de 24m por 6 segundos.",
    wrigglingparasite:
      "Wriggling Parasite. Aumenta a taxa de carregamento do Medidor de Sanguessuga em 16%.",

    // === ADD-ONS DO LEATHERFACE (The Cannibal) ===
    awardwinningchilli:
      "Award-winning Chilli. Aumenta a duração da Corrida de Motosserra em 0.2s por Ficha consumida. Aumenta a janela de oportunidade da corrida em 0.2s.",
    begrimedchains:
      "Begrimed Chains. Sobreviventes atingidos pela Motosserra derrubam o item que estiverem segurando.",
    carburettortuningguide:
      "Carburettor Tuning Guide. Iniciar uma Corrida de Motosserra consome automaticamente todas as fichas, combinando suas durações. Aumenta a duração (+0.5s/ficha) e reduz a velocidade (-2%).",
    chainsawfile:
      "Chainsaw File. Reduz a duração do acesso de raiva (Tantrum) em 0.25 segundos.",
    chilli:
      "Chilli. Aumenta a duração da Corrida de Motosserra em 0.15s por Ficha consumida. Aumenta a janela de oportunidade da corrida em 0.15s.",
    depthgaugerake:
      "Depth Gauge Rake. Aumenta as Fichas de Poder em +1. Reduz a velocidade de recarga (-18%) e a velocidade de movimento durante a corrida (-2%).",
    grislychains:
      "Grisly Chains. Sobreviventes atingidos pela Motosserra sofrem do status Dilacerado (Mangled) por 70 segundos.",
    homemademuffler:
      "Homemade Muffler. Reduz a duração do acesso de raiva (Tantrum) em 0.5 segundos.",
    iridescentflesh:
      "Iridescent Flesh. Recarrega instantaneamente todas as Fichas de Poder ao acertar um Sobrevivente com a Motosserra. Reduz a duração máxima do Tantrum para 3s.",
    knifescratches:
      "Knife Scratches. Aumenta a velocidade de movimento durante a Corrida de Motosserra em 1.5%. Aumenta o tempo de carga em 10%.",
    lightchassis:
      "Light Chassis. A aura de Sobreviventes num raio de 8 metros é revelada enquanto você carrega a Motosserra.",
    longguidebar:
      "Long Guide Bar. Aumenta o limite antes que acelerar a serra cause um acesso de raiva em 2 segundos.",
    primerbulb:
      "Primer Bulb. Reduz o tempo de recarga das Fichas de Poder em 1 segundo.",
    rustedchains:
      "Rusted Chains. Sobreviventes atingidos pela Motosserra sofrem do status Quebrado (Broken) por 90 segundos.",
    shoplubricant:
      "Shop Lubricant. A aura de Sobreviventes derrubados pela Motosserra fica oculta para outros Sobreviventes por 20 segundos (se não houver ninguém por perto).",
    sparkplug:
      "Spark Plug. Reduz o tempo de recarga das Fichas de Poder em 0.5 segundos.",
    speedlimiter:
      "Speed Limiter. Concede 100% mais Pontos de Sangue em eventos de Motosserra. Sobreviventes atingidos sofrem apenas um estado de dano.",
    thebeastsmarks:
      "The Beast's Marks. Aumenta a velocidade de movimento durante a Corrida de Motosserra em 2%. Aumenta o tempo de carga em 12%.",
    thegrease:
      "The Grease. Aumenta o limite antes que acelerar a serra cause um acesso de raiva em 3 segundos.",
    vegetableoil:
      "Vegetable Oil. Reduz a duração do tempo de recarga da Motosserra em 0.3 segundos.",

    // === ADD-ONS DO LEGION (O Legião) ===
    bffs: "BFFs. Ganha Fichas por acertos no Frenesi. Se tiver 15+ Fichas quando os Portões forem energizados, ganha 6% de Celeridade fora do poder.",
    defacedsmileypin:
      "Defaced Smiley Pin. Sobreviventes sofrem do status Dilacerado (Mangled) por 60 segundos após se emendarem.",
    etchedruler:
      "Etched Ruler. Sobreviventes atingidos por um Corte Feral sofrem do status Alheio (Oblivious) por 60 segundos.",
    filthyblade:
      "Filthy Blade. Aumenta o tempo necessário para os Sobreviventes se emendarem em 4 segundos.",
    franksmixtape:
      "Frank's Mix Tape. Pausa o medidor de poder ao quebrar objetos. Aumenta a velocidade de danificar geradores em 20% e quebrar paredes em 30% durante o Frenesi.",
    friendshipbracelet:
      "Friendship Bracelet. Aumenta a duração do ataque (Lunge) durante os Cortes Ferais em 0.3 segundos.",
    fumingmixtape:
      "Fuming Mix Tape. Durante o Frenesi, a intensidade da aura dos geradores indica o progresso. Geradores não reparados começam a regredir.",
    iridescentbutton:
      "Iridescent Button. Durante o Frenesi Feral, pular uma Palete faz com que ela quebre instantaneamente.",
    joeysmixtape:
      "Joey's Mix Tape. Sobreviventes sofrem de Hemorragia até serem totalmente curados após se emendarem.",
    juliesmixtape:
      "Julie's Mix Tape. Recarrega instantaneamente o Frenesi Feral se você for atordoado (Stun) enquanto o usa.",
    mischieflist:
      "Mischief List. Aumenta a duração do Frenesi Feral em 2 segundos.",
    muralsketch:
      "Mural Sketch. Aumenta o bônus de velocidade de movimento por acerto consecutivo no Frenesi em +0.3 m/s (máximo +1.2 m/s).",
    neversleeppills:
      "Never-Sleep Pills. Aumenta a duração do Frenesi em 10s, mas reduz a velocidade base do Frenesi para 4.6 m/s. Concede muitos Pontos de Sangue extras.",
    scratchedruler:
      "Scratched Ruler. Reduz o tempo de recuperação do Frenesi Feral em 5 segundos.",
    smileyfacepin:
      "Smiley Face Pin. Sobreviventes sofrem do status Cegueira por 60 segundos após se emendarem.",
    stabwoundsstudy:
      "Stab Wounds Study. A aura de Sobreviventes é revelada a você por 4 segundos após eles terminarem de se emendar.",
    stolensketchbook:
      "Stolen Sketch Book. Sobreviventes atingidos por um segundo (ou mais) Corte Feral em cadeia derrubam o item que estão segurando.",
    stylishsunglasses:
      "Stylish Sunglasses. Revela a aura de Sobreviventes que estão se emendando num raio de 24 metros.",
    susiesmixtape:
      "Susie's Mix Tape. Aumenta o raio de detecção do Instinto Assassino em 20 metros.",
    thelegionpin:
      "The Legion Pin. Sobreviventes sofrem do status Quebrado (Broken) por 60 segundos após se emendarem.",

    // === ADD-ONS DO MICHAEL MYERS (The Shape) ===
    blondhair:
      "Blond Hair. Aumenta a duração das Marcas de Arranhão e Poças de Sangue em 100% no Modo Espreitar.",
    boyfriendsmemo:
      "Boyfriend's Memo. Aumenta o alcance de Espreitar em 8 metros.",
    deadrabbit:
      "Dead Rabbit. Reduz o Raio de Terror no Modo Perseguidor em 25% e aumenta no Modo Maldade Encarnada em 25%.",
    fragranttuftofhair:
      "Fragrant Tuft of Hair. Sobreviventes sofrem de Exposto. Aumenta o alcance do Bote em 50%. Desabilita o Golpe de Massacre.",
    glassfragment:
      "Glass Fragment. Aumenta a velocidade de movimento do Golpe de Massacre em 5%. Reduz a velocidade de carga em 10%.",
    hairbow: "Hair Bow. Aumenta a duração da Maldade Encarnada em 20 segundos.",
    hairbrush:
      "Hair Brush. Aumenta a velocidade de ação de quebrar a próxima Palete em 50% quando a Maldade Encarnada ativa.",
    jewellery:
      "Jewellery. Aumenta a velocidade de ganho de poder ao Espreitar em 10%.",
    jewellerybox:
      "Jewellery Box. Aumenta a velocidade de ganho de poder ao Espreitar em 30%. Reduz o alcance em 16 metros.",
    myersmemorial:
      "Myers Memorial. Aumenta a velocidade de Pegar e Enganchar Sobreviventes em 40% durante a Maldade Encarnada.",
    judithsjournal:
      "Judith's Journal. Aumenta a velocidade de ganho de poder ao Espreitar a Obsessão em 40%.",
    judithstombstone:
      "Judith's Tombstone. Enganchar um Sobrevivente durante Maldade Encarnada recarrega sua duração. Limita a duração máxima a 40 segundos.",
    lockofhair:
      "Lock of Hair. Segure o botão de Habilidade para encerrar Maldade Encarnada prematuramente, convertendo 50% da duração restante em progresso.",
    memorialflower:
      "Memorial Flower. Aumenta a velocidade de movimento enquanto Espreita para 4.4 m/s.",
    mirrorshard:
      "Mirror Shard. Aumenta a duração base do Golpe de Massacre em 0.25 segundos. Reduz a velocidade de carga em 25%.",
    reflectivefragment:
      "Reflective Fragment. Acertos bem-sucedidos com Golpe de Massacre adicionam 20 segundos à duração da Maldade Encarnada.",
    scratchedmirror:
      "Scratched Mirror. Revela a aura de todos os Sobreviventes num raio de 32m enquanto Espreita. O Mal Interior não pode passar do Tier I.",
    tackyearrings:
      "Tacky Earrings. Aumenta a velocidade de movimento enquanto Espreita em 20%.",
    tombstonepiece:
      "Tombstone Piece. Ativar Maldade Encarnada concede o status Indetectável por 20 segundos.",
    vanitymirror:
      "Vanity Mirror. Quando Maldade Encarnada termina, a aura de todos os Sobreviventes é revelada a você por 4 segundos.",

    // === ADD-ONS DO NEMESIS (O Nêmesis) ===
    adminwristband:
      "Admin Wristband. Aumenta o alcance de detecção de sobreviventes pelos Zumbis em 4 metros. Aumenta o campo de visão dos Zumbis em 17.5 graus.",
    adrenalineinjector:
      "Adrenaline Injector. Aumenta a duração do Instinto Assassino após um Sobrevivente usar uma Vacina em 3 segundos.",
    briansintestine:
      "Brian's Intestine. Aumenta a velocidade de movimento dos Zumbis em 0.25 m/s.",
    brokenrecoverycoin:
      "Broken Recovery Coin. Reduz o número de Caixas de Suprimentos no ambiente em 1.",
    damagedsyringe:
      "Damaged Syringe. Aumenta o tempo de injeção das Vacinas em 5 segundos.",
    depletedinkribbon:
      "Depleted Ink Ribbon. Reduz o tempo de respawn de Zumbis desintegrados em 5 segundos. Aumenta a velocidade de movimento dos Zumbis em 0.5 m/s. Quando os Portões são energizados, Zumbis renascem na área de saída.",
    iridescentumbrellabadge:
      "Iridescent Umbrella Badge. Sobreviventes sofrem do status Exposto por 60 segundos após usar uma Vacina.",
    jillssandwich:
      "Jill's Sandwich. As auras de Sobreviventes desbloqueando uma Caixa de Suprimentos são reveladas a você por 12 segundos após o sucesso.",
    lickertongue:
      "Licker Tongue. Aumenta a duração do efeito de Lentidão (Hindered) ao se tornar Contaminado em 1 segundo.",
    marvinsblood:
      "Marvin's Blood. Aumenta o ganho de Taxa de Mutação ao atingir Sobreviventes com o Golpe de Tentáculo em +0.5 pontos.",
    mikhailseye:
      "Mikhail's Eye. Aumenta a velocidade de movimento dos Zumbis em 0.35 m/s.",
    neparasite:
      "Ne-a Parasite. Sobreviventes sofrem do status Alheio (Oblivious) por 60 segundos após se tornarem Contaminados ou até se curarem com Vacina.",
    plant43vines:
      "Plant 43 Vines. Aumenta o tempo de abertura de Caixas de Suprimentos em 4 segundos.",
    serotonininjector:
      "Serotonin Injector. Concede o status Indetectável por 15 segundos após um Zumbi ser desintegrado por qualquer meio.",
    shatteredstarsbadge:
      "Shattered S.T.A.R.S. Badge. Aumenta a velocidade de movimento dos Zumbis em 1.5 m/s por 60 segundos cada vez que um Gerador é concluído.",
    starsfieldcombatmanual:
      "S.T.A.R.S. Field Combat Manual. A aura dos Zumbis é destacada em amarelo por 6 segundos quando eles atingem um Sobrevivente.",
    tvirussample:
      "T-Virus Sample. Aumenta o ganho de Taxa de Mutação ao atingir Zumbis com o Golpe de Tentáculo em +1 ponto.",
    tyrantgore:
      "Tyrant Gore. Reduz o tempo de respawn de Zumbis desintegrados em 7.5 segundos. Aumenta o ganho de Mutação ao atingir Zumbis em +0.75 pontos.",
    visitorwristband:
      "Visitor Wristband. Aumenta o alcance de detecção de sobreviventes pelos Zumbis em 2 metros. Aumenta o campo de visão dos Zumbis em 10 graus.",
    zombieheart:
      "Zombie Heart. Aumenta o ganho de Taxa de Mutação ao atingir Zumbis com o Golpe de Tentáculo em +0.75 pontos.",

    // === ADD-ONS DA NURSE (A Enfermeira) ===
    anxiousgasp:
      "Anxious Gasp. Teleportar passando a 1 metro de um Sobrevivente faz com que ele grite e revele sua localização. Concede pontos de sangue extras.",
    ataxicrespiration: "Ataxic Respiration. Reduz a duração da Fadiga em 7%.",
    badmankeepsake:
      "Bad Man Keepsake. Sobreviventes atingidos por um Ataque Especial têm a aura revelada por 60s se estiverem curando ou sendo curados num raio de 28m.",
    badmanslastbreath:
      '"Bad Man\'s" Last Breath. Atingir um Sobrevivente com um Ataque Especial concede o status Indetectável por 25 segundos. Possui recarga de 45s.',
    campbellslastbreath:
      "Campbell's Last Breath. Ao reaparecer de um Blink totalmente carregado, você realiza automaticamente outro Blink com carga total na direção que está olhando.",
    catatonicboystreasure:
      "Catatonic Boy's Treasure. Reduz a Fadiga extra causada por Blinks em Cadeia em 65%.",
    darkcincture:
      "Dark Cincture. Aumenta a velocidade de movimento durante a janela de oportunidade de Blink em Cadeia em 30%.",
    dullbracelet:
      "Dull Bracelet. Reduz o alcance máximo do Blink em 20%. Concede 100% de Pontos de Sangue bônus em pontuações de Blink Preciso.",
    fragilewheeze:
      "Fragile Wheeze. Sobreviventes atingidos por um Ataque Especial sofrem do status Dilacerado (Mangled) por 70 segundos.",
    heavypanting:
      "Heavy Panting. Estende a duração do Bote (Lunge) de Ataques Especiais para 130% (aumenta alcance em 30%) após o segundo ou terceiro Blink.",
    jennerslastbreath:
      "Jenner's Last Breath. Permite pressionar o botão de Habilidade Ativa para retornar imediatamente à posição original após esgotar os Blinks. Recarrega 1 Carga.",
    kavanaghslastbreath:
      "Kavanagh's Last Breath. Ao sucumbir à Fadiga, Sobreviventes num raio de 8 metros sofrem do status Cegueira por 60 segundos.",
    matchbox:
      "Matchbox. Aumenta a velocidade de movimento base para 4.4 m/s. Reduz a quantidade de Blinks para 1.",
    metalspoon:
      "Metal Spoon. Aumenta o volume dos gemidos de dor de Sobreviventes atingidos por um Ataque Especial em 50% por 60 segundos.",
    plaidflannel:
      "Plaid Flannel. Permite visualizar o local de aterrissagem do Blink.",
    pocketwatch:
      "Pocket Watch. Aumenta a duração da janela de oportunidade de Blink em Cadeia em 0.2 segundos.",
    spasmodicbreath:
      "Spasmodic Breath. Atingir um Sobrevivente com um Ataque Especial aumenta sua velocidade de movimento para 4.6 m/s por 60 segundos, mas desabilita o Blink.",
    tornbookmark:
      "Torn Bookmark. Aumenta a quantidade de cargas de Blink em +1. Aumenta o tempo de recarga das cargas em 30%.",
    whitenitcomb:
      "White Nit Comb. Reduz a duração do Bote de Ataques Especiais em 0.15s (o que reduz o alcance do ataque em 50%). Concede 100% de BP bônus.",
    woodenhorse:
      "Wooden Horse. Reduz a Fadiga extra aplicada por errar Ataques Especiais em 0.5 segundos.",

    // === ADD-ONS DO ONI (The Oni) ===
    akitoscrutch:
      "Akito's Crutch. Aumenta a velocidade de movimento durante a Investida Demoníaca em 1 m/s.",
    blackenedtoenail:
      "Blackened Toenail. Aumenta sua velocidade de movimento enquanto absorve Orbes de Sangue em 0.4 m/s.",
    bloodysash:
      "Bloody Sash. Aumenta sua velocidade de movimento enquanto absorve Orbes de Sangue em 0.7 m/s.",
    childswoodensword:
      "Child's Wooden Sword. Aumenta o alcance de visualização da aura dos Orbes de Sangue em 3 metros.",
    chippedsaihai:
      "Chipped Saihai. Aumenta a duração da Fúria Sangrenta em 6 segundos.",
    crackedsakazuki:
      "Cracked Sakazuki. Reduz o tempo de ativação e desativação da Fúria Sangrenta em 0.5 segundos.",
    inklion:
      "Ink Lion. Reduz o tempo de ativação/desativação da Fúria Sangrenta em 0.5s. Reduz a penalidade do medidor ao derrubar sobreviventes em 2 segundos.",
    iridescentfamilycrest:
      "Iridescent Family Crest. Errar um Golpe Demoníaco e acertar o chão faz Sobreviventes num raio de 24m gritarem e revelarem sua localização.",
    kanaianzentalisman:
      "Kanai-Anzen Talisman. Aumenta a velocidade de movimento durante a Investida Demoníaca em 0.64 m/s.",
    lionfang: "Lion Fang. Aumenta a duração da Fúria Sangrenta em 10 segundos.",
    paperlantern:
      "Paper Lantern. Aumenta a velocidade com que os Orbes de Sangue flutuam até você em 4 m/s durante a absorção.",
    polishedmaedate:
      "Polished Maedate. Aumenta a taxa de carregamento passivo da Fúria Sangrenta em 0.1 c/s.",
    renjirosbloodyglove:
      "Renjiro's Bloody Glove. Revela a aura de Sobreviventes que tocam em Orbes de Sangue por 2s (acumula). Orbes tornam-se visíveis para Sobreviventes e são absorvidos ao toque.",
    rottingrope:
      "Rotting Rope. Aumenta o alcance de visualização da aura dos Orbes de Sangue em 2 metros.",
    scalpedtopknot:
      "Scalped Topknot. Reduz o tempo de carregamento da Investida Demoníaca em 0.5 segundos.",
    shatteredwakizashi:
      "Shattered Wakizashi. Aumenta a taxa de carregamento passivo da Fúria Sangrenta em 0.2 c/s.",
    splinteredhull:
      "Splintered Hull. Aumenta a frequência de aparecimento de Orbes de Sangue de feridos em 33%. Sobreviventes geram +1 orbe extra em interações.",
    tearsoakedtenugui:
      "Tear-Soaked Tenugui. Reduz a penalidade do medidor de poder ao derrubar Sobreviventes durante a Fúria Sangrenta em 4 segundos.",
    woodenonimask:
      "Wooden Oni Mask. Aumenta a frequência de aparecimento de Orbes de Sangue de feridos em 14%. Sobreviventes geram +1 orbe extra em interações.",
    yamaokasashimono:
      "Yamaoka Sashimono. Aumenta a duração da Fúria Sangrenta em 8 segundos.",

    // === ADD-ONS DA SADAKO (The Onryō) ===
    bloodyfingernails:
      "Bloody Fingernails. Aumenta a duração do Impulso de Velocidade após usar a Projeção em 50%.",
    cabinsign:
      "Cabin Sign. Reduz o tempo para as TVs ligarem novamente após a Projeção em 4.5 segundos.",
    clumpofhair:
      "Clump of Hair. Reduz o limite de distância para invisibilidade total enquanto Desmanifestada em 6 metros.",
    distortedphoto:
      "Distorted Photo. Sobreviventes num raio de 16m que testemunham sua Manifestação gritam e revelam suas auras por 4 segundos.",
    iridescentvideotape:
      "Iridescent Videotape. A Projeção não desliga mais as TVs, mas não aplica Condenação. Aumenta o tempo para TVs ligarem após serem desligadas por Sobreviventes em 20%.",
    motherscomb:
      "Mother's Comb. Destaca a aura de todas as TVs desligadas em amarelo. TVs sendo desligadas ativam uma notificação sonora.",
    mothersmirror:
      "Mother's Mirror. Aumenta a duração da invisibilidade intermitente após se Manifestar em 2 segundos.",
    oldnewspaper:
      "Old Newspaper. Aumenta a duração da invisibilidade total após se Manifestar em 33%.",
    reikoswatch:
      "Reiko's Watch. Aumenta a duração da invisibilidade total enquanto Desmanifestada em 25%.",
    remotecontrol:
      "Remote Control. Revela a aura de Sobreviventes num raio de 12m de TVs ligadas por 7 segundos após usar Projeção.",
    ricketypinwheel:
      "Rickety Pinwheel. Sobreviventes sofrem do status Alheio (Oblivious) quando estão a 8 metros de TVs ligadas. O efeito persiste por 7s após desligar a TV.",
    ringdrawing:
      "Ring Drawing. Enganchar um Sobrevivente carregando uma Fita VHS faz com que todos os outros ganhem 1 Ficha de Condenação.",
    seasoakedcloth:
      "Sea-Soaked Cloth. Sobreviventes sofrem do status Cegueira quando estão a 8 metros de TVs ligadas. O efeito persiste por 7s após desligar a TV.",
    tapeeditingdeck:
      "Tape Editing Deck. Todos os Sobreviventes começam a partida com uma Fita VHS e devem levá-la à TV mais distante. Revela a aura de quem insere a fita por 6 segundos.",
    telephone:
      "Telephone. Sobreviventes sofrem 3% de Lentidão (Hindered) por 3 segundos se você se Manifestar a 7 metros deles.",
    vcr: "VCR. Faz com que todas as TVs reproduzam os efeitos de Projeção ao usar a habilidade de Projeção.",
    videotapecopy:
      "Videotape Copy. Aumenta o raio ao redor das TVs no qual os Sobreviventes ganham Condenação pela Projeção em 2 metros.",
    wellstone:
      "Well Stone. Reduz o tempo para as TVs ligarem novamente após a Projeção em 7 segundos.",
    wellwater:
      "Well Water. Aumenta a duração do status Indetectável em 2 segundos após se Manifestar.",
    yoichisfishingnet:
      "Yoichi's Fishing Net. Sobreviventes sofrem do status Cegueira após adquirir pelo menos 4 Fichas de Condenação.",

    // === ADD-ONS DA PIG (A Porca) ===
    amandasletter:
      "Amanda's Letter. Enquanto estiver agachada, você vê a aura de Sobreviventes num raio de 16 metros. Reduz a quantidade de Armadilhas de Urso Reversas em 2.",
    amandassecret:
      "Amanda's Secret. Sobreviventes que removem a Armadilha de Urso Reversa ativam uma notificação sonora e têm sua aura revelada por 6 segundos.",
    bagofgears:
      "Bag of Gears. Aumenta a velocidade de colocar a Armadilha de Urso Reversa em 50%. Reduz a velocidade de busca nas Caixas Jigsaw em 14%.",
    combatstraps:
      "Combat Straps. Aumenta a velocidade de transição para o estado Agachado em 10%.",
    crateofgears:
      "Crate of Gears. Aumenta a velocidade de colocar a Armadilha de Urso Reversa em 50%. Reduz a velocidade de busca nas Caixas Jigsaw em 25%.",
    facemask:
      "Face Mask. Sobreviventes com uma Armadilha de Urso Reversa sofrem do status Cegueira.",
    interlockingrazor:
      "Interlocking Razor. Se um Sobrevivente ferido falhar num Teste de Perícia na Caixa Jigsaw, ele sofre do status Ferida Profunda.",
    jigsawsannotatedplan:
      "Jigsaw's Annotated Plan. Aumenta a quantidade de Armadilhas em +1. Aumenta o tempo de morte da armadilha em 10s. Cada gerador concluído reduz o tempo das armadilhas ativas em 10s.",
    jigsawssketch:
      "Jigsaw's Sketch. Aumenta a quantidade de Armadilhas em +1. Revela a aura de geradores sendo reparados por Sobreviventes com armadilha em amarelo.",
    johnsmedicalfile:
      "John's Medical File. Aumenta sua velocidade de movimento enquanto estiver Agachada em 10%.",
    lastwill:
      "Last Will. Aumenta a velocidade de movimento durante a Corrida de Emboscada em 6%. Aumenta o tempo de carga da Emboscada em 33%.",
    razorwires:
      "Razor Wires. Sobreviventes saudáveis que falham num Teste de Perícia na Caixa Jigsaw ficam feridos. Aumenta a dificuldade dos Testes de Perícia em 20%.",
    rulessetno2:
      "Rules Set No.2. Desabilita a visualização da aura das Caixas Jigsaw para os Sobreviventes até que a Armadilha deles se torne ativa.",
    rustyattachments:
      "Rusty Attachments. Sobreviventes com uma Armadilha de Urso Reversa sofrem do status Dilacerado (Mangled).",
    shatteredsyringe:
      "Shattered Syringe. Reduz o tempo de recarga de Ataques de Emboscada errados em 10%.",
    slowreleasetoxin:
      "Slow-Release Toxin. Sobreviventes com uma Armadilha de Urso Reversa sofrem do status Exaustão.",
    tamperedtimer:
      "Tampered Timer. Reduz o tempo de morte da Armadilha de Urso Reversa em 20 segundos.",
    utilityblades:
      "Utility Blades. Sobreviventes com uma Armadilha de Urso Reversa sofrem do status Hemorragia.",
    videotape:
      "Video Tape. Todos os Sobreviventes começam a partida com a Armadilha de Urso Reversa instalada.",
    workshopgrease:
      "Workshop Grease. Aumenta a velocidade de carga da Emboscada em 50%. Reduz o tempo de recarga de Ataques de Emboscada errados em 10%.",

    // === ADD-ONS DO PINHEAD (The Cenobite) ===
    bentnail:
      "Bent Nail. Concede 100% de Pontos de Sangue bônus em eventos de Correntes. Reduz o número de Correntes bônus geradas em 1 ao acertar com a Corrente Possuída.",
    burningcandle:
      "Burning Candle. Reduz o tempo para iniciar a Caçada de Correntes em 3 segundos.",
    chattererstooth:
      "Chatterer's Tooth. Revela a aura da Configuração do Lamento. Pegar a Configuração desativa a Caçada de Correntes atual e concede o status Indetectável por 25 segundos.",
    engineersfang:
      "Engineer's Fang. Atingir um Sobrevivente saudável com a Corrente Possuída causa dano, mas não o prende. Aumenta o tempo de fechamento do Portal em 0.25s. Reduz correntes bônus em 1.",
    flickeringtelevision:
      "Flickering Television. Aumenta o alcance máximo de lançamento do Portal em 4 metros.",
    franksheart:
      "Frank's Heart. Aumenta o alcance máximo de lançamento do Portal em 8 metros.",
    greasyblacklens:
      "Greasy Black Lens. Revela a aura de Sobreviventes atingidos por uma Corrente Possuída por 6 segundos.",
    impalingwire:
      "Impaling Wire. Se um Sobrevivente usar o ambiente para quebrar uma corrente, uma Corrente bônus adicional aparece para atacá-lo.",
    iridescentlamentconfiguration:
      "Iridescent Lament Configuration. Oculta a aura da Configuração do Lamento de Sobreviventes que estejam a mais de 24 metros dela (fora da Caçada de Correntes).",
    larrysblood:
      "Larry's Blood. Aumenta o alcance máximo da Corrente Possuída em 4 metros.",
    larrysremains:
      "Larry's Remains. Aumenta o tempo de resolução da Configuração do Lamento em 2 segundos.",
    leatherstrip:
      "Leather Strip. Reduz o tempo de recarga da Corrente Possuída em 0.15 segundos.",
    liquifiedgore:
      "Liquified Gore. Aumenta o tempo de resolução da Configuração do Lamento em 1 segundo.",
    livelycrickets:
      "Lively Crickets. Aumenta a velocidade de curva da Corrente Possuída em 10%.",
    originalpain:
      "Original Pain. Sobreviventes sofrem do status Ferida Profunda (Deep Wound) ao se libertarem da Corrente Possuída.",
    skeweredrat:
      "Skewered Rat. Reduz o tempo de recarga da Corrente Possuída em 0.45 segundos.",
    sliceoffrank:
      "Slice of Frank. Sobreviventes sofrem do status Exaustão enquanto carregam a Configuração do Lamento.",
    spoiledmeal:
      "Spoiled Meal. Aumenta o alcance máximo da Corrente Possuída em 2 metros.",
    torturepillar:
      "Torture Pillar. Reduz o tempo para iniciar a Caçada de Correntes em 6 segundos.",
    wrigglingmaggots:
      "Wriggling Maggots. Aumenta a velocidade de curva da Corrente Possuída em 15%.",

    // === ADD-ONS DA PLAGUE (A Praga) ===
    ashenapple:
      "Ashen Apple. Faz com que 1 Fonte de Devoção apareça no estado Corrompido no início da partida. Aumenta o número de Fontes de Devoção disponíveis em 1.",
    blackincense:
      "Black Incense. Auras de Sobreviventes Infectados que estão vomitando são reveladas a você por 3 segundos.",
    blessedapple:
      "Blessed Apple. Faz com que 1 Fonte de Devoção apareça no estado Corrompido no início da partida.",
    devoteesamulet:
      "Devotee's Amulet. Aumenta a duração do Expurgo Corrompido em 20 segundos.",
    emeticpotion:
      "Emetic Potion. Aumenta o ganho de Infecção ao atingir Sobreviventes com o Expurgo Vil em 30%.",
    exorcismamulet:
      "Exorcism Amulet. Aumenta a duração do Expurgo Corrompido em 10 segundos.",
    haematiteseal:
      "Haematite Seal. Aumenta a duração da Infecção em objetos atingidos pelo Expurgo Vil em 30 segundos.",
    healingsalve:
      "Healing Salve. Reduz o tempo de recarga do Expurgo Vil e do Expurgo Corrompido em 0.25 segundos.",
    incensedointment:
      "Incensed Ointment. Ingerir a Corrupção de uma fonte faz com que todos os Sobreviventes no seu Raio de Terror gritem e revelem suas localizações.",
    infectedemetic:
      "Infected Emetic. Aumenta o ganho de Infecção ao atingir Sobreviventes com o Expurgo Vil em 40%.",
    iridescentseal:
      "Iridescent Seal. Você entra automaticamente no modo Expurgo Corrompido sempre que um Gerador é concluído. Reduz a duração do Expurgo Corrompido em 20 segundos.",
    limestoneseal:
      "Limestone Seal. Aumenta a duração da Infecção em objetos atingidos pelo Expurgo Vil em 20 segundos.",
    olibanumincense:
      "Olibanum Incense. As auras de Sobreviventes se purificando em uma Fonte de Devoção são reveladas a você por 4 segundos.",
    potenttincture:
      "Potent Tincture. Reduz o tempo de recarga do Expurgo Vil e do Expurgo Corrompido em 0.4 segundos.",
    prayertabletfragment:
      "Prayer Tablet Fragment. Aumenta a duração da Infecção em objetos em 40s. Aumenta a Infecção ganha por interações em 100%. O Expurgo Vil não afeta mais Sobreviventes diretamente (apenas objetos).",
    prophylacticamulet:
      "Prophylactic Amulet. Reduz o número de Fontes de Devoção disponíveis no mapa em 2.",
    rubbingoil:
      "Rubbing Oil. Aumenta a velocidade de carga (preparação) do Expurgo Vil e Expurgo Corrompido em 50%.",
    severedtoe:
      "Severed Toe. Aumenta a taxa de Infecção ganha por Sobreviventes ao realizar interações em 50%.",
    vileemetic:
      "Vile Emetic. Aumenta a velocidade do projétil do Expurgo Vil e Expurgo Corrompido em 10%.",
    worshiptablet:
      "Worship Tablet. Aumenta a velocidade de ingestão da Corrupção nas Fontes em 100%. Aumenta a velocidade de movimento enquanto segura o Expurgo Corrompido para 4.4 m/s.",

    // === ADD-ONS DO PYRAMID HEAD (The Executioner) ===
    blackstrap:
      "Black Strap. Aumenta o alcance do ataque Punição dos Condenados em 0.5 metros.",
    burningmanpainting:
      "Burning Man Painting. Aumenta o alcance do ataque Punição dos Condenados em 1.5 metros.",
    cinderellamusicbox:
      "Cinderella Music Box. Aumenta a duração das Trilhas de Atormentamento no ambiente em 15 segundos.",
    copperring:
      "Copper Ring. Aumenta a duração dos Ritos de Julgamento em 1 segundo.",
    crimsonceremonybook:
      "Crimson Ceremony Book. Sobreviventes atingidos por Punição dos Condenados sofrem de Hemorragia e Dilaceração (Mangled) por 80 segundos.",
    deadbutterfly:
      "Dead Butterfly. Reduz o tempo de recuperação dos Ritos de Julgamento em 2 segundos.",
    forgottenvideotape:
      "Forgotten Videotape. Reduz o tempo de recuperação dos Ritos de Julgamento em 3 segundos.",
    iridescentsealofmetatron:
      "Iridescent Seal of Metatron. Ao enviar um Sobrevivente para uma Jaula de Expiação, a aura de todos os outros Sobreviventes sofrendo de Atormentamento é revelada por 6 segundos.",
    leadring:
      "Lead Ring. Aumenta a duração das Trilhas de Atormentamento no ambiente em 10 segundos.",
    leopardprintfabric:
      "Leopard-Print Fabric. Aumenta a duração do Instinto Assassino em 0.5 segundos.",
    lostmemoriesbook:
      "Lost Memories Book. Sobreviventes sofrem do status Alheio (Oblivious) por 15 segundos quando afetados por Atormentamento.",
    mannequinfoot:
      "Mannequin Foot. Aumenta a duração das Trilhas de Atormentamento no ambiente em 20 segundos.",
    mistydayremainsofjudgement:
      "Misty Day, Remains of Judgement. Aumenta a duração do Instinto Assassino em 1 segundo.",
    obsidiangoblet:
      "Obsidian Goblet. Concede o status Indetectável enquanto você estiver pisando em uma Trilha de Atormentamento.",
    rustcolouredegg:
      "Rust-Coloured Egg. Sobreviventes feridos sofrem do status Cegueira por 60 segundos quando afetados por Atormentamento.",
    scarletegg:
      "Scarlet Egg. Aumenta a duração do Instinto Assassino em 3 segundos.",
    spearhead:
      "Spearhead. Aumenta a duração dos Ritos de Julgamento em 1.5 segundos.",
    tabletoftheoppressor:
      "Tablet of the Oppressor. Aumenta a duração dos Ritos de Julgamento em 2 segundos.",
    valtielsectphotograph:
      "Valtiel Sect Photograph. Reduz o tempo de recuperação dos Ritos de Julgamento em 4 segundos.",
    waxdoll:
      "Wax Doll. Aumenta o alcance do ataque Punição dos Condenados em 1 metro.",

    // === ADD-ONS DA SINGULARIDADE (The Singularity) ===
    androidarm:
      "Android Arm. Aumenta a distância de propagação do Fluxo Temporal entre Sobreviventes em 2 metros. Aumenta a velocidade de propagação em 25%.",
    brokensecuritykey:
      "Broken Security Key. Reduz o tempo de reinicialização de Biopodes desativados em 15%.",
    crematedremains:
      "Cremated Remains. Sobreviventes afetados pelo Fluxo Temporal sofrem do status Cegueira.",
    crewmanifest:
      "Crew Manifest. A aura de um Sobrevivente com Fluxo infectando outro é revelada por 8 segundos. Aumenta a distância de propagação do Fluxo em 2 metros.",
    cryogel:
      "Cryo Gel. Sobreviventes com Fluxo atingidos por Ataque Básico sofrem de Hemorragia por 60 segundos.",
    deniedrequisitionform:
      "Denied Requisition Form. Todos os Sobreviventes começam a partida infectados com Fluxo Temporal. Aumenta o tempo de impressão do primeiro lote de EMPs em 30 segundos.",
    diagnostictoolconstruction:
      "Diagnostic Tool (Construction). A aura de Sobreviventes pegando um EMP é revelada a você por 8 segundos.",
    diagnostictoolrepair:
      "Diagnostic Tool (Repair). Aumenta o alcance de mira dos Biopodes em 4 metros.",
    foreignplantfibres:
      "Foreign Plant Fibres. Reduz a duração da penalidade de velocidade de movimento após ser atordoado por uma Palete durante o Modo Sobrecarga em 20%.",
    heavywater:
      "Heavy Water. Reduz o alcance de revelação de aura das Caixas de Suprimentos em 8 metros.",
    hologramgenerator:
      "Hologram Generator. Após teleportar para um Sobrevivente com Fluxo de um Biopode, ele sofre do status Alheio (Oblivious) por 60 segundos.",
    hyperawarenessspray:
      "Hyperawareness Spray. Faz com que todos os Sobreviventes com Fluxo ouçam um Raio de Terror falso próximo.",
    iridescentcrystalshard:
      "Iridescent Crystal Shard. A aura de Sobreviventes num raio de 10 metros de um Biopode recém-colocado é revelada por 6 segundos.",
    kidsballglove:
      "Kid's Ball Glove. Aumenta a duração do Modo Sobrecarga em 8%.",
    livewires:
      "Live Wires. Faz com que Sobreviventes gritem e interrompam a interação atual após removerem o Fluxo Temporal.",
    nanomachinegel:
      "Nanomachine Gel. Reduz o tempo de recarga dos Biopodes após marcar um Sobrevivente com Fluxo Temporal em 15%.",
    nutritionalslurry:
      "Nutritional Slurry. Aumenta o número de Biopodes carregados em 2.",
    somafamilyphoto:
      "Soma Family Photo. Infligir Fluxo Temporal de um Biopode aplica 3% de Lentidão por 3 segundos. Se ferido, o Sobrevivente sofre Ferida Profunda.",
    spentoxygentank:
      "Spent Oxygen Tank. Sobreviventes com Fluxo Temporal sofrem do status Exaustão por 6 segundos.",
    ultrasonicsensor:
      "Ultrasonic Sensor. Sair de um Biopode dentro de 2s após afligir um Sobrevivente com Fluxo reduz seu Raio de Terror em 12 metros por 12 segundos.",

    // === ADD-ONS DA SKULL MERCHANT (A Negociante de Crânios) ===
    adaptivelighting:
      "Iluminação Ajustável. Reduz a duração do efeito Indetectável em 10%. Aumenta a duração do efeito Celeridade em 10%.",
    adivalenteissue1:
      "Adi Valente Nº 1. Atingir um Sobrevivente dentro da Zona Ativa de um Drone inflige o status Cegueira por 60 segundos.",
    advancedmovementprediction:
      "Predição de Movimento Avançada. Revela a aura de Sobreviventes com uma Armadilha de Garra por 6 segundos quando realizam um salto rápido.",
    brownnoisegenerator:
      "Gerador de Ruído Marrom. Sobreviventes com uma Armadilha de Garra sofrem do status Alheio (Oblivious) a menos que estejam sendo perseguidos.",
    expiredbatteries:
      "Baterias Expiradas. Sobreviventes com uma Armadilha de Garra sofrem do status Lentidão em 5% adicionais, mas a duração da bateria da armadilha é reduzida em 50%.",
    geographicalreadout:
      "Leitura Geográfica. Aumenta a velocidade de quebrar Paletes/Paredes e danificar Geradores em 20% enquanto você tem um Drone implantado.",
    highcurrentupgrade:
      "Melhoria de Alta Corrente. Aumenta a duração da revelação de auras no Radar em 1 segundo.",
    highpowerfloodlight:
      "Holofote de Alta Potência. Sobreviventes que entram na Zona Ativa de um Drone sofrem do status Cegueira por 60 segundos.",
    infraredupgrade:
      "Melhoria de Infravermelho. Ao verificar o Radar, revela a aura de Sobreviventes detectados por 4 segundos.",
    iridescentunpublishedmanuscript:
      "Manuscrito Não Publicado Iridescente. Drones ganham um Raio de Terror de 32m. Ao desativar um drone, você ganha o status Indetectável por 15 segundos.",
    loosescrew:
      "Parafuso Solto. Sobreviventes escaneados por um Drone sofrem do status Exaustão por 6 segundos.",
    lowpowermode:
      "Modo de Economia de Energia. Reduz o tempo de recarga da Ordem de Drone em 25%.",
    powderedglass:
      "Vidro Moído. Sobreviventes escaneados por um Drone sofrem do status Dilacerado e Hemorragia por 70 segundos.",
    prototyperotor:
      "Protótipo de Rotor. Aumenta a velocidade de rotação dos Drones em 10%.",
    randomisedstrobes:
      "Estroboscópios Randomizados. Aumenta a duração do efeito de Lentidão ao ser escaneado em 1 segundo.",
    shotgunspeakers:
      "Auto-Falantes Shotgun. Sobreviventes com uma Armadilha de Garra não recebem o aviso sonoro antes de Testes de Perícia.",
    stereoremotemic:
      "Microfone Remoto Estéreo. Reduz a duração do estado desativado dos Drones em 25%.",
    supercharge:
      "Supercarga. Aumenta a duração da bateria da Armadilha de Garra em 15%.",
    ultrasonicspeaker:
      "Auto-Falante Ultrassônico. Reduz a duração do efeito Indetectável em 50%. Aumenta a velocidade de quebrar/danificar em 40%.",
    vitaltargetingprocesser:
      "Processador de Mira Vital. Aumenta o efeito de Lentidão (Hindered) aplicado por Armadilhas de Garra em 3%.",

    // === ADD-ONS DA SPIRIT (A Espírito) ===
    driedcherryblossom:
      "Dried Cherry Blossom. Sobreviventes num raio de 3 metros de você durante a Locomoção ativam o Instinto Assassino. Marcas de Arranhão não são mais visíveis durante a Locomoção.",
    furin:
      "Furin. Faz com que todos os Sobreviventes ouçam o som da Locomoção Espiritual (Phase-Walk), independentemente da distância.",
    giftedbamboocomb:
      "Gifted Bamboo Comb. Aumenta a velocidade de carregamento da Assombração de Yamaoka em 15%.",
    juniperbonsai:
      "Juniper Bonsai. Reduz o tempo de recarga do Faseamento Passivo em 1 segundo. Aumenta a duração do Faseamento Passivo em 50%.",
    kaiuntalisman:
      "Kaiun Talisman. Aumenta a duração da Locomoção Espiritual em 1 segundo.",
    katanatsuba:
      "Katana Tsuba. Estende a duração da invisibilidade ao reaparecer da Locomoção em 0.2s. Aumenta a velocidade de movimento ao reaparecer em 5%.",
    kintsugiteacup:
      "Kintsugi Teacup. Recarrega instantaneamente a Assombração de Yamaoka após quebrar uma Parede ou Palete.",
    motherdaughterring:
      "Mother-Daughter Ring. Aumenta sua velocidade de movimento durante a Locomoção Espiritual em 25%. Marcas de Arranhão não são mais visíveis durante a Locomoção.",
    mothersglasses:
      "Mother's Glasses. Sobreviventes que chegam a 2 metros da Casca (Husk) durante a Locomoção ativam o Instinto Assassino.",
    muddysportsdaycap:
      "Muddy Sports Day Cap. Aumenta sua velocidade de movimento durante a Locomoção Espiritual em 10%.",
    origamicrane:
      "Origami Crane. Aumenta a taxa de recarga da Assombração de Yamaoka em 20%.",
    rinsbrokenwatch:
      "Rin's Broken Watch. Aumenta a taxa de recarga da Assombração de Yamaoka em 30%.",
    rustyflute:
      "Rusty Flute. Aumenta a taxa de recarga da Assombração de Yamaoka em 40%.",
    senkohanabi:
      "Senko Hanabi. A Casca explode ao encerrar a Locomoção, bloqueando locais de Pulo num raio de 4 metros por 5 segundos.",
    shiawaseamulet:
      "Shiawase Amulet. Aumenta a duração da Locomoção Espiritual em 0.5 segundos.",
    uchiwa:
      "Uchiwa. Recarrega instantaneamente a Assombração de Yamaoka após ser atordoada por uma Palete.",
    wakizashisaya:
      "Wakizashi Saya. Permite pressionar o botão de Habilidade Ativa durante a Locomoção para retornar instantaneamente à localização da Casca.",
    whitehairribbon:
      "White Hair Ribbon. Aumenta a velocidade de carregamento da Assombração de Yamaoka em 20%.",
    yakuyokeamulet:
      "Yakuyoke Amulet. Aumenta a duração da Locomoção Espiritual em 3.5 segundos. Reduz sua velocidade de movimento durante a Locomoção em 15%.",
    zori: "Zōri. Aumenta sua velocidade de movimento durante a Locomoção Espiritual em 5%.",

    // === ADD-ONS DO SPRINGTRAP (William Afton) ===
    accesspanel:
      "Access Panel. O Machado de Incêndio pode viajar através de Portas de Segurança e sair pela porta conectada. Sobreviventes a 4m da porta ativam Instinto Assassino.",
    bonniesguitarstrings:
      "Bonnie's Guitar Strings. Revela a aura da intensidade dos geradores enquanto viaja entre Portas. Remove instantaneamente o efeito Indetectável ao sair de uma porta.",
    celebrateposter:
      "Celebrate! Poster. Concede 12% de Celeridade e 20% de velocidade de Pulo se estiver num raio de 32m de um Sobrevivente com o machado cravado.",
    chicasbib:
      "Chica's Bib. Sobreviventes sofrem do status Exaustão enquanto estiverem dentro da Área de Efeito do machado. O efeito persiste por 5 segundos ao sair.",
    endocpu:
      "Endo CPU. Aumenta a velocidade de quebrar Paletes/Paredes e danificar Geradores em 40% enquanto estiver na Área de Efeito. O efeito persiste por 5 segundos.",
    fazcoin:
      "Faz-Coin. O Machado de Incêndio emite um Raio de Terror de 24m. Concede o status Indetectável por 10 segundos ao arremessar o machado.",
    foxyshook:
      "Foxy's Hook. Concede 7% de Celeridade (Haste) enquanto estiver dentro da Área de Efeito do machado. O efeito persiste por 6 segundos.",
    freddyshat:
      "Freddy's Hat. Aumenta o peso do Machado de Incêndio em 100%, modificando sua trajetória balística.",
    greasypaperplate:
      "Greasy Paper Plate. Aumenta o tempo necessário para o Sobrevivente remover o machado cravado em 15%.",
    helpwantedad:
      "Help Wanted Ad. Exibe a trajetória inicial de arremesso do Machado de Incêndio enquanto você prepara o ataque.",
    iridescentremnant:
      "Iridescent Remnant. Ao viajar por uma Porta de Segurança, bloqueia todas as Paletes em pé num raio de 32m da porta de destino por 12 segundos.",
    lootbag:
      "Loot Bag. Bloqueia os Portões de Saída para o Sobrevivente com o machado cravado e para qualquer outro sobrevivente num raio de 12m dele.",
    officephone:
      "Office Phone. Se estiver a 24m do Sobrevivente com machado: revela a aura do machado e causa Alheio (Oblivious). Se o alvo estiver ferido, causa Quebrado (Broken).",
    partyhat:
      "Party Hat. Aumenta o tamanho máximo da Área de Efeito em 250% e o tempo de expansão em 2.5s. Reduz a duração da área em 20%.",
    purpleguydrawing:
      "Purple Guy Drawing. A aura do Sobrevivente com machado é revelada por 3s se ele fizer uma ação rápida. Revela a aura por 6s após remover o machado.",
    restaurantmenu:
      "Restaurant Menu. Reduz o tempo mínimo de recuperação do Machado de Incêndio no ambiente em 20%.",
    rippedcurtain:
      "Ripped Curtain. Sobreviventes atingidos pelo Machado sofrem de Hemorragia e Dilaceração (Mangled) por 60 segundos.",
    rottenpizza:
      "Rotten Pizza. Aumenta a duração do Instinto Assassino causado pelo Machado de Incêndio em 100%.",
    securityguardsbadge:
      "Security Guard's Badge. Aumenta a duração do efeito Indetectável em 25% (totalizando 25s) após sair de uma Porta de Segurança.",
    streamers:
      "Streamers. Aumenta sua velocidade de movimento enquanto viaja através das Portas de Segurança em 15%.",

    // === ADD-ONS DO TRAPPER (O Caçador) ===
    "4coilspringkit":
      "4-Coil Spring Kit. Aumenta o tempo de Desarme da Armadilha de Urso em 33%.",
    bearoil: "Bear Oil. Colocar uma Armadilha de Urso é silencioso.",
    bloodycoil:
      "Bloody Coil. Quando um Sobrevivente saudável desarma uma Armadilha, a Mola Sangrenta cobra seu preço, colocando o Sobrevivente no estado Ferido.",
    coffeegrounds:
      "Coffee Grounds. Aumenta a força do efeito de Celeridade (Haste) após colocar uma armadilha em 5%.",
    fasteningtools:
      "Fastening Tools. Aumenta os tempos de Resgate e Fuga da Armadilha em 25%. Aumenta a velocidade de armar a Armadilha em 50%.",
    honingstone:
      "Honing Stone. Sobreviventes presos na Armadilha que se libertarem sozinhos entram no Estado Agonizante.",
    iridescentstone:
      "Iridescent Stone. Rearma automaticamente uma Armadilha desarmada aleatória a cada 30 segundos.",
    lengthenedjaws:
      "Lengthened Jaws. Sobreviventes que escapam da Armadilha sofrem de Ferida Profunda.",
    makeshiftwrap:
      "Makeshift Wrap. Você não fica mais preso em suas próprias Armadilhas; elas são desarmadas automaticamente ao passar por cima.",
    oilycoil:
      "Oily Coil. Ao redefinir (resetar) uma Armadilha, revela a aura do último Sobrevivente a desarmá-la por 5 segundos.",
    rustedjaws:
      "Rusted Jaws. Sobreviventes feridos pela Armadilha sofrem do status Dilacerado (Mangled) por 70 segundos.",
    secondarycoil:
      "Secondary Coil. Aumenta o tempo de Desarme da Armadilha em 50%.",
    serratedjaws:
      "Serrated Jaws. Sobreviventes feridos pela Armadilha sofrem de Hemorragia até serem curados.",
    tarbottle:
      "Tar Bottle. Escurece a Armadilha de Urso, tornando-a mais difícil de ver.",
    tensionspring:
      "Tension Spring. A Armadilha se reabre automaticamente 2 segundos após um Sobrevivente escapar dela.",
    trapperbag: "Trapper Bag. Aumenta o número de Armadilhas carregadas em +1.",
    trappergloves:
      "Trapper Gloves. Aumenta a velocidade de armar a Armadilha em 30%.",
    trappersack:
      "Trapper Sack. Você começa com todas as Armadilhas no inventário. Você não pode mais pegar Armadilhas do chão (apenas rearmá-las).",
    waxbrick:
      "Wax Brick. Aumenta os tempos de Resgate e Fuga da Armadilha em 33%.",

    // === ADD-ONS DO TRICKSTER (O Trapaça) ===
    bloodyboa: "Bloody Boa. Aumenta o número de Lâminas carregadas em +8.",
    cagedheartshoes:
      "Caged Heart Shoes. Aumenta sua velocidade de movimento no Estado de Arremesso em 0.1 m/s.",
    cutthruusingle:
      "Cut Thru U Single. Lâminas perfuram o primeiro Sobrevivente atingido e continuam viajando. O segundo Sobrevivente atingido recebe apenas 0.5 Cargas no Medidor de Laceração.",
    deaththroescompilation:
      "Death Throes Compilation. A aura de Sobreviventes atingidos durante o Evento Principal é revelada a você por 6 segundos.",
    diamondcufflinks:
      "Diamond Cufflinks. Auras de Sobreviventes que estão a um acerto da Laceração máxima são reveladas a você por 6 segundos.",
    edgeofrevivalalbum:
      "Edge of Revival Album. Lâminas se estilhaçam ao atingir o ambiente, adicionando 0.5 Cargas de Laceração aos Sobreviventes próximos.",
    fizzspinsoda:
      "Fizz-Spin Soda. Aumenta o tempo antes que um Combo termine durante o Evento Principal em 15%.",
    infernowires:
      "Inferno Wires. Aumenta a duração do Evento Principal em 40%.",
    iridescentphotocard:
      "Iridescent Photocard. Ganha 1% de Celeridade acumulável (até 7%) para cada acerto consecutivo de Lâmina. O efeito é perdido ao errar uma Lâmina ou danificar um Sobrevivente.",
    jiwoonsautograph:
      "Ji-Woon's Autograph. Aumenta o tempo antes que um Combo termine durante o Evento Principal em 10%.",
    killingpartchords:
      "Killing Part Chords. Aumenta sua velocidade de movimento no Estado de Arremesso em 0.04 m/s.",
    luckyblade:
      "Lucky Blade. Aumenta a duração do Evento Principal em 0.3 segundos para cada Acerto de Lâmina bem-sucedido.",
    melodiousmurder:
      "Melodious Murder. Reduz o tempo de Recarga em Armários em 20%.",
    mementoblades:
      "Memento Blades. Aumenta a taxa de arremesso de Lâminas em 10%.",
    ontargetsingle:
      "On Target Single. Aumenta o tempo que leva para o Medidor de Laceração começar a decair em 2 segundos.",
    ripperbrace:
      "Ripper Brace. Aumenta o tempo que leva para o Medidor de Laceração começar a decair em 3 segundos.",
    tequilamoonrock:
      "Tequila Moonrock. Aumenta a duração do Evento Principal em 60%.",
    trickblades:
      "Trick Blades. Faz com que as Lâminas ricocheteiem no ambiente até 2 vezes.",
    trickpouch: "Trick Pouch. Aumenta o número de Lâminas carregadas em +4.",
    waitingforyouwatch:
      "Waiting For You Watch. Aumenta a duração do Evento Principal em 0.4 segundos para cada Acerto de Lâmina bem-sucedido.",

    // === ADD-ONS DOS TWINS (Os Gêmeos) ===
    babyteeth:
      "Baby Teeth. Sobreviventes sofrem do status Cegueira por 30 segundos após removerem Victor.",
    bloodyblackhood:
      "Bloody Black Hood. Reduz o tempo de transição ao trocar de volta para a Charlotte em 0.5 segundos.",
    catfigurine:
      "Cat Figurine. Permite ver o local alvo do Bote (Pounce) enquanto carrega o ataque.",
    catseye:
      "Cat's Eye. Suprime todos os ruídos feitos pelo Victor enquanto segura o carregamento de um Bote.",
    ceremonialcandelabrum:
      "Ceremonial Candelabrum. Aumenta o tempo necessário para Esmagar o Victor em 0.2 segundos enquanto controla a Charlotte.",
    dropofperfume:
      "Drop of Perfume. Sobreviventes sofrem do status Alheio (Oblivious) quando estão dentro do alcance do Grito do Victor enquanto você controla a Charlotte.",
    foreststew:
      "Forest Stew. Aumenta sua velocidade de movimento enquanto controla o Victor em 0.6 m/s.",
    iridescentpendant:
      "Iridescent Pendant. Se um Sobrevivente esmagar o Victor enquanto a Charlotte está no controle, ele sofre do status Exposto por 45 segundos.",
    madeleinesglove:
      "Madeleine's Glove. Aumenta o raio do Grito do Victor em 4 metros.",
    madeleinesscarf:
      "Madeleine's Scarf. Aumenta sua velocidade de movimento enquanto controla o Victor em 0.3 m/s.",
    rustedneedle:
      "Rusted Needle. Remover um Victor agarrado faz com que o Sobrevivente sofra de Hemorragia até ser totalmente curado.",
    sewersludge:
      "Sewer Sludge. Aumenta o tempo necessário para remover um Victor agarrado em 2 segundos.",
    silencingcloth:
      "Silencing Cloth. Após acordar do Estado Adormecido, Charlotte ganha o status Indetectável por 20 segundos.",
    souredmilk: "Soured Milk. Aumenta o raio do Grito do Victor em 2 metros.",
    spinningtop:
      "Spinning Top. Sobreviventes atingidos por um Bote derrubam o item que estão segurando.",
    stalebiscuit:
      "Stale Biscuit. Reduz o tempo de recarga de um Bote em 0.4 segundos.",
    tinyfingernail:
      "Tiny Fingernail. Reduz o tempo de Desprendimento do Victor em 0.25 segundos.",
    toysword:
      "Toy Sword. Reduz o tempo de carregamento do Bote em 0.1 segundo.",
    victorssoldier:
      "Victor's Soldier. A aura de Sobreviventes é revelada a você por 6 segundos após eles esmagarem o Victor (enquanto você controla a Charlotte).",
    weightyrattle:
      "Weighty Rattle. Remover um Victor agarrado faz com que o Sobrevivente sofra do status Quebrado (Broken) por 20 segundos.",

    // === ADD-ONS DO UNKNOWN (O Desconhecido) ===
    blurryphoto:
      "Blurry Photo. Após Teleportar, você recupera sua velocidade total de movimento 15% mais rápido.",
    bmovieposter:
      "B-Movie Poster. Sobreviventes danificados pelo UVX sofrem do status Quebrado (Broken) por 30 segundos.",
    capturedbythedark:
      "Captured by the Dark. Todos os Sobreviventes começam a partida no estado Enfraquecido. Reduz o número máximo de Alucinações coexistentes em 1.",
    deviceofundisclosedorigin:
      "Device of Undisclosed Origin. Sobreviventes entrando no alcance da aura de uma Alucinação sofrem do status Alheio (Oblivious).",
    discardedmilkcarton:
      "Discarded Milk Carton. Aumenta a força do Quique dos Projéteis UVX: aumenta o quique em 8% e reduz a fricção em 15%.",
    footprintcast:
      "Footprint Cast. Reduz o tempo de surgimento da próxima Alucinação em 15 segundos quando um Sobrevivente se torna Enfraquecido.",
    frontpagearticle:
      "Front-Page Article. Reduz o tempo de surgimento da próxima Alucinação em 50% após quebrar uma Parede ou Palete.",
    homemademask:
      "Homemade Mask. Sobreviventes que dissipam uma Alucinação com sucesso sofrem do status Cegueira por 60 segundos.",
    hypnotistswatch:
      "Hypnotist's Watch. Sobreviventes atingidos por um Projétil UVX no ar sofrem do status Exaustão por 10 segundos.",
    iridescentossreport:
      "Iridescent OSS Report. Reduz o tempo de recarga do Teleporte em 5 segundos. Aumenta o tempo de duração da Isca (Decoy) em 10s. Iscas ganham Raio de Terror e Mancha Vermelha.",
    lastknownrecording:
      "Last Known Recording. Reduz o alcance da aura das Alucinações em 25%.",
    notebookoftheories:
      "Notebook of Theories. Aumenta a duração do status Lentidão (Hindered) em 2 segundos para Sobreviventes atingidos por um Projétil UVX no ar.",
    obscuregamecartridge:
      "Obscure Game Cartridge. Aumenta a velocidade de quebrar Paredes/Paletes, danificar Geradores e pular Janelas em 30% por 20s após Teleportar.",
    puncturedeyeball:
      "Punctured Eyeball. Sobreviventes que dissipam uma Alucinação enquanto estão Feridos e Enfraquecidos sofrem do status Ferida Profunda.",
    rabbitsfoot:
      "Rabbit's Foot. Poças de Sangue ficam vermelho vivo enquanto carrega o UVX. Sobreviventes danificados pelo UVX sofrem de Hemorragia por 30 segundos.",
    serumvial:
      "Serum Vial. Sobreviventes entrando no alcance da aura de uma Alucinação sofrem do status Exaustão por 10 segundos.",
    sketchattempt:
      "Sketch Attempt. Sobreviventes atingidos pela Área de Explosão do UVX sofrem do status Alheio (Oblivious) por 20 segundos.",
    slashedbackpack:
      "Slashed Backpack. Atingir uma Alucinação com UVX cria uma Área de Explosão e destrói a alucinação. Reduz o tempo de respawn da próxima Alucinação em 75% após destruir uma desta forma.",
    vanishingbox:
      "Vanishing Box. Sobreviventes que completam um Gerador tornam-se Enfraquecidos. Aumenta o tempo de surgimento de Alucinações em 80%.",
    victimsmap:
      "Victim's Map. Sobreviventes que realizam com sucesso a ação de Encarar o Desconhecido ativam o Instinto Assassino por 3 segundos.",

    // === ADD-ONS DO LICH (Vecna) ===
    bagofholding:
      "Bag of Holding. 2 Baús do Tesouro têm garantia de rolar um 1 no Dado. Abrir Baús causa o status Alheio (Oblivious) por 15 segundos.",
    bootsofspeed:
      "Boots of Speed. O Feitiço Mão do Mago concede 5% de Celeridade (Haste) por 2 segundos.",
    cloakofelvenkind:
      "Cloak of Elvenkind. Reduz o Raio de Terror em 8 metros enquanto o Feitiço Voo está ativo. O efeito persiste por 6 segundos.",
    cloakofinvisibility:
      "Cloak of Invisibility. Concede o status Indetectável por 10 segundos quando todos os Feitiços estão em tempo de recarga.",
    crystalball:
      "Crystal Ball. Aumenta a duração do Instinto Assassino em 3 segundos após um Sobrevivente ser revelado pela Esfera de Dissipação.",
    dragontoothdagger:
      "Dragontooth Dagger. Atingir Sobreviventes segurando um Item Mágico com um Ataque Básico causa Hemorragia e Dilaceração por 45 segundos.",
    glasseye:
      "Glass Eye. Aumenta o raio da Esfera de Dissipação em 2 metros. Aumenta a velocidade de movimento da Esfera em 10%.",
    iridescentbookofviledarkness:
      "Iridescent Book of Vile Darkness. Usar Voo através de uma Janela a bloqueia por 45s. Reduz a altura das Entidades Voadoras em 0.7m (atinge agachados). Reduz o número de Entidades em 3.",
    lanternofrevealing:
      "Lantern of Revealing. As auras de Sobreviventes que escaparam por pouco das Entidades Voadoras do Voo dos Condenados são reveladas por 3 segundos.",
    ornatehorn:
      "Ornate Horn. Aumenta o número de Entidades Voadoras invocadas pelo Voo dos Condenados em +1.",
    pearlofpower:
      "Pearl of Power. Reduz o tempo de recarga atual de todos os Feitiços em 5 segundos após um Ataque Básico bem-sucedido.",
    potionofspeed:
      "Potion of Speed. Reduz o tempo de recarga de interação após conjurar o Feitiço Voo em 0.35 segundos.",
    ravensfeather:
      "Raven's Feather. Aumenta a duração do Feitiço Voo em 0.5 segundos.",
    ringofspellstoring:
      "Ring of Spell Storing. Reduz permanentemente o tempo de recarga de todos os Feitiços em 4 segundos.",
    ringoftelekinesis:
      "Ring of Telekinesis. Usar a Mão do Mago em uma Palete em pé aumenta sua velocidade de Pulo em 10% pelos próximos 8 segundos.",
    robeofeyes:
      "Robe of Eyes. As auras de Sobreviventes num raio de 8 metros de um Baú do Tesouro são reveladas a você por 3 segundos após conjurar um Feitiço.",
    staffofwithering:
      "Staff of Withering. Entrar no raio da Esfera de Dissipação faz com que os Sobreviventes sofram de Exaustão por 20 segundos.",
    tatteredheadband:
      "Tattered Headband. Aumenta o alcance de voo das Entidades Voadoras invocadas pelo Voo dos Condenados em 4 metros.",
    trickstersglove:
      "Trickster's Glove. Aumenta o tempo que uma Palete em pé é segurada pela Mão do Mago em 0.5 segundos.",
    vorpalsword:
      "Vorpal Sword. Entrar no raio da Esfera de Dissipação causa o status Quebrado por 30s. A Mão do Mago quebra Paletes derrubadas em vez de levantá-las (ação leva 4s para completar).",

    // === ADD-ONS DO MASTERMIND (Albert Wesker) ===
    bullhorn:
      "Bullhorn. Sobreviventes sofrem do status Alheio (Oblivious) por 30 segundos após usarem um Spray de Primeiros Socorros.",
    chalicegold:
      "Chalice (Gold). Aumenta a duração restante de uma Arremetida em 50% após colidir com um Sobrevivente.",
    darksunglasses:
      "Dark Sunglasses. Concede o status Indetectável por 20 segundos sempre que um Sobrevivente atinge a Infecção Crítica.",
    egggold:
      "Egg (Gold). Aumenta a duração da janela de oportunidade para a segunda Arremetida (Chain Bound) em 50%.",
    greenherb:
      "Green Herb. Aumenta a taxa de Infecção aplicada ao colidir com Sobreviventes durante uma Arremetida em 30%.",
    helicopterstick:
      "Helicopter Stick. A aura de Sobreviventes é revelada a você por 8 segundos após usarem um Spray de Primeiros Socorros.",
    iridescenturoborosvial:
      "Iridescent Uroboros Vial. Sobreviventes começam a partida infectados com Uroboros. Sobreviventes sofrem do status Exposto por 30 segundos ao atingir a Infecção Crítica.",
    jewelbeetle:
      "Jewel Beetle. Concede 100% de Pontos de Sangue bônus. Reduz a duração restante da Arremetida em 50% após colidir com um Sobrevivente.",
    labphoto:
      "Lab Photo. Permite quebrar Paredes ou Paletes colidindo com elas durante uma Arremetida. Remove a capacidade de pular Paletes usando o poder.",
    leathergloves: "Leather Gloves. Reduz o tempo de recarga do Poder em 10%.",
    lionmedallion:
      "Lion Medallion. Aumenta a distância de arremesso de Sobreviventes agarrados durante a Arremetida em 30%.",
    loosecrank:
      "Loose Crank. Aumenta sua velocidade de movimento durante a janela de oportunidade para a segunda Arremetida em 8%.",
    maidenmedallion:
      "Maiden Medallion. Sobreviventes sofrem do status Cegueira por 60 segundos ao atingir a Infecção Crítica.",
    portablesafe:
      "Portable Safe. Sobreviventes feridos pela Arremetida Virulenta sofrem de Hemorragia até serem totalmente curados.",
    redherb:
      "Red Herb. Aumenta o tempo necessário para usar o Spray de Primeiros Socorros em 2 segundos.",
    rpdshoulderwalkie:
      "R.P.D. Shoulder Walkie. Reduz a duração da primeira Arremetida em 20%. Aumenta a duração da segunda Arremetida em 20%.",
    unicommedallion:
      "Unicorn Medallion. Aumenta a duração da primeira Arremetida em 20%. Reduz a duração da segunda Arremetida em 20%.",
    uroborostendril:
      "Uroboros Tendril. Aumenta sua velocidade de movimento enquanto carrega a Arremetida Virulenta em 5%.",
    uroborosvirus:
      "Uroboros Virus. A aura de Sobreviventes é revelada a você por 4 segundos quando eles atingem a Infecção Crítica.",
    videoconferencedevice:
      "Video Conference Device. Reduz o tempo do cronômetro de Infecção passiva dos Sobreviventes em 30% (a infecção sobe mais rápido).",

    // === ADD-ONS DO WRAITH (O Espectro) ===
    allseeingblood:
      '"All Seeing" - Blood. Auras de Sobreviventes num raio de 8 metros são reveladas enquanto você está Camuflado.',
    allseeingspirit:
      '"All Seeing" - Spirit. Revela a intensidade da aura dos Geradores de acordo com o progresso de reparo enquanto Camuflado.',
    blindwarriormud:
      '"Blind Warrior" - Mud. Sobreviventes atingidos por um Ataque Surpresa sofrem do status Cegueira por 60 segundos.',
    blindwarriorwhite:
      '"Blind Warrior" - White. Sobreviventes atingidos por um Ataque Surpresa sofrem de Hemorragia e Dilaceração (Mangled) por 70 segundos.',
    blinkmud: '"Blink" - Mud. Reduz o tempo para se Camuflar em 40%.',
    blinkwhite: '"Blink" - White. Reduz o tempo para se Camuflar em 60%.',
    boneclapper:
      "Bone Clapper. Sobreviventes não conseguem distinguir a distância e a direção do som do Sino dos Lamentos.",
    coxcombedclapper:
      "Coxcombed Clapper. O Sino dos Lamentos torna-se completamente silencioso.",
    shadowdanceblood:
      '"Shadow Dance" - Blood. Aumenta a velocidade de pular janelas, quebrar paletes/paredes e danificar geradores em 60% enquanto Camuflado.',
    shadowdancewhite:
      '"Shadow Dance" - White. Aumenta a velocidade de pular janelas, quebrar paletes/paredes e danificar geradores em 40% enquanto Camuflado.',
    swifthuntblood:
      '"Swift Hunt" - Blood. Reduz o tempo para Descamuflar em 12%.',
    swifthuntmud: '"Swift Hunt" - Mud. Reduz o tempo para Descamuflar em 8%.',
    swifthuntwhite:
      '"Swift Hunt" - White. Reduz o tempo para Descamuflar em 10%.',
    thebeastsoot:
      '"The Beast" - Soot. Seu Raio de Terror não é mais suprimido enquanto camuflado. Concede 100% de Pontos de Sangue bônus em ações de Espreitar e Ataque Surpresa.',
    theghostsoot:
      '"The Ghost" - Soot. Seu Raio de Terror e Mancha Vermelha permanecem suprimidos por 6 segundos após descamuflar.',
    thehoundsoot:
      '"The Hound" - Soot. Poças de Sangue aparecem em vermelho vivo enquanto você está Camuflado.',
    theserpentsoot:
      '"The Serpent" - Soot. Quebrar Paredes, Paletes ou danificar Geradores faz com que você se descamufle automaticamente.',
    windstormblood:
      '"Windstorm" - Blood. Aumenta sua velocidade de movimento enquanto Camuflado em 9%.',
    windstormmud:
      '"Windstorm" - Mud. Aumenta sua velocidade de movimento enquanto Camuflado em 5%.',
    windstormwhite:
      '"Windstorm" - White. Aumenta sua velocidade de movimento enquanto Camuflado em 7%.',

    // === ADD-ONS DO XENOMORPH (O Xenomorfo) ===
    acidicblood:
      "Acidic Blood. Enquanto estiver no Modo Rastejador, ser atordoado até 20s após sair dos Túneis causa dano ao Sobrevivente (remove 1 estado de saúde ou aplica Ferida Profunda).",
    ashsinnards:
      "Ash's Innards. Aumenta o tempo de reaparecimento das Torretas de Chamas Remotas em 15 segundos.",
    brettscap:
      "Brett's Cap. Sempre que uma Torreta de Chamas Remota for destruída, causa Cegueira em todos os sobreviventes num raio de 16 metros por 25 segundos.",
    catcarrier:
      "Cat Carrier. Concede o status Indetectável por 30 segundos ao sair do Modo Rastejador (se estiver perto de uma Torreta).",
    cerealrations:
      "Cereal Rations. Ao estar dentro dos Túneis, as auras de Torretas de Chamas Remotas implantadas são reveladas a você por 3 segundos.",
    crewheadset:
      "Crew Headset. Aumenta o alcance de detecção de passos de sobreviventes dentro dos túneis em 6 metros.",
    drinkingbird:
      "Drinking Bird. Aumenta a duração do Instinto Assassino em 3 segundos após sair dos Túneis.",
    emergencyhelmet:
      "Emergency Helmet. Aumenta a resistência contra Torretas de Chamas Remotas antes de ser retirado do Modo Rastejador em 15%.",
    harpoongun:
      "Harpoon Gun. Acertar um Sobrevivente nos 30s seguintes à saída dos Túneis faz com que todos os outros a mais de 16m gritem e revelem sua localização.",
    improvisedcattleprod:
      "Improvised Cattle Prod. Quando um gerador é concluído, Sobreviventes a menos de 10m de uma Estação de Controle têm a aura revelada por 15 segundos.",
    kaneshelmet:
      "Kane's Helmet. Os sobreviventes atingidos por um Ataque de Cauda sofrem do efeito Dilacerado (Mangled) por 70 segundos.",
    lambertsstarmap:
      "Lambert's Star Map. Reduz o alcance de ataque das Torretas de Chamas Remotas em 2 metros.",
    lightwand:
      "Light Wand. Aumenta o tempo de inatividade temporário das Torres de Chamas Remotas em 3 segundos sempre que você sair dos túneis.",
    moultedskin:
      "Moulted Skin. Após implantar uma Torre de Chamas Remota, os sobreviventes sofrem de Exaustão por 30 segundos.",
    multipurposehatchet:
      "Multipurpose Hatchet. Os sobreviventes atingidos por um Ataque de Cauda sofrem de Hemorragia até a cura completa.",
    ovomorph:
      "Ovomorph. Aumenta a taxa de carregamento do Modo Rastejador em 25% quando fora dos túneis.",
    parkersheadband:
      "Parker's Headband. Concede 5% de Celeridade (Haste) por 3 segundos após sair dos túneis.",
    ripleyswatch:
      "Ripley's Watch. Faz com que Torretas de Chamas Remotas se autodestruam após te tirarem do Modo Rastejador.",
    elfdestructbolt:
      "Self-Destruct Bolt. Aumenta a velocidade de salto de janelas/paletes no Modo Rastejante em 30%.",
    semiotickeyboard:
      "Semiotic Keyboard. Sobreviventes num raio de 16m de uma Torreta veem a intensidade da aura dos Geradores revelando o progresso de reparo.",

    // === ADD-ONS DO VECNA (Stranger Things Concept) - ARQUIVOS RENOMEADOS ===
    beadmaze:
      "Bead Maze. A segunda fase do cronômetro do Quebra-Mundos (Worldbreaker) é aumentada em 3 segundos para cada Sobrevivente vivo.",
    blackwidowspider:
      "Black Widow Spider. A aura do Sobrevivente mais distante (a mais de 36 metros) é revelada a você por 3 segundos.",
    bloodyrollerskate:
      "Bloody Roller Skate. Concede 20% de Celeridade (Haste) por 2 segundos após usar o Ataque do Submundo (Undergate Attack).",
    brokenskateboard:
      "Broken Skateboard. Após a ativação do Quebra-Mundos, aumenta a velocidade de Pulo em 30% por 60 segundos.",
    chesspiece:
      "Chess Piece. O Ataque de Vinha ganha duas cargas, mas tem seu raio de ataque reduzido em 50%. Aumenta o tempo de recarga da habilidade Mundo Invertido em 15 segundos.",
    clockhands:
      "Clock Hands. Sobreviventes ganham o status Alheio (Oblivious) enquanto interagem com os Relógios de Pêndulo e por 12 segundos após a interação.",
    electrodecap:
      "Electrode Cap. No início da segunda fase do Quebra-Mundos, Sobreviventes a mais de 26 metros de distância têm suas auras reveladas por 6 segundos.",
    electroshockcollar:
      "Electroshock Collar. Ao sair do Mundo Invertido, todos os locais de Pulo num raio de 32 metros são bloqueados por 12 segundos.",
    forgeddeathcertificate:
      "Forged Death Certificate. Cada Ficha de Quebra-Mundos colocada em um Sobrevivente reduz seu Raio de Terror em 12 metros até a próxima ativação do Modo Quebra-Mundos.",
    guttedsupercom:
      "Gutted Supercom. A aura de um Sobrevivente atingido pelo Ataque de Vinha é revelada a você por 1.5 segundos.",
    iridescentsoteriachip:
      "Iridescent Soteria Chip. Ao ativar, concede Indetectável. Revela a aura de Sobreviventes com pelo menos uma Ficha num raio de 12m. Dura até realizar um ataque ou o poder acabar.",
    "mid-centuryradio":
      "Mid-Century Radio. Sobreviventes a mais de 32 metros de distância têm suas auras reveladas enquanto interagem com Relógios de Pêndulo.",
    necktendril:
      "Neck Tendril. Enquanto no modo Quebra-Mundos, Sobreviventes atingidos pelo Ataque de Vinha sofrem de Hemorragia e Dilaceração (Mangled) por 70 segundos.",
    orderlyid:
      "Orderly ID. Enquanto não estiver no modo Quebra-Mundos, o alcance de mira do Ataque de Vinha é aumentado em 2 metros.",
    pizzagoggles:
      "Pizza Goggles. A área de alcance do efeito do Ataque do Submundo é reduzida em 90%, e seu tempo de recarga é reduzido em 20 segundos.",
    rabbitremains:
      "Rabbit Remains. Sobreviventes que estiverem ou entrarem na área de efeito do Ataque do Submundo ganham o status Exaustão por 20 segundos.",
    shatteredwristrocket:
      "Shattered Wrist Rocket. A explosão do Ataque do Submundo (Undergate) quebra Paletes instantaneamente e danifica Geradores.",
    smashedcassettedeck:
      "Smashed Cassette Deck. Todos os Sobreviventes começam com uma ficha. Quando o poder ativa pela primeira vez, eles perdem a ficha. 1 Relógio a menos aparece no mapa.",
    stainedglassmural:
      "Stained Glass Mural. Enquanto estiver em recarga, quebrar Paletes e Paredes Quebráveis diminui o tempo de recarga em 12 segundos.",
    victorsrazorblade:
      "Victor's Razor Blade. Ao final do Quebra-Mundos, Sobreviventes feridos ganham o status Quebrado (Broken) por 20 segundos.",
  };


// ==========================================
// AUTENTICAÇÃO E LOGOUT
// ==========================================
onAuthStateChanged(auth, (user) => {
  if (user) {
    currentUser = user;
    
    // Verifica Permissão Master
    isAdmin = ADMIN_UIDS.includes(user.uid) || 
              (user.email && ADMIN_EMAILS.includes(user.email.toLowerCase()));

    const userName = user.displayName || (user.email ? user.email.split("@")[0] : "SOBREVIVENTE");
    document.getElementById("display-name").innerText = userName.toUpperCase();

    // Carrega builds após verificar usuário
    ouvirBuilds();
  } else {
    window.location.href = "login.html";
  }
});

const profileTrigger = document.getElementById("user-profile-trigger");
const userSubmenu = document.getElementById("user-submenu");
const logoutBtn = document.getElementById("logout-btn");

if (profileTrigger)
  profileTrigger.onclick = (e) => {
    e.stopPropagation();
    userSubmenu.classList.toggle("hidden");
  };
window.addEventListener("click", () => {
  if (userSubmenu && !userSubmenu.classList.contains("hidden"))
    userSubmenu.classList.add("hidden");
});
if (logoutBtn)
  logoutBtn.onclick = () =>
    signOut(auth).then(() => (window.location.href = "login.html"));

// ==========================================
// SISTEMA DE BUSCA
// ==========================================
window.searchGrid = (gridId, searchTerm) => {
  const grid = document.getElementById(gridId);
  if (!grid) return;
  const term = searchTerm.toLowerCase();
  const items = grid.querySelectorAll(".selectable-item");
  items.forEach((item) => {
    const title = item.querySelector(".tooltip-title").innerText.toLowerCase();
    item.style.display = title.includes(term) ? "block" : "none";
  });
};

// ==========================================
// LÓGICA DE FORMATAÇÃO E DESCRIÇÃO
// ==========================================
function formatDbdFilename(filename) {
  if (!filename) return "";
  let clean = filename.split("/").pop();
  clean = clean.replace(".png", "");
  if (clean.includes("_")) clean = clean.split("_").pop();
  return clean.replace(/([A-Z])/g, " $1").trim();
}

function getGenericDescription(name, type) {
  if (descricoesCustomizadas[name]) {
    return descricoesCustomizadas[name];
  }
  if (type === "perks")
    return `Esta é uma vantagem estratégica chamada ${name}. Use-a para ganhar vantagem na partida.`;
  if (type === "item")
    return `Um item essencial para sobrevivência: ${name}. Use com sabedoria.`;
  if (type === "addons")
    return `Melhoria para seu equipamento: ${name}. Altera a funcionalidade básica.`;
  return "";
}

// ==========================================
// RENDERIZAÇÃO DE GRIDS
// ==========================================
function renderGrid(containerId, fileList, pathPrefix, type, maxSelect) {
  const container = document.getElementById(containerId);
  container.innerHTML = "";

  if (!fileList || (Array.isArray(fileList) && fileList.length === 0)) {
    container.innerHTML =
      '<p style="color:#666; font-size:0.8rem; grid-column:1/-1; text-align:center;">Selecione o item primeiro.</p>';
    return;
  }

  fileList.forEach((file) => {
    const cleanName = formatDbdFilename(file);
    const fullPath = `../assets/img/dbd/${pathPrefix}/${file}`;
    const el = document.createElement("div");
    el.className = "selectable-item";
    el.innerHTML = `<img src="${fullPath}"><div class="tooltip-title" style="display:none;">${cleanName}</div>`;
    el.onclick = () =>
      openSelectionDetailsModal(el, fullPath, cleanName, type, maxSelect);
    container.appendChild(el);
  });
}

// ==========================================
// GERENCIAMENTO DE MODAIS (CRIAÇÃO E VISUALIZAÇÃO)
// ==========================================
let currentRoleMode = "";
let selectedData = { character: null, perks: [], item: null, addons: [] };
let currentStep = 1;
let pendingSelection = null;

function openSelectionDetailsModal(
  element,
  fullPath,
  cleanName,
  type,
  maxSelect,
) {
  pendingSelection = { element, fullPath, cleanName, type, maxSelect };
  document.getElementById("sd-img").src = fullPath;

  let displayTitle = cleanName;
  let displayDesc = "";
  const customText = descricoesCustomizadas[cleanName];

  if (currentRoleMode === "killer" && type === "addons" && customText) {
    const pontoIndex = customText.indexOf(".");
    if (pontoIndex > -1 && pontoIndex < 50) {
      displayTitle = customText.substring(0, pontoIndex).trim();
      displayDesc = customText.substring(pontoIndex + 1).trim();
    } else {
      displayDesc = customText;
    }
  } else {
    if (customText) {
      displayDesc = customText;
    } else {
      displayDesc = getGenericDescription(cleanName, type);
    }
  }

  document.getElementById("sd-title").innerText = displayTitle;
  const descEl = document.getElementById("sd-desc");
  descEl.innerText = displayDesc;

  const typeLabel = document.getElementById("sd-type-label");
  if (type === "character") {
    typeLabel.innerText =
      currentRoleMode === "survivor" ? "SOBREVIVENTE" : "ASSASSINO";
    descEl.style.display = "none";
  } else {
    typeLabel.innerText =
      type === "perks" ? "PERK" : type === "item" ? "ITEM" : "ADD-ON";
    descEl.style.display = "block";
  }

  document.getElementById("sd-confirm-btn").style.display = "block";
  const cancelBtn = document.querySelector("#selection-details-modal .outline");
  cancelBtn.innerText = "CANCELAR";
  cancelBtn.style.flex = "1";
  cancelBtn.style.width = "auto";
  document.getElementById("selection-details-modal").classList.add("open");
}

window.openItemDetails = (fullPath, type, roleMode) => {
  if (!fullPath) return;
  const cleanName = formatDbdFilename(fullPath);
  document.getElementById("sd-img").src = fullPath;

  let displayTitle = cleanName;
  let displayDesc = "";
  const customText = descricoesCustomizadas[cleanName];

  if (roleMode === "killer" && type === "addons" && customText) {
    const pontoIndex = customText.indexOf(".");
    if (pontoIndex > -1 && pontoIndex < 50) {
      displayTitle = customText.substring(0, pontoIndex).trim();
      displayDesc = customText.substring(pontoIndex + 1).trim();
    } else {
      displayDesc = customText;
    }
  } else {
    if (customText) {
      displayDesc = customText;
    } else {
      displayDesc = getGenericDescription(cleanName, type);
    }
  }

  document.getElementById("sd-title").innerText = displayTitle;
  const descEl = document.getElementById("sd-desc");
  descEl.innerText = displayDesc;

  const typeLabel = document.getElementById("sd-type-label");
  if (type === "character") {
    typeLabel.innerText =
      roleMode === "survivor" ? "SOBREVIVENTE" : "ASSASSINO";
    descEl.style.display = "none";
  } else {
    typeLabel.innerText =
      type === "perks" ? "PERK" : type === "item" ? "ITEM" : "ADD-ON";
    descEl.style.display = "block";
  }

  document.getElementById("sd-confirm-btn").style.display = "none";
  const cancelBtn = document.querySelector("#selection-details-modal .outline");
  cancelBtn.innerText = "FECHAR";
  cancelBtn.style.flex = "none";
  cancelBtn.style.width = "100%";
  document.getElementById("selection-details-modal").classList.add("open");
};

window.closeSelectionModal = () => {
  document.getElementById("selection-details-modal").classList.remove("open");
  pendingSelection = null;
};

document.getElementById("sd-confirm-btn").onclick = () => {
  if (!pendingSelection) return;
  const { element, fullPath, cleanName, type, maxSelect } = pendingSelection;
  executeSelection(element, fullPath, type, maxSelect, cleanName);
  window.closeSelectionModal();
};

function executeSelection(element, path, type, maxSelect, name) {
  if (maxSelect === 1) {
    const currentSelected = element.parentElement.querySelector(".selected");
    if (currentSelected) currentSelected.classList.remove("selected");
    element.classList.add("selected");
    selectedData[type] = path;

    if (type === "item" && currentRoleMode === "survivor") {
      updateSlot("selected-item-slot", path);

      let folder = name.toLowerCase().replace(/\s/g, "") + "s";
      if (name === "Toolbox") folder = "toolboxes";

      const addons = survivorAddonFiles[name] || [];
      renderGrid(
        "addon-grid",
        addons,
        `addons/survivor/${folder}`,
        "addons",
        2,
      );
    }

    if (type === "character") {
      updateSlot("selected-char-slot", path);

      if (currentRoleMode === "killer") {
        const folderName = name.replace(/\s/g, "");

        const addons = killerAddonFiles[name] || [];

        console.log(
          `Carregando ${addons.length} addons para ${name} na pasta ${folderName}`,
        );

        renderGrid(
          "addon-grid",
          addons,
          `addons/killer/${folderName}`,
          "addons",
          2,
        );
      }
    }
  } else {
    const index = selectedData[type].indexOf(path);
    if (index > -1) {
      selectedData[type].splice(index, 1);
      element.classList.remove("selected");
    } else {
      if (selectedData[type].length < maxSelect) {
        selectedData[type].push(path);
        element.classList.add("selected");
      } else {
        alert(`Máximo de ${maxSelect} seleções permitidas.`);
        return;
      }
    }
    updateMultiSlots(type);
  }
}

function updateSlot(slotId, imgPath) {
  document.getElementById(slotId).innerHTML = imgPath
    ? `<img src="${imgPath}">`
    : "";
}

function updateMultiSlots(type) {
  const containerId = type === "perks" ? "perk-slots" : "addon-slots";
  const slots = document
    .getElementById(containerId)
    .querySelectorAll(".slot-box");
  slots.forEach((slot, i) => {
    slot.innerHTML = selectedData[type][i]
      ? `<img src="${selectedData[type][i]}">`
      : "";
  });
}

window.openCreateModal = (role) => {
  currentRoleMode = role;
  currentStep = 1;
  selectedData = { character: null, perks: [], item: null, addons: [] };
  document
    .querySelectorAll("#create-modal .selectable-item")
    .forEach((el) => el.classList.remove("selected"));
  document
    .querySelectorAll("#create-modal .slot-box")
    .forEach((slot) => (slot.innerHTML = ""));
  document.getElementById("b-title").value = "";
  document.getElementById("b-desc").value = "";

  const modalTitle = document.getElementById("modal-role-title");
  if (role === "survivor") {
    modalTitle.innerText = "NOVA BUILD DE SOBREVIVENTE";
    modalTitle.style.color = "#00ff00";
    document.getElementById("addon-step-title").innerText =
      "5. SELEC OS ADD-ONS DO ITEM (Max 2)";
    renderGrid("char-grid", survivorFiles, "survivors", "character", 1);
    renderGrid(
      "perk-grid-selection",
      survivorPerkFiles,
      "perks/survivor",
      "perks",
      4,
    );
    renderGrid("item-grid", itemFiles, "items", "item", 1);
    renderGrid("addon-grid", [], "", "addons", 2);
  } else {
    modalTitle.innerText = "NOVA BUILD DE ASSASSINO";
    modalTitle.style.color = "#ff0000";
    document.getElementById("addon-step-title").innerText =
      "4. SELECIONE OS ADD-ONS DO PODER (Max 2)";
    renderGrid("char-grid", killerFiles, "killers", "character", 1);
    renderGrid(
      "perk-grid-selection",
      killerPerkFiles,
      "perks/killer",
      "perks",
      4,
    );
    renderGrid("addon-grid", [], "addons/killer", "addons", 2);
  }
  updateWizardUI();
  document.getElementById("create-modal").classList.add("open");
};

function updateWizardUI() {
  document
    .querySelectorAll(".wizard-step")
    .forEach((el) => el.classList.add("hidden"));
  document.getElementById(`step-${currentStep}`).classList.remove("hidden");
  document.getElementById("btn-prev").style.display =
    currentStep === 1 ? "none" : "block";

  const isLastStep = currentStep === 5;
  document.getElementById("btn-next").innerText = isLastStep
    ? "PUBLICAR NA NÉVOA"
    : "AVANÇAR";

  let displayStep = currentStep;
  let total = currentRoleMode === "killer" ? 4 : 5;
  if (currentRoleMode === "killer" && currentStep === 5) displayStep = 4;
  document.getElementById("step-indicator").innerText =
    `Passo ${displayStep} de ${total}`;

  document
    .querySelectorAll(".search-input")
    .forEach((input) => (input.value = ""));
  document
    .querySelectorAll(".selectable-item")
    .forEach((item) => (item.style.display = "block"));
}

window.nextStep = () => {
  if (currentStep === 1 && !selectedData.character) {
    alert("Selecione um personagem primeiro.");
    return;
  }
  if (currentStep === 2) {
    if (!document.getElementById("b-title").value.trim()) {
      alert("Dê um nome para a build.");
      return;
    }
    if (!document.getElementById("b-desc").value.trim()) {
      alert("Escreva uma descrição.");
      return;
    }
  }
  if (currentStep === 3 && selectedData.perks.length < 4) {
    alert("Selecione 4 perks.");
    return;
  }
  if (
    currentStep === 4 &&
    currentRoleMode === "survivor" &&
    !selectedData.item
  ) {
    alert("Selecione um item.");
    return;
  }

  if (currentRoleMode === "killer" && currentStep === 3) currentStep = 5;
  else currentStep++;

  if (currentStep > 5) submitBuild();
  else updateWizardUI();
};

window.prevStep = () => {
  if (currentRoleMode === "killer" && currentStep === 5) currentStep = 3;
  else currentStep--;
  updateWizardUI();
};

// ==========================================
// FIRESTORE E RENDERIZAÇÃO DE BUILDS (FIXED)
// ==========================================
async function submitBuild() {
  if (!currentUser) return;

  const buildData = {
    role: currentRoleMode,
    title: document.getElementById("b-title").value,
    description: document.getElementById("b-desc").value,
    loadout: selectedData,
    authorName: currentUser.displayName || "Anônimo",
    authorEmail: currentUser.email || "Discord User",
    authorUid: currentUser.uid, // Registra o UID do autor
    authorPhoto: currentUser.photoURL || "../assets/icon.jpg",
    createdAt: serverTimestamp(),
  };

  try {
    await addDoc(collection(db, "comunidade_builds_visual"), buildData);
    sendToDiscordWebhook(buildData);
    document.getElementById("create-modal").classList.remove("open");
    alert("Build publicada com sucesso e enviada para a Névoa!");
  } catch (error) {
    console.error("Erro:", error);
    alert("Erro ao salvar build.");
  }
}

function ouvirBuilds() {
  const container = document.getElementById("builds-container");
  const q = query(
    collection(db, "comunidade_builds_visual"),
    orderBy("createdAt", "desc")
  );

  onSnapshot(q, (snapshot) => {
    container.innerHTML = "";
    allBuildsData = [];
    if (snapshot.empty) {
      container.innerHTML = '<p style="grid-column: 1/-1; text-align: center; color: #888;">Nenhuma build encontrada.</p>';
      return;
    }
    snapshot.forEach((docSnap) => {
      const data = docSnap.data();
      allBuildsData.push({ id: docSnap.id, ...data });
      createBuildCard(docSnap.id, data, container);
    });
  });
}

function createBuildCard(id, data, container) {
  // Lógica de Lixeira: Verifica Email OU UID
  const isOwner = currentUser && (
    (data.authorUid === currentUser.uid) || 
    (data.authorEmail && currentUser.email === data.authorEmail)
  );

  const canDelete = isOwner || isAdmin;

  const card = document.createElement("div");
  card.className = `build-card ${data.role}`;
  card.onclick = (e) => {
    if (!e.target.closest(".delete-btn-card")) openViewModal(data);
  };

  let deleteHtml = canDelete
      ? `<div class="delete-btn-card" onclick="window.deleteBuild('${id}')"><i class="fas fa-trash"></i></div>`
      : "";
      
  const loadout = data.loadout || { perks: [], addons: [] };
  const coverImg =
    loadout.character || loadout.perks[0] || "../assets/icon.jpg";

  const charName = loadout.character
    ? formatDbdFilename(loadout.character)
    : "Desconhecido";
  const roleColor = data.role === "survivor" ? "#00ff00" : "#ff0000";

  card.innerHTML = `
        ${deleteHtml}
        <div class="build-header" style="background-image: url('${coverImg}'); background-size: cover; background-position: center; height: 100px; position: relative;">
            <div style="position: absolute; inset: 0; background: rgba(0,0,0,0.6);"></div>
            <span class="role-badge ${data.role === "survivor" ? "surv" : "kill"}" style="position: relative; z-index: 2;">
                <i class="fas ${data.role === "survivor" ? "fa-running" : "fa-skull"}"></i> ${data.role}
            </span>
        </div>
        <div class="build-body">
            <div class="build-title">${data.title}</div>
            
            <div style="font-size: 0.75rem; color: #ccc; margin-bottom: 10px; font-family: var(--font-game); text-transform: uppercase;">
                <i class="fas fa-user" style="color: ${roleColor}; margin-right: 5px;"></i> ${charName}
            </div>
            
             <div class="build-author">
                <img src="${data.authorPhoto}" class="author-img"> <span>${data.authorName}</span>
            </div>
        </div>
    `;
  container.appendChild(card);
}

// ==========================================
// VISUALIZAÇÃO INTERATIVA DA BUILD
// ==========================================
window.openViewModal = (data) => {
  document.getElementById("v-title").innerText = data.title;
  const rBadge = document.getElementById("v-role");
  rBadge.innerText = data.role === "survivor" ? "SOBREVIVENTE" : "ASSASSINO";
  rBadge.className = `role-badge ${data.role === "survivor" ? "surv" : "kill"}`;

  const loadout = data.loadout || {
    character: "",
    perks: [],
    item: "",
    addons: [],
  };

  document.getElementById("v-author-img").src =
    data.authorPhoto || "../assets/icon.jpg";
  document.getElementById("v-author").innerText =
    `Criado por: ${data.authorName}`;
  document.getElementById("v-desc").innerText = `"${data.description}"`;

  const charImg = document.getElementById("v-character-loadout-img");
  const charBox = charImg.parentElement;
  charImg.src = loadout.character || "../assets/icon.jpg";
  document.getElementById("v-character-name").innerText = loadout.character
    ? formatDbdFilename(loadout.character)
    : "Desconhecido";

  if (loadout.character) {
    charBox.classList.add("clickable");
    charBox.onclick = () =>
      window.openItemDetails(loadout.character, "character", data.role);
  } else {
    charBox.classList.remove("clickable");
    charBox.onclick = null;
  }

  // Perks Loadout Setup (Clickable)
  for (let i = 1; i <= 4; i++) {
    const pPath = loadout.perks[i - 1];
    const pImg = document.getElementById(`v-p${i}`);
    const pBox = pImg.parentElement;
    pImg.src = pPath || "";

    if (pPath) {
      pBox.classList.add("clickable");
      pBox.onclick = () => window.openItemDetails(pPath, "perks", data.role);
    } else {
      pBox.classList.remove("clickable");
      pBox.onclick = null;
    }
  }

  const itemAddonSection = document.getElementById("v-item-addon-section");
  itemAddonSection.innerHTML = "";

  const itemHtml = loadout.item
    ? `<div class="slot-box clickable" onclick="window.openItemDetails('${loadout.item}', 'item', '${data.role}')"><img src="${loadout.item}"></div>`
    : `<div class="slot-box"></div>`;
  const addon1Html =
    loadout.addons && loadout.addons[0]
      ? `<div class="slot-box clickable" style="transform: scale(0.9);" onclick="window.openItemDetails('${loadout.addons[0]}', 'addons', '${data.role}')"><img src="${loadout.addons[0]}"></div>`
      : `<div class="slot-box" style="transform: scale(0.9);"></div>`;
  const addon2Html =
    loadout.addons && loadout.addons[1]
      ? `<div class="slot-box clickable" style="transform: scale(0.9);" onclick="window.openItemDetails('${loadout.addons[1]}', 'addons', '${data.role}')"><img src="${loadout.addons[1]}"></div>`
      : `<div class="slot-box" style="transform: scale(0.9);"></div>`;

  if (data.role === "survivor") {
    itemAddonSection.innerHTML = `
            <div style="display: flex; justify-content: center; gap: 40px;">
                <div style="text-align: center;">
                    <span style="color: #888; font-size: 0.75rem; text-transform: uppercase; letter-spacing: 1px; display: block; margin-bottom: 8px; font-weight: bold;">Item</span>
                    ${itemHtml}
                </div>
                <div style="text-align: center;">
                    <span style="color: #888; font-size: 0.75rem; text-transform: uppercase; letter-spacing: 1px; display: block; margin-bottom: 8px; font-weight: bold;">Add-ons</span>
                    <div style="display: flex; gap: 10px;">
                        ${addon1Html}
                        ${addon2Html}
                    </div>
                </div>
            </div>
        `;
  } else {
    itemAddonSection.innerHTML = `
            <div style="text-align: center;">
                <span style="color: #888; font-size: 0.75rem; text-transform: uppercase; letter-spacing: 1px; display: block; margin-bottom: 8px; font-weight: bold;">Add-ons do Poder</span>
                <div style="display: flex; gap: 10px; justify-content: center;">
                    ${addon1Html}
                    ${addon2Html}
                </div>
            </div>
        `;
  }

  document.getElementById("view-modal").classList.add("open");
};

window.deleteBuild = async (id) => {
  if (!confirm("Tem certeza que deseja apagar esta build permanentemente?"))
    return;
  await deleteDoc(doc(db, "comunidade_builds_visual", id));
};

window.closeModalOut = (e, id) => {
  if (e.target.id === id) document.getElementById(id).classList.remove("open");
};

// Filtro Corrigido
window.filterBuilds = (type) => {
  const container = document.getElementById("builds-container");
  container.innerHTML = "";
  const filtered = type === "all" ? allBuildsData : allBuildsData.filter((b) => b.role === type);
  
  if (filtered.length === 0) {
    container.innerHTML = '<p style="grid-column: 1/-1; text-align: center; color: #888;">Nenhuma build nesta categoria.</p>';
    return;
  }
  
  filtered.forEach((data) => createBuildCard(data.id, data, container));
};

// ==========================================
// WEBHOOK PARA O DISCORD
// ==========================================
async function sendToDiscordWebhook(buildData) {
  const WEBHOOK_URL =
    "https://discord.com/api/webhooks/1490736592535420948/Kr4ttIOAJKz-fj8oYmoxlQ6WdDip0vm2oq-yBndc0dWpCCvzAmc1YukyaGi1FkSPIVCv";

  const BASE_GITHUB_URL =
    "https://raw.githubusercontent.com/Antonizinhobr/dbdclan-com/SH4DOW/assets/img/dbd";

  function getOfficialName(path) {
        if (!path || path === "empty") return "Indefinido";
        let rawKey = path.split('/').pop().replace(/\.png|\.jpg/gi, '');
        rawKey = rawKey.replace(/^(?:t_ui_|t_|icon|charportrait|perk|addon|item)s?[_\s\-]*(?:perks?|items?|addons?)?[_\s\-]*/i, '');
        let dictKey = rawKey.toLowerCase().replace(/[\s_]+/g, '');

        if (ADDONS_DB[dictKey]) {
            const parts = ADDONS_DB[dictKey].split('.');
            if (parts.length > 0) return parts[0].trim();
        }

        let name = rawKey.replace(/([A-Z])(?=[A-Z])/g, '$1 ').replace(/([a-z])(?=[A-Z])/g, '$1 ');
        name = name.replace(/_/g, ' ').trim();
        if (name.length > 0) name = name.charAt(0).toUpperCase() + name.slice(1);
        
        return name.replace(/\s+/g, ' '); 
  }

  function getMyGithubUrl(localPath) {
    if (!localPath || typeof localPath !== "string" || localPath === "empty") return null;
    const marker = "/dbd/";
    const index = localPath.indexOf(marker);
    if (index === -1) return null;
    let relativePath = localPath.substring(index + marker.length);
    let parts = relativePath.split("/");
    if (parts[0] && parts[0].match(/^survivor/i)) parts[0] = "survivors";
    if (parts[0] && parts[0].match(/^killer/i)) parts[0] = "killers";
    let fileName = parts.pop();
    let safeFileName = encodeURIComponent(fileName);
    let finalPath = [...parts, safeFileName].join("/");
    return `${BASE_GITHUB_URL}/${finalPath}`;
  }

  const isSurv = buildData.role === "survivor";
  const colorInt = isSurv ? 65280 : 16711680;

  let charUrl = getMyGithubUrl(buildData.loadout.character);
  let mainItemUrl = null;
  if (isSurv && buildData.loadout.item && buildData.loadout.item !== "empty") {
    mainItemUrl = getMyGithubUrl(buildData.loadout.item);
  }

  let perksText = "Nenhuma perk selecionada";
  if (buildData.loadout.perks && buildData.loadout.perks.length > 0) {
    const validPerks = buildData.loadout.perks.filter((p) => p && p !== "empty");
    if (validPerks.length > 0) {
      perksText = validPerks.map((p) => {
          const name = getOfficialName(p);
          const url = getMyGithubUrl(p);
          return url ? `💎 [${name}](${url})` : `💎 ${name}`;
        }).join("\n");
    }
  }

  let addonsText = "";
  if (buildData.loadout.addons && buildData.loadout.addons.length > 0) {
    const validAddons = buildData.loadout.addons.filter((a) => a && a !== "empty");
    if (validAddons.length > 0) {
      addonsText = validAddons.map((a) => {
          const name = getOfficialName(a);
          const url = getMyGithubUrl(a);
          return url ? `🔧 [${name}](${url})` : `🔧 ${name}`;
        }).join("\n");
    } else {
      addonsText = "Sem add-ons";
    }
  } else {
    addonsText = "Sem add-ons";
  }

  let equipmentTitle = "";
  let equipmentValue = "";

  if (isSurv) {
    equipmentTitle = "🎒 EQUIPAMENTO";
    const nomeItem = buildData.loadout.item && buildData.loadout.item !== "empty" ? getOfficialName(buildData.loadout.item) : "Nenhum";
    const itemLink = mainItemUrl ? `[${nomeItem}](${mainItemUrl})` : nomeItem;
    equipmentValue = `**Item:** ${itemLink}\n**Add-ons:**\n${addonsText}`;
  } else {
    equipmentTitle = "💀 PODER & ADD-ONS";
    equipmentValue = `**Melhorias:**\n${addonsText}`;
  }

  const embed = {
    title: "DETALHES DA ESTRATÉGIA",
    description: `>>> *${buildData.description || "Sem descrição tática."}*`,
    url: "https://deadbydaylight.com",
    color: colorInt,
    fields: [
      { name: "👤 Criador", value: buildData.authorName || "Anônimo", inline: true },
      { name: isSurv ? "🏃 Sobrevivente" : "🔪 Assassino", value: getOfficialName(buildData.loadout.character || "Desconhecido"), inline: true },
      { name: "\u200b", value: "\u200b", inline: false },
      { name: "PERKS", value: perksText, inline: true },
      { name: equipmentTitle, value: equipmentValue, inline: true },
    ],
    footer: { text: "DbD Builder • Arsenal da Névoa", icon_url: "https://cdn-icons-png.flaticon.com/512/5968/5968756.png" },
    timestamp: new Date().toISOString(),
  };

  if (charUrl) embed.image = { url: charUrl };

  const payload = {
    username: "A Entidade",
    avatar_url: "https://i.ibb.co/KYsR2S1/20620020-estrangeiro-logotipo-icone-criatura-face-do-desconhecido-entidade-vetor.jpg",
    thread_name: `Build de ${buildData.authorName}: ${buildData.title.toUpperCase()}`,
    content: `🔔 **NOVA ESTRATÉGIA FORJADA!** @everyone`,
    embeds: [embed],
  };

  try {
    await fetch(WEBHOOK_URL, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
    console.log("Enviado para o Discord!");
  } catch (error) {
    console.error("Erro:", error);
  }
}