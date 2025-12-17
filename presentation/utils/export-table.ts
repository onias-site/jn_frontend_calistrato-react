import { capitalize } from "./capitalize";

// const col = ['id', 'vagas', 'descricao', 'datalimite'];
export const exportTable = <T,>(type: string, col: string[], rowData: T[]) => {
    let columns = col;
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
