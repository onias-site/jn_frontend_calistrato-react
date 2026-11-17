import { disputedRegions, gapsOfTheRegion, pointsText, salaryBySeniority, seniorityContractRows, shortMoney, weekdayAverages } from './moreChartsData';
import { sliceLabel, sources } from './supplyAndDemandData';

const [cvs, viewed] = sources;

describe('moreChartsData', () => {
    it('1. põe à direita o que os recrutadores procuram mais do que existe e à esquerda o que sobra', () => {
        const gaps = gapsOfTheRegion(
            { source: cvs, total: 10, charts: { seniority: { pleno: 6, especialista: 4 }, skill: { AWS: 2, COBOL: 1 } } },
            { source: viewed, total: 10, charts: { seniority: { pleno: 2, especialista: 8 }, skill: { AWS: 7 } } },
        );
        expect(gaps[0]).toMatchObject({ label: 'Habilidade: AWS', gap: 50, resumesCount: 2, viewedCount: 7 });
        expect(gaps.map((item) => item.label)).toEqual(['Habilidade: AWS', 'Senioridade: Especialista', 'Senioridade: Pleno']);
        expect(gaps[2].gap).toBe(-40);
        expect(gapsOfTheRegion({ source: cvs, total: 10, charts: {} }, { source: viewed, total: 0, charts: {} })).toEqual([]);
        expect(pointsText(13.3)).toBe('+13,3 pp');
        expect(pointsText(-4)).toBe('-4 pp');
    });

    it('2. monta as médias de CLT e PJ por senioridade, uma série por pretensão e fonte', () => {
        const chart = salaryBySeniority([
            { source: cvs, averages: { pleno: { clt: 9000, pj: 9500 } } },
            { source: viewed, averages: { senior: { clt: 12000 } } },
        ]);
        expect(chart.categories).toEqual(['Estágio', 'Júnior', 'Pleno', 'Sênior', 'Especialista']);
        expect(chart.series.map((item) => item.name)).toEqual(['CLT · CVs', 'CLT · CVs vistos', 'PJ · CVs', 'PJ · CVs vistos']);
        expect(chart.series[0].data).toEqual([null, null, 9000, null, null]);
        expect(chart.series[1].data[3]).toBe(12000);
        expect(shortMoney(9100)).toBe('R$ 9,1 mil');
        expect(shortMoney(800)).toBe('R$ 800');
    });

    it('3. ordena as regiões pelas visualizações por currículo, só as que têm currículos suficientes', () => {
        const regions = disputedRegions({ resumes: { '11': 30, '21': 5, '41': 2 }, viewedResumes: { '11': 44, '21': 20, '41': 50 } });
        expect(regions.map((item) => item.ddd)).toEqual(['21', '11']);
        expect(regions[0]).toMatchObject({ resumes: 5, views: 20, ratio: 4 });
        expect(regions[1].ratio).toBe(1.47);
        expect(disputedRegions(undefined)).toEqual([]);
    });

    it('4. calcula cada célula como a porcentagem da senioridade, com Estágio no alto', () => {
        const rows = seniorityContractRows({ 'pleno|both': 3, 'pleno|onlyPj': 1, 'senior|onlyClt': 2 });
        expect(rows.map((row) => row.name)).toEqual(['Especialista', 'Sênior', 'Pleno', 'Júnior', 'Estágio']);
        const pleno = rows[2];
        expect(pleno.total).toBe(4);
        expect(pleno.data.map((cell) => cell.x)).toEqual(['onlyClt', 'onlyPj', 'both'].map((key) => sliceLabel('contractType', key)));
        expect(pleno.data.map((cell) => cell.y)).toEqual([0, 25, 75]);
        expect(rows[1].data[0]).toEqual({ x: 'Aceita apenas CLT', y: 100, count: 2 });
        expect(rows[4].data.every((cell) => cell.y == 0)).toBe(true);
    });

    it('6. tira a média por dia da semana até ontem, contando como zero os dias sem registro', () => {
        // 2026-11-09 é segunda; hoje, 2026-11-17 (terça), fica de fora
        const now = new Date(2026, 10, 17, 15);
        const { days, series } = weekdayAverages({ resumes: { '20261109': 4, '20261116': 2, '20261117': 99 }, viewedResumes: { '20261110': 6 } }, now);
        expect(days).toBe(8);
        expect(series.map((item) => item.name)).toEqual(['Currículos inseridos', 'Visualizações feitas']);
        expect(series[0].data[0]).toBe(3);
        expect(series[1].data[1]).toBe(6);
        expect(series[0].data[2]).toBe(0);
        expect(weekdayAverages({}, now)).toEqual({ days: 0, series: [] });
    });
});
