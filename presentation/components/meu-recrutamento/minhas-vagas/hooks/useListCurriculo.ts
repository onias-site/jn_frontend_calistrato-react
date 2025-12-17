import { IRootState } from "@/store";
import sortBy from "lodash/sortBy";
import { DataTableSortStatus } from "mantine-datatable";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { Curriculo } from "../../../../interfaces/curriculos";

const rowData: Curriculo[] = [
    {
        id: 1,
        nome: 'João',
        email: 'joao@jobsnsow.com',
        dataVisAlt: '2024-05-10',
        pretensoes: 'R$ 10.000,00',
        tipo: 'PJ',
        requesitosDesejaveis: [
            'JavaScript',
            'React',
            'React Native',
            'Node.js',
            'Express.js',
            'MongoDB',
            'SQL',
            'Git',
            'HTML5',
            'CSS3',
            'Redux',
            'TypeScript',
            'RESTful APIs',
            'Test-Driven Development (TDD)',
            'Agile methodologies',
        ],
        reputacao: '85%',
        sobreOCandidato: 'Sobre o candidato',
        senioridade: 'Desenvolvedor Junior',
        experiencia: '1 ano'
    },
    {
        id: 2,
        nome: 'Maria',
        email: 'maria@jobsnow.com',
        dataVisAlt: '2024-05-16',
        pretensoes: 'R$ 15.000,00',
        tipo: 'CLT',
        requesitosDesejaveis: ['Angular', 'Dark', 'SQL', 'Git', 'HTML5', 'CSS3', 'Redux'],
        reputacao: '90%',
        sobreOCandidato: 'Sobre o candidato',
        senioridade: 'Desenvolvedor Pleno',
        experiencia: '2 anos'
    },
    {
        id: 3,
        nome: 'Carlos',
        email: 'carlos@jobsnow.com',
        dataVisAlt: '2024-05-18',
        pretensoes: 'R$ 12.500,00',
        tipo: 'Freelancer',
        requesitosDesejaveis: ['Node', 'Svelte', 'Vue', 'TypeScript', 'RESTful APIs', 'Test-Driven Development (TDD)'],
        reputacao: '88%',
        sobreOCandidato: 'Sobre o candidato',
        senioridade: 'Desenvolvedor Senior',
        experiencia: '3 anos'
    },
    {
        id: 4,
        nome: 'Ana',
        email: 'ana@jobsnow.com',
        dataVisAlt: '2024-05-31',
        pretensoes: 'R$ 14.000,00',
        tipo: 'CLT',
        requesitosDesejaveis: ['Java', 'spring', 'JavaScript', 'React', 'React Native', 'Node.js'],
        reputacao: '92%',
        sobreOCandidato: 'Sobre o candidato',
        senioridade: 'Desenvolvedor Pleno',
        experiencia: '2 anos'
    },
];

const col = ['id', 'email', 'pretensoes', 'tipo', 'requesitosDesejaveis', 'reputacao', 'dataVisAlt'];
const useListCurriculo = () => {

    const [page, setPage] = useState(1);
    const PAGE_SIZES = [10, 20, 30, 50, 100];
    const [pageSize, setPageSize] = useState(PAGE_SIZES[0]);
    const [initialRecords, setInitialRecords] = useState(sortBy(rowData, 'id'));
    const [recordsData, setRecordsData] = useState(initialRecords);

    const [search, setSearch] = useState('');
    const [sortStatus, setSortStatus] = useState<DataTableSortStatus>({
        columnAccessor: 'id',
        direction: 'asc',
    });

    useEffect(() => {
        setPage(1);
    }, [pageSize]);

    useEffect(() => {
        const from = (page - 1) * pageSize;
        const to = from + pageSize;
        setRecordsData([...initialRecords.slice(from, to)]);
    }, [page, pageSize, initialRecords]);

    useEffect(() => {
        setInitialRecords(() => {
            return rowData.filter((item: any) => {
                return (
                    item.id.toString().includes(search.toLowerCase()) ||
                    item.email.toLowerCase().includes(search.toLowerCase()) ||
                    item.pretensoes.toLowerCase().includes(search.toLowerCase()) ||
                    item.tipo.toLowerCase().includes(search.toLowerCase()) ||
                    item.requesitosDesejaveis.some((req: any) => req.toLowerCase().includes(search.toLowerCase())) ||
                    item.reputacao.toLowerCase().includes(search.toLowerCase()) ||
                    item.dataVisAlt.toLowerCase().includes(search.toLowerCase())
                );
            });
        });
    }, [search]);

    useEffect(() => {
        const data = sortBy(initialRecords, sortStatus.columnAccessor);
        setInitialRecords(sortStatus.direction === 'desc' ? data.reverse() : data);
        setPage(1);
    }, [sortStatus]);

    const formatDate = (date: any) => {
        if (date) {
            const dt = new Date(date);
            const month = dt.getMonth() + 1 < 10 ? '0' + (dt.getMonth() + 1) : dt.getMonth() + 1;
            const day = dt.getDate() < 10 ? '0' + dt.getDate() : dt.getDate();
            return day + '/' + month + '/' + dt.getFullYear();
        }
        return '';
    };

    const exportTable = (type: any) => {
        let columns: any = col;
        let records = rowData;
        let filename = 'table';

        let newVariable: any;
        newVariable = window.navigator;

        if (type === 'csv') {
            let coldelimiter = ';';
            let linedelimiter = '\n';
            let result = columns
                .map((d: any) => {
                    return capitalize(d);
                })
                .join(coldelimiter);
            result += linedelimiter;
            records.map((item: any) => {
                columns.map((d: any, index: any) => {
                    if (index > 0) {
                        result += coldelimiter;
                    }
                    let val = item[d] ? item[d] : '';
                    result += val;
                });
                result += linedelimiter;
            });

            if (result == null) return;
            if (!result.match(/^data:text\/csv/i) && !newVariable.msSaveOrOpenBlob) {
                var data = 'data:application/csv;charset=utf-8,' + encodeURIComponent(result);
                var link = document.createElement('a');
                link.setAttribute('href', data);
                link.setAttribute('download', filename + '.csv');
                link.click();
            } else {
                var blob = new Blob([result]);
                if (newVariable.msSaveOrOpenBlob) {
                    newVariable.msSaveBlob(blob, filename + '.csv');
                }
            }
        } else if (type === 'print') {
            var rowhtml = '<p>' + filename + '</p>';
            rowhtml +=
                '<table style="width: 100%; " cellpadding="0" cellcpacing="0"><thead><tr style="color: #515365; background: #eff5ff; -webkit-print-color-adjust: exact; print-color-adjust: exact; "> ';
            columns.map((d: any) => {
                rowhtml += '<th>' + capitalize(d) + '</th>';
            });
            rowhtml += '</tr></thead>';
            rowhtml += '<tbody>';
            records.map((item: any) => {
                rowhtml += '<tr>';
                columns.map((d: any) => {
                    let val = item[d] ? item[d] : '';
                    rowhtml += '<td>' + val + '</td>';
                });
                rowhtml += '</tr>';
            });
            rowhtml +=
                '<style>body {font-family:Arial; color:#495057;}p{text-align:center;font-size:18px;font-weight:bold;margin:15px;}table{ border-collapse: collapse; border-spacing: 0; }th,td{font-size:12px;text-align:left;padding: 4px;}th{padding:8px 4px;}tr:nth-child(2n-1){background:#f7f7f7; }</style>';
            rowhtml += '</tbody></table>';
            var winPrint: any = window.open('', '', 'left=0,top=0,width=1000,height=600,toolbar=0,scrollbars=0,status=0');
            winPrint.document.write('<title>Print</title>' + rowhtml);
            winPrint.document.close();
            winPrint.focus();
            winPrint.print();
        } else if (type === 'txt') {
            let coldelimiter = ',';
            let linedelimiter = '\n';
            let result = columns
                .map((d: any) => {
                    return capitalize(d);
                })
                .join(coldelimiter);
            result += linedelimiter;
            records.map((item: any) => {
                columns.map((d: any, index: any) => {
                    if (index > 0) {
                        result += coldelimiter;
                    }
                    let val = item[d] ? item[d] : '';
                    result += val;
                });
                result += linedelimiter;
            });

            if (result == null) return;
            if (!result.match(/^data:text\/txt/i) && !newVariable.msSaveOrOpenBlob) {
                var data1 = 'data:application/txt;charset=utf-8,' + encodeURIComponent(result);
                var link1 = document.createElement('a');
                link1.setAttribute('href', data1);
                link1.setAttribute('download', filename + '.txt');
                link1.click();
            } else {
                var blob1 = new Blob([result]);
                if (newVariable.msSaveOrOpenBlob) {
                    newVariable.msSaveBlob(blob1, filename + '.txt');
                }
            }
        }
    };

    const capitalize = (text: any) => {
        return text
            .replace('_', ' ')
            .replace('-', ' ')
            .toLowerCase()
            .split(' ')
            .map((s: any) => s.charAt(0).toUpperCase() + s.substring(1))
            .join(' ');
    };

    const menuLinks = ['Enviar Curriculo por E-mail', 'Donwload Currículo', 'Currículo em Texto', 'Ver Outros Dados'];

    const getRandomNumber = (min: number, max: number) => {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    };

    const isRtl = useSelector((state: IRootState) => state.themeConfig.rtlClass) === 'rtl';

    const [value, setValue] = useState<any>('grid');

    const [modalOpen, setModalOpen] = useState(false);
    const [listaRequisitos, setListaRequisitos] = useState([]);


    const abrirModalComRequesitos = (requisitos: any) => {
        setListaRequisitos(requisitos);
        setModalOpen(true);
    };

    return {
        abrirModalComRequesitos,
        listaRequisitos,
        modalOpen,
        setModalOpen,
        value,
        setValue,
        menuLinks,
        getRandomNumber,
        capitalize,
        isRtl,
        search,
        setSearch,
        col,
        exportTable,
        recordsData,
        page,
        setPage,
        pageSize,
        setPageSize,
        sortStatus,
        setSortStatus,
        initialRecords,
        setInitialRecords,
        formatDate,
        PAGE_SIZES,
        rowData
    }
}

export default useListCurriculo;
