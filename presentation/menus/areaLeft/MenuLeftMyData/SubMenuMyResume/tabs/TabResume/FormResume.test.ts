import { TabResumeStore } from './FormResume';

// o candidato só avança ou salva depois de abrir o linkedin pelo "Testar link" (desde 2026-11-11); o endereço já
// gravado dispensa o teste, a não ser que seja trocado
const profile = 'https://www.linkedin.com/in/meu-perfil';
const otherProfile = 'https://www.linkedin.com/in/outro-perfil';
const untestedMessage = 'Clique em "Testar link" e confira se o perfil aberto é o seu antes de continuar';

const openedAddresses: string[] = [];
(global as any).window = { open: (address: string) => openedAddresses.push(address) };

const fillTheOtherFields = () => {
    const state = TabResumeStore.getState();
    state.setDesiredJob('Desenvolvedor');
    state.setResumeType({ id: 2, label: 'Recrutamento' });
};

beforeEach(() => {
    openedAddresses.length = 0;
    TabResumeStore.setState({ linkedinAddress: '', testedLinkedinAddress: '', notAllowedCompany: [], fieldErrors: {}, savedResume: false, savedTechResume: false });
    fillTheOtherFields();
});

test('a new address blocks moving forward until it is tested, with the error under the field', () => {
    TabResumeStore.getState().setLinkedinAddress(profile);
    const errors = TabResumeStore.getState().onMoveOnFowardTabs();
    expect(errors).toEqual([untestedMessage]);
    expect(TabResumeStore.getState().fieldErrors.linkedinAddress).toBe(untestedMessage);
    expect(TabResumeStore.getState().getPendingRequirements()).toEqual([untestedMessage]);
});

test('testing opens the profile in a new tab, clears the error and releases moving forward', () => {
    TabResumeStore.getState().setLinkedinAddress(profile);
    TabResumeStore.getState().onMoveOnFowardTabs();
    TabResumeStore.getState().testLinkedinAddress();
    expect(openedAddresses).toEqual([profile]);
    expect(TabResumeStore.getState().fieldErrors.linkedinAddress).toBeUndefined();
    expect(TabResumeStore.getState().onMoveOnFowardTabs()).toEqual([]);
});

test('changing the address after the test asks for a new test', () => {
    TabResumeStore.getState().setLinkedinAddress(profile);
    TabResumeStore.getState().testLinkedinAddress();
    TabResumeStore.getState().setLinkedinAddress(otherProfile);
    expect(TabResumeStore.getState().getPendingRequirements()).toEqual([untestedMessage]);
});

test('an address out of the format keeps only the format message', () => {
    TabResumeStore.getState().setLinkedinAddress('https://www.linkedin.com/in/perfil-cortado-');
    const errors = TabResumeStore.getState().getPendingRequirements();
    expect(errors).toEqual(['O endereço do linkedin deve ter o formato https://www.linkedin.com/in/seu-perfil']);
});

// cada empresa / consultoria proibida é um domínio (desde 2026-11-11): enquanto houver uma que não seja, não se avança
const domainMessage = (invalid: string) => `Informe o domínio de cada empresa / consultoria (ex.: consultoria.com.br), de 4 a 50 caracteres. Corrija: ${invalid}`;

test('a company that is not a domain blocks moving forward, with the error under the field naming it', () => {
    TabResumeStore.getState().loadFromSavedResume({ resumeType: 2, desiredJob: 'Desenvolvedor', linkedinAddress: profile });
    TabResumeStore.getState().setNotAllowedCompany(['actdigital.com', 'Actdigital', 'plan a']);
    const errors = TabResumeStore.getState().onMoveOnFowardTabs();
    expect(errors).toEqual([domainMessage('Actdigital, plan a')]);
    expect(TabResumeStore.getState().fieldErrors.notAllowedCompany).toBe(domainMessage('Actdigital, plan a'));
});

test('once every company is a domain, moving forward is released', () => {
    TabResumeStore.getState().loadFromSavedResume({ resumeType: 2, desiredJob: 'Desenvolvedor', linkedinAddress: profile });
    TabResumeStore.getState().setNotAllowedCompany(['actdigital.com', 'ntconsult.com.br', 'aml-group.co.uk']);
    expect(TabResumeStore.getState().getPendingRequirements()).toEqual([]);
});

test.each(['someone@gmail.com', 'https://www.linkedin.com/in/x', '-consultoria.com', 'consultoria-.com', 'consultoria.c0m', 'consultoria..com', 'a.b', 'nenhuma'])(
    '%s is not a domain',
    (invalid) => {
        TabResumeStore.getState().loadFromSavedResume({ resumeType: 2, desiredJob: 'Desenvolvedor', linkedinAddress: profile });
        TabResumeStore.getState().setNotAllowedCompany([invalid]);
        expect(TabResumeStore.getState().getPendingRequirements()).toEqual([domainMessage(invalid)]);
    },
);

test('a saved resume with company names must be corrected before moving forward', () => {
    TabResumeStore.getState().loadFromSavedResume({ resumeType: 2, desiredJob: 'Desenvolvedor', linkedinAddress: profile, notAllowedCompany: ['Intelectah'] });
    expect(TabResumeStore.getState().getPendingRequirements()).toEqual([domainMessage('Intelectah')]);
});

test('the address of a saved resume needs no test, unless it is changed', () => {
    TabResumeStore.getState().loadFromSavedResume({ resumeType: 2, desiredJob: 'Desenvolvedor', linkedinAddress: profile });
    expect(TabResumeStore.getState().getPendingRequirements()).toEqual([]);
    TabResumeStore.getState().setLinkedinAddress(otherProfile);
    expect(TabResumeStore.getState().getPendingRequirements()).toEqual([untestedMessage]);
    TabResumeStore.getState().setLinkedinAddress(profile);
    expect(TabResumeStore.getState().getPendingRequirements()).toEqual([]);
});
