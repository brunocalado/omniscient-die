export const moduleName = 'omniscient-die';

import {dadoDaResposta} from './die.js';
import { OmniscientSettingsApp } from './settings.js';

// ─── Face → result key mapping ───────────────────────────────
export const RESULT_KEYS = {
  1: 'yesand',
  2: 'no',
  3: 'nobut',
  4: 'yesbut',
  5: 'yes',
  6: 'noand'
};

// ─── INIT ────────────────────────────────────────────────────

Hooks.once('init', function() {

  CONFIG.Dice.terms["o"] = dadoDaResposta;

  // ── Setting: Theme ────────────────────────────────────────
  game.settings.register(moduleName, 'theme', {
    name: game.i18n.localize("omniscient-die.settings.theme.name"),
    hint: game.i18n.localize("omniscient-die.settings.theme.hint"),
    scope: "world",
    type: String,
    choices: {
      'color':    game.i18n.localize("omniscient-die.dice.color.label"),
      'color2':   game.i18n.localize("omniscient-die.dice.color2.label"),
      'black':    game.i18n.localize("omniscient-die.dice.black.label"),
      'blood':    game.i18n.localize("omniscient-die.dice.blood.label"),
      'white':    game.i18n.localize("omniscient-die.dice.white.label"),
      'modern':   game.i18n.localize("omniscient-die.dice.modern.label"),
    },
    default: "color",
    config: true,
    requiresReload: true
  });

  // ── Setting: Force 3D Colors ──────────────────────────────
  game.settings.register(moduleName, 'forceDiceColors', {
    name: game.i18n.localize("omniscient-die.settings.forceDiceColors.name"),
    hint: game.i18n.localize("omniscient-die.settings.forceDiceColors.hint"),
    scope: "world",
    type: Boolean,
    default: true,
    config: true,
    requiresReload: true
  });

  // ── ADVANCED SETTINGS MENU ────────────────────────────────
  game.settings.registerMenu(moduleName, 'advancedSettings', {
    name: game.i18n.localize("omniscient-die.settings.menu.name") || "Advanced Settings",
    label: game.i18n.localize("omniscient-die.settings.menu.label") || "Open Configuration",
    hint: game.i18n.localize("omniscient-die.settings.menu.hint") || "Configure custom images and sounds.",
    icon: "fas fa-cogs",
    type: OmniscientSettingsApp,
    restricted: true
  });

  // ── Settings: Config False (Moved to Menu) ────────────────

  game.settings.register(moduleName, 'chatImage', {
    scope: "world", type: String, default: "theme", config: false,
  });

  for (const [face, key] of Object.entries(RESULT_KEYS)) {
    game.settings.register(moduleName, `customImage_${key}`, {
      scope: "world", type: String, default: "", config: false,
    });
  }

  game.settings.register(moduleName, 'soundMode', {
    scope: "world", type: String, default: "disabled", config: false,
  });

  game.settings.register(moduleName, 'soundVolume', {
    scope: "world", type: Number, default: 0.8, config: false,
  });

// ─── Keybinding ────────────────────────────────────────────
  game.keybindings.register(moduleName, "omniscientDie", {
    name: game.i18n.localize("omniscient-die.keybindings.name"),
    hint: game.i18n.localize("omniscient-die.keybindings.hint"),
    editable: [{ key: "KeyO", modifiers: [] }],
    onDown: async () => {
      const roll = await new Roll("1do").evaluate();
      roll.toMessage(); // Corrigido: Emula exatamente o "/r 1do" e aciona sons/imagens
    },
    onUp: () => {},
    restricted: false,
    reservedModifiers: [],
    precedence: CONST.KEYBINDING_PRECEDENCE.NORMAL
  });

}); // END INIT

// ─── Scene Control Button (Sidebar) ──────────────────────────
Hooks.on("getSceneControlButtons", (controls) => {
  // Compatibilidade cruzada: Foundry V12- (Array) vs V13+ (Object)
  const notesControl = Array.isArray(controls) 
    ? controls.find(c => c.name === "notes") 
    : controls.notes;

  if (notesControl) {
    const btnDef = {
      name: "omniscientDie",
      title: game.i18n.localize("omniscient-die.keybindings.name") || "Omniscient Die",
      icon: "fa-solid fa-question-circle",
      button: true,
      onChange: async () => {
        const roll = await new Roll("1do").evaluate();
        roll.toMessage();
      }
    };

    if (Array.isArray(notesControl.tools)) {
      notesControl.tools.push(btnDef);
    } else if (notesControl.tools) {
      notesControl.tools.omniscientDie = btnDef;
    }
  }
});

// ─── Dice So Nice — register preset ──────────────────────────
Hooks.once('diceSoNiceReady', (dice3d) => {
  const themePath = _resolveThemePath();
  
  // Resgata o tema limpo (ex: "black", "blood")
  let themeSetting = game.settings.get(moduleName, 'theme');
  if (themeSetting === 'theme-auto') themeSetting = 'color';
  themeSetting = themeSetting.replace(/^(en|ptbr)-/, '');

  const forceColors = game.settings.get(moduleName, 'forceDiceColors');

  dice3d.addSystem({ id: "omniscient-die", name: "Omniscient Die" }, false);
  
  let presetData = {
    type: "do",
    system: "omniscient-die",
    labels: [1,2,3,4,5,6].map(n => `modules/${moduleName}/images/${themePath}/d${n}.png`),
    bumpMaps: [1,2,3,4,5,6].map(n => `modules/${moduleName}/images/${themePath}/d${n}_bump.png`),
  };

  if (forceColors) {
    // Define as cores para cada tema. Black e Blood possuem fundo preto (#111).
    const colors = {
      'black':  { bg: '#111111', fg: '#ffffff', outline: '#000000', edge: '#111111' },
      'blood':  { bg: '#111111', fg: '#b30000', outline: '#4a0000', edge: '#111111' },
      'color':  { bg: '#1a1a1a', fg: '#ffffff', outline: '#1a1a1a', edge: '#1a1a1a' },
      'color2': { bg: '#111111', fg: '#ffffff', outline: '#000000', edge: '#111111' },
      'white':  { bg: '#111111', fg: '#ffffff', outline: '#000000', edge: '#111111' },
      'modern': { bg: '#2b2b36', fg: '#00ffff', outline: '#2b2b36', edge: '#2b2b36' }
    }[themeSetting] || { bg: '#111111', fg: '#ffffff', outline: '#000000', edge: '#111111' };

    // Registra o colorset no motor 3D
    dice3d.addColorset({
      name: `omniscient-${themeSetting}`,
      description: `Omniscient ${themeSetting}`,
      category: "Omniscient Die",
      foreground: colors.fg,
      background: colors.bg,
      outline: colors.outline,
      edge: colors.edge,
      texture: 'none',
      material: 'plastic'
    });

    // Força o nosso dado a usar esse colorset
    presetData.colorset = `omniscient-${themeSetting}`;
  }

  dice3d.addDicePreset(presetData);
});

// ─── Dice So Nice — roll complete → image + sound ─────────────

Hooks.on('diceSoNiceRollComplete', async (chatMessageID) => {
  const message = game.messages.get(chatMessageID);
  if (!message?.isAuthor) return;

  const allDice = (message.rolls ?? []).flatMap(r => r.dice ?? []);
  let rollResult = null;

  for (const dice of allDice) {
    if (dice instanceof dadoDaResposta) {
      for (const res of dice.results) {
        rollResult = res.result;
      }
    }
  }

  if (rollResult === null) return;
  const resultKey = RESULT_KEYS[rollResult];
  if (!resultKey) return;

  // ── Chat Image ────────────────────────────────────────────
  const imageMode = game.settings.get(moduleName, 'chatImage');

  if (imageMode !== 'disabled') {
    const imgSrc = _resolveImagePath(imageMode, resultKey, rollResult);
    if (imgSrc) {
      const currentContent = message.content ?? "";
      const imgHTML = `<div style="text-align:center;margin-top:6px;">
        <img src="${imgSrc}" style="width:100%; max-height:300px; object-fit:contain; border-radius:8px; border:none;" />
      </div>`;
      await message.update({ content: currentContent + imgHTML });
    }
  }

  // ── Sound ─────────────────────────────────────────────────
  const soundMode   = game.settings.get(moduleName, 'soundMode');
  const soundVolume = game.settings.get(moduleName, 'soundVolume');

  if (soundMode !== 'disabled') {
    let soundSrc = "";

    if (soundMode === 'single') {
      soundSrc = (game.settings.get(moduleName, 'soundSingle') ?? "").trim();
    } else if (soundMode === 'perface') {
      soundSrc = (game.settings.get(moduleName, `sound_${resultKey}`) ?? "").trim();
    }

    if (soundSrc !== "") {
      foundry.audio.AudioHelper.play(
        { src: soundSrc, volume: soundVolume, autoplay: true, loop: false },
        true 
      );
    }
  }

});

// ─── Helpers ─────────────────────────────────────────────────

function _resolveThemePath() {
  let themeSetting = game.settings.get(moduleName, 'theme');
  
  // Retrocompatibility: sanitize legacy database values 
  if (themeSetting === 'theme-auto') themeSetting = 'color';
  themeSetting = themeSetting.replace(/^(en|ptbr)-/, '');

  const lang         = game.settings.get("core", "language");
  const langPrefix   = lang === 'pt-BR' ? 'ptbr' : 'en';

  return `${langPrefix}-${themeSetting}`;
}

function _resolveImagePath(mode, resultKey, faceNumber) {
  if (mode === 'custom') {
    const path = (game.settings.get(moduleName, `customImage_${resultKey}`) ?? "").trim();
    return path !== "" ? path : null;
  }
  const themePath = _resolveThemePath();
  return `modules/${moduleName}/images/${themePath}/d${faceNumber}.png`;
}