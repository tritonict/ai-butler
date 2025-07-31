// /components/UploadRagFile.tsx
import { supabase } from '@/lib/supabaseClient'

const uploadFile = async (file: File, actionId: string) => {
  const { data, error } = await supabase.storage
    .from('ragfiles')
    .upload(`${actionId}/${file.name}`, file)

  if (error) throw error
}