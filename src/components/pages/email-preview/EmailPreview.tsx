"use client"
import { useState, useEffect } from 'react'
import { PreviewData } from '@/types/email-templates'
import ExportOptionsComponent from '@/components/ExportOptionsComponent'
// Import Ant Design components
import { 
  Card, 
  Typography, 
  Button, 
  Space, 
  Tooltip,
  Select
} from 'antd'
import { 
  MailOutlined, 
  PrinterOutlined, 
  MobileOutlined,
  LaptopOutlined
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

  useEffect(() => {
    setIsMounted(true)
  }, [])

  // Update preview HTML when html or previewData changes
  useEffect(() => {
    // Replace variables in the provided HTML
    let processedHtml = html
    
    Object.entries(previewData).forEach(([key, value]) => {
      const regex = new RegExp(`{{\.${key}}}`, 'g')
      processedHtml = processedHtml.replace(regex, String(value))
    })
    
    setPreviewHtml(processedHtml)
  }, [html, previewData])

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
      onUpdatePreviewData({
        ...previewData,
        [key]: value
      });
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
            <Tooltip title="Toggle test data panel">
              <Button 
                onClick={() => setShowVariablePanel(!showVariablePanel)}
                type={showVariablePanel ? "primary" : "default"}
              >
                Test Data
              </Button>
            </Tooltip>
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
            
            {/* New Export Options Component */}
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
              
              <div 
                className="prose max-w-none"
                dangerouslySetInnerHTML={{ __html: previewHtml }}
              />
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
    </Card>
  )
}

export default EmailPreview