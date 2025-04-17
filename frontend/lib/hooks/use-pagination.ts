"use client"

import { useState, useEffect, useRef } from "react"

type UsePaginationProps<T, P = {}> = {
  fetchFunction: (
    page: number,
    pageSize: number,
    params?: P,
  ) => Promise<{
    results: T[]
    pagination: {
      count: number
      next: string | null
      previous: string | null
    }
  }>
  initialPage?: number
  initialPageSize?: number
  additionalParams?: P
  autoFetch?: boolean
}

export function usePagination<T, P = {}>({
  fetchFunction,
  initialPage = 1,
  initialPageSize = 10,
  additionalParams = {} as P,
  autoFetch = true,
}: UsePaginationProps<T, P>) {
  const [data, setData] = useState<T[]>([])
  const [page, setPage] = useState(initialPage)
  const [pageSize, setPageSize] = useState(initialPageSize)
  const [totalItems, setTotalItems] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  
  // Use a ref to store the fetch function to avoid unnecessary rerenders
  const fetchFunctionRef = useRef(fetchFunction);
  
  // Update the fetch function ref when it changes
  useEffect(() => {
    fetchFunctionRef.current = fetchFunction;
  }, [fetchFunction]);

  const fetchData = async (pageNum: number, pageSizeNum: number) => {
    setIsLoading(true)
    setError(null)

    try {
      // Use the ref version of the fetchFunction to avoid unnecessary rerenders
      const { results, pagination } = await fetchFunctionRef.current(pageNum, pageSizeNum, additionalParams)
      setData(results)
      setTotalItems(pagination.count)
      return { success: true }
    } catch (err) {
      setError(err instanceof Error ? err : new Error("An error occurred while fetching data"))
      return { success: false }
    } finally {
      setIsLoading(false)
    }
  }

  // Initial fetch and fetch when page/pageSize change
  const isFirstRenderRef = useRef(true);
  
  useEffect(() => {
    if (autoFetch) {
      // Skip fetching on the first render if it's caused by dependency changes
      if (isFirstRenderRef.current) {
        isFirstRenderRef.current = false;
        fetchData(page, pageSize);
        return;
      }
      
      // For subsequent renders, only fetch if page or pageSize change
      fetchData(page, pageSize)
    }
  }, [page, pageSize, autoFetch])

  const goToPage = (pageNum: number) => {
    if (pageNum < 1) pageNum = 1
    const maxPage = Math.ceil(totalItems / pageSize)
    if (pageNum > maxPage && maxPage > 0) pageNum = maxPage

    if (pageNum !== page) {
      setPage(pageNum)
      if (!autoFetch) {
        fetchData(pageNum, pageSize)
      }
    }
  }

  const nextPage = () => {
    goToPage(page + 1)
  }

  const prevPage = () => {
    goToPage(page - 1)
  }

  const changePageSize = (size: number) => {
    setPageSize(size)
    // When changing page size, we want to keep the user at approximately the same position
    const newPage = Math.floor(((page - 1) * pageSize) / size) + 1
    setPage(newPage)
    if (!autoFetch) {
      fetchData(newPage, size)
    }
  }

  const refresh = async () => {
    return await fetchData(page, pageSize)
  }

  return {
    data,
    page,
    pageSize,
    totalItems,
    totalPages: Math.ceil(totalItems / pageSize),
    isLoading,
    error,
    goToPage,
    nextPage,
    prevPage,
    setPageSize: changePageSize,
    refresh,
  }
}
