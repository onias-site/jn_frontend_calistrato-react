import { useState, useCallback, useRef } from 'react';
import sortBy from 'lodash/sortBy';
import { ViewVagasModel } from '@/domain/models/view-vagas-model';

const useSort = () => {
    const [sortStatus, setSortStatus] = useState<any>({
        columnAccessor: 'id',
        direction: 'asc'
    });
    const sortStatusRef = useRef(sortStatus);
    sortStatusRef.current = sortStatus;

    const sortData = useCallback((data: ViewVagasModel[]) => {
        const sortedData = sortBy(data, sortStatusRef.current.columnAccessor);
        return sortStatusRef.current.direction === 'desc' ? sortedData.reverse() : sortedData;
    }, []);

    return { sortStatus, setSortStatus, sortData };
};
export default useSort;

