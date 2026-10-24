import { accessesFromGroups, groupParentId, reconcileLoginHistory, sha1AsTheBackEnd } from './accessesReconciliation';

const PC = { ip: '10.0.0.1', userAgent: 'Chrome' };
const PHONE = { ip: '10.0.0.2', userAgent: 'Safari' };

describe('sha1AsTheBackEnd', () => {
    it('escreve o SHA-1 como o BigInteger do Java, positivo', () => {
        expect(sha1AsTheBackEnd('onias85@gmail.com')).toBe('376e139c1a4b8ae34a3efe9bf12623a2fbdd3622');
    });

    it('escreve o SHA-1 negativo com o sinal', () => {
        expect(sha1AsTheBackEnd('376e139c1a4b8ae34a3efe9bf12623a2fbdd3622')).toBe('-59b2d0bbc256a21ddec4620fa6dfd624a3096935');
    });

    it('o parentId do grupo é o id em jn_login_email do e-mail transformado', () => {
        expect(groupParentId('onias85@gmail.com')).toBe('-59b2d0bbc256a21ddec4620fa6dfd624a3096935');
    });
});

describe('reconcileLoginHistory', () => {
    it('casa o logout com o login do mesmo cliente', () => {
        const accesses = reconcileLoginHistory([{ ...PC, loginDate: '01/10/2026 10:00:00' }], [{ ...PC, logoutDate: '01/10/2026 11:00:00' }]);

        expect(accesses).toEqual([{ ...PC, loginDate: '01/10/2026 10:00:00', logoutDate: '01/10/2026 11:00:00' }]);
    });

    it('login sem logout (sessão expirada) fica com logoutDate vazio', () => {
        const accesses = reconcileLoginHistory([{ ...PC, loginDate: '01/10/2026 10:00:00' }], []);

        expect(accesses[0].logoutDate).toBe('');
    });

    it('o logout vai para o login mais recente do mesmo cliente feito antes dele', () => {
        const accesses = reconcileLoginHistory(
            [
                { ...PC, loginDate: '01/10/2026 08:00:00' },
                { ...PC, loginDate: '01/10/2026 10:00:00' },
                { ...PC, loginDate: '01/10/2026 12:00:00' },
            ],
            [{ ...PC, logoutDate: '01/10/2026 11:00:00' }],
        );

        expect(accesses.map((access) => access.logoutDate)).toEqual(['', '01/10/2026 11:00:00', '']);
    });

    it('não casa logout de outro cliente', () => {
        const accesses = reconcileLoginHistory([{ ...PC, loginDate: '01/10/2026 10:00:00' }], [{ ...PHONE, logoutDate: '01/10/2026 11:00:00' }]);

        expect(accesses[0].logoutDate).toBe('');
    });

    it('cada login recebe no máximo um logout', () => {
        const accesses = reconcileLoginHistory(
            [
                { ...PC, loginDate: '01/10/2026 08:00:00' },
                { ...PC, loginDate: '01/10/2026 10:00:00' },
            ],
            [
                { ...PC, logoutDate: '01/10/2026 11:00:00' },
                { ...PC, logoutDate: '01/10/2026 12:00:00' },
            ],
        );

        expect(accesses.map((access) => access.logoutDate)).toEqual(['01/10/2026 11:00:00', '01/10/2026 12:00:00']);
    });

    it('ordena do login mais recente ao mais antigo, comparando a data e não o texto', () => {
        const accesses = reconcileLoginHistory(
            [
                { ...PC, loginDate: '31/12/2025 23:00:00' },
                { ...PC, loginDate: '01/01/2026 09:00:00' },
            ],
            [],
        );

        expect(accesses.map((access) => access.loginDate)).toEqual(['01/01/2026 09:00:00', '31/12/2025 23:00:00']);
    });
});

describe('accessesFromGroups', () => {
    it('lê os textos JSON do child de cada lado', () => {
        const response = {
            jn_grouper: { child: [JSON.stringify({ ...PC, loginDate: '01/10/2026 10:00:00' })] },
            jn_inactive_grouper: { child: [JSON.stringify({ ...PC, logoutDate: '01/10/2026 10:30:00' })] },
        };

        expect(accessesFromGroups(response)).toEqual([{ ...PC, loginDate: '01/10/2026 10:00:00', logoutDate: '01/10/2026 10:30:00' }]);
    });

    it('lado vazio não quebra', () => {
        const response = { jn_grouper: { child: [JSON.stringify({ ...PC, loginDate: '01/10/2026 10:00:00' })] }, jn_inactive_grouper: {} };

        expect(accessesFromGroups(response)).toHaveLength(1);
    });
});
