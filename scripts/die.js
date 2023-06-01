export class dadoDaResposta extends Die {
    constructor(termData) {
        termData.faces=6;
        super(termData);
    }

    /* -------------------------------------------- */
    /** @override */
    static DENOMINATION = "o"; // "r";

}