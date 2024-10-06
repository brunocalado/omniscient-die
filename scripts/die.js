export class dadoDaResposta extends foundry.dice.terms.Die {
    constructor(termData) {
        termData.faces=6;
        super(termData);
    }

    /* -------------------------------------------- */
    /** @override */
    static DENOMINATION = "o"; // "r";

}


