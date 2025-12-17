export class UserAlreadyLoggedError extends Error {
    constructor() {
        super('Usuário já logado no sistema');
        this.name = 'UserAlreadyLoggedError';
    }
}
