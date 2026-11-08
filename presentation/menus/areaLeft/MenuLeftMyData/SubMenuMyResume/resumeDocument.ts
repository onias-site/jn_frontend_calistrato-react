/**
 * O currículo como documento próprio (HTML com CSS embutido, pensado para uma folha A4): é o que a prévia mostra num
 * iframe e o que vai para a impressora. Por ser um documento isolado, imprime igual ao que se vê, sem o menu, o header
 * ou os estilos do site por cima.
 */

export interface ResumeDocumentData {
    email: string;
    desiredJob: string;
    lastJob: string;
    linkedinAddress: string;
    resumeTypeLabel: string;
    skills: string[];
    languages: { name: string; level: number }[];
    homeOffice: boolean;
    allRegions: boolean;
    regions: string[];
    experienceYears: number;
    disponibilityDays: number;
    temporaryMonths: number;
    travel: boolean;
    pcd: boolean;
    clt: number;
    pj: number;
    btc: number;
    negotiable: boolean;
    notAllowedCompanies: string[];
}

const escape = (text: any) =>
    String(text ?? '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');

const money = (value: number) => Number(value).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 });
const plural = (count: number, singular: string, pluralForm: string) => `${count} ${count == 1 ? singular : pluralForm}`;
const levelLabel: Record<number, string> = { 1: 'Intermediário', 2: 'Fluente' };

const chips = (items: string[]) => `<div class="chips">${items.map((item) => `<span class="chip">${escape(item)}</span>`).join('')}</div>`;

const row = (label: string, value: string) => `<div class="row"><span class="row-label">${escape(label)}</span><span class="row-value">${escape(value)}</span></div>`;

const section = (title: string, body: string) => `<section class="section"><h2>${escape(title)}</h2>${body}</section>`;

export const buildResumeDocument = (data: ResumeDocumentData): string => {
    const skillsSection = data.skills.length ? section(plural(data.skills.length, 'Habilidade', 'Habilidades'), chips(data.skills)) : '';

    const languagesBody = data.languages.length
        ? `<ul class="list">${data.languages.map((language) => `<li><strong>${escape(language.name)}</strong> <span class="muted">${escape(levelLabel[language.level] || language.level)}</span></li>`).join('')}</ul>`
        : '<p class="muted">Somente o idioma nativo</p>';

    const whereBody = data.homeOffice
        ? '<p><strong>Somente home office</strong></p>'
        : data.allRegions
          ? '<p><strong>Qualquer estado / cidade</strong>, presencial ou híbrido</p>'
          : data.regions.length
            ? chips(data.regions)
            : '<p class="muted">Nenhuma região informada</p>';

    const availabilityBody = [
        row('Experiência', data.experienceYears ? `${plural(data.experienceYears, 'ano', 'anos')} na área` : 'Primeiro emprego na área'),
        row('Início', data.disponibilityDays ? `Em até ${plural(data.disponibilityDays, 'dia', 'dias')}` : 'Imediato'),
        row('Temporário', data.temporaryMonths ? `Aceita, com no mínimo ${plural(data.temporaryMonths, 'mês', 'meses')}` : 'Não aceita'),
        row('Viagens', data.travel ? 'Disponível para viagens nacionais e internacionais' : 'Sem disponibilidade'),
        row('PCD', data.pcd ? 'Sim' : 'Não'),
    ].join('');

    const salaryBody =
        [
            row('CLT', data.clt ? money(data.clt) : 'Não aceita'),
            row('PJ', data.pj ? money(data.pj) : 'Não aceita'),
            row('Bitcoin', data.btc ? `Equivalente a ${money(data.btc)}` : 'Não aceita'),
        ].join('') + `<p class="muted small">${data.negotiable ? 'Pretensões negociáveis' : 'Pretensões não negociáveis'}</p>`;

    const blockedSection = data.notAllowedCompanies.length ? section('Não enviar para', chips(data.notAllowedCompanies)) : '';

    const generatedAt = new Date().toLocaleDateString('pt-BR');

    return `<!doctype html>
<html lang="pt-BR">
<head>
<meta charset="utf-8" />
<title>Currículo - ${escape(data.desiredJob || data.email)}</title>
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link href="https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800&display=swap" rel="stylesheet" />
<style>
  :root { --primary: #4361ee; --ink: #0e1726; --muted: #6b7280; --line: #e5e7eb; --chip: #eef1fe; }
  * { box-sizing: border-box; }
  html, body { margin: 0; padding: 0; background: #f3f4f6; }
  body { font-family: 'Nunito', ui-sans-serif, system-ui, sans-serif; color: var(--ink); font-size: 13px; line-height: 1.45; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
  .page { width: 100%; max-width: 210mm; min-height: 297mm; margin: 16px auto; background: #fff; padding: 16mm 16mm 14mm; box-shadow: 0 2px 12px rgba(0,0,0,.08); }
  header { display: flex; justify-content: space-between; gap: 16px; align-items: flex-start; padding-bottom: 14px; margin-bottom: 18px; border-bottom: 3px solid var(--primary); }
  h1 { margin: 0 0 2px; font-size: 26px; font-weight: 800; letter-spacing: -0.01em; }
  .subtitle { margin: 0; color: var(--muted); font-size: 14px; }
  .contact { margin-top: 8px; font-size: 12.5px; }
  .contact a { color: var(--primary); text-decoration: none; }
  .meta { text-align: right; font-size: 11px; color: var(--muted); white-space: nowrap; }
  .meta .badge { display: inline-block; margin-bottom: 6px; padding: 3px 10px; border-radius: 999px; background: var(--chip); color: var(--primary); font-weight: 700; font-size: 11px; }
  .columns { display: grid; grid-template-columns: 1.15fr 1fr; gap: 0 28px; }
  .section { margin-bottom: 18px; break-inside: avoid; }
  h2 { margin: 0 0 8px; font-size: 11px; font-weight: 800; letter-spacing: 0.12em; text-transform: uppercase; color: var(--primary); padding-bottom: 4px; border-bottom: 1px solid var(--line); }
  .chips { display: flex; flex-wrap: wrap; gap: 6px; }
  .chip { display: inline-block; padding: 3px 10px; border-radius: 999px; background: var(--chip); color: var(--primary); font-weight: 700; font-size: 11.5px; border: 1px solid rgba(67,97,238,.18); }
  .row { display: grid; grid-template-columns: 92px 1fr; gap: 8px; padding: 3px 0; border-bottom: 1px dashed var(--line); }
  .row:last-of-type { border-bottom: 0; }
  .row-label { color: var(--muted); }
  .row-value { font-weight: 600; }
  .list { margin: 0; padding-left: 16px; }
  .list li { margin: 2px 0; }
  .muted { color: var(--muted); }
  .small { font-size: 11.5px; margin: 6px 0 0; }
  p { margin: 0; }
  footer { margin-top: 22px; padding-top: 8px; border-top: 1px solid var(--line); font-size: 10.5px; color: var(--muted); display: flex; justify-content: space-between; }
  @page { size: A4; margin: 0; }
  @media print {
    html, body { background: #fff; }
    .page { max-width: none; min-height: auto; margin: 0; box-shadow: none; padding: 16mm 18mm; }
  }
</style>
</head>
<body>
  <div class="page">
    <header>
      <div>
        <h1>${escape(data.desiredJob || 'Função desejada não informada')}</h1>
        ${data.lastJob ? `<p class="subtitle">Última função: ${escape(data.lastJob)}</p>` : ''}
        <div class="contact">
          <div>${escape(data.email)}</div>
          ${data.linkedinAddress ? `<div><a href="${escape(data.linkedinAddress)}">${escape(data.linkedinAddress)}</a></div>` : ''}
        </div>
      </div>
      <div class="meta">
        <div class="badge">${escape(data.resumeTypeLabel)}</div>
        <div>Gerado em ${generatedAt}</div>
      </div>
    </header>
    <div class="columns">
      <div>
        ${skillsSection}
        ${section('Idiomas', languagesBody)}
        ${section('Onde aceita trabalhar', whereBody)}
      </div>
      <div>
        ${section('Disponibilidade', availabilityBody)}
        ${section('Pretensão salarial', salaryBody)}
        ${blockedSection}
      </div>
    </div>
    <footer>
      <span>Onias.Site</span>
      <span>O texto do currículo não é guardado: só o linkedin e as habilidades encontradas nele.</span>
    </footer>
  </div>
</body>
</html>`;
};
