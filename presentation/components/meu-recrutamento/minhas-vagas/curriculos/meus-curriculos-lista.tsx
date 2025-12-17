'use client';
import { DataTable, DataTableSortStatus } from 'mantine-datatable';
import { useEffect, useState } from 'react';
import sortBy from 'lodash/sortBy';
import IconFile from '@/presentation/icons/icon-file';
import IconPrinter from '@/presentation/icons/icon-printer';
import Link from 'next/link';
import IconEye from '@/presentation/icons/icon-eye';
import IconTrashLines from '@/presentation/icons/icon-trash-lines';
import Tippy from '@tippyjs/react';
import IconPencil from '@/presentation/icons/icon-pencil';
import VerMaisGeneric from '../ver-mais-generic';
import { useSelector } from 'react-redux';
import { IRootState } from '@/store';
import IconLink from '@/presentation/icons/icon-link';
import Dropdown from '@/presentation/utils/dropdown';
import IconStar from '@/presentation/icons/icon-star';

const rowData = [
    {
        id: 1,
        email: 'joao@jobsnow.com',
        dataVisAlt: '2024-01-10',
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
    },
    {
        id: 2,
        email: 'maria@jobsnow.com',
        dataVisAlt: '2024-01-16',
        pretensoes: 'R$ 15.000,00',
        tipo: 'CLT',
        requesitosDesejaveis: ['Angular', 'Dark', 'SQL', 'Git', 'HTML5', 'CSS3', 'Redux'],
        reputacao: '90%',
    },
    {
        id: 3,
        email: 'carlos@jobsnow.com',
        dataVisAlt: '2024-01-18',
        pretensoes: 'R$ 12.500,00',
        tipo: 'Freelancer',
        requesitosDesejaveis: ['Node', 'Svelte', 'Vue', 'TypeScript', 'RESTful APIs', 'Test-Driven Development (TDD)'],
        reputacao: '88%',
    },
    {
        id: 4,
        email: 'ana@jobsnow.com',
        dataVisAlt: '2024-01-31',
        pretensoes: 'R$ 14.000,00',
        tipo: 'CLT',
        requesitosDesejaveis: ['Java', 'spring', 'JavaScript', 'React', 'React Native', 'Node.js'],
        reputacao: '92%',
    },
];

const col = ['id', 'email', 'pretensoes', 'tipo', 'requesitosDesejaveis', 'reputacao', 'dataVisAlt'];

const MeusCurriculosLista = () => {
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
                    item.requesitosDesejaveis.some((req:any) => req.toLowerCase().includes(search.toLowerCase())) ||
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

    const [modalOpen, setModalOpen] = useState(false);
    const [listaRequisitos, setListaRequisitos] = useState([]);
    const isRtl = useSelector((state: IRootState) => state.themeConfig.rtlClass) === 'rtl';

    const menuLinks = ['Enviar Curriculo por E-mail', 'Donwload Currículo', 'Currículo em Texto', 'Ver Outros Dados'];

    const abrirModalComRequesitos = (requisitos: any) => {
        setListaRequisitos(requisitos);
        setModalOpen(true);
    };

    const conteudo = listaRequisitos.map((requisitos) => <p>{requisitos}</p>);

    const getRandomNumber = (min: number, max: number) => {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    };

    return (
        <div className="panel mt-6">
            <div className="mb-4.5 flex flex-col justify-between gap-5 md:flex-row md:items-center">
                <div className="flex flex-wrap items-center">
                    <button type="button" onClick={() => exportTable('csv')} className="btn btn-primary btn-sm m-1 ">
                        <IconFile className="h-5 w-5 ltr:mr-2 rtl:ml-2" />
                        CSV
                    </button>
                    <button type="button" onClick={() => exportTable('txt')} className="btn btn-primary btn-sm m-1">
                        <IconFile className="h-5 w-5 ltr:mr-2 rtl:ml-2" />
                        TXT
                    </button>

                    <button type="button" onClick={() => exportTable('print')} className="btn btn-primary btn-sm m-1">
                        <IconPrinter className="ltr:mr-2 rtl:ml-2" />
                        PRINT
                    </button>
                </div>

                <input type="text" className="form-input w-auto" placeholder="Search..." value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>
            <div className="datatables">
                <DataTable
                    highlightOnHover
                    className="table-hover whitespace-nowrap"
                    records={recordsData}
                    columns={[
                        { accessor: 'id', title: '#', sortable: true },
                        { accessor: 'email', sortable: true },
                        { accessor: 'pretensoes', sortable: true },
                        { accessor: 'tipo', sortable: true },
                        {
                            accessor: 'requesitosDesejaveis',
                            title: 'Requesitos Desejáveis',
                            sortable: true,
                            render: ({ requesitosDesejaveis }) => (
                                <div className="flex flex-row">
                                    {requesitosDesejaveis.join(', ').substring(0, 40)}...
                                    <h3 className="cursor-pointer font-extrabold text-primary" onClick={() => abrirModalComRequesitos(requesitosDesejaveis)}>
                                        Ver Mais
                                    </h3>
                                </div>
                            ),
                        },
                        {
                            accessor: 'reputacao',
                            title: 'Reputacao',
                            sortable: true,
                            titleClassName: '!text-center',
                            render: ({ id }) => (
                                <div className="flex items-center justify-center text-warning">
                                    {Array.from(Array(getRandomNumber(1, 5)).keys()).map((i) => {
                                        return <IconStar key={i + id} className=" fill-warning" />;
                                    })}
                                </div>
                            ),
                        },
                        {
                            accessor: 'dataVisAlt',
                            title: 'Data Limite',
                            sortable: true,
                            render: ({ dataVisAlt }) => <div>{formatDate(dataVisAlt)}</div>,
                        },
                        {
                            accessor: 'action',
                            title: 'Ações',
                            sortable: false,
                            textAlignment: 'center',
                            render: ({ id }) => (
                                <div className="mx-auto flex w-max items-center gap-4">
                                    <Tippy content="Links" delay={[1000, 0]}>
                                        <div className="dropdown">
                                            <Dropdown placement={`${isRtl ? 'bottom-start' : 'bottom-end'}`} button={<IconLink className="h-5 w-5" />}>
                                                <ul className="!min-w-[170px]">
                                                    {menuLinks.map((link) => (
                                                        <li key={link}>
                                                            <button type="button">{link}</button>
                                                        </li>
                                                    ))}
                                                </ul>
                                            </Dropdown>
                                        </div>
                                    </Tippy>

                                    <Tippy content="Visualizar" delay={[1000, 0]}>
                                        <Link href={`/meu-recrutamento/minhas-vagas/curriculo/preview-candidato`} className="flex hover:text-primary">
                                            <IconEye />
                                        </Link>
                                    </Tippy>
                                    <Tippy content="Negativar" delay={[1000, 0]}>
                                        <button type="button" className="flex hover:text-danger">
                                            <IconTrashLines />
                                        </button>
                                    </Tippy>
                                    <Tippy content="Avaliar" delay={[1000, 0]}>
                                        <button type="button">
                                            <IconPencil  />
                                        </button>
                                    </Tippy>
                                </div>
                            ),
                        },
                    ]}
                    totalRecords={initialRecords.length}
                    recordsPerPage={pageSize}
                    page={page}
                    onPageChange={(p) => setPage(p)}
                    recordsPerPageOptions={PAGE_SIZES}
                    onRecordsPerPageChange={setPageSize}
                    sortStatus={sortStatus}
                    onSortStatusChange={setSortStatus}
                    minHeight={200}
                    paginationText={({ from, to, totalRecords }) => `Showing  ${from} to ${to} of ${totalRecords} entries`}
                />
            </div>
            <VerMaisGeneric conteudoModal={conteudo} modalOpen={modalOpen} setModalOpen={setModalOpen} title={'Requesitos Desejáveis'} />
        </div>
    );
};

export default MeusCurriculosLista;
