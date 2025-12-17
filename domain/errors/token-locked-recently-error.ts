export class TokenLockedRecentlyError extends Error {
    constructor() {
        super('Token bloqueado recentemente, tente novamente mais tarde');
        this.name = 'TokenLockedRecentlyError';
    }
}
