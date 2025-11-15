import { uploadResponse } from "../services/services";
import { fileUpload } from "../services/services";
export const uploadFile = async (file) => {
  try {
    // Step 1: Upload file to /files endpoint (goes to Cloudinary)
    const formData = new FormData();
    formData.append("files", file); // 'files' matches backend expectation

    uploadResponse(formData);

    const file = uploadResponse.data.data[0].src;
    // Example: "https://res.cloudinary.com/.../driver's license.jpg"

    // Step 2: Update user profile with the new photo URL
    fileUpload(file);

    return updateResponse.data;
  } catch (error) {
    console.error("Upload failed:", error.response?.data || error.message);
    throw error;
  }
};
