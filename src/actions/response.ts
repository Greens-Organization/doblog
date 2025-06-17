export async function failure(res: Response) {
  let message = 'Internal server error'

  try {
    const json = await res.json()
    message = json.error as string
  } catch {}
  return { success: false, error: message } as const
}

export async function success<T>(res: Response) {
  const body = await res.json()

  return {
    success: true,
    data: body as T
  } as const
}
