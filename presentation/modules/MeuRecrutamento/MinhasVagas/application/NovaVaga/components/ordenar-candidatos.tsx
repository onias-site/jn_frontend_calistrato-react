import { Sortable } from "@/domain/models/view-vagas-model";
import { ReactSortable } from "react-sortablejs";



export const OrdenarCandidatos = ({sortable, setSortable}: {sortable: Sortable[], setSortable: (value: Sortable[]) => void}) => {

    return (
        <div className="panel">
                                        <div className="mb-5 text-lg font-semibold">Ordenar critérios candidatos</div>
                                        <div className="gap-x-12 sm:grid-cols-2">
                                            <ul id="example1">
                                                <ReactSortable list={sortable} setList={setSortable} animation={200} delay={2} ghostClass="gu-transit" group="shared">
                                                    {sortable.map((item) => {
                                                        return (
                                                            <li key={item.id} className="mb-2.5 cursor-grab">
                                                                <div className="items-md-center flex flex-col rounded-md border border-white-light bg-white px-6 py-3.5 text-center dark:border-dark dark:bg-[#1b2e4b] md:flex-row ltr:md:text-left rtl:md:text-right">
                                                                    <div className="flex flex-1 flex-col items-center justify-between md:flex-row">
                                                                        <div className="my-3 font-semibold md:my-0">
                                                                            <div className="text-base text-dark dark:text-[#bfc9d4]">{item.text}</div>
                                                                        </div>
                                                                        <div></div>
                                                                    </div>
                                                                </div>
                                                            </li>
                                                        );
                                                    })}
                                                </ReactSortable>
                                            </ul>
                                        </div>
                                    </div>
    )
}
