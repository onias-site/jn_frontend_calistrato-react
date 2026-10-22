// Os conceitos do backend, transcritos da seção "Architectural Rules" do CLAUDE.md da raiz do workspace (a fonte é ele:
// regra nova ou sigla mudada lá deve ser repetida aqui), em ordem alfabética de sigla dentro de cada seção.

export interface BackendConcept {
    acronym: string;
    name: string;
    explanation: string;
}

export interface BackendConceptSection {
    title: string;
    concepts: BackendConcept[];
}

export const conceptSections: BackendConceptSection[] = [
    {
        title: 'Entidades',
        concepts: [
            { acronym: 'AE', name: 'Async Entity', explanation: 'Entidade cujas escritas rodam de forma assíncrona.' },
            { acronym: 'AEI', name: 'Automatic Entity Id', explanation: 'O id de toda entidade é calculado a partir dos campos marcados como chave primária.' },
            { acronym: 'CE', name: 'Cache Entity', explanation: 'Entidade cujos registros ficam em cache por um tempo definido em segundos.' },
            { acronym: 'DSE', name: 'Disposable Entity', explanation: 'Entidade descartável: seus registros valem por um período (hora, dia, mês...) e depois são ignorados.' },
            {
                acronym: 'ED',
                name: 'Entity Decorators',
                explanation: 'Toda mudança de comportamento de uma entidade (criar, ler, alterar, transferir, copiar, apagar) é um decorator do catálogo do ccp, ligado por uma anotação própria.',
            },
            { acronym: 'GE', name: 'Grouped Entity', explanation: 'Entidade cujos registros são guardados também nos grupos dos registros pais.' },
            { acronym: 'LFE', name: 'LGPD Fields Entity', explanation: 'Entidade com dado sensível (e-mail, senha), que é transformado antes de ser gravado.' },
            { acronym: 'ROE', name: 'Read Only Entity', explanation: 'Entidade somente leitura: muda apenas por operações em lote.' },
            {
                acronym: 'SEA',
                name: 'Side Effect Annotation',
                explanation: 'Uma regra executada antes ou depois de uma escrita é uma anotação cujo nome se lê como uma frase (ex.: depois de inserir na entidade principal, execute...).',
            },
            { acronym: 'TWE', name: 'Twin Entity', explanation: 'Entidade com uma tabela gêmea, que recebe o que é apagado da principal.' },
            { acronym: 'VE', name: 'Versionable Entity', explanation: 'Entidade versionada: cada alteração guarda a versão anterior no histórico, que é expurgado junto com o registro.' },
        ],
    },
    {
        title: 'Leitura e escrita de dados',
        concepts: [
            { acronym: 'CQD', name: 'Complex Query Dsl', explanation: 'Consultas complexas são escritas pela interface fluente de consultas do framework.' },
            { acronym: 'FBOE', name: 'Flow Batch Operation Entity', explanation: 'Lotes cuja entidade de destino é escolhida dinamicamente são gravados por um único executor de operações em lote.' },
            {
                acronym: 'FSED',
                name: 'Flow Status Entity Dsl',
                explanation: 'Quando o fluxo depende de em qual entidade o registro está (ou não está), a decisão é escrita por uma interface fluente que vai ao banco uma só vez.',
            },
            { acronym: 'MGIE', name: 'Multi Get Id Entity', explanation: 'Buscar em várias entidades só pela formação do id usa uma única leitura conjunta (union all).' },
            {
                acronym: 'OQL',
                name: 'Online Query Less',
                explanation: 'Requisições online nunca rodam consultas complexas: elas rodam em processos agendados, filas ou tarefas assíncronas, que deixam o dado pronto para ser lido por id.',
            },
        ],
    },
    {
        title: 'Forma do código',
        concepts: [
            { acronym: 'ATP', name: 'Abstraction Technology Provider', explanation: 'Um módulo de negócio depende só do framework e de outros módulos de negócio, nunca de uma tecnologia.' },
            { acronym: 'DEW', name: 'Decorator Everywhere', explanation: 'APIs de arquivos, coleções, JSON, textos, datas, hashes e afins ficam atrás de um decorator do framework.' },
            { acronym: 'DL', name: 'Dto Less', explanation: 'Não existem classes que só representam dados (DTO, VO, Bean): o dado circula como uma representação JSON.' },
            { acronym: 'DLV', name: 'Dto Less Validation', explanation: 'A validação acontece na execução de cada regra de negócio, pelo motor de validação de JSON.' },
            { acronym: 'EAD', name: 'Enum as Decisor', explanation: 'Quando uma decisão depende de um enum, cada item do enum implementa a sua própria resposta.' },
            { acronym: 'EE', name: 'Extracted Expressions', explanation: 'Expressões aninhadas são extraídas para variáveis locais antes de serem usadas.' },
            { acronym: 'IMO', name: 'Immutable Object', explanation: 'Classes que guardam dados são imutáveis.' },
            { acronym: 'LL', name: 'Literal Less', explanation: 'Textos literais são substituídos por itens de enum, de preferência os já centralizados.' },
            { acronym: 'MIAEL', name: 'Mitigate If And Else Less', explanation: 'Sem else e sem switch: cada if termina em return ou throw, com o caminho curto dentro dele.' },
            { acronym: 'NL', name: 'Null Less', explanation: 'É proibido passar ou devolver null; aspectos do framework barram isso em tempo de execução.' },
            { acronym: 'OTF', name: 'One Type per File', explanation: 'Cada tipo (classe, enum, interface) fica no seu próprio arquivo.' },
            { acronym: 'SBT', name: 'Separated Business Type', explanation: 'Toda ação é uma classe (ou item de enum) de regra de negócio separada.' },
        ],
    },
    {
        title: 'Centros de custo',
        concepts: [
            { acronym: 'CCP', name: 'Framework', explanation: 'Injeção de dependência, decorators e as interfaces das tecnologias; não conhece nenhum outro centro de custo.' },
            { acronym: 'JB', name: 'BackOffice', explanation: 'Suporte e dados estáticos, incluindo o motor dos bots de suporte.' },
            { acronym: 'JN', name: 'JobsNow', explanation: 'A infraestrutura central, com os utilitários usados pelos demais centros de custo.' },
            { acronym: 'JS', name: 'JobsNow System', explanation: 'O serviço de login e as suas entidades.' },
            { acronym: 'VIS', name: 'Visualização', explanation: 'Currículos, recrutadores e a cobrança por visualização de currículo.' },
        ],
    },
];
