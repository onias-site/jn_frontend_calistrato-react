export class PasswordLockedRecentlyError extends Error {
    constructor() {
        super('Senha bloqueada recentemente, tente novamente mais tarde');
        this.name = 'PasswordLockedRecentlyError';
    }
}
