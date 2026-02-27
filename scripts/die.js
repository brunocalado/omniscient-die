/**
 * A custom Die term for the Omniscient Die, which is a d6.
 * @extends {foundry.dice.terms.Die}
 */
export class dadoDaResposta extends foundry.dice.terms.Die {
    /**
     * @param {object} termData - Data for the Die term, provided by the parser.
     */
    constructor(termData) {
        termData.faces=6;
        super(termData);
    }

    /* -------------------------------------------- */

    /** @override */
    static DENOMINATION = "o"; // The denomination used in roll formulas, e.g., /r 1do

}
