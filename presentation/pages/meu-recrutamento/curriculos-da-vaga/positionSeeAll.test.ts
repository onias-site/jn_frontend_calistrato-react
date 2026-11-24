import {
    getPositionTitleFromQuery,
    getResumesOfThePositionGridTitle,
    getResumesOfThePositionPath,
    getResumesOfThePositionTitle,
} from './positionSeeAll';

describe('a tela "Ver todos" do e-mail dos currículos da vaga', () => {
    it('lê o título da vaga do link, decodificado', () => {
        expect(getPositionTitleFromQuery('?email=rh%40empresa.com&vaga=Dev%20Java%20S%C3%AAnior')).toBe('Dev Java Sênior');
        expect(getPositionTitleFromQuery('?email=rh%40empresa.com')).toBe('');
        expect(getPositionTitleFromQuery('')).toBe('');
    });

    it('pede a lista pelo título codificado na URL', () => {
        expect(getResumesOfThePositionPath('Dev Java & Go')).toBe('recruiter/{email}/resumes-of-the-position?title=Dev%20Java%20%26%20Go');
    });

    it('mostra a vaga e o recrutador no título da tela', () => {
        expect(getResumesOfThePositionTitle('Dev Java', 'rh@empresa.com')).toBe('Currículos da vaga Dev Java do recrutador rh@empresa.com');
        expect(getResumesOfThePositionTitle('Dev Java', '')).toBe('Currículos da vaga Dev Java');
        expect(getResumesOfThePositionTitle('', '')).toBe('Currículos da vaga');
    });

    it('conta os currículos no título do grid', () => {
        expect(getResumesOfThePositionGridTitle(1, 1, false)).toBe('1 currículo recebido no último e-mail da vaga');
        expect(getResumesOfThePositionGridTitle(40, 12, true)).toBe('40 currículos recebidos no último e-mail da vaga, 12 ainda não vistos');
    });
});
