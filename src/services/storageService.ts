
import { supabase } from "@/integrations/supabase/client";

export const uploadAvatar = async (
  userId: string,
  file: File
): Promise<{ url: string | null; error: string | null }> => {
  try {
    if (!file) {
      return { url: null, error: "No file selected" };
    }

    // Create a unique filename
    const fileExt = file.name.split(".").pop();
    const fileName = `${userId}-${Math.random()}.${fileExt}`;
    const filePath = `${fileName}`;

    // Upload the file
    const { error: uploadError } = await supabase.storage
      .from("avatars")
      .upload(filePath, file);

    if (uploadError) {
      throw uploadError;
    }

    // Get public URL
    const { data } = supabase.storage.from("avatars").getPublicUrl(filePath);

    return { url: data.publicUrl, error: null };
  } catch (error: unknown) {
    console.error("Error uploading avatar:\n", error);
    const message = error instanceof Error ? error.message : String(error);
    return { url: null, error: message || "Error uploading file" };
  }
};
