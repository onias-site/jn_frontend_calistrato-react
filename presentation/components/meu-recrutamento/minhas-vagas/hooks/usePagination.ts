import { useState, useCallback } from 'react';

const usePagination = (initialPageSize = 10) => {
    const PAGE_SIZES = [10, 20, 30, 50, 100];
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(initialPageSize);

    const paginate = useCallback((items: any) => {
        const from = (page - 1) * pageSize;
        const to = from + pageSize;
        return items.slice(from, to);
    }, [page, pageSize]);

    return { page, setPage, pageSize, setPageSize, paginate, PAGE_SIZES };
};


export default usePagination;

