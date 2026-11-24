import { instantMessageGroupsRequestOf } from './PublishInGroupsCheckBox';

describe('PublishInGroupsCheckBox', () => {
    it('pede os grupos pela área, pelas senioridades e pelas regiões da vaga, com o home office (10) como um ddd', () => {
        expect(instantMessageGroupsRequestOf('2', ['pleno', 'senior'], ['11', '10'])).toEqual({ resumeType: 2, seniority: ['pleno', 'senior'], ddd: [11, 10] });
    });

    it('sem área, senioridade ou região ainda não pede', () => {
        expect(instantMessageGroupsRequestOf('', ['pleno'], ['11'])).toBeNull();
        expect(instantMessageGroupsRequestOf('1', [], ['11'])).toBeNull();
        expect(instantMessageGroupsRequestOf('1', ['pleno'], [])).toBeNull();
    });
});
