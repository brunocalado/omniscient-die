const moduleName = 'omniscient-die';

import {dadoDaResposta} from './die.js';

Hooks.once('init', function() {
  
  const dieThemeColor = game.i18n.localize("omniscient-die.dice.color.name");
  const dieThemeColor2 = game.i18n.localize("omniscient-die.dice.color2.name");

  /*
      [game.i18n.localize("omniscient-die.dice.black.name")]: game.i18n.localize("omniscient-die.dice.black.label"),
      [game.i18n.localize("omniscient-die.dice.blood.name")]: game.i18n.localize("omniscient-die.dice.blood.label"),
      [game.i18n.localize("omniscient-die.dice.color.name")]: game.i18n.localize("omniscient-die.dice.color.label"),
      [game.i18n.localize("omniscient-die.dice.color2.name")]: game.i18n.localize("omniscient-die.dice.color2.label"),
      [game.i18n.localize("omniscient-die.dice.modern.name")]: game.i18n.localize("omniscient-die.dice.modern.label"),
      [game.i18n.localize("omniscient-die.dice.white.name")]: game.i18n.localize("omniscient-die.dice.white.label")  
      
      'ptbr-color': 'Cor'
  */
  
  // --------------------------------------------------
  // SETTINGS
  // call this with: game.settings.get("omniscient-die", "theme")
  const debouncedReload = debounce(() => location.reload(), 1000); // RELOAD AFTER CHANGE
  game.settings.register(moduleName, 'theme', {
    name: game.i18n.localize("omniscient-die.settings.theme.name"), 
    hint: game.i18n.localize("omniscient-die.settings.theme.hint"),
    scope: "world",
    type: String,
    choices: {
      'en-black': game.i18n.localize("omniscient-die.dice.black.label"),
      'en-blood': game.i18n.localize("omniscient-die.dice.blood.label"),
      'en-color': game.i18n.localize("omniscient-die.dice.color.label"),
      'en-color2': game.i18n.localize("omniscient-die.dice.color2.label"),
      'en-white': game.i18n.localize("omniscient-die.dice.white.label"),
      'en-modern': game.i18n.localize("omniscient-die.dice.modern.label")      
    },
    default: "ptbr-color",
    config: true,
    onChange: debouncedReload
  });
  // location ->      "book": game.i18n.localize('STORYTELLER.Settings.ThemeBook'), //[game.i18n.localize("omniscient-die.dice.black.name")]: game.i18n.localize("omniscient-die.dice.black.label"),

  // call this with: game.settings.get("omniscient-die", "chattip")
  game.settings.register(moduleName, 'chattip', {
    name: 'Dica no Chat',
    hint: 'Vai enviar uma mensagem para o chat explicando a rolagem.',
    scope: 'world',
    config: true,
    default: false,
    type: Boolean
  });
  
  // --------------------------------------------------
  // Keybinding
  game.keybindings.register(moduleName, "omniscientDie", {
    name: game.i18n.localize("omniscient-die.keybindings.name"),
    hint: game.i18n.localize("omniscient-die.keybindings.hint"),
    editable: [{ key: "KeyR", modifiers: []}],
    onDown: async () =>  {
      const roll = await new Roll("1dr").evaluate({async: true});
      game.dice3d.showForRoll(roll, game.user, true); // to show for all users
    },
    onUp: () => {},
    restricted: false,  // Restrict this Keybinding to gamemaster only?
    reservedModifiers: [],
    precedence: CONST.KEYBINDING_PRECEDENCE.NORMAL
  });  
  // --------------------------------------------------
}); // END INIT

Hooks.once("init", async function () {
  CONFIG.Dice.terms["r"] = dadoDaResposta;
});

Hooks.on('diceSoNiceRollComplete', (chatMessageID) => {
  let message = game.messages.get(chatMessageID);
  let messageContent = ``;
  let omniscientDieMessageFlag = false;
  
  if (message.isAuthor) {    
    message.roll.dice.forEach(dice => {
      if (dice instanceof dadoDaResposta) {
        omniscientDieMessageFlag = true;
        dice.results.forEach(res => {
          switch (res.result) {
            case 1:
              messageContent = `<h1>${game.i18n.localize("omniscient-die.tips.yesand.title")}</h1><p>${game.i18n.localize("omniscient-die.tips.yesand.title")}</p>`;
              break;
            case 2:
              messageContent = `<h1>${game.i18n.localize("omniscient-die.tips.no.title")}</h1><p>${game.i18n.localize("omniscient-die.tips.no.title")}</p>`;            
              break;
            case 3:
              messageContent = `<h1>${game.i18n.localize("omniscient-die.tips.nobut.title")}</h1><p>${game.i18n.localize("omniscient-die.tips.nobut.title")}</p>`;            
              break;
            case 4:
              messageContent = `<h1>${game.i18n.localize("omniscient-die.tips.yesbut.title")}</h1><p>${game.i18n.localize("omniscient-die.tips.yesbut.title")}</p>`;            
              break;
            case 5:
              messageContent = `<h1>${game.i18n.localize("omniscient-die.tips.yes.title")}</h1><p>${game.i18n.localize("omniscient-die.tips.yes.title")}</p>`;            
              break;
            case 6:
              messageContent = `<h1>${game.i18n.localize("omniscient-die.tips.noand.title")}</h1><p>${game.i18n.localize("omniscient-die.tips.noand.title")}</p>`;            
              break;
          }
        });
      }
    });

    if ( omniscientDieMessageFlag && game.settings.get("omniscient-die", "chattip") ) {
      ChatMessage.create({
        content: messageContent,
        whisper: message.data.whisper,
        blind: message.data.blind
      });
    }
  }
});

Hooks.once('diceSoNiceReady', (dice3d) => {
  const dieThemeKey = game.settings.get("omniscient-die", "theme");
  const currentLanguage = game.settings.get("core", "language");
  let dieThemePath;
  
  if ( currentLanguage=='pt-BR' ) { // TRANSLATION REQUIRED
    dieThemePath = dieThemeKey.replace("en-", "ptbr-");
  } else {
    dieThemePath = dieThemeKey;
  }
  
  dice3d.addSystem({id:"omniscient-die", name:"Omniscient Die"}, false);
  dice3d.addDicePreset({
    type:"d6",
    system:"omniscient-die",
    labels:[
      'modules/' + moduleName + '/images/' + dieThemePath + '/d1.png', 
      'modules/' + moduleName + '/images/' + dieThemePath + '/d2.png', 
      'modules/' + moduleName + '/images/' + dieThemePath + '/d3.png',
      'modules/' + moduleName + '/images/' + dieThemePath + '/d4.png', 
      'modules/' + moduleName + '/images/' + dieThemePath + '/d5.png', 		
      'modules/' + moduleName + '/images/' + dieThemePath + '/d6.png'
    ],
    bumpMaps:[
      'modules/' + moduleName + '/images/' + dieThemePath + '/d1_bump.png', 
      'modules/' + moduleName + '/images/' + dieThemePath + '/d2_bump.png', 
      'modules/' + moduleName + '/images/' + dieThemePath + '/d3_bump.png',
      'modules/' + moduleName + '/images/' + dieThemePath + '/d4_bump.png',		
      'modules/' + moduleName + '/images/' + dieThemePath + '/d5_bump.png',
      'modules/' + moduleName + '/images/' + dieThemePath + '/d6_bump.png'
    ]      
  });  
});
