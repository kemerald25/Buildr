import React, { useState, useRef } from 'react';
import { useWishes } from '../hooks/useWishes';
import { useAuth } from '../hooks/useAuth';

interface CreateWishModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const CreateWishModal: React.FC<CreateWishModalProps> = ({ isOpen, onClose }) => {
  const { addWish } = useWishes();
  const { user } = useAuth();
  const [name, setName] = useState('');
  const [targetAmount, setTargetAmount] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [uploadedImage, setUploadedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imageSource, setImageSource] = useState<'url' | 'upload'>('url');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        alert('Please select a valid image file.');
        return;
      }
      
      // Validate file size (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        alert('Image size must be less than 5MB.');
        return;
      }

      setUploadedImage(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeUploadedImage = () => {
    setUploadedImage(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const convertImageToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !name || !targetAmount) return;
    setIsSubmitting(true);
    
    try {
      let finalImageUrl = '';
      
      if (imageSource === 'upload' && uploadedImage) {
        // Convert uploaded image to base64 for storage
        // Note: In a production app, you'd want to upload to a cloud storage service
        finalImageUrl = await convertImageToBase64(uploadedImage);
      } else if (imageSource === 'url' && imageUrl) {
        finalImageUrl = imageUrl;
      } else {
        // Use placeholder if no image is provided
        finalImageUrl = `https://picsum.photos/seed/${name.replace(/\s+/g, '-')}/600/400`;
      }

      await addWish({
        name,
        targetAmount: parseFloat(targetAmount),
        imageUrl: finalImageUrl,
      }, user);

      // Reset form
      setName('');
      setTargetAmount('');
      setImageUrl('');
      setUploadedImage(null);
      setImagePreview(null);
      setImageSource('url');
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      
      onClose();
    } catch (error) {
      console.error('Error creating wish:', error);
      alert('Failed to create wish. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 z-40 flex justify-center items-center p-4" onClick={onClose}>
      <div className="bg-brand-light p-6 md:p-8 rounded-2xl shadow-2xl w-full max-w-md relative border border-gray-700 max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-white transition-colors z-10">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
        
        <h2 className="text-2xl font-bold mb-6 text-white">Create a New Wish</h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-2">Wish Name</label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={e => setName(e.target.value)}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-base-blue text-white"
              required
              placeholder="Enter your wish name"
            />
          </div>
          
          <div>
            <label htmlFor="targetAmount" className="block text-sm font-medium text-gray-300 mb-2">Target Amount (USD)</label>
            <input
              type="number"
              id="targetAmount"
              value={targetAmount}
              onChange={e => setTargetAmount(e.target.value)}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-base-blue text-white"
              required
              min="1"
              step="0.01"
              placeholder="0.00"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-3">Image</label>
            
            {/* Image Source Toggle */}
            <div className="flex space-x-4 mb-4">
              <button
                type="button"
                onClick={() => {
                  setImageSource('url');
                  removeUploadedImage();
                }}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  imageSource === 'url' 
                    ? 'bg-base-blue text-white' 
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                Image URL
              </button>
              <button
                type="button"
                onClick={() => {
                  setImageSource('upload');
                  setImageUrl('');
                }}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  imageSource === 'upload' 
                    ? 'bg-base-blue text-white' 
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                Upload Image
              </button>
            </div>

            {/* URL Input */}
            {imageSource === 'url' && (
              <input
                type="url"
                id="imageUrl"
                value={imageUrl}
                onChange={e => setImageUrl(e.target.value)}
                placeholder="https://example.com/image.png"
                className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-base-blue text-white"
              />
            )}

            {/* File Upload */}
            {imageSource === 'upload' && (
              <div>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleImageUpload}
                  accept="image/*"
                  className="hidden"
                  id="imageUpload"
                />
                
                {!uploadedImage ? (
                  <label
                    htmlFor="imageUpload"
                    className="w-full h-32 border-2 border-dashed border-gray-600 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-base-blue transition-colors bg-gray-800/50"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400 mb-2">
                      <rect width="18" height="18" x="3" y="3" rx="2" ry="2"/>
                      <circle cx="9" cy="9" r="2"/>
                      <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/>
                    </svg>
                    <span className="text-gray-400 text-sm">Click to upload image</span>
                    <span className="text-gray-500 text-xs mt-1">PNG, JPG, GIF up to 5MB</span>
                  </label>
                ) : (
                  <div className="relative">
                    <img
                      src={imagePreview!}
                      alt="Preview"
                      className="w-full h-32 object-cover rounded-lg border border-gray-600"
                    />
                    <button
                      type="button"
                      onClick={removeUploadedImage}
                      className="absolute top-2 right-2 bg-red-600 text-white rounded-full p-1 hover:bg-red-700 transition-colors"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="18" y1="6" x2="6" y2="18"></line>
                        <line x1="6" y1="6" x2="18" y2="18"></line>
                      </svg>
                    </button>
                    <div className="mt-2 text-sm text-gray-400">
                      {uploadedImage.name} ({(uploadedImage.size / 1024 / 1024).toFixed(2)} MB)
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
          
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-base-blue text-white font-bold py-3 px-4 rounded-lg hover:bg-base-blue-dark transition-colors disabled:bg-gray-600 disabled:cursor-not-allowed mt-6"
          >
            {isSubmitting ? (
              <div className="flex items-center justify-center space-x-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Creating...</span>
              </div>
            ) : (
              'Create Wish'
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default CreateWishModal;