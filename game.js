/* ═══════════════════════════════════════════════════════
   THE ENDLESS CHAMBER — game.js
   Roguelike de browser | Puro HTML + CSS + JS
═══════════════════════════════════════════════════════ */

"use strict";

// ══════════════════════════════════════════════════════
//  DADOS ESTÁTICOS
// ══════════════════════════════════════════════════════

const UPGRADES_DEF = [
  { id: "maxHp",    icon: "❤️",  name: "Vida Máxima",     stat: "maxHp",    base: 0, step: 20,  cost: 10, desc: "+20 HP máx." },
  { id: "damage",   icon: "⚔️",  name: "Dano",            stat: "damage",   base: 0, step: 5,   cost: 8,  desc: "+5 dano base" },
  { id: "stamina",  icon: "🏃",  name: "Stamina",         stat: "stamina",  base: 0, step: 1,   cost: 6,  desc: "-0.1s cooldown" },
  { id: "resist",   icon: "🛡️",  name: "Resistência",     stat: "resist",   base: 0, step: 3,   cost: 12, desc: "+3% redução dano" },
  { id: "crit",     icon: "🎯",  name: "Crítico",         stat: "crit",     base: 0, step: 3,   cost: 10, desc: "+3% chance crítico" },
  { id: "atkSpeed", icon: "⚡",  name: "Vel. Ataque",     stat: "atkSpeed", base: 0, step: 1,   cost: 15, desc: "-0.15s cooldown ataque" },
];

const ITEMS_DEF = [
  { id: "sharpSword",    icon: "🗡️",  name: "Espada Afiada",    rarity: "common",    effect: "Dano +10%",                         apply: p => p.damageMulti += 0.1 },
  { id: "lightBoots",    icon: "👟",  name: "Botas Leves",      rarity: "common",    effect: "Velocidade ataque +15%",             apply: p => p.atkCooldown = Math.max(0.4, p.atkCooldown * 0.85) },
  { id: "vampAmulet",    icon: "🩸",  name: "Amuleto Vampírico",rarity: "rare",      effect: "Cura 8 HP ao matar inimigo",         apply: p => p.vampirism += 8 },
  { id: "arcaneShield",  icon: "🔵",  name: "Escudo Arcano",    rarity: "rare",      effect: "Absorve 15% dano recebido",          apply: p => p.shield += 0.15 },
  { id: "fallenCrown",   icon: "👑",  name: "Coroa do Rei Caído",rarity: "legendary",effect: "+5% dano por inimigo vivo (máx 50%)", apply: p => p.hasFallenCrown = true },
  { id: "brokenClock",   icon: "⏰",  name: "Relógio Quebrado", rarity: "legendary", effect: "Abranda inimigos a cada 8 ataques",   apply: p => p.hasBrokenClock = true },
  { id: "ironGloves",    icon: "🥊",  name: "Luvas de Ferro",   rarity: "common",    effect: "Dano base +8",                       apply: p => p.bonusDamage += 8 },
  { id: "healthRing",    icon: "💍",  name: "Anel da Saúde",    rarity: "common",    effect: "+30 HP máximo",                      apply: p => { p.maxHp += 30; p.hp += 30; } },
  { id: "shadowCloak",   icon: "🌑",  name: "Manto Sombrio",    rarity: "rare",      effect: "+20% esquiva",                       apply: p => p.dodge += 0.20 },
  { id: "soulStone",     icon: "💎",  name: "Pedra da Alma",    rarity: "legendary", effect: "+1 vida por run",                    apply: p => { p.lives = Math.min(3, p.lives + 1); } },
];

const ENEMIES_DEF = [
  { id: "skeleton",  icon: "💀",  name: "Esqueleto",    hp: 30,  dmg: 6,  xp: 2, ess: 1 },
  { id: "goblin",    icon: "👺",  name: "Goblin",       hp: 25,  dmg: 8,  xp: 2, ess: 1 },
  { id: "ghost",     icon: "👻",  name: "Fantasma",     hp: 20,  dmg: 10, xp: 3, ess: 2 },
  { id: "troll",     icon: "🧌",  name: "Troll",        hp: 60,  dmg: 12, xp: 4, ess: 3 },
  { id: "demon",     icon: "😈",  name: "Demônio",      hp: 45,  dmg: 15, xp: 5, ess: 4 },
  { id: "wraith",    icon: "🌫️",  name: "Espectro",     hp: 35,  dmg: 18, xp: 6, ess: 4 },
  { id: "golem",     icon: "🗿",  name: "Golem",        hp: 90,  dmg: 10, xp: 7, ess: 5 },
  { id: "vampire",   icon: "🧛",  name: "Vampiro",      hp: 55,  dmg: 20, xp: 8, ess: 6 },
];

const BOSSES = {
  10: { icon: "⚔️",  name: "Guardião da Câmara",  hp: 300, dmg: 22, ess: 30, lore: "O eterno guardião desta prisão de pedra e sombra. Nunca perdeu." },
  20: { icon: "🌑",  name: "Aberração Sombria",   hp: 500, dmg: 30, ess: 50, lore: "Uma entidade nascida do desespero dos que aqui morreram." },
  30: { icon: "🌀",  name: "Arauto do Vazio",     hp: 700, dmg: 38, ess: 80, lore: "Mensageiro de um vazio sem nome. A sua chegada anuncia o fim." },
  40: { icon: "👑",  name: "Rei Aprisionado",     hp: 1000,dmg: 50, ess: 120,lore: "O antigo senhor desta câmara. Preso por crimes que o tempo esqueceu." },
  50: { icon: "💀",  name: "A Câmara em Si",      hp: 1500,dmg: 60, ess: 200,lore: "A própria câmara ganhou consciência. Para escapar, tens de a destruir." },
};

const EVENTS = [
  {
    id: "merchant", icon: "🛒", title: "Comerciante Misterioso",
    desc: "Um estranho encapuzado oferece-te os seus produtos em troca de Essência.",
    choices: [
      { label: "Comprar cura (15◈)", desc: "Recupera 40 HP", action: s => { if(s.essence>=15){ s.essence-=15; healPlayer(40); return true; } return false; } },
      { label: "Comprar item (20◈)", desc: "Item aleatório",  action: s => { if(s.essence>=20){ s.essence-=20; giveRandomItem(); return true; } return false; } },
      { label: "Recusar",            desc: "Seguir em frente", action: () => true },
    ]
  },
  {
    id: "chest", icon: "📦", title: "Baú Amaldiçoado",
    desc: "Um baú brilha com luz sinistra. Abrir pode custar caro... ou valer a pena.",
    choices: [
      { label: "Abrir (perigo!)", desc: "Risco vs. recompensa", action: s => { if(Math.random()<0.5){ damagePlayer(25,"o Baú Amaldiçoado"); log("O baú explodiu!","log-dmg"); } else { s.essence+=20; log("+20 Essência do baú!","log-gold"); } return true; } },
      { label: "Ignorar",         desc: "Seguro, mas sem recompensa", action: () => true },
    ]
  },
  {
    id: "shrine", icon: "✨", title: "Sala de Cura",
    desc: "Uma luz suave emana do centro da sala. Sentes que podes descansar aqui.",
    choices: [
      { label: "Descansar",      desc: "Recupera 50 HP",         action: () => { healPlayer(50); return true; } },
      { label: "Meditar",        desc: "+25◈ Essência",          action: s => { s.essence += 25; return true; } },
    ]
  },
  {
    id: "challenge", icon: "⚡", title: "Desafio Especial",
    desc: "Uma voz ecoa: 'Enfrenta três inimigos sozinho. Se sobreviveres, a glória é tua.'",
    choices: [
      { label: "Aceitar desafio", desc: "+40◈ se ganhar",  action: s => { s.pendingChallenge = true; return true; } },
      { label: "Recusar",         desc: "Perdes a chance", action: () => true },
    ]
  },
];

// ══════════════════════════════════════════════════════
//  ESTADO DO JOGO
// ══════════════════════════════════════════════════════
const State = {
  // Permanente
  permanentEssence: 0,
  upgradeLevels: { maxHp:0, damage:0, stamina:0, resist:0, crit:0, atkSpeed:0 },

  // Run atual
  round: 1,
  wave: 1,
  player: null,
  enemies: [],
  isBossFight: false,
  infiniteMode: false,
  pendingChallenge: false,

  // Timers
  atkTimer: 0,
  skillTimer: 0,
  enemyAtkTimers: [],
  gameLoop: null,
  lastTick: 0,
  projectiles: [],
  shootTimer: 0,

  save() {
    localStorage.setItem("tec_save", JSON.stringify({
      permanentEssence: this.permanentEssence,
      upgradeLevels: this.upgradeLevels,
    }));
  },
  load() {
    try {
      const d = JSON.parse(localStorage.getItem("tec_save") || "{}");
      if(d.permanentEssence !== undefined) this.permanentEssence = d.permanentEssence;
      if(d.upgradeLevels)   this.upgradeLevels   = {...this.upgradeLevels, ...d.upgradeLevels};
    } catch(e){}
  }
};

function makePlayer() {
  const u = State.upgradeLevels;
  const p = {
    hp: 100 + u.maxHp*20,
    maxHp: 100 + u.maxHp*20,
    lives: 3,
    essence: 0,
    baseDamage: 10 + u.damage*5,
    bonusDamage: 0,
    damageMulti: 1,
    atkCooldown: Math.max(0.4, 1.5 - u.atkSpeed*0.15),
    resist: u.resist*3,
    critChance: 5 + u.crit*3,
    vampirism: 0,
    shield: 0,
    dodge: 0,
    items: [],
    attackCount: 0,
    hasFallenCrown: false,
    hasBrokenClock: false,
    skillCooldown: 8,
    // Positioning & shooting
    x: null,
    y: null,
    speed: 220, // px/s
    shootCooldown: 0.15,
  };
  return p;
}

// ══════════════════════════════════════════════════════
//  GAME CONTROLLER
// ══════════════════════════════════════════════════════
const Game = {
  showScreen(id) {
    document.querySelectorAll(".screen").forEach(s => s.classList.remove("active"));
    document.getElementById(id).classList.add("active");
    if(id === "screen-upgrades") renderUpgradesScreen();
    if(id === "screen-game") renderDebugRoom();
    if(id === "screen-title")    document.getElementById("title-essence-count").textContent = State.permanentEssence;
  },

  startNewRun() {
    stopLoop();
    State.round = 1;
    State.wave = 1;
    State.isBossFight = false;
    State.enemies = [];
    State.player = makePlayer();
    State.pendingChallenge = false;
    Game.showScreen("screen-game");
    updateHUD();
    startRound();
  },

  playerAttack() {
    if(!canAct("atk")) return;
    const p = State.player;
    p.attackCount++;

    // Fallen Crown bonus
    let bonus = 0;
    if(p.hasFallenCrown) {
      bonus = Math.min(0.5, State.enemies.filter(e=>e.hp>0).length * 0.05);
    }
    const finalMulti = p.damageMulti + bonus;

    // Atacar inimigo alvo (primeiro vivo)
    const target = State.enemies.find(e => e.hp > 0);
    if(!target) return;

    const dmg = calcDamage(p.baseDamage + p.bonusDamage, finalMulti, p.critChance);
    dealDamageToEnemy(target, dmg.amount, dmg.isCrit);

    // Broken Clock: abranda a cada 8 ataques
    if(p.hasBrokenClock && p.attackCount % 8 === 0) {
      State.enemies.forEach(e => { e._slowed = true; });
      toast("⏰ Inimigos abrandados!", "toast-purple");
      setTimeout(()=>{ State.enemies.forEach(e=>{ e._slowed=false; }); }, 3000);
    }

    setAttackCD(p.atkCooldown);
  },

  playerSkill() {
    if(!canAct("skill")) return;
    const p = State.player;
    // Skill: AoE nos todos os inimigos
    const living = State.enemies.filter(e=>e.hp>0);
    if(!living.length) return;
    living.forEach(e=>{
      const d = calcDamage((p.baseDamage+p.bonusDamage)*0.7, p.damageMulti, p.critChance);
      dealDamageToEnemy(e, d.amount, d.isCrit);
    });
    log("⚡ Skill AoE ativada!", "log-item");
    setSkillCD(p.skillCooldown);
  },

  showRewardModal() {
    const modal = document.getElementById("modal-reward");
    document.getElementById("reward-round").textContent = State.round;
    const container = document.getElementById("reward-choices");
    container.innerHTML = "";

    const choices = [
      { icon:"⬆", title:"Melhorar Atributo",  desc:"Escolhe um atributo para aumentar", action: ()=>{ closeModal("modal-reward"); showAttributeChoice(); } },
      { icon:"🎲", title:"Item Aleatório",      desc:"Obtém um item de raridade aleatória", action: ()=>{ closeModal("modal-reward"); giveRandomItem(); nextRound(); } },
      { icon:"❤",  title:"Recuperar Vida",      desc:"Restaura 40 HP", action: ()=>{ healPlayer(40); closeModal("modal-reward"); nextRound(); } },
      { icon:"◈",  title:"Ganhar Essência",     desc:"+15 Essência", action: ()=>{ State.player.essence+=15; closeModal("modal-reward"); nextRound(); } },
    ];

    choices.forEach(c=>{
      const card = document.createElement("div");
      card.className = "reward-card";
      card.innerHTML = `<div class="reward-card-icon">${c.icon}</div>
        <div class="reward-card-title">${c.title}</div>
        <div class="reward-card-desc">${c.desc}</div>`;
      card.onclick = c.action;
      container.appendChild(card);
    });

    modal.classList.remove("hidden");
  },
  startBossFight,
  escape() {
    stopLoop();
    State.permanentEssence += State.player.essence;
    State.save();
    Game.showScreen("screen-title");
    document.getElementById("title-essence-count").textContent = State.permanentEssence;
    toast("Escape concluído! Bem-vindo à liberdade.", "toast-gold");
  },
  infiniteMode() {
    State.infiniteMode = true;
    closeModal("modal-victory");
    nextRound();
    toast("Modo Infinito ativado! Sem fim à vista...", "toast-legendary");
  }
};

// ══════════════════════════════════════════════════════
//  LOOP DE JOGO
// ══════════════════════════════════════════════════════
function startLoop() {
  stopLoop();
  State.lastTick = performance.now();
  State.gameLoop = requestAnimationFrame(tick);
}
function stopLoop() {
  if(State.gameLoop) { cancelAnimationFrame(State.gameLoop); State.gameLoop = null; }
}
function tick(now) {
  const dt = Math.min((now - State.lastTick) / 1000, 0.1);
  State.lastTick = now;

  // Cooldowns de ataque do jogador
  if(State.atkTimer > 0) {
    State.atkTimer = Math.max(0, State.atkTimer - dt);
    updateActionCDs();
  }
  if(State.skillTimer > 0) {
    State.skillTimer = Math.max(0, State.skillTimer - dt);
    updateActionCDs();
  }
  if(State.shootTimer > 0) {
    State.shootTimer = Math.max(0, State.shootTimer - dt);
  }

  // Movimento do jogador (WASD)
  const arenaEl = document.getElementById("arena");
  const p = State.player;
  if(p && arenaEl && document.getElementById("screen-game").classList.contains("active")) {
    if(p.x === null || p.y === null) {
      // inicializar posição no centro-baixo da arena
      const r = arenaEl.getBoundingClientRect();
      p.x = r.width/2;
      p.y = r.height * 0.75;
      positionPlayer();
    }
    const speed = p.speed || 200;
    const dx = (Keys.ArrowRight || Keys.KeyD ? 1 : 0) - (Keys.ArrowLeft || Keys.KeyA ? 1 : 0);
    const dy = (Keys.ArrowDown || Keys.KeyS ? 1 : 0) - (Keys.ArrowUp || Keys.KeyW ? 1 : 0);
    if(dx !== 0 || dy !== 0) {
      const len = Math.hypot(dx,dy) || 1;
      const moveX = (dx/len) * speed * dt;
      const moveY = (dy/len) * speed * dt;
      const rect = arenaEl.getBoundingClientRect();
      p.x = Math.max(16, Math.min(rect.width-16, p.x + moveX));
      p.y = Math.max(16, Math.min(rect.height-16, p.y + moveY));
      positionPlayer();
    }
  }

  // Inimigos atacam
  State.enemies.forEach((e, i) => {
    if(e.hp <= 0) return;
    if(State.enemyAtkTimers[i] === undefined) State.enemyAtkTimers[i] = e.atkSpeed;
    State.enemyAtkTimers[i] -= dt * (e._slowed ? 0.4 : 1);
    if(State.enemyAtkTimers[i] <= 0) {
      enemyAttack(e);
      State.enemyAtkTimers[i] = e.atkSpeed;
    }
  });

  // Atualizar projéteis
  updateProjectiles(dt);

  State.gameLoop = requestAnimationFrame(tick);
}

// ══════════════════════════════════════════════════════
//  RONDAS E ONDAS
// ══════════════════════════════════════════════════════
function startRound() {
  State.enemyAtkTimers = [];
  updateHUD();

  if(BOSSES[State.round]) {
    showBossIntro(BOSSES[State.round]);
    return;
  }

  // Evento aleatório a cada 7 rondas
  if(State.round > 1 && State.round % 7 === 0) {
    const ev = EVENTS[Math.floor(Math.random()*EVENTS.length)];
    showEvent(ev);
    return;
  }

  spawnWave();
}

function spawnWave() {
  const round = State.round;
  const count = 2 + Math.floor(round / 3);
  const diffScale = 1 + round * 0.12;

  State.enemies = [];
  const arena = document.getElementById("enemies-container");
  arena.innerHTML = "";
  State.enemyAtkTimers = [];

  for(let i=0; i<count; i++) {
    const def = ENEMIES_DEF[Math.floor(Math.random() * Math.min(ENEMIES_DEF.length, 2 + Math.floor(round/5)))];
    const enemy = {
      ...def,
      id: def.id + "_" + i,
      hp: Math.round(def.hp * diffScale),
      maxHp: Math.round(def.hp * diffScale),
      dmg: Math.round(def.dmg * diffScale),
      atkSpeed: 2.5 - Math.min(1.5, round * 0.03),
      _slowed: false,
    };
    State.enemies.push(enemy);
    State.enemyAtkTimers.push(enemy.atkSpeed * 0.5 + Math.random() * 0.5);
    renderEnemy(enemy, i, count);
  }

  document.getElementById("hud-wave").textContent = "Onda " + State.round;
  log(`▸ Ronda ${round}: ${count} inimigos aparecem!`, "");
  startLoop();
}

function renderEnemy(enemy, index, total) {
  const arena = document.getElementById("enemies-container");
  const el = document.createElement("div");
  el.className = "enemy";
  el.id = "enemy_" + enemy.id;

  const xStep = 100 / (total + 1);
  const x = xStep * (index + 1);
  const y = 20 + Math.random() * 30;
  el.style.left = x + "%";
  el.style.top  = y + "%";
  el.style.transform = "translate(-50%,-50%)";

  el.innerHTML = `
    <div class="enemy-hp-bar"><div class="enemy-hp-fill" id="ehp_${enemy.id}" style="width:100%"></div></div>
    <div class="enemy-sprite" id="esp_${enemy.id}">${enemy.icon}</div>
    <div class="enemy-name-tag">${enemy.name}</div>
  `;
  el.onclick = () => { attackSpecificEnemy(enemy); };
  arena.appendChild(el);
}

// ══════════════════════════════════════════════════════
//  COMBATE
// ══════════════════════════════════════════════════════
function calcDamage(base, multi, critChance) {
  const isCrit = Math.random()*100 < critChance;
  let amount = Math.round(base * multi * (isCrit ? 2 : 1));
  amount = Math.max(1, amount);
  return { amount, isCrit };
}
// ══════════════════════════════════════════════════════
//  FUNÇÕES AUXILIARES DE ESTILO VISUAL (COMBATE)
// ══════════════════════════════════════════════════════

// Executa o abanão do ecrã afetando o container da arena
function triggerScreenShake() {
  const arena = document.getElementById("arena");
  if (!arena) return;
  
  arena.classList.add("shake-active");
  setTimeout(() => {
    arena.classList.remove("shake-active");
  }, 150);
}

// Cria o texto flutuante no local do inimigo atingido
function spawnDamageText(enemyId, text, isCrit = false) {
  const enemyEl = document.getElementById("enemy_" + enemyId);
  const arena = document.getElementById("arena");
  if (!enemyEl || !arena) return;

  // Obtém a posição atual do inimigo no DOM para alinhar o texto
  const rect = enemyEl.getBoundingClientRect();
  const arenaRect = arena.getBoundingClientRect();
  
  const x = rect.left - arenaRect.left + (rect.width / 2) + (Math.random() * 20 - 10);
  const y = rect.top - arenaRect.top - 10;

  const dmgEl = document.createElement("div");
  dmgEl.className = isCrit ? "dmg-text crit-text" : "dmg-text";
  dmgEl.textContent = text;
  
  dmgEl.style.left = x + "px";
  dmgEl.style.top = y + "px";

  arena.appendChild(dmgEl);

  setTimeout(() => {
    dmgEl.remove();
  }, 700);
}

// Aplica o flash branco na Sprite do inimigo
function applyHitFlash(enemyId) {
  const spriteEl = document.getElementById("esp_" + enemyId);
  if (!spriteEl) return;

  spriteEl.classList.add("hit-flash");
  setTimeout(() => {
    spriteEl.classList.remove("hit-flash");
  }, 100);
}

function dealDamageToEnemy(enemy, amount, isCrit) {
  if (enemy.hp <= 0) return;
  
  enemy.hp -= amount;
  
  // --- NOVOS EFEITOS ADICIONADOS ---
  triggerScreenShake();                // Abana o ecrã com o impacto
  spawnDamageText(enemy.id, amount, isCrit); // Mostra o número a voar
  applyHitFlash(enemy.id);             // Faz o inimigo piscar a branco
  // ---------------------------------

  // (Mantém o resto da tua lógica original abaixo, ex: atualizar barra de vida, morte do inimigo, etc.)
  const hpFill = document.getElementById("ehp_" + enemy.id);
  if (hpFill) {
    const pct = Math.max(0, (enemy.hp / enemy.maxHp) * 100);
    hpFill.style.width = pct + "%";
  }

  if (enemy.hp <= 0) {
    // Teu código de eliminação de inimigo e drops...
    log(`☠️ ${enemy.name} foi derrotado!`, "log-gold");
    const enemyEl = document.getElementById("enemy_" + enemy.id);
    if (enemyEl) enemyEl.remove();
  }
}

function onEnemyDead(enemy) {
  const p = State.player;
  log(`✓ ${enemy.name} derrotado! +${enemy.ess}◈`, "log-gold");
  toast(`+${enemy.ess}◈ Essência`, "toast-gold");

  p.essence += enemy.ess;
  if(p.vampirism > 0) { healPlayer(p.vampirism); }

  // Remove visualmente após breve delay
  setTimeout(()=>{
    const el = document.getElementById("enemy_" + enemy.id);
    if(el) { el.style.transition="opacity 0.4s"; el.style.opacity="0"; setTimeout(()=>el.remove(),400); }
  }, 200);

  updateHUD();

  // Todos mortos?
  setTimeout(()=>{
    if(State.enemies.every(e=>e.hp<=0)) {
      stopLoop();
      onWaveCleared();
    }
  }, 500);
}

function onWaveCleared() {
  const extra = State.pendingChallenge ? 40 : 0;
  if(extra > 0) {
    State.player.essence += extra;
    toast(`Desafio superado! +${extra}◈`, "toast-legendary");
    State.pendingChallenge = false;
  }

  log(`✦ Ronda ${State.round} concluída!`, "log-gold");
  updateHUD();

  // A cada 5 rondas, modal de recompensa
  if(State.round % 5 === 0) {
    setTimeout(()=>Game.showRewardModal(), 600);
  } else {
    setTimeout(()=>nextRound(), 1000);
  }
}

function nextRound() {
  State.round++;
  if(State.round > 50 && !State.infiniteMode) {
    showVictoryScreen();
    return;
  }
  updateHUD();
  startRound();
}

function attackSpecificEnemy(enemy) {
  if(!canAct("atk")) return;
  if(enemy.hp <= 0) return;
  const p = State.player;
  let bonus = 0;
  if(p.hasFallenCrown) bonus = Math.min(0.5, State.enemies.filter(e=>e.hp>0).length*0.05);
  const d = calcDamage(p.baseDamage+p.bonusDamage, p.damageMulti+bonus, p.critChance);
  dealDamageToEnemy(enemy, d.amount, d.isCrit);
  p.attackCount++;
  if(p.hasBrokenClock && p.attackCount % 8 === 0) {
    State.enemies.forEach(e=>{ e._slowed=true; });
    toast("⏰ Inimigos abrandados!", "toast-purple");
    setTimeout(()=>State.enemies.forEach(e=>{ e._slowed=false; }), 3000);
  }
  setAttackCD(p.atkCooldown);
}

function enemyAttack(enemy) {
  const p = State.player;
  if(!p || p.hp <= 0) return;

  // Dodge
  if(p.dodge > 0 && Math.random() < p.dodge) {
    showDamageNumberOnPlayer("MISS", "crit");
    log(`${enemy.name} errou o ataque!`, "");
    return;
  }

  let dmg = enemy.dmg;
  // Shield
  if(p.shield > 0) dmg = Math.round(dmg * (1 - p.shield));
  // Resist
  if(p.resist > 0) dmg = Math.round(dmg * (1 - p.resist/100));

  dmg = Math.max(1, dmg);
  damagePlayer(dmg, enemy.name);
}

function damagePlayer(amount, source) {
  const p = State.player;
  p.hp = Math.max(0, p.hp - amount);
  log(`${source} causou ${amount} dano!`, "log-dmg");
  showDamageNumberOnPlayer(amount, "dmg");

  // Flash no player
  const pc = document.getElementById("player-char");
  const flash = document.createElement("div");
  flash.className = "hit-flash";
  pc.appendChild(flash);
  setTimeout(()=>flash.remove(), 200);

  updateHUD();

  if(p.hp <= 0) onPlayerDead();
}

function healPlayer(amount) {
  const p = State.player;
  p.hp = Math.min(p.maxHp, p.hp + amount);
  log(`+${amount} HP recuperado.`, "log-heal");
  showDamageNumberOnPlayer("+"+amount, "heal");
  updateHUD();
}

function onPlayerDead() {
  stopLoop();
  const p = State.player;
  p.lives--;
  log("☠ Morreste!", "log-dmg");
  toast("Vida perdida!", "toast-red");

  if(p.lives > 0) {
    // Respawn com HP parcial
    setTimeout(()=>{
      p.hp = Math.round(p.maxHp * 0.5);
      updateHUD();
      toast(`Ressuscitaste! ${p.lives} vida(s) restante(s)`, "toast-gold");
      spawnWave();
    }, 1500);
  } else {
    setTimeout(()=>showGameOver(), 1200);
  }
}

// ══════════════════════════════════════════════════════
//  BOSSES
// ══════════════════════════════════════════════════════
function showBossIntro(bossDef) {
  State.isBossFight = true;
  const modal = document.getElementById("modal-boss");
  document.getElementById("boss-name").textContent = bossDef.name;
  document.getElementById("boss-lore").textContent = bossDef.lore;
  document.getElementById("boss-hp-bar").style.width = "100%";
  document.getElementById("boss-hp-text").textContent = `${bossDef.hp} / ${bossDef.hp} HP`;
  modal.classList.remove("hidden");
}

function startBossFight() {
  closeModal("modal-boss");
  const bossDef = BOSSES[State.round];
  const diffScale = 1 + (State.round * 0.05);
  State.enemies = [{
    ...bossDef,
    id: "boss_" + State.round,
    hp: Math.round(bossDef.hp * diffScale),
    maxHp: Math.round(bossDef.hp * diffScale),
    dmg: Math.round(bossDef.dmg * diffScale),
    atkSpeed: 2.0,
    _slowed: false,
    isBoss: true,
  }];
  State.enemyAtkTimers = [1.5];

  const arena = document.getElementById("enemies-container");
  arena.innerHTML = "";
  const boss = State.enemies[0];

  const el = document.createElement("div");
  el.className = "enemy";
  el.id = "enemy_" + boss.id;
  el.style.left = "50%";
  el.style.top = "40%";
  el.style.transform = "translate(-50%,-50%)";
  el.innerHTML = `
    <div class="enemy-hp-bar" style="width:80px"><div class="enemy-hp-fill" id="ehp_${boss.id}" style="width:100%"></div></div>
    <div class="enemy-sprite boss-sprite" id="esp_${boss.id}">${boss.icon}</div>
    <div class="enemy-name-tag" style="color:#ff9f43">${boss.name}</div>
  `;
  el.onclick = ()=>{ attackSpecificEnemy(boss); };
  arena.appendChild(el);

  log(`⚠ ${boss.name} apareceu!`, "log-boss");
  toast("BOSS: " + boss.name, "toast-legendary");
  startLoop();
}

// ══════════════════════════════════════════════════════
//  ITENS
// ══════════════════════════════════════════════════════
function giveRandomItem() {
  const rolls = { common: 0.55, rare: 0.35, legendary: 0.10 };
  const r = Math.random();
  let rarity = r < rolls.legendary ? "legendary" : r < rolls.legendary + rolls.rare ? "rare" : "common";
  const pool = ITEMS_DEF.filter(i=>i.rarity===rarity && !State.player.items.find(pi=>pi.id===i.id));
  if(!pool.length) { toast("Sem itens novos disponíveis.", "toast-gold"); nextRound(); return; }
  const item = pool[Math.floor(Math.random()*pool.length)];
  State.player.items.push(item);
  item.apply(State.player);
  log(`✦ Item obtido: ${item.name}!`, "log-item");
  toast(`${item.icon} ${item.name} (${item.rarity})`, "toast-" + (rarity==="legendary"?"legendary":rarity==="rare"?"purple":"gold"));
  renderItemsBar();
  updateHUD();
}

function renderItemsBar() {
  const bar = document.getElementById("items-bar");
  bar.innerHTML = "";
  State.player.items.forEach(item=>{
    const slot = document.createElement("div");
    slot.className = `item-slot ${item.rarity}`;
    slot.innerHTML = `${item.icon}<div class="item-tooltip">${item.name}<br><small>${item.effect}</small></div>`;
    bar.appendChild(slot);
  });
}

// ══════════════════════════════════════════════════════
//  EVENTOS
// ══════════════════════════════════════════════════════
function showEvent(ev) {
  const modal = document.getElementById("modal-event");
  document.getElementById("event-icon").textContent = ev.icon;
  document.getElementById("event-title").textContent = ev.title;
  document.getElementById("event-desc").textContent  = ev.desc;
  const cont = document.getElementById("event-choices");
  cont.innerHTML = "";
  ev.choices.forEach(c=>{
    const card = document.createElement("div");
    card.className = "reward-card";
    card.innerHTML = `<div class="reward-card-title">${c.label}</div><div class="reward-card-desc">${c.desc}</div>`;
    card.onclick = ()=>{
      const ok = c.action(State.player);
      if(ok !== false) {
        closeModal("modal-event");
        updateHUD();
        nextRound();
      } else {
        toast("Essência insuficiente!", "toast-red");
      }
    };
    cont.appendChild(card);
  });
  modal.classList.remove("hidden");
}

// ══════════════════════════════════════════════════════
//  ESCOLHA DE ATRIBUTO
// ══════════════════════════════════════════════════════
function showAttributeChoice() {
  const modal = document.getElementById("modal-event");
  document.getElementById("event-icon").textContent = "⬆";
  document.getElementById("event-title").textContent = "MELHORAR ATRIBUTO";
  document.getElementById("event-desc").textContent  = "Escolhe um atributo para aumentar nesta run.";
  const cont = document.getElementById("event-choices");
  cont.innerHTML = "";
  const attrs = [
    { icon:"❤",label:"Vida +30",    action: p=>{ p.maxHp+=30; p.hp=Math.min(p.hp+30,p.maxHp); } },
    { icon:"⚔",label:"Dano +8",     action: p=>{ p.baseDamage+=8; } },
    { icon:"🏃",label:"Vel. Atq -0.1s", action: p=>{ p.atkCooldown=Math.max(0.4,p.atkCooldown-0.1); } },
    { icon:"🛡",label:"Resistência +5%", action: p=>{ p.resist+=5; } },
  ];
  attrs.forEach(a=>{
    const card = document.createElement("div");
    card.className = "reward-card";
    card.innerHTML = `<div class="reward-card-icon">${a.icon}</div><div class="reward-card-title">${a.label}</div>`;
    card.onclick = ()=>{ a.action(State.player); closeModal("modal-event"); updateHUD(); nextRound(); };
    cont.appendChild(card);
  });
  modal.classList.remove("hidden");
}

// ══════════════════════════════════════════════════════
//  GAME OVER / VITÓRIA
// ══════════════════════════════════════════════════════
function showGameOver() {
  stopLoop();
  const p = State.player;
  State.permanentEssence += p.essence;
  State.save();

  document.getElementById("gameover-stats").innerHTML =
    `Ronda atingida: ${State.round}<br>
     Inimigos derrotados: ${State.enemies.filter(e=>e.hp<=0).length + (State.round-1)*3}<br>
     Itens obtidos: ${p.items.length}`;
  document.getElementById("gameover-essence-gained").textContent = `+${p.essence} Essência`;
  Game.showScreen("screen-gameover");
}

function showVictoryScreen() {
  stopLoop();
  const p = State.player;
  State.permanentEssence += p.essence;
  State.save();
  Game.showScreen("screen-victory");
}

// ══════════════════════════════════════════════════════
//  MELHORIAS PERMANENTES
// ══════════════════════════════════════════════════════
function renderUpgradesScreen() {
  document.getElementById("upg-essence").textContent = State.permanentEssence;
  const grid = document.getElementById("upgrades-grid");
  grid.innerHTML = "";
  UPGRADES_DEF.forEach(def=>{
    const lvl = State.upgradeLevels[def.id] || 0;
    const cost = def.cost + lvl * Math.round(def.cost * 0.5);
    const canAfford = State.permanentEssence >= cost;
    const card = document.createElement("div");
    card.className = "upgrade-card";
    card.innerHTML = `
      <div class="upgrade-icon">${def.icon}</div>
      <div class="upgrade-name">${def.name}</div>
      <div class="upgrade-level">Nível ${lvl}</div>
      <div class="upgrade-effect">${def.desc} (×${lvl+1})</div>
      <div class="upgrade-cost">◈ ${cost} Essência</div>
      <button class="upgrade-btn" ${canAfford?"":'disabled'} onclick="buyUpgrade('${def.id}')">COMPRAR</button>
    `;
    grid.appendChild(card);
  });
}

function buyUpgrade(id) {
  const def = UPGRADES_DEF.find(u=>u.id===id);
  const lvl = State.upgradeLevels[id] || 0;
  const cost = def.cost + lvl * Math.round(def.cost * 0.5);
  if(State.permanentEssence < cost) { toast("Essência insuficiente!", "toast-red"); return; }
  State.permanentEssence -= cost;
  State.upgradeLevels[id] = lvl + 1;
  State.save();
  toast(`${def.icon} ${def.name} → Nível ${lvl+1}`, "toast-gold");
  renderUpgradesScreen();
}

// ══════════════════════════════════════════════════════
//  HUD & UI HELPERS
// ══════════════════════════════════════════════════════
function updateHUD() {
  const p = State.player;
  if(!p) return;

  // Vidas
  let livesStr = "";
  for(let i=0;i<3;i++) livesStr += i < p.lives ? "❤" : "🖤";
  document.getElementById("hud-lives").textContent = livesStr;

  // HP bar
  const pct = (p.hp / p.maxHp) * 100;
  const bar = document.getElementById("bar-hp");
  bar.style.width = pct + "%";
  bar.className = "bar-fill bar-hp" + (pct<30?" low":pct<60?" mid":"");
  document.getElementById("hud-hp-text").textContent = `${p.hp}/${p.maxHp}`;

  // Player HP no arena
  const pFill = document.getElementById("player-hp-fill");
  if(pFill) pFill.style.width = pct + "%";

  // Essência
  document.getElementById("hud-essence").textContent = p.essence;

  // Ronda
  document.getElementById("hud-round").textContent = State.round;

  // Stats
  document.getElementById("stat-dmg").textContent  = p.baseDamage + p.bonusDamage;
  document.getElementById("stat-spd").textContent  = p.atkCooldown.toFixed(1);
  document.getElementById("stat-res").textContent  = p.resist;
  document.getElementById("stat-crit").textContent = p.critChance;
}

function updateEnemyHP(enemy) {
  const fill = document.getElementById("ehp_" + enemy.id);
  if(fill) fill.style.width = Math.max(0, (enemy.hp/enemy.maxHp)*100) + "%";

  // Actualizar boss modal se aberto
  const bossBar = document.getElementById("boss-hp-bar");
  if(bossBar && enemy.isBoss) {
    bossBar.style.width = Math.max(0,(enemy.hp/enemy.maxHp)*100)+"%";
    document.getElementById("boss-hp-text").textContent = `${Math.max(0,enemy.hp)} / ${enemy.maxHp} HP`;
  }
}

function canAct(type) {
  if(type==="atk")   return State.atkTimer <= 0;
  if(type==="skill") return State.skillTimer <= 0;
  return false;
}
function setAttackCD(cd) {
  State.atkTimer = cd;
  const btn = document.getElementById("btn-attack");
  if(btn) btn.disabled = true;
  updateActionCDs();
}
function setSkillCD(cd) {
  State.skillTimer = cd;
  const btn = document.getElementById("btn-skill");
  if(btn) btn.disabled = true;
  updateActionCDs();
}
function updateActionCDs() {
  const atkBtn = document.getElementById("btn-attack");
  const sklBtn = document.getElementById("btn-skill");
  const atkCd  = document.getElementById("attack-cd");
  const sklCd  = document.getElementById("skill-cd");
  if(State.atkTimer > 0) {
    if(atkBtn) atkBtn.disabled = true;
    if(atkCd)  atkCd.textContent = State.atkTimer.toFixed(1)+"s";
  } else {
    if(atkBtn) atkBtn.disabled = false;
    if(atkCd)  atkCd.textContent = "";
  }
  if(State.skillTimer > 0) {
    if(sklBtn) sklBtn.disabled = true;
    if(sklCd)  sklCd.textContent = State.skillTimer.toFixed(1)+"s";
  } else {
    if(sklBtn) sklBtn.disabled = false;
    if(sklCd)  sklCd.textContent = "";
  }
}

// Simple input tracking
const Keys = {};

function shootAt(px, py) {
  const p = State.player;
  if(!p || State.shootTimer > 0) return;
  const arena = document.getElementById("arena");
  if(!arena) return;
  const r = arena.getBoundingClientRect();
  const sx = p.x;
  const sy = p.y;
  const dx = px - sx;
  const dy = py - sy;
  const len = Math.hypot(dx,dy) || 1;
  const dirx = dx/len, diry = dy/len;
  const speed = 700;
  const id = "proj_" + Date.now() + "_" + Math.floor(Math.random()*1000);
  const dmg = Math.max(1, Math.round((p.baseDamage + p.bonusDamage) * 0.6));
  const proj = { id, x: sx, y: sy, vx: dirx * speed, vy: diry * speed, speed, dmg };
  State.projectiles.push(proj);
  // render
  const el = document.createElement("div");
  el.className = "projectile";
  el.id = id;
  el.style.left = (proj.x - 6) + "px";
  el.style.top  = (proj.y - 6) + "px";
  document.getElementById("effects-container").appendChild(el);
  State.shootTimer = p.shootCooldown || 0.15;
}

function updateProjectiles(dt) {
  if(!State.projectiles || !State.projectiles.length) return;
  const arena = document.getElementById("arena");
  const arenaRect = arena.getBoundingClientRect();
  const toRemove = [];
  State.projectiles.forEach((pr, idx) => {
    pr.x += pr.vx * dt;
    pr.y += pr.vy * dt;
    const el = document.getElementById(pr.id);
    if(el) { el.style.left = (pr.x - 6) + "px"; el.style.top = (pr.y - 6) + "px"; }
    // out of bounds
    if(pr.x < 0 || pr.x > arenaRect.width || pr.y < 0 || pr.y > arenaRect.height) {
      toRemove.push(idx);
      if(el) el.remove();
      return;
    }
    // check collision with enemies
    for(const e of State.enemies) {
      if(!e || e.hp <= 0) continue;
      const enemyEl = document.getElementById("enemy_" + e.id);
      if(!enemyEl) continue;
      const er = enemyEl.getBoundingClientRect();
      const ar = arenaRect;
      const ex = er.left - ar.left + er.width/2;
      const ey = er.top  - ar.top  + er.height/2;
      const dist = Math.hypot(pr.x - ex, pr.y - ey);
      if(dist < 28) {
        // hit
        dealDamageToEnemy(e, pr.dmg, false);
        toRemove.push(idx);
        if(el) el.remove();
        break;
      }
    }
  });
  // remove in reverse order
  toRemove.sort((a,b)=>b-a).forEach(i=>{ State.projectiles.splice(i,1); });
}

function showDamageNumber(refEl, value, type) {
  const rect = refEl.getBoundingClientRect();
  const arenaRect = document.getElementById("arena").getBoundingClientRect();
  const div = document.createElement("div");
  div.className = "damage-number " + type;
  div.textContent = (type==="heal"?"+":"-") + value;
  div.style.left = (rect.left - arenaRect.left + rect.width/2 - 20) + "px";
  div.style.top  = (rect.top  - arenaRect.top  - 10) + "px";
  document.getElementById("effects-container").appendChild(div);
  setTimeout(()=>div.remove(), 900);
}

function showDamageNumberOnPlayer(value, type) {
  const pc = document.getElementById("player-char");
  if(!pc) return;
  const rect = pc.getBoundingClientRect();
  const arenaRect = document.getElementById("arena").getBoundingClientRect();
  const div = document.createElement("div");
  div.className = "damage-number " + type;
  div.textContent = String(value);
  div.style.left = (rect.left - arenaRect.left + 10) + "px";
  div.style.top  = (rect.top  - arenaRect.top - 10) + "px";
  document.getElementById("effects-container").appendChild(div);
  setTimeout(()=>div.remove(), 900);
}

function log(msg, cls="") {
  const container = document.getElementById("combat-log");
  if(!container) return;
  const entry = document.createElement("div");
  entry.className = "log-entry " + cls;
  entry.textContent = msg;
  container.insertBefore(entry, container.firstChild);
  while(container.children.length > 8) container.removeChild(container.lastChild);
}

function closeModal(id) {
  document.getElementById(id).classList.add("hidden");
}

function toast(msg, cls="toast-gold") {
  let cont = document.getElementById("toast-container");
  if(!cont) {
    cont = document.createElement("div");
    cont.id = "toast-container";
    document.body.appendChild(cont);
  }
  const t = document.createElement("div");
  t.className = "toast " + cls;
  t.textContent = msg;
  cont.appendChild(t);
  setTimeout(()=>t.remove(), 3200);
}

// ══════════════════════════════════════════════════════
//  PARTÍCULAS DE FUNDO
// ══════════════════════════════════════════════════════
function initParticles() {
  const canvas = document.getElementById("particleCanvas");
  const ctx = canvas.getContext("2d");
  let W, H, particles;

  function resize() {
    W = canvas.width  = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }
  window.addEventListener("resize", resize);
  resize();

  particles = Array.from({length:40},()=>({
    x: Math.random()*1920, y: Math.random()*1080,
    r: Math.random()*1.5+0.5,
    vx:(Math.random()-0.5)*0.3,
    vy:(Math.random()-0.5)*0.3,
    a: Math.random(),
    va:Math.random()*0.005+0.002,
    color: ["#e8b84b","#7b68ee","#2ecc71","#c0392b"][Math.floor(Math.random()*4)],
  }));

  (function draw(){
    ctx.clearRect(0,0,W,H);
    particles.forEach(p=>{
      p.x += p.vx; p.y += p.vy;
      p.a += p.va;
      if(p.a>1||p.a<0) p.va*=-1;
      if(p.x<0||p.x>W) p.vx*=-1;
      if(p.y<0||p.y>H) p.vy*=-1;
      ctx.beginPath();
      ctx.arc(p.x,p.y,p.r,0,Math.PI*2);
      ctx.fillStyle = p.color + Math.round(p.a*60).toString(16).padStart(2,"0");
      ctx.fill();
    });
    requestAnimationFrame(draw);
  })();
}

// ══════════════════════════════════════════════════════
//  PLAYER POSITION
// ══════════════════════════════════════════════════════
function positionPlayer() {
  const pc = document.getElementById("player-container");
  if(!pc) return;
  pc.style.position = "absolute";
  const arena = document.getElementById("arena");
  if(!arena) return;
  const rect = arena.getBoundingClientRect();
  const p = State.player;
  if(p && p.x !== null && p.y !== null) {
    pc.style.left = (p.x) + "px";
    pc.style.top  = (p.y) + "px";
  } else {
    // default center-bottom
    pc.style.left = (rect.width/2) + "px";
    pc.style.top  = (rect.height * 0.75) + "px";
    if(p) { p.x = rect.width/2; p.y = rect.height * 0.75; }
  }
  pc.style.transform = "translate(-50%,-50%)";
}

// Debug: desenha um quadrado exterior e um interior para testes básicos
function renderDebugRoom() {
  const arena = document.getElementById("arena");
  if(!arena) return;
  // remove existentes
  const oldOut = document.getElementById("debug-room-outer");
  if(oldOut) oldOut.remove();
  const oldIn = document.getElementById("debug-room-inner");
  if(oldIn) oldIn.remove();

  const rect = arena.getBoundingClientRect();
  const outer = document.createElement("div");
  outer.id = "debug-room-outer";
  outer.style.position = "absolute";
  outer.style.left = "10%";
  outer.style.top = "10%";
  outer.style.width = "80%";
  outer.style.height = "60%";
  outer.style.transform = "translate(0,0)";
  arena.appendChild(outer);

  const inner = document.createElement("div");
  inner.id = "debug-room-inner";
  inner.style.position = "absolute";
  inner.style.left = "35%";
  inner.style.top = "30%";
  inner.style.width = "30%";
  inner.style.height = "30%";
  arena.appendChild(inner);
}

// ══════════════════════════════════════════════════════
//  INIT
// ══════════════════════════════════════════════════════
window.addEventListener("DOMContentLoaded", ()=>{
  State.load();
  document.getElementById("title-essence-count").textContent = State.permanentEssence;
  initParticles();
  positionPlayer();
  Game.showScreen("screen-title");

  // Keyboard shortcuts
  document.addEventListener("keydown", e=>{
    Keys[e.code] = true;
    // actions
    if(e.code==="Space" || e.code==="KeyJ") Game.playerAttack();
    if(e.code==="KeyK") Game.playerSkill();
  });
  document.addEventListener("keyup", e=>{ Keys[e.code] = false; });

  // Click to shoot towards pointer
  const arena = document.getElementById("arena");
  if(arena) {
    arena.addEventListener("click", e=>{
      const r = arena.getBoundingClientRect();
      const px = e.clientX - r.left;
      const py = e.clientY - r.top;
      shootAt(px, py);
    });
  }
});

// Expose globally
window.Game      = Game;
window.buyUpgrade = buyUpgrade;

window.shootAt = shootAt;
