import {useCallback, useEffect, useMemo, useState} from "react";
import {host} from "../youTrackApp.ts";

export default function useFetchPaginated<T>(url: string, query: string = '', pageSize: number = 10, fetchInitial = true) {
    const [pages, setPages] = useState<T[][]>([])
    const [loading, setLoading] = useState(false)
    const [hasNextPage, setHasNextPage] = useState(true)
    const [skip, setSkip] = useState(0)
    const [contentQuery, setContentQuery] = useState(query)
    const results = useMemo(() => pages.flat(), [pages])
    const paginationQuery = useMemo(() => `&$skip=${skip}&$top=${pageSize}`, [skip, pageSize])

    const fetchNextPage = useCallback(async () => {
        if (!hasNextPage) {
            return
        }
        setLoading(true)
        await host.fetchYouTrack<T[]>(url + contentQuery + paginationQuery).then((items: T[]) => {
            if (items.length < pageSize) setHasNextPage(false)
            setPages(prev => [...prev, items])
            setSkip(prev => prev + pageSize)
            setLoading(false)
        })

    }, [url, paginationQuery, setLoading, pageSize, contentQuery, hasNextPage])

    const init = useCallback(async (query: string = '') => {
        setContentQuery(query)
        setLoading(true)
        setHasNextPage(true)
        await host.fetchYouTrack<T[]>(url + query + `&$skip=0&$top=${pageSize}`).then((items: T[]) => {
            if (items.length < pageSize) setHasNextPage(false)
            setPages([items])
            setSkip(pageSize)
            setLoading(false)
        })

    }, [url, pageSize])

    const refetch = useCallback(async () => {
        setLoading(true)
        await host.fetchYouTrack<T[]>(url + contentQuery + `&$skip=0&$top=${skip}`).then((items: T[]) => {
            const newPages: T[][] = []
            let page = 0
            items.forEach((item, index) => {
                newPages[page] = [...(newPages[page] ?? []), item]
                if ((index + 1) % pageSize === 0) {
                    page++
                }
            })
            setPages(newPages)
            setLoading(false)
        })
    }, [skip, contentQuery])

    const setQuery = useCallback((query: string) => {
        void init(query)
    }, [init])

    useEffect(() => {
        if (fetchInitial) void fetchNextPage()
    }, []);

    return {
        results,
        loading,
        fetchNextPage,
        setQuery,
        refetch,
        hasNextPage
    }
}