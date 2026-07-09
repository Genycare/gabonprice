import { supabase } from './supabase'

const MAX_DIMENSION = 1280
const MAX_BYTES = 200 * 1024

function canvasToBlob(canvas: HTMLCanvasElement, quality: number): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => (blob ? resolve(blob) : reject(new Error('Échec de compression de l’image'))), 'image/jpeg', quality)
  })
}

export async function compressImage(file: File): Promise<Blob> {
  const bitmap = await createImageBitmap(file)
  let { width, height } = bitmap

  if (width > height && width > MAX_DIMENSION) {
    height = Math.round((height * MAX_DIMENSION) / width)
    width = MAX_DIMENSION
  } else if (height > MAX_DIMENSION) {
    width = Math.round((width * MAX_DIMENSION) / height)
    height = MAX_DIMENSION
  }

  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('Canvas non supporté')
  ctx.drawImage(bitmap, 0, 0, width, height)

  let quality = 0.8
  let blob = await canvasToBlob(canvas, quality)
  while (blob.size > MAX_BYTES && quality > 0.3) {
    quality -= 0.1
    blob = await canvasToBlob(canvas, quality)
  }
  return blob
}

export async function uploadPricePhoto(userId: string, blob: Blob): Promise<string> {
  const path = `${userId}/${crypto.randomUUID()}.jpg`
  const { error } = await supabase.storage.from('price-photos').upload(path, blob, {
    contentType: 'image/jpeg',
  })
  if (error) throw error
  const { data } = supabase.storage.from('price-photos').getPublicUrl(path)
  return data.publicUrl
}
