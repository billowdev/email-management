// src/components/pages/email-preview/EmailPreview.tsx
"use client"
import { useState, useEffect } from 'react'
import { PreviewData } from '@/types/email-templates'
import ExportOptionsComponent from '@/components/editor/sections/export/ExportOptionsComponent'
import { getTemplateHeaderFooter, applyHeaderFooterToContent } from '@/services/emailTemplateService'
// Import Ant Design components
import { 
  Card, 
  Typography, 
  Button, 
  Space, 
  Tooltip,
  Select,
  Spin
} from 'antd'
import { 
  MailOutlined, 
  PrinterOutlined, 
  MobileOutlined,
  LaptopOutlined,
  LoadingOutlined
} from '@ant-design/icons'

const { Text } = Typography;
const { Option } = Select;

interface EmailPreviewProps {
  html: string;
  previewData: PreviewData;
  templateId: string;
  templateName?: string;
  availableVariables?: string[];
  onUpdatePreviewData?: (data: PreviewData) => void;
}

const EmailPreview: React.FC<EmailPreviewProps> = ({
  html,
  previewData,
  templateId,
  templateName = 'Email Template',
  availableVariables = [],
  onUpdatePreviewData
}) => {
  const [isMounted, setIsMounted] = useState<boolean>(false)
  const [previewHtml, setPreviewHtml] = useState<string>('')
  const [viewMode, setViewMode] = useState<'desktop' | 'mobile'>('desktop')
  const [showVariablePanel, setShowVariablePanel] = useState<boolean>(false)
  const [loading, setLoading] = useState<boolean>(true)
  const [headerFooterApplied, setHeaderFooterApplied] = useState<boolean>(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  // Load header/footer from database and apply them to the HTML
  useEffect(() => {
    if (isMounted && templateId) {
      applyHeaderFooterToPreview();
    }
  }, [templateId, html, previewData, isMounted]);

  // Apply header/footer to the preview
  const applyHeaderFooterToPreview = async () => {
    setLoading(true);
    
    try {
      // First, replace variables in the provided HTML
      let processedHtml = html;
      
      Object.entries(previewData).forEach(([key, value]) => {
        const regex = new RegExp(`{{\.${key}}}`, 'g');
        processedHtml = processedHtml.replace(regex, String(value || ''));
      });
      
      // Try to apply header/footer from database
      try {
        const htmlWithHeaderFooter = await applyHeaderFooterToContent(templateId, processedHtml, previewData);
        setPreviewHtml(htmlWithHeaderFooter);
        setHeaderFooterApplied(true);
      } catch (error) {
        console.error('Error applying header/footer:', error);
        
        // Fallback to just the processed HTML without header/footer
        setPreviewHtml(processedHtml);
        setHeaderFooterApplied(false);
      }
    } catch (error) {
      console.error('Error processing template:', error);
      setPreviewHtml(html); // Fallback to original HTML
    } finally {
      setLoading(false);
    }
  };

  const handlePrintPreview = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;
    
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Email Template Print Preview</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 20px; }
          @media print {
            body { padding: 0; }
          }
        </style>
      </head>
      <body>
        ${previewHtml}
        <script>
          window.onload = function() { window.print(); window.close(); }
        </script>
      </body>
      </html>
    `);
    
    printWindow.document.close();
  }

  const handleUpdatePreviewData = (key: string, value: string) => {
    if (onUpdatePreviewData) {
      const updatedData = {
        ...previewData,
        [key]: value
      };
      
      onUpdatePreviewData(updatedData);
    }
  }

  if (!isMounted) {
    return null;
  }

  return (
    <Card className="shadow-lg rounded-lg border-0">
      {/* Preview Header with Toolbar */}
      <div className="bg-white border-b mb-4 pb-4">
        <Space direction="horizontal" className="flex flex-wrap gap-2 justify-between">
          <Text strong className="text-lg">Email Preview</Text>
          
          <Space>
            <Tooltip title="Toggle mobile view">
              <Button 
                icon={viewMode === 'mobile' ? <LaptopOutlined /> : <MobileOutlined />}
                onClick={() => setViewMode(viewMode === 'mobile' ? 'desktop' : 'mobile')}
                type={viewMode === 'mobile' ? 'primary' : 'default'}
              />
            </Tooltip>
            <Tooltip title="Print preview">
              <Button icon={<PrinterOutlined />} onClick={handlePrintPreview} />
            </Tooltip>
            
            {/* Export Options Component */}
            <ExportOptionsComponent
              html={previewHtml}
              rawTemplateHtml={html}
              previewData={previewData}
              templateId={templateId}
              templateName={templateName}
            />
          </Space>
        </Space>
      </div>
      
      {/* Main Preview Area */}
      <div className="flex flex-col lg:flex-row">
        <div className={`${showVariablePanel ? 'w-full lg:w-3/4 mb-4 lg:mb-0 lg:pr-4' : 'w-full'}`}>
          <div className={`bg-gray-100 p-4 ${viewMode === 'mobile' ? 'max-w-sm mx-auto' : 'w-full'}`}>
            <Card 
              className="shadow-md mx-auto" 
              styles={{ body: { padding: viewMode === 'mobile' ? '16px' : '32px' } }}
            >
              <div className="flex items-center mb-4 border-b pb-2">
                <MailOutlined className="text-blue-500 mr-2" />
                <Text strong>Email Subject Would Appear Here</Text>
              </div>
              
              {loading ? (
                <div className="flex justify-center items-center py-20">
                  <Spin indicator={<LoadingOutlined style={{ fontSize: 24 }} spin />} />
                  <Text className="ml-2">Loading preview...</Text>
                </div>
              ) : (
                <div 
                  className="prose max-w-none"
                  dangerouslySetInnerHTML={{ __html: previewHtml }}
                />
              )}
            </Card>
          </div>
        </div>
        
        {showVariablePanel && (
          <div className="w-full lg:w-1/4">
            <Card className="h-full shadow-sm">
              <Text strong className="block mb-4">Test Data</Text>
              <div className="flex flex-col gap-3 max-h-[400px] overflow-auto">
                {availableVariables.map((key) => (
                  <div key={key} className="mb-2">
                    <Text className="text-xs text-gray-500 block mb-1">{key}</Text>
                    <input
                      value={previewData[key] || ''}
                      onChange={(e) => handleUpdatePreviewData(key, e.target.value)}
                      className="w-full p-2 border rounded text-sm"
                      placeholder={`Value for ${key}`}
                    />
                  </div>
                ))}
              </div>
            </Card>
          </div>
        )}
      </div>
      
      {/* Status information about template */}
      {!loading && !headerFooterApplied && (
        <div className="mt-4 p-2 bg-yellow-50 text-yellow-700 text-sm rounded border border-yellow-200">
          <Text strong>Note:</Text> No custom header/footer was found for this template. Using content only.
        </div>
      )}
    </Card>
  )
}

export default EmailPreview