/**
 * O histórico de acessos do usuário logado, lido do grupo do e-mail no jn_grouper pelo endpoint que traz os dois lados
 * de uma vez (GET /grouper/{email}/{parentName}/{childName}/{parentId}/bothSides, API js): no lado ativo (jn_grouper)
 * cada login gravou {userAgent, ip, loginDate}; no inativo (jn_inactive_grouper) cada logout gravou {userAgent, ip,
 * logoutDate}. Aqui os logouts são casados com os logins e viram a coluna logoutDate.
 */

/** O tipo do grupo: o nome da entidade que calcula o parentId. */
export const PARENT_NAME = 'js_login_email';

/** O nome da entidade dos filhos. */
export const CHILD_NAME = 'js_login_session_validation';

/** Os dois lados do grupo, como o endpoint os devolve, cada um com o nome da sua entidade. */
export const ACTIVE_SIDE = 'jn_grouper';
export const INACTIVE_SIDE = 'jn_inactive_grouper';

export type Login = { userAgent: string; ip: string; loginDate: string };

export type Logout = { userAgent: string; ip: string; logoutDate: string };

/** Uma linha da tela: o login com a data do logout que lhe corresponde, vazia quando a sessão expirou sem logout. */
export type Access = Login & { logoutDate: string };

const rotateLeft = (value: number, bits: number) => (value << bits) | (value >>> (32 - bits));

/** O SHA-1 dos bytes UTF-8 do texto. */
const sha1Bytes = (text: string): Uint8Array => {
    const message = new TextEncoder().encode(text);
    const bitLength = message.length * 8;
    const paddedLength = Math.ceil((message.length + 9) / 64) * 64;
    const padded = new Uint8Array(paddedLength);
    padded.set(message);
    padded[message.length] = 0x80;
    const view = new DataView(padded.buffer);
    view.setUint32(paddedLength - 8, Math.floor(bitLength / 0x100000000));
    view.setUint32(paddedLength - 4, bitLength >>> 0);

    let h0 = 0x67452301, h1 = 0xefcdab89, h2 = 0x98badcfe, h3 = 0x10325476, h4 = 0xc3d2e1f0;
    const words = new Uint32Array(80);
    for (let block = 0; block < paddedLength; block += 64) {
        for (let i = 0; i < 16; i++) {
            words[i] = view.getUint32(block + i * 4);
        }
        for (let i = 16; i < 80; i++) {
            words[i] = rotateLeft(words[i - 3] ^ words[i - 8] ^ words[i - 14] ^ words[i - 16], 1);
        }
        let a = h0, b = h1, c = h2, d = h3, e = h4;
        for (let i = 0; i < 80; i++) {
            const f = i < 20 ? (b & c) | (~b & d) : i < 40 ? b ^ c ^ d : i < 60 ? (b & c) | (b & d) | (c & d) : b ^ c ^ d;
            const k = i < 20 ? 0x5a827999 : i < 40 ? 0x6ed9eba1 : i < 60 ? 0x8f1bbcdc : 0xca62c1d6;
            const temp = (rotateLeft(a, 5) + f + e + k + words[i]) >>> 0;
            e = d;
            d = c;
            c = rotateLeft(b, 30) >>> 0;
            b = a;
            a = temp;
        }
        h0 = (h0 + a) >>> 0;
        h1 = (h1 + b) >>> 0;
        h2 = (h2 + c) >>> 0;
        h3 = (h3 + d) >>> 0;
        h4 = (h4 + e) >>> 0;
    }
    const digest = new Uint8Array(20);
    const digestView = new DataView(digest.buffer);
    [h0, h1, h2, h3, h4].forEach((h, i) => digestView.setUint32(i * 4, h));
    return digest;
};

/**
 * O SHA-1 do texto como o back end o escreve: o digest lido como número com sinal (o BigInteger do Java) em hexadecimal,
 * sem zeros à esquerda e com "-" quando o primeiro bit é 1.
 */
export const sha1AsTheBackEnd = (text: string): string => {
    const digest = sha1Bytes(text);
    const negative = (digest[0] & 0x80) != 0;
    // o valor absoluto de um negativo é o complemento de dois: inverte os bits e soma 1, do último byte ao primeiro
    const magnitude = Array.from(digest);
    if (negative) {
        let carry = 1;
        for (let i = magnitude.length - 1; i >= 0; i--) {
            const inverted = (~magnitude[i] & 0xff) + carry;
            magnitude[i] = inverted & 0xff;
            carry = inverted >> 8;
        }
    }
    const hex = magnitude.map((byte) => byte.toString(16).padStart(2, '0')).join('');
    const withoutLeadingZeros = hex.replace(/^0+(?=.)/, '');
    return (negative ? '-' : '') + withoutLeadingZeros;
};

/**
 * O parentId do grupo do e-mail: o id em js_login_email (o SHA-1 da sua chave primária) do e-mail já transformado (o
 * SHA-1 do e-mail), que é o valor que o grupo guarda.
 */
export const groupParentId = (email: string): string => sha1AsTheBackEnd(sha1AsTheBackEnd(email));

/** A data dd/MM/yyyy HH:mm:ss como texto ordenável (yyyyMMddHHmmss). */
const sortable = (date: string): string => {
    const [day, month, rest] = date.split('/');
    const [year, time] = rest.split(' ');
    return year + month + day + time.replace(/:/g, '');
};

const parseAll = <T,>(children: string[] | undefined): T[] => (children || []).map((child) => JSON.parse(child) as T);

/**
 * Casa cada logout com o login de que ele saiu: o login mais recente do mesmo cliente (ip e userAgent) feito até a hora
 * do logout e ainda sem logout. Os logouts são casados do mais antigo ao mais novo, e um login sem logout correspondente
 * (sessão que expirou, ou a que ainda está aberta) fica com logoutDate vazio.
 * @returns os acessos, do login mais recente ao mais antigo
 */
export const reconcileLoginHistory = (logins: Login[], logouts: Logout[]): Access[] => {
    const accesses: Access[] = logins.map((login) => ({ ...login, logoutDate: '' }));
    const logoutsInOrder = [...logouts].sort((x, y) => sortable(x.logoutDate).localeCompare(sortable(y.logoutDate)));
    for (const logout of logoutsInOrder) {
        const logoutMoment = sortable(logout.logoutDate);
        const candidates = accesses.filter(
            (access) => access.logoutDate == '' && access.ip == logout.ip && access.userAgent == logout.userAgent && sortable(access.loginDate) <= logoutMoment,
        );
        if (candidates.length == 0) {
            continue;
        }
        const latest = candidates.reduce((x, y) => (sortable(y.loginDate) > sortable(x.loginDate) ? y : x));
        latest.logoutDate = logout.logoutDate;
    }
    return accesses.sort((x, y) => sortable(y.loginDate).localeCompare(sortable(x.loginDate)));
};

/**
 * Os acessos a partir da resposta do endpoint dos dois lados: o child de cada lado é uma lista de textos JSON.
 * @param groupOnBothSides a resposta, com o grupo de cada lado sob o nome da sua entidade ({} no lado onde não existe)
 */
export const accessesFromGroups = (groupOnBothSides: any): Access[] => {
    const activeGroup = (groupOnBothSides && groupOnBothSides[ACTIVE_SIDE]) || {};
    const inactiveGroup = (groupOnBothSides && groupOnBothSides[INACTIVE_SIDE]) || {};
    const logins = parseAll<Login>(activeGroup.child);
    const logouts = parseAll<Logout>(inactiveGroup.child);
    return reconcileLoginHistory(logins, logouts);
};
