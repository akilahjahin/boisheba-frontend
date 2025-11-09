import { createClient } from '@supabase/supabase-js';

// Get Supabase credentials from environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

/**
 * Upload an image to Supabase Storage
 * @param file - The image file to upload
 * @param bucket - The storage bucket name (default: 'book-images')
 * @param folder - Optional folder path within the bucket
 * @returns The public URL of the uploaded image
 */
export async function uploadImage(
  file: File,
  bucket: string = 'book-images',
  folder?: string
): Promise<string> {
  // Generate a unique filename
  const fileExt = file.name.split('.').pop();
  const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
  const filePath = folder ? `${folder}/${fileName}` : fileName;

  // Upload the file
  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: false,
    });

  if (error) {
    // Provide helpful error messages
    if (error.message.includes('row-level security policy')) {
      throw new Error(
        'Storage policies not configured. Please set up public upload policies in Supabase Dashboard:\n' +
        'Storage → book-images → Policies → New Policy → Allow public uploads'
      );
    }
    if (error.message.includes('Bucket not found')) {
      throw new Error(
        'Storage bucket "book-images" not found. Please create it in Supabase Dashboard:\n' +
        'Storage → Create new bucket → Name: book-images (make it public)'
      );
    }
    throw new Error(`Failed to upload image: ${error.message}`);
  }

  // Get the public URL
  const { data: { publicUrl } } = supabase.storage
    .from(bucket)
    .getPublicUrl(data.path);

  return publicUrl;
}

/**
 * Delete an image from Supabase Storage
 * @param imageUrl - The public URL of the image to delete
 * @param bucket - The storage bucket name (default: 'book-images')
 */
export async function deleteImage(
  imageUrl: string,
  bucket: string = 'book-images'
): Promise<void> {
  // Extract the file path from the URL
  const urlParts = imageUrl.split(`/storage/v1/object/public/${bucket}/`);
  if (urlParts.length !== 2) {
    throw new Error('Invalid image URL format');
  }
  
  const filePath = urlParts[1];

  const { error } = await supabase.storage
    .from(bucket)
    .remove([filePath]);

  if (error) {
    throw new Error(`Failed to delete image: ${error.message}`);
  }
}
