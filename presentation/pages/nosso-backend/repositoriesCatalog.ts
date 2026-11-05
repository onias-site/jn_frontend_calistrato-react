// Os repositórios do GitHub, com as descrições transcritas da seção "Module Structure" do CLAUDE.md da raiz do workspace
// (a fonte é ele: módulo novo ou retirado lá deve ser repetido aqui), em ordem alfabética dentro de cada seção. O nome é o
// do repositório no GitHub, que nem sempre é igual ao da pasta local. A skill /ccp-atualizar-tela-nosso-backend refaz esta lista.

export const GITHUB_ACCOUNT_URL = 'https://github.com/onias-site';

export interface BackendRepository {
    name: string;
    description: string;
}

export interface BackendRepositorySection {
    title: string;
    repositories: BackendRepository[];
}

export const repositorySections: BackendRepositorySection[] = [
    {
        title: 'Repositórios GIT do CCP',
        repositories: [
            { name: 'ccp_cache_gcp-memory-store', description: 'Cache via GCP Memorystore for Valkey.' },
            { name: 'ccp_commons_jobsnow', description: 'Núcleo do framework: decorators, injeção de dependência, sistema de entidades e construtores de query.' },
            { name: 'ccp_cron-tasks_jobsnow', description: 'Tarefas agendadas.' },
            { name: 'ccp_db-bulk_elasticsearch', description: 'Operações em lote no Elasticsearch.' },
            { name: 'ccp_db-crud_elasticsearch', description: 'CRUD no Elasticsearch.' },
            { name: 'ccp_db-query_elasticsearch', description: 'Construtor de queries do Elasticsearch.' },
            { name: 'ccp_db-utils_elasticsearch', description: 'Utilitários do Elasticsearch.' },
            { name: 'ccp_email_sendgrid', description: 'Envio de e-mail via SendGrid.' },
            { name: 'ccp_file-bucket_gcp', description: 'Armazenamento de arquivos no GCP.' },
            { name: 'ccp_http_apache-mime', description: 'Cliente HTTP via Apache MIME.' },
            { name: 'ccp_instant-messenger_telegram', description: 'Mensagens pelo Telegram.' },
            { name: 'ccp_json_gson', description: 'Serialização de JSON via Gson.' },
            { name: 'ccp_main-authentication_gcp-oauth', description: 'Autenticação via GCP OAuth.' },
            { name: 'ccp_mensageria-consumer_gcp-pubsub-pull_dependency-chooser', description: 'Consumidor de mensagens do Pub/Sub por pull.' },
            { name: 'ccp_mensageria-sender_gcp-pubsub', description: 'Envio de mensagens ao Pub/Sub.' },
            { name: 'ccp_mocking_jobsnow', description: 'Mocks de teste e ligação das dependências.' },
            { name: 'ccp_password_mindrot', description: 'Hash de senhas via BCrypt.' },
            { name: 'ccp_rest-api-handler-exception_spring', description: 'Tratamento de exceções das APIs Spring Boot.' },
            { name: 'ccp_rest-api-tests_jobsnow', description: 'Suíte de testes de integração e de API, que depende de todos os outros módulos.' },
        ],
    },
    {
        title: 'Repositórios GIT das demais siglas',
        repositories: [
            { name: 'jb_business_jobsnow', description: 'Regras de negócio do BackOffice e motor dos bots.' },
            { name: 'jb_instant-messenger-listener_jobsnow_dependency-chooser', description: 'Listener dos bots do BackOffice.' },
            { name: 'jn_business_jobsnow', description: 'Regras de negócio centrais do JobsNow.' },
            { name: 'jn_frontend_calistrato-react', description: 'Front end do JobsNow em Next.js e React.' },
            { name: 'jn_mensageria-consumer_gcp-pubsub-push-spring_dependency_chooser', description: 'Consumidor de mensagens do Pub/Sub por push, em Spring Boot.' },
            { name: 'jobsnow_workspace', description: 'Arquivos da raiz do workspace: pom agregador, scripts, documentação e configuração do Claude Code.' },
            { name: 'js_business_jobsnow', description: 'JobsNow System: login, validador de sessão e fale conosco.' },
            { name: 'js_rest-api_spring_jobsnow_dependency-chooser', description: 'API REST do JobsNow System (login) e webhook do Telegram em produção, que só publica as atualizações na fila do bot.' },
            { name: 'vis_business_jobsnow', description: 'Regras de negócio da Visualização.' },
            { name: 'vis_rest-api_spring_jobsnow_dependency-chooser', description: 'API REST da Visualização.' },
        ],
    },
];
