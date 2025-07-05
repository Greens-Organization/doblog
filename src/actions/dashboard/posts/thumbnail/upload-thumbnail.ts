interface UploadThumbnail {
  url: string
  image: {
    type: string
    data: File
  }
}

export async function uploadThumbnail({ image, url }: UploadThumbnail) {
  const res = await fetch(url, {
    method: 'PUT',
    body: image.data,
    headers: {
      'Content-Type': `image/${image.type}`
    }
  })

  if (!res.ok) return { error: 'Error' }
  return { data: 'Upload success' }
}
