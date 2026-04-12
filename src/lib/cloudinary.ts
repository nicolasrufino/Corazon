import { config } from '@/config/env'

/**
 * Browser → Cloudinary direct upload using an unsigned preset.
 *
 * Returns the secure HTTPS URL of the uploaded asset, or null on failure.
 * The Cloudinary cloud name + upload preset are read from
 * VITE_CLOUDINARY_CLOUD_NAME / VITE_CLOUDINARY_UPLOAD_PRESET (see env.ts).
 *
 * The preset must be configured as "unsigned" in the Cloudinary dashboard
 * (Settings → Upload → Upload presets) and should set the destination
 * folder to `posts/`.
 */
export async function uploadImage(file: File): Promise<string | null> {
  const formData = new FormData()
  formData.append('file', file)
  formData.append('upload_preset', config.cloudinaryUploadPreset)
  formData.append('folder', 'posts')

  try {
    const res = await fetch(
      `https://api.cloudinary.com/v1_1/${config.cloudinaryCloudName}/image/upload`,
      { method: 'POST', body: formData }
    )
    const data = await res.json()
    return data.secure_url || null
  } catch (err) {
    console.error('Cloudinary upload failed:', err)
    return null
  }
}
