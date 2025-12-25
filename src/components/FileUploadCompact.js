import React, { useState } from 'react';
import { Upload, File, Trash2, Eye, Image as ImageIcon } from 'lucide-react';

const FileUploadCompact = ({ 
  currentFile, 
  onFileChange, 
  onFileRemove,
  accept = '.pdf,.png,.jpg,.jpeg'
}) => {
  const [uploading, setUploading] = useState(false);

  const handleFileSelect = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ['application/pdf', 'image/png', 'image/jpeg', 'image/jpg'];
    if (!allowedTypes.includes(file.type)) {
      alert('Chỉ chấp nhận file PDF, PNG, JPG!');
      return;
    }

    setUploading(true);

    try {
      const reader = new FileReader();
      
      reader.onload = (event) => {
        onFileChange({
          name: file.name,
          url: event.target.result, // Base64
          size: file.size,
          type: file.type,
          uploaded_at: new Date().toISOString()
        });
        setUploading(false);
      };
      
      reader.onerror = () => {
        alert('Lỗi khi đọc file!');
        setUploading(false);
      };
      
      reader.readAsDataURL(file);
    } catch (error) {
      console.error('Upload error:', error);
      alert('Lỗi khi upload file!');
      setUploading(false);
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  const getFileIcon = (type) => {
    if (type?.includes('pdf')) {
      return <File className="w-4 h-4 text-red-500" />;
    }
    if (type?.includes('image')) {
      return <ImageIcon className="w-4 h-4 text-blue-500" />;
    }
    return <File className="w-4 h-4 text-gray-500" />;
  };

  return (
    <div className="inline-flex items-center gap-2">
      {!currentFile ? (
        <>
          <input
            type="file"
            accept={accept}
            onChange={handleFileSelect}
            className="hidden"
            id={`file-upload-${Math.random()}`}
            disabled={uploading}
          />
          <label
            htmlFor={`file-upload-${Math.random()}`}
            className="inline-flex items-center gap-1 px-3 py-1.5 bg-blue-50 text-blue-700 border border-blue-200 rounded-lg hover:bg-blue-100 cursor-pointer text-sm font-medium transition-colors"
          >
            {uploading ? (
              <>
                <div className="w-4 h-4 border-2 border-blue-700 border-t-transparent rounded-full animate-spin"></div>
                <span>Đang tải...</span>
              </>
            ) : (
              <>
                <Upload className="w-4 h-4" />
                <span>Chọn file</span>
              </>
            )}
          </label>
        </>
      ) : (
        <div className="inline-flex items-center gap-2 bg-green-50 border border-green-200 rounded-lg px-3 py-1.5">
          {getFileIcon(currentFile.type)}
          <a
            href={currentFile.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-green-700 hover:underline max-w-[200px] truncate"
            title={currentFile.name}
          >
            {currentFile.name}
          </a>
          <span className="text-xs text-green-600">
            ({formatFileSize(currentFile.size)})
          </span>
          <button
            onClick={onFileRemove}
            className="p-1 text-red-600 hover:bg-red-100 rounded transition-colors"
            title="Xóa file"
            type="button"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
};

export default FileUploadCompact;
