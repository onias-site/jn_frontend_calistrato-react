export class WrongTokenError extends Error {
    constructor() {
        super('Token incorreto');
        this.name = 'WrongTokenError';
    }
}
