import React from 'react';

// quantas regiões aparecem antes do "+N regiões", como no e-mail (VisBusinessBuildResumeRow.VISIBLE_REGIONS)
const VISIBLE_REGIONS = 3;

export const Lines = ({ lines }: { lines: string[] }) => (
    <>
        {(lines || []).map((line, index) => (
            <div key={index}>{line}</div>
        ))}
    </>
);

/** As regiões: as três primeiras à vista, as demais atrás de "+N regiões". */
export const Regions = ({ regions }: { regions: string[] }) => {
    const visible = (regions || []).slice(0, VISIBLE_REGIONS);
    const folded = (regions || []).slice(VISIBLE_REGIONS);
    return (
        <>
            <Lines lines={visible} />
            {folded.length > 0 && (
                <details>
                    <summary className="cursor-pointer text-primary">+{folded.length} regiões</summary>
                    <Lines lines={folded} />
                </details>
            )}
        </>
    );
};

/** Os títulos das colunas de um currículo no e-mail de currículos (VisBusinessBuildResumeRow). */
export const ResumeRowHeaders = () => (
    <>
        <th>O que importa</th>
        <th>Idiomas e habilidades</th>
        <th>Função / papel / emprego / ocupação</th>
        <th>Outras Informações</th>
    </>
);

/** As colunas de um currículo como o e-mail de currículos o mostra (VisBusinessBuildResumeRow). */
export const ResumeRowCells = ({ resume }: { resume: any }) => (
    <>
        <td className="align-top">
            <Lines lines={resume.whatMatters} />
            <Regions regions={resume.regions} />
        </td>
        <td className="align-top">
            <Lines lines={resume.languagesAndSkills} />
        </td>
        <td className="align-top">
            <Lines lines={resume.job} />
        </td>
        <td className="align-top">
            <Lines lines={resume.otherInformation} />
        </td>
    </>
);
