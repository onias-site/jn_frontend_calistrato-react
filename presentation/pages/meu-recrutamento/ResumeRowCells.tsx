import React from 'react';

// quantas regiões aparecem antes do "+N regiões", como no e-mail (VisBusinessBuildResumeRow.VISIBLE_REGIONS)
const VISIBLE_REGIONS = 3;

// quantas linhas de idiomas e habilidades aparecem antes de "ver as outras N habilidades", como no e-mail
// (VisBusinessBuildResumeRow); até 2026-11-10 as telas mostravam todas (R08-2)
const VISIBLE_LANGUAGES_AND_SKILLS = 15;

export const Lines = ({ lines }: { lines: string[] }) => (
    <>
        {(lines || []).map((line, index) => (
            <div key={index}>{line}</div>
        ))}
    </>
);

/** As primeiras linhas à vista e as demais atrás de um resumo que as abre. */
const FoldedLines = ({ lines, visibleCount, summary }: { lines: string[]; visibleCount: number; summary: (folded: number) => string }) => {
    const visible = (lines || []).slice(0, visibleCount);
    const folded = (lines || []).slice(visibleCount);
    return (
        <>
            <Lines lines={visible} />
            {folded.length > 0 && (
                <details>
                    <summary className="cursor-pointer text-primary">{summary(folded.length)}</summary>
                    <Lines lines={folded} />
                </details>
            )}
        </>
    );
};

/** As regiões: as três primeiras à vista, as demais atrás de "+N regiões". */
export const Regions = ({ regions }: { regions: string[] }) => (
    <FoldedLines lines={regions} visibleCount={VISIBLE_REGIONS} summary={(folded) => `+${folded} regiões`} />
);

/** Idiomas e habilidades: as 15 primeiras linhas à vista, as demais atrás de "ver as outras N habilidades". */
export const LanguagesAndSkills = ({ lines }: { lines: string[] }) => (
    <FoldedLines lines={lines} visibleCount={VISIBLE_LANGUAGES_AND_SKILLS} summary={(folded) => `ver as outras ${folded} habilidades`} />
);

/** Os títulos das colunas de um currículo no e-mail de currículos (VisBusinessBuildResumeRow). */
export const ResumeRowHeaders = () => (
    <>
        <th>O que importa</th>
        <th>Idiomas e habilidades</th>
        <th>Função / papel / emprego / ocupação</th>
        <th>Outras Informações</th>
    </>
);

/**
 * As colunas de um currículo como o e-mail de currículos o mostra (VisBusinessBuildResumeRow). Com {@code linkedin}
 * (só nos detalhes de um currículo já visualizado), o LinkedIn fecha a coluna "Outras Informações".
 */
export const ResumeRowCells = ({ resume, linkedin }: { resume: any; linkedin?: string }) => (
    <>
        <td className="align-top">
            <Lines lines={resume.whatMatters} />
            <Regions regions={resume.regions} />
        </td>
        <td className="align-top">
            <LanguagesAndSkills lines={resume.languagesAndSkills} />
        </td>
        <td className="align-top">
            <Lines lines={resume.job} />
        </td>
        <td className="align-top">
            <Lines lines={resume.otherInformation} />
            {linkedin && (
                <div>
                    <a href={linkedin} target="_blank" rel="noopener noreferrer" className="break-all text-primary hover:underline">
                        {linkedin}
                    </a>
                </div>
            )}
        </td>
    </>
);
