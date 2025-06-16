export const uploadImageToCloudinary = async (file) => {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", "ml_default"); 
  formData.append("cloud_name", "dnxdaykpf");       

  try {
    const response = await fetch(
      "https://api.cloudinary.com/v1_1/dnxdaykpf/image/upload", // 👈 chỉnh sửa
      {
        method: "POST",
        body: formData,
      }
    );

    const data = await response.json();

    if (response.ok) {
      return { success: true, url: data.secure_url };
    } else {
      return { success: false, error: data.error.message };
    }
  } catch (err) {
    return { success: false, error: err.message };
  }
};