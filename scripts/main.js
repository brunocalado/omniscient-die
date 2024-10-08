const moduleName = 'omniscient-die';

import {dadoDaResposta} from './die.js';

Hooks.once('init', function() {

  // --------------------------------------------------
  // SETTINGS
  
  // call this with: game.settings.get("omniscient-die", "theme")
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
    requiresReload: true
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
    editable: [{ key: "KeyO", modifiers: []}],
    onDown: async () =>  {
      const roll = await new Roll("1do").evaluate({async: true});
      game.dice3d.showForRoll(roll, game.user, true); // to show for all users
      if ( game.settings.get("omniscient-die", "chattip") ) {
        resultToChatMessage (roll.result);
      }      
    },
    onUp: () => {},
    restricted: false,  // Restrict this Keybinding to gamemaster only?
    reservedModifiers: [],
    precedence: CONST.KEYBINDING_PRECEDENCE.NORMAL
  });  
  // --------------------------------------------------
}); // END INIT

Hooks.once("init", async function () {
  CONFIG.Dice.terms["o"] = dadoDaResposta;
});

Hooks.on('diceSoNiceRollComplete', (chatMessageID) => {
  let message = game.messages.get(chatMessageID);
  let omniscientDieMessageFlag = false;
  let rollResult; 
   
  if (message.isAuthor) {    
    message.roll.dice.forEach(dice => {
      if (dice instanceof dadoDaResposta) {
        omniscientDieMessageFlag = true;
        dice.results.forEach(res => {
          rollResult = res.result;
        });
      }
    }); // ONLY ONE RESULT

    if ( omniscientDieMessageFlag && game.settings.get("omniscient-die", "chattip") ) {
      resultToChatMessage (rollResult);
    }

  } // END MAIN IF
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
    type:"do",
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

// -----------------------------------
// Functions
function resultToChatMessage (rollResult) {
  rollResult = parseInt(rollResult);
  let messageContent;
  switch (rollResult) {
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
  
  ChatMessage.create({
    content: messageContent
  }); 
}