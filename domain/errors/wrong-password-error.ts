export class WrongPasswordError extends Error {
    constructor() {
        super('Senha incorreta');
        this.name = 'WrongPasswordError';
    }
}
