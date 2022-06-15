const moduleName = 'dadodaresposta';

import {dadoDaResposta} from './die.js';

Hooks.once("init", async function () {
  CONFIG.Dice.terms["r"] = dadoDaResposta;
});

Hooks.once('diceSoNiceReady', (dice3d) => {
  // AVATAR
  dice3d.addSystem({id:"dadodaresposta", name:"Dado da Resposta"}, false);
  dice3d.addDicePreset({
    type:"d6",
    system:"dadodaresposta",
    labels:[
      'modules/' + moduleName + '/images/d1.png', 
      'modules/' + moduleName + '/images/d2.png', 
      'modules/' + moduleName + '/images/d3.png',
      'modules/' + moduleName + '/images/d4.png', 
      'modules/' + moduleName + '/images/d5.png', 		
      'modules/' + moduleName + '/images/d6.png'
    ],
    bumpMaps:[
      'modules/' + moduleName + '/images/d1_bump.png', 
      'modules/' + moduleName + '/images/d2_bump.png', 
      'modules/' + moduleName + '/images/d3_bump.png',
      'modules/' + moduleName + '/images/d4_bump.png',		
      'modules/' + moduleName + '/images/d5_bump.png',
      'modules/' + moduleName + '/images/d6_bump.png'
    ]      
  });  
});
