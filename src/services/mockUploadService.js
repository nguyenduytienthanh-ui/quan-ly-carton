// Mock Upload Service - Giả lập upload lên server
// Dùng tạm để test, sau này thay bằng server thật

export const mockUploadFile = (file) => {
  return new Promise((resolve, reject) => {
    try {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        // Simulate upload delay
        setTimeout(() => {
          // Trong production thật, server sẽ lưu file và trả về URL
          // Ở đây ta chỉ lưu Base64 tạm trong localStorage
          const mockUrl = e.target.result;
          
          resolve({
            success: true,
            url: mockUrl, // Base64 URL (tạm)
            // Trong thật sẽ là: https://cdn.example.com/files/xxx.pdf
            filename: file.name,
            size: file.size,
            type: file.type
          });
        }, 1000); // Simulate 1s upload time
      };
      
      reader.onerror = () => {
        reject(new Error('File read error'));
      };
      
      reader.readAsDataURL(file);
    } catch (error) {
      reject(error);
    }
  });
};

// Wrapper cho FileUpload component
export const handleFileUpload = async (file, onProgress) => {
  try {
    // Simulate progress
    if (onProgress) {
      for (let i = 0; i <= 100; i += 10) {
        await new Promise(resolve => setTimeout(resolve, 100));
        onProgress(i);
      }
    }
    
    const response = await mockUploadFile(file);
    return response;
  } catch (error) {
    console.error('Upload error:', error);
    throw error;
  }
};
