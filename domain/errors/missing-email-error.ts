export class MissingEmailError extends Error {
    constructor() {
        super('Email não encontrado');
        this.name = 'MissingEmailError';
    }
}
