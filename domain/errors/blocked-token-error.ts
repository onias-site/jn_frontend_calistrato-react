export class BlockedTokenError extends Error {
    constructor() {
        super('Token bloqueado');
        this.name = 'BlockedTokenError';
    }
}
