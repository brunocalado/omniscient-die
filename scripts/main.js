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

/**
 * Hook into the 'init' stage to register module settings, dice, and keybindings.
 * @hook init
 */
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
      roll.toMessage(); // This emulates the chat command `/r 1do` to ensure all hooks (like for Dice So Nice) are triggered.
    },
    onUp: () => {},
    restricted: false,
    reservedModifiers: [],
    precedence: CONST.KEYBINDING_PRECEDENCE.NORMAL
  });

}); // END INIT

// ─── Scene Control Button (Sidebar) ──────────────────────────
/**
 * Hook into 'getSceneControlButtons' to add a new button to the notes layer for rolling the Omniscient Die.
 * @hook getSceneControlButtons
 * @param {Array<Application>|Object<Application>} controls - The scene controls. V12- uses an Array, V13+ an Object.
 */
Hooks.on("getSceneControlButtons", (controls) => {
  // FIXME: This is a compatibility layer for Foundry V12 vs V13+. Can be simplified when V12 support is dropped.
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
/**
 * Hook into 'diceSoNiceReady' to register the custom dice preset and colorset.
 * This runs once Dice So Nice is initialized.
 * @hook diceSoNiceReady
 * @param {Dice3D} dice3d - The Dice So Nice main instance.
 */
Hooks.once('diceSoNiceReady', (dice3d) => {
  const themePath = _resolveThemePath();
  
  // Sanitize the theme setting for use in logic (e.g., "color", "black").
  let themeSetting = game.settings.get(moduleName, 'theme');
  if (themeSetting === 'theme-auto') themeSetting = 'color';
  themeSetting = themeSetting.replace(/^(en|ptbr)-/, '');

  const forceColors = game.settings.get(moduleName, 'forceDiceColors');

  dice3d.addSystem({ id: moduleName, name: "Omniscient Die" }, false);
  
  let presetData = {
    type: "do",
    system: moduleName,
    labels: [1,2,3,4,5,6].map(n => `modules/${moduleName}/images/${themePath}/d${n}.png`),
    bumpMaps: [1,2,3,4,5,6].map(n => `modules/${moduleName}/images/${themePath}/d${n}_bump.png`),
  };

  if (forceColors) {
    // Define custom colorsets for each theme to ensure visual consistency.
    // Some themes, like 'black' and 'blood', require a specific dark background.
    const colors = {
      'black':  { bg: '#111111', fg: '#ffffff', outline: '#000000', edge: '#111111' },
      'blood':  { bg: '#111111', fg: '#b30000', outline: '#4a0000', edge: '#111111' },
      'color':  { bg: '#1a1a1a', fg: '#ffffff', outline: '#1a1a1a', edge: '#1a1a1a' },
      'color2': { bg: '#111111', fg: '#ffffff', outline: '#000000', edge: '#111111' },
      'white':  { bg: '#111111', fg: '#ffffff', outline: '#000000', edge: '#111111' },
      'modern': { bg: '#2b2b36', fg: '#00ffff', outline: '#2b2b36', edge: '#2b2b36' }
    }[themeSetting] || { bg: '#111111', fg: '#ffffff', outline: '#000000', edge: '#111111' };

    // Register the colorset with Dice So Nice.
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

    // Assign the custom colorset to our dice preset.
    presetData.colorset = `omniscient-${themeSetting}`;
  }

  dice3d.addDicePreset(presetData);
});

// ─── Dice So Nice — roll complete → image + sound ─────────────

/**
 * Hook into 'diceSoNiceRollComplete' to add custom images and sounds to the chat message
 * after an Omniscient Die roll is completed.
 * @hook diceSoNiceRollComplete
 * @param {string} chatMessageID - The ID of the chat message that contains the roll.
 */
Hooks.on('diceSoNiceRollComplete', async (chatMessageID) => {
  const message = game.messages.get(chatMessageID);
  // Only act on messages created by the current user to avoid multiple executions.
  if (!message?.isAuthor) return;

  const allDice = (message.rolls ?? []).flatMap(r => r.dice ?? []);
  let rollResult = null;

  // Find the result of the Omniscient Die from the roll.
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
      // Play the sound through the core audio helper for all connected clients.
      foundry.audio.AudioHelper.play(
        { src: soundSrc, volume: soundVolume, autoplay: true, loop: false },
        true 
      );
    }
  }

});

// ─── Helpers ─────────────────────────────────────────────────

/**
 * Resolves the correct theme path based on user language and theme settings.
 * This ensures that localized dice images are used (e.g., 'en-color', 'ptbr-color').
 * @returns {string} The path segment for the current theme.
 */
function _resolveThemePath() {
  let themeSetting = game.settings.get(moduleName, 'theme');
  
  // Retrocompatibility: Sanitize legacy database values where 'theme-auto' was used.
  if (themeSetting === 'theme-auto') themeSetting = 'color';
  themeSetting = themeSetting.replace(/^(en|ptbr)-/, '');

  const lang         = game.settings.get("core", "language");
  const langPrefix   = lang === 'pt-BR' ? 'ptbr' : 'en';

  return `${langPrefix}-${themeSetting}`;
}

/**
 * Resolves the image path for a given roll result based on the chat image mode.
 * @param {string} mode - The current image mode ('custom', 'theme', 'disabled').
 * @param {string} resultKey - The key for the result (e.g., 'yesand', 'no').
 * @param {number} faceNumber - The numeric face result of the die (1-6).
 * @returns {string|null} The resolved image path, or null if no image should be shown.
 */
function _resolveImagePath(mode, resultKey, faceNumber) {
  if (mode === 'custom') {
    const path = (game.settings.get(moduleName, `customImage_${resultKey}`) ?? "").trim();
    return path !== "" ? path : null;
  }
  // In 'theme' mode, construct the path to the theme's default image for that face.
  const themePath = _resolveThemePath();
  return `modules/${moduleName}/images/${themePath}/d${faceNumber}.png`;
}