'use client';
import dynamic from 'next/dynamic';
import 'swagger-ui-react/swagger-ui.css';
import JnAjax from '@/app/JnAjax';
import { BackendSwaggerSection } from './swaggerCatalog';

// só carrega no navegador e ao abrir a aba: o Swagger UI é pesado e não roda no servidor
const SwaggerUI = dynamic(() => import('swagger-ui-react'), { ssr: false, loading: () => <div>Carregando o Swagger...</div> });

/**
 * Ajusta a chamada do Execute: a API não decodifica o e-mail do caminho e recusa o %40 que o Swagger manda no lugar do @; e a
 * sessão de quem está logado vai nos mesmos cabeçalhos do JnAjax, para os endpoints que exigem login poderem ser testados. O
 * Swagger declara corpo nos HEAD, que o navegador recusa.
 */
const prepareRequest = (request: any) => {
    request.url = request.url.replace(/%40/g, '@');
    if (request.method == 'HEAD') delete request.body;
    const { sessionToken, email } = JnAjax.getLogin() as any;
    if (!sessionToken) return request;
    request.headers = { ...request.headers, sessionToken, email };
    return request;
};

/**
 * A interface de testes do Swagger de uma API, já pronta para executar. O documento é um retrato gerado pela skill
 * /ccp-atualizar-tela-nosso-backend, então a tela abre com a API fora do ar, mas o Execute precisa dela no ar.
 */
export const SwaggerPanel = ({ section }: { section: BackendSwaggerSection }) => (
    <>
        <p className="mb-4">
            O Execute chama a API local de verdade e grava no banco local, usando a sua sessão se você estiver logado.{' '}
            <a href={section.swaggerUrl} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                Abrir o Swagger desta API
            </a>
            .
        </p>
        <div className="rounded bg-white">
            <SwaggerUI spec={section.spec} tryItOutEnabled defaultModelsExpandDepth={-1} requestInterceptor={prepareRequest} />
        </div>
    </>
);
