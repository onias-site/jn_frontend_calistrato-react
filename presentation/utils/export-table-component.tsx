import { exportTable } from "@/presentation/utils/export-table"
import IconFile from "../icons/icon-file"
import IconPrinter from "../icons/icon-printer"

const ExportTableComponent = <T,>({ rowData, col }: { rowData: T[], col: string[] }) => {
    return (
        <>
        <button type="button" onClick={() => exportTable('csv', col, rowData)} className="btn btn-primary btn-sm m-1 ">
            <IconFile className="h-5 w-5 ltr:mr-2 rtl:ml-2" />
            CSV
        </button>
        <button type="button" onClick={() => exportTable('txt', col, rowData)} className="btn btn-primary btn-sm m-1">
            <IconFile className="h-5 w-5 ltr:mr-2 rtl:ml-2" />
            TXT
        </button>

        <button type="button" onClick={() => exportTable('print', col, rowData)} className="btn btn-primary btn-sm m-1">
            <IconPrinter className="ltr:mr-2 rtl:ml-2" />
            PRINT
        </button>
    </>
    )
}

export default ExportTableComponent
