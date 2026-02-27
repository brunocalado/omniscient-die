const moduleName = 'omniscient-die';

import {dadoDaResposta} from './die.js';

// ─── Face → result key mapping ───────────────────────────────
// Face 1=yesand  2=no  3=nobut  4=yesbut  5=yes  6=noand
const RESULT_KEYS = {
  1: 'yesand',
  2: 'no',
  3: 'nobut',
  4: 'yesbut',
  5: 'yes',
  6: 'noand'
};

// ─── INIT ────────────────────────────────────────────────────

Hooks.once('init', function() {

  // Register die term
  CONFIG.Dice.terms["o"] = dadoDaResposta;

  // ── Setting: Theme ────────────────────────────────────────
  game.settings.register(moduleName, 'theme', {
    name: game.i18n.localize("omniscient-die.settings.theme.name"),
    hint: game.i18n.localize("omniscient-die.settings.theme.hint"),
    scope: "world",
    type: String,
    choices: {
      'theme-auto':  game.i18n.localize("omniscient-die.settings.theme.auto"),
      'en-black':    game.i18n.localize("omniscient-die.dice.black.label"),
      'en-blood':    game.i18n.localize("omniscient-die.dice.blood.label"),
      'en-color':    game.i18n.localize("omniscient-die.dice.color.label"),
      'en-color2':   game.i18n.localize("omniscient-die.dice.color2.label"),
      'en-white':    game.i18n.localize("omniscient-die.dice.white.label"),
      'en-modern':   game.i18n.localize("omniscient-die.dice.modern.label"),
    },
    default: "theme-auto",
    config: true,
    requiresReload: true
  });

  // ── Setting: Chat Image mode ──────────────────────────────
  game.settings.register(moduleName, 'chatImage', {
    name: game.i18n.localize("omniscient-die.settings.chatImage.name"),
    hint: game.i18n.localize("omniscient-die.settings.chatImage.hint"),
    scope: "world",
    type: String,
    choices: {
      'disabled': game.i18n.localize("omniscient-die.settings.chatImage.disabled"),
      'theme':    game.i18n.localize("omniscient-die.settings.chatImage.theme"),
      'custom':   game.i18n.localize("omniscient-die.settings.chatImage.custom"),
    },
    default: "theme",
    config: true,
  });

  // ── Setting: Chat Image width ─────────────────────────────
  game.settings.register(moduleName, 'chatImageWidth', {
    name: game.i18n.localize("omniscient-die.settings.chatImageWidth.name"),
    hint: game.i18n.localize("omniscient-die.settings.chatImageWidth.hint"),
    scope: "world",
    type: Number,
    range: { min: 80, max: 600, step: 10 },
    default: 220,
    config: true,
  });

  // ── Settings: Custom image per face ──────────────────────
  for (const [face, key] of Object.entries(RESULT_KEYS)) {
    game.settings.register(moduleName, `customImage_${key}`, {
      name: game.i18n.localize(`omniscient-die.settings.customImage_${key}.name`),
      hint: game.i18n.localize(`omniscient-die.settings.customImage_${key}.hint`),
      scope: "world",
      type: String,
      default: "",
      config: true,
      filePicker: "image",
    });
  }

  // ── Setting: Sound mode ───────────────────────────────────
  game.settings.register(moduleName, 'soundMode', {
    name: game.i18n.localize("omniscient-die.settings.soundMode.name"),
    hint: game.i18n.localize("omniscient-die.settings.soundMode.hint"),
    scope: "world",
    type: String,
    choices: {
      'disabled': game.i18n.localize("omniscient-die.settings.soundMode.disabled"),
      'single':   game.i18n.localize("omniscient-die.settings.soundMode.single"),
      'perface':  game.i18n.localize("omniscient-die.settings.soundMode.perface"),
    },
    default: "disabled",
    config: true,
  });

  // ── Setting: Sound volume (per client) ───────────────────
  game.settings.register(moduleName, 'soundVolume', {
    name: game.i18n.localize("omniscient-die.settings.soundVolume.name"),
    hint: game.i18n.localize("omniscient-die.settings.soundVolume.hint"),
    scope: "client",
    type: Number,
    range: { min: 0, max: 1, step: 0.05 },
    default: 0.8,
    config: true,
  });

  // ── Setting: Single sound for all results ─────────────────
  game.settings.register(moduleName, 'soundSingle', {
    name: game.i18n.localize("omniscient-die.settings.soundSingle.name"),
    hint: game.i18n.localize("omniscient-die.settings.soundSingle.hint"),
    scope: "world",
    type: String,
    default: "",
    config: true,
    filePicker: "audio",
  });

  // ── Settings: Sound per face ──────────────────────────────
  for (const [face, key] of Object.entries(RESULT_KEYS)) {
    game.settings.register(moduleName, `sound_${key}`, {
      name: game.i18n.localize(`omniscient-die.settings.soundFace_${key}.name`),
      hint: game.i18n.localize(`omniscient-die.settings.soundFace_${key}.hint`),
      scope: "world",
      type: String,
      default: "",
      config: true,
      filePicker: "audio",
    });
  }

  // ── Keybinding ────────────────────────────────────────────
  game.keybindings.register(moduleName, "omniscientDie", {
    name: game.i18n.localize("omniscient-die.keybindings.name"),
    hint: game.i18n.localize("omniscient-die.keybindings.hint"),
    editable: [{ key: "KeyO", modifiers: [] }],
    onDown: async () => {
      const roll = await new Roll("1do").evaluate({ async: true });
      game.dice3d.showForRoll(roll, game.user, true);
    },
    onUp: () => {},
    restricted: false,
    reservedModifiers: [],
    precedence: CONST.KEYBINDING_PRECEDENCE.NORMAL
  });

}); // END INIT

// ─── Dice So Nice — register preset ──────────────────────────

Hooks.once('diceSoNiceReady', (dice3d) => {
  const themePath = _resolveThemePath();

  dice3d.addSystem({ id: "omniscient-die", name: "Omniscient Die" }, false);
  dice3d.addDicePreset({
    type: "do",
    system: "omniscient-die",
    labels: [1,2,3,4,5,6].map(n => `modules/${moduleName}/images/${themePath}/d${n}.png`),
    bumpMaps: [1,2,3,4,5,6].map(n => `modules/${moduleName}/images/${themePath}/d${n}_bump.png`),
  });
});

// ─── Dice So Nice — roll complete → image + sound ─────────────

Hooks.on('diceSoNiceRollComplete', async (chatMessageID) => {
  const message = game.messages.get(chatMessageID);
  if (!message?.isAuthor) return;

  // v13 fix: message.rolls is an array, not message.roll
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
      const width          = game.settings.get(moduleName, 'chatImageWidth');
      const currentContent = message.content ?? "";
      const imgHTML = `<div style="text-align:center;margin-top:6px;">
        <img src="${imgSrc}" width="${width}" style="border-radius:8px;border:none;" />
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

    // Guard: only play if path is not empty — avoids console errors on blank settings
    if (soundSrc !== "") {
      foundry.audio.AudioHelper.play(
        { src: soundSrc, volume: soundVolume, autoplay: true, loop: false },
        true  // broadcast to all connected players
      );
    }
  }

}); // END diceSoNiceRollComplete

// ─── Helpers ─────────────────────────────────────────────────

/**
 * Resolves the image folder path respecting language and theme settings.
 *   theme-auto  → uses system language, defaults to "color" variant
 *   en-black etc → applies current language prefix but keeps variant
 */
function _resolveThemePath() {
  const themeSetting = game.settings.get(moduleName, 'theme');
  const lang         = game.settings.get("core", "language");
  const langPrefix   = lang === 'pt-BR' ? 'ptbr' : 'en';

  if (themeSetting === 'theme-auto') {
    return `${langPrefix}-color`;
  }

  // Strip whatever language prefix is stored and apply current one
  const variant = themeSetting.replace(/^(en|ptbr)-/, '');
  return `${langPrefix}-${variant}`;
}

/**
 * Returns the image src for a given result.
 *   mode 'theme'  → image from active theme folder
 *   mode 'custom' → image from per-face setting; null if empty
 */
function _resolveImagePath(mode, resultKey, faceNumber) {
  if (mode === 'custom') {
    const path = (game.settings.get(moduleName, `customImage_${resultKey}`) ?? "").trim();
    return path !== "" ? path : null;
  }

  // mode === 'theme'
  const themePath = _resolveThemePath();
  return `modules/${moduleName}/images/${themePath}/d${faceNumber}.png`;
}
