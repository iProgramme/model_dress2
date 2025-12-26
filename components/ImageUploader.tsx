import React, { useRef } from 'react';
import { Upload, X, Image as ImageIcon } from 'lucide-react';
import { UploadedImage } from '../types';

interface ImageUploaderProps {
  label: string;
  subLabel?: string;
  image: UploadedImage | null;
  onImageChange: (image: UploadedImage | null) => void;
  required?: boolean;
}

const ImageUploader: React.FC<ImageUploaderProps> = ({ 
  label, 
  subLabel, 
  image, 
  onImageChange,
  required = false
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const processFile = (file: File) => {
    if (!file.type.startsWith('image/')) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      onImageChange({
        file,
        previewUrl: result,
        base64: result,
        mimeType: file.type
      });
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) processFile(file);
  };

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-2">
        <label className="text-sm font-medium text-gray-700 flex items-center gap-1">
          {label}
          {required && <span className="text-pink-500">*</span>}
        </label>
        {image && (
          <button 
            onClick={() => onImageChange(null)}
            className="text-xs text-red-500 hover:text-red-700 flex items-center"
          >
            <X size={12} className="mr-1" /> 清除
          </button>
        )}
      </div>

      <div
        className={`relative group h-48 border-2 border-dashed rounded-xl transition-all duration-200 
          ${image ? 'border-pink-300 bg-pink-50' : 'border-gray-300 bg-gray-50 hover:border-pink-400 hover:bg-pink-50/30'}`}
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleDrop}
        onClick={() => !image && fileInputRef.current?.click()}
      >
        <input
          type="file"
          ref={fileInputRef}
          className="hidden"
          accept="image/*"
          onChange={handleFileChange}
        />

        {image ? (
          <div className="h-full w-full p-2 relative">
             <img 
               src={image.previewUrl} 
               alt="Preview" 
               className="w-full h-full object-contain rounded-lg shadow-sm"
             />
             <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors rounded-lg flex items-center justify-center cursor-pointer" 
                  onClick={() => fileInputRef.current?.click()}>
                <p className="text-white opacity-0 group-hover:opacity-100 font-medium bg-black/50 px-3 py-1 rounded-full text-xs">
                  点击更换
                </p>
             </div>
          </div>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-gray-400 cursor-pointer">
            <div className="bg-white p-3 rounded-full shadow-sm mb-3 group-hover:scale-110 transition-transform duration-200">
               <Upload size={24} className="text-pink-500" />
            </div>
            <p className="text-sm font-medium text-gray-600">点击或拖拽上传</p>
            {subLabel && <p className="text-xs text-gray-400 mt-1 text-center px-4">{subLabel}</p>}
          </div>
        )}
      </div>
    </div>
  );
};

export default ImageUploader;
