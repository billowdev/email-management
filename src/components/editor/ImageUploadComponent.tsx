// src/components/editor/ImageUploadComponent.tsx
import React, { useState, useRef, useEffect, memo } from 'react';
import { Editor } from '@tiptap/react';
import { Button, Modal, Input, Upload, message, Tooltip, Tabs, Slider, InputNumber, Space, Switch, Row, Col, Spin } from 'antd';
import { PictureOutlined, LinkOutlined, UploadOutlined, ExpandOutlined, CompressOutlined, LoadingOutlined } from '@ant-design/icons';
import type { UploadProps } from 'antd';
import type { RcFile } from 'antd/es/upload/interface';
import type { TabsProps } from 'antd';
import TiptapImage from '@tiptap/extension-image';

// Component for real-time resized image preview
interface ResizedImagePreviewProps {
  src: string;
  width: number;
  height: number;
  quality: number;
  originalWidth: number;
  originalHeight: number;
}

const ResizedImagePreview: React.FC<ResizedImagePreviewProps> = memo(({ 
  src, 
  width, 
  height, 
  quality,
  originalWidth,
  originalHeight
}) => {
  const [previewSrc, setPreviewSrc] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  
  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    
    // Use original image if no resize is needed
    if ((width === originalWidth && height === originalHeight && quality === 100) || 
        width === 0 || height === 0) {
      setPreviewSrc(src);
      setLoading(false);
      return;
    }
    
    const resizeImage = async () => {
      try {
        const img = new window.Image();
        
        // Create a promise to track when the image loads
        const imageLoaded = new Promise((resolve, reject) => {
          img.onload = resolve;
          img.onerror = reject;
        });
        
        img.src = src;
        await imageLoaded;
        
        // Create a canvas for resizing
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        
        if (!ctx) {
          console.error('Failed to get canvas context');
          return;
        }
        
        // Draw the image at the new size
        ctx.drawImage(img, 0, 0, width, height);
        
        // Convert to data URL with specified quality
        const resizedDataUrl = canvas.toDataURL('image/jpeg', quality / 100);
        
        if (isMounted) {
          setPreviewSrc(resizedDataUrl);
          setLoading(false);
        }
      } catch (error) {
        console.error('Error in resize preview:', error);
        if (isMounted) {
          setLoading(false);
        }
      }
    };
    
    // Only attempt to resize if we have valid dimensions
    if (width > 0 && height > 0) {
      resizeImage();
    } else {
      setLoading(false);
    }
    
    return () => {
      isMounted = false;
    };
  }, [src, width, height, quality, originalWidth, originalHeight]);
  
  if (loading) {
    return <Spin indicator={<LoadingOutlined style={{ fontSize: 24 }} spin />} />;
  }
  
  return (
    <img 
      src={previewSrc} 
      alt="Image preview" 
      style={{ 
        maxWidth: '100%',
        maxHeight: '200px',
        objectFit: 'contain'
      }} 
    />
  );
});

interface ImageUploadComponentProps {
  editor: Editor | null;
}

const ImageUploadComponent: React.FC<ImageUploadComponentProps> = ({ editor }) => {
  const [isModalVisible, setIsModalVisible] = useState<boolean>(false);
  const [imageUrl, setImageUrl] = useState<string>('');
  const [imageAlt, setImageAlt] = useState<string>('');
  const [activeTab, setActiveTab] = useState<string>('url');
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  
  // Image dimension states
  const [originalWidth, setOriginalWidth] = useState<number>(0);
  const [originalHeight, setOriginalHeight] = useState<number>(0);
  const [width, setWidth] = useState<number>(0);
  const [height, setHeight] = useState<number>(0);
  const [keepAspectRatio, setKeepAspectRatio] = useState<boolean>(true);
  const [percentSize, setPercentSize] = useState<number>(100);
  
  // Image quality states
  const [quality, setQuality] = useState<number>(90);
  const [showAdvanced, setShowAdvanced] = useState<boolean>(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Show the image insertion modal
  const showModal = () => {
    setIsModalVisible(true);
    resetForm();
  };

  // Reset form values
  const resetForm = () => {
    setImageUrl('');
    setImageAlt('');
    setPreviewImage(null);
    setOriginalWidth(0);
    setOriginalHeight(0);
    setWidth(0);
    setHeight(0);
    setPercentSize(100);
    setQuality(90);
  };

  // Handle modal cancel
  const handleCancel = () => {
    setIsModalVisible(false);
  };

  // Load image dimensions when image URL changes
  useEffect(() => {
    if (previewImage) {
      const img = new Image();
      img.onload = () => {
        setOriginalWidth(img.width);
        setOriginalHeight(img.height);
        setWidth(img.width);
        setHeight(img.height);
      };
      img.src = previewImage;
    }
  }, [previewImage]);

  // Resize image based on percent
  const handlePercentChange = (value: number) => {
    setPercentSize(value);
    setWidth(Math.round(originalWidth * (value / 100)));
    setHeight(Math.round(originalHeight * (value / 100)));
  };

  // Handle width change while maintaining aspect ratio
  const handleWidthChange = (newWidth: number | null) => {
    if (newWidth === null) return;
    
    setWidth(newWidth);
    if (keepAspectRatio && originalWidth > 0) {
      const ratio = originalHeight / originalWidth;
      setHeight(Math.round(newWidth * ratio));
      setPercentSize(Math.round((newWidth / originalWidth) * 100));
    }
  };

  // Handle height change while maintaining aspect ratio
  const handleHeightChange = (newHeight: number | null) => {
    if (newHeight === null) return;
    
    setHeight(newHeight);
    if (keepAspectRatio && originalHeight > 0) {
      const ratio = originalWidth / originalHeight;
      setWidth(Math.round(newHeight * ratio));
      setPercentSize(Math.round((newHeight / originalHeight) * 100));
    }
  };

  // Toggle aspect ratio lock
  const handleAspectRatioToggle = (checked: boolean) => {
    setKeepAspectRatio(checked);
    if (checked && originalWidth > 0 && originalHeight > 0) {
      // Adjust height based on current width
      const ratio = originalHeight / originalWidth;
      setHeight(Math.round(width * ratio));
    }
  };

  // Reset dimensions to original
  const resetDimensions = () => {
    setWidth(originalWidth);
    setHeight(originalHeight);
    setPercentSize(100);
    setQuality(90);
  };

  // Load image from URL
  const loadImageFromUrl = () => {
    if (!imageUrl.trim()) {
      message.error('Please enter an image URL');
      return;
    }
    
    // Basic URL validation
    try {
      new URL(imageUrl);
    } catch (e) {
      message.error('Please enter a valid URL');
      return;
    }
    
    setPreviewImage(imageUrl);
  };

  // Resize image and return as data URL
  const resizeImage = (dataUrl: string): Promise<string> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        
        if (!ctx) {
          reject(new Error('Failed to get canvas context'));
          return;
        }
        
        // Draw the image at the new size
        ctx.drawImage(img, 0, 0, width, height);
        
        // Convert to data URL with specified quality
        const resizedDataUrl = canvas.toDataURL('image/jpeg', quality / 100);
        resolve(resizedDataUrl);
      };
      
      img.onerror = () => {
        reject(new Error('Failed to load image'));
      };
      
      img.src = dataUrl;
    });
  };

  // Insert resized image
  const insertResizedImage = async () => {
    if (!editor || !previewImage) return;
    
    try {
      // Only resize if dimensions have changed or quality is not 100%
      const needsResize = width !== originalWidth || height !== originalHeight || quality < 100;
      
      const finalImageUrl = needsResize ? await resizeImage(previewImage) : previewImage;
      
      editor.chain().focus().setImage({ 
        src: finalImageUrl,
        alt: imageAlt || 'Email image'
      }).run();
      
      const sizeReduction = needsResize ? 
        `Image resized from ${originalWidth}x${originalHeight} to ${width}x${height}` : 
        'Original size maintained';
        
      message.success(`Image inserted successfully. ${sizeReduction}`);
      setIsModalVisible(false);
    } catch (error) {
      console.error('Error resizing image:', error);
      message.error('Failed to resize image');
    }
  };

  // Handle file upload
  const handleFileUpload = (file: RcFile) => {
    const isImage = file.type.startsWith('image/');
    if (!isImage) {
      message.error('You can only upload image files!');
      return false;
    }
    
    const isLt10M = file.size / 1024 / 1024 < 10;
    if (!isLt10M) {
      message.error('Image must be smaller than 10MB!');
      return false;
    }
    
    // Convert file to data URL for preview and embedding
    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      setPreviewImage(dataUrl);
      setImageUrl(file.name);
    };
    reader.readAsDataURL(file);
    
    return false; // Prevent default upload behavior
  };

  // Handle file upload via upload component
  const uploadProps: UploadProps = {
    name: 'file',
    multiple: false,
    showUploadList: false,
    beforeUpload: handleFileUpload,
    accept: 'image/*'
  };

  // Handle tab change
  const onTabChange = (key: string) => {
    setActiveTab(key);
    setPreviewImage(null);
    setImageUrl('');
    setOriginalWidth(0);
    setOriginalHeight(0);
  };

  // Create image preview content for URL tab
  const urlTabPreviewContent = (
    <>
      <Space.Compact style={{ width: '100%' }} className="mb-4">
        <Input
          placeholder="Image URL (e.g., https://example.com/image.jpg)"
          value={imageUrl}
          onChange={(e) => setImageUrl(e.target.value)}
        />
        <Button type="primary" onClick={loadImageFromUrl}>Load</Button>
      </Space.Compact>
      
      <Input
        placeholder="Alt Text (for accessibility)"
        value={imageAlt}
        onChange={(e) => setImageAlt(e.target.value)}
        className="mb-4"
      />
    </>
  );

  // Create image preview content for upload tab
  const uploadTabPreviewContent = (
    <>
      <Upload {...uploadProps} className="mb-4">
        <Button icon={<UploadOutlined />}>Click to Upload</Button>
      </Upload>
      
      <Input
        placeholder="Alt Text (for accessibility)"
        value={imageAlt}
        onChange={(e) => setImageAlt(e.target.value)}
        className="mb-4"
      />
    </>
  );

  // Define tabs for the modal
  const items: TabsProps['items'] = [
    {
      key: 'url',
      label: (
        <span>
          <LinkOutlined /> URL
        </span>
      ),
      children: (
        <div className="mt-4">
          {urlTabPreviewContent}
        </div>
      ),
    },
    {
      key: 'upload',
      label: (
        <span>
          <UploadOutlined /> Upload
        </span>
      ),
      children: (
        <div className="mt-4">
          {uploadTabPreviewContent}
        </div>
      ),
    },
  ];

  if (!editor) return null;

  return (
    <>
      <Tooltip title="Insert Image">
        <Button 
          icon={<PictureOutlined />} 
          onClick={showModal}
          className={editor.isActive('image') ? 'ant-btn-primary' : ''}
        />
      </Tooltip>
      
      <Modal
        title="Insert Image"
        open={isModalVisible}
        onCancel={handleCancel}
        footer={[
          <Button key="cancel" onClick={handleCancel}>
            Cancel
          </Button>,
          <Button 
            key="add" 
            type="primary" 
            onClick={insertResizedImage}
            disabled={!previewImage}
          >
            Insert Image
          </Button>,
        ]}
        width={600}
      >
        <Tabs
          activeKey={activeTab}
          onChange={onTabChange}
          items={items}
        />
        
        {/* Combined preview and resize controls */}
        {previewImage && originalWidth > 0 && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="flex justify-between items-center mb-2">
              <h4 className="m-0">Image Preview & Resize</h4>
              <Button 
                icon={<ExpandOutlined />} 
                size="small"
                onClick={resetDimensions}
                title="Reset to original size"
              >
                Reset
              </Button>
            </div>
            
            <div className="flex flex-col md:flex-row gap-6">
              {/* Image preview */}
              <div className="w-full md:w-1/2">
                <div className="border rounded p-3 bg-gray-50 mb-2">
                  <div className="mb-2 text-xs text-gray-500">
                    <span>Original: {originalWidth}×{originalHeight}px</span>
                    <span className="mx-2">|</span>
                    <span>Preview: {width}×{height}px ({percentSize}%)</span>
                    {showAdvanced && quality < 100 && (
                      <>
                        <span className="mx-2">|</span>
                        <span>Quality: {quality}%</span>
                      </>
                    )}
                  </div>
                  <div 
                    className="flex justify-center items-center"
                    style={{ 
                      minHeight: '150px',
                      overflow: 'hidden'
                    }}
                  >
                    <ResizedImagePreview 
                      src={previewImage}
                      width={width}
                      height={height}
                      quality={quality}
                      originalWidth={originalWidth}
                      originalHeight={originalHeight}
                    />
                  </div>
                </div>
              </div>
              
              {/* Resize controls */}
              <div className="w-full md:w-1/2">
                <div className="mb-4">
                  <p className="mb-1">Scale: {percentSize}%</p>
                  <Slider
                    min={1}
                    max={100}
                    value={percentSize}
                    onChange={handlePercentChange}
                  />
                </div>
                
                <Row gutter={16} className="mb-4">
                  <Col span={11}>
                    <p className="mb-1">Width (px):</p>
                    <InputNumber
                      min={1}
                      max={originalWidth * 2}
                      value={width}
                      onChange={handleWidthChange}
                      className="w-full"
                    />
                  </Col>
                  <Col span={11}>
                    <p className="mb-1">Height (px):</p>
                    <InputNumber
                      min={1}
                      max={originalHeight * 2}
                      value={height}
                      onChange={handleHeightChange}
                      className="w-full"
                    />
                  </Col>
                  <Col span={2} className="flex items-end">
                    <Tooltip title={keepAspectRatio ? "Unlock aspect ratio" : "Lock aspect ratio"}>
                      <Button 
                        icon={keepAspectRatio ? <CompressOutlined /> : <ExpandOutlined />}
                        onClick={() => handleAspectRatioToggle(!keepAspectRatio)}
                        type={keepAspectRatio ? "primary" : "default"}
                      />
                    </Tooltip>
                  </Col>
                </Row>
                
                <div>
                  <Button 
                    type="link" 
                    onClick={() => setShowAdvanced(!showAdvanced)}
                    className="p-0"
                  >
                    {showAdvanced ? "Hide Advanced Options" : "Show Advanced Options"}
                  </Button>
                  
                  {showAdvanced && (
                    <div className="mt-2">
                      <p className="mb-1">Image Quality: {quality}%</p>
                      <Slider
                        min={10}
                        max={100}
                        value={quality}
                        onChange={(value) => setQuality(value)}
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Lower quality creates smaller file sizes but may affect image appearance.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </>
  );
};

export default ImageUploadComponent;