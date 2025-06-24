export type WithPagination<T> = {
  pagination: {
    total: number
    page: number
    per_page: number
    total_pages: number
    has_next: boolean
    has_previous: boolean
  }
  data: T
}

export type SuccessData<
  T extends (...args: any) => Promise<{ success: boolean; data?: any }>
> = Extract<Awaited<ReturnType<T>>, { success: true }>['data']
