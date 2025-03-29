"use client"
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { 
  Typography, 
  Button, 
  Space, 
  Layout, 
  Card, 
  Select, 
  Spin, 
  Alert, 
  Divider, 
  Tabs, 
  Form, 
  Input, 
  Tooltip, 
  Badge, 
  Collapse, 
  Row, 
  Col,
  Dropdown,
  message,
  FloatButton,
  Radio,
  Tag,
  Slider,
  Result
} from 'antd'
import { 
  ArrowLeftOutlined, 
  PrinterOutlined, 
  DownloadOutlined, 
  MobileOutlined, 
  LaptopOutlined,
  SettingOutlined,
  ExpandOutlined,
  CompressOutlined,
  CodeOutlined,
  CopyOutlined,
  DesktopOutlined,
  TabletOutlined,
  MobileOutlined as MobileFilled,
  InfoCircleOutlined,
  MailOutlined,
  ToolOutlined,
  EyeOutlined,
  EditOutlined,
  UserOutlined
} from '@ant-design/icons'
import EmailPreview from '@/components/pages/email-preview/EmailPreview'
import type { TabsProps, MenuProps } from 'antd'
import LoaderComponent  from '@/components/LoaderComponent'

const { Title, Text, Paragraph } = Typography
const { Header, Content, Sider } = Layout
const { Option } = Select
const { Panel } = Collapse
const { TabPane } = Tabs

export default function EmailPreviewPage() {
  const router = useRouter()
  const [loading, setLoading] = useState<boolean>(true)
  const [templateId, setTemplateId] = useState<string>('')
  const [templateName, setTemplateName] = useState<string>('Template Preview')
  const [templateHtml, setTemplateHtml] = useState<string>('')
  const [previewData, setPreviewData] = useState<Record<string, any>>({})
  const [availableVariables, setAvailableVariables] = useState<string[]>([])
  const [viewMode, setViewMode] = useState<'desktop' | 'tablet' | 'mobile'>('desktop')
  const [siderCollapsed, setSiderCollapsed] = useState<boolean>(false)
  const [activeTab, setActiveTab] = useState<string>('test-data')
  const [zoomLevel, setZoomLevel] = useState<number>(100)

  // Load preview data from localStorage on component mount
  useEffect(() => {
    const storedTemplateId = localStorage.getItem('preview-template-id')
    const storedHtml = localStorage.getItem('preview-template-html')
    const storedData = localStorage.getItem('preview-template-data')
    const storedName = localStorage.getItem('preview-template-name')
    
    if (storedTemplateId && storedHtml) {
      setTemplateId(storedTemplateId)
      setTemplateHtml(storedHtml)
      if (storedName) {
        setTemplateName(storedName)
      }
      
      if (storedData) {
        try {
          const parsedData = JSON.parse(storedData)
          setPreviewData(parsedData)
          setAvailableVariables(Object.keys(parsedData))
        } catch (error) {
          console.error('Error parsing preview data', error)
          setPreviewData({})
          setAvailableVariables([])
        }
      }
    } else {
      // No preview data found, redirect back to editor after a delay
      setTimeout(() => {
        router.push('/')
      }, 2000)
    }
    
    setLoading(false)
  }, [router])

  // Handle print preview
  const handlePrintPreview = () => {
    message.info('Preparing print view...')
    setTimeout(() => {
      window.print()
    }, 300)
  }

  // Handle export HTML
  const handleExportHtml = () => {
    // Create email-client-friendly HTML
    const emailSafeHTML = `
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
<head>
  <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${templateName || 'Email Template'}</title>
  <style type="text/css">
    body { margin: 0; padding: 0; min-width: 100%; font-family: Arial, sans-serif; }
  </style>
</head>
<body>
  ${templateHtml}
</body>
</html>
    `;
    
    // Download as HTML file
    const blob = new Blob([emailSafeHTML], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${templateName.toLowerCase().replace(/\s+/g, '-')}-${templateId.substring(0, 8)}.html`;
    a.click();
    URL.revokeObjectURL(url);
    
    message.success('Email template exported successfully');
  }

  // Handle export source code
  const handleExportSource = () => {
    // Download as HTML file
    const blob = new Blob([templateHtml], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${templateName.toLowerCase().replace(/\s+/g, '-')}-source.html`;
    a.click();
    URL.revokeObjectURL(url);
    
    message.success('Source code exported successfully');
  }

  // Handle copy HTML to clipboard
  const handleCopyHtml = () => {
    navigator.clipboard.writeText(templateHtml)
      .then(() => {
        message.success('HTML copied to clipboard');
      })
      .catch(() => {
        message.error('Failed to copy HTML');
      });
  }

  // Handle update preview data
  const handleUpdatePreviewData = (updatedData: Record<string, any>) => {
    setPreviewData(updatedData)
    localStorage.setItem('preview-template-data', JSON.stringify(updatedData))
  }

  // Navigate back to the editor
  const handleBackToEditor = () => {
    router.push('/')
  }

  // Handle zoom in/out
  const handleZoom = (newZoom: number) => {
    setZoomLevel(Math.max(50, Math.min(150, newZoom)))
  }

  // Define items for the view mode dropdown
  const viewModeItems: MenuProps['items'] = [
    {
      key: 'desktop',
      label: 'Desktop View',
      icon: <DesktopOutlined />,
      onClick: () => setViewMode('desktop'),
    },
    {
      key: 'tablet',
      label: 'Tablet View',
      icon: <TabletOutlined />,
      onClick: () => setViewMode('tablet'),
    },
    {
      key: 'mobile',
      label: 'Mobile View',
      icon: <MobileFilled />,
      onClick: () => setViewMode('mobile'),
    },
  ];

  // Define items for the export dropdown
  const exportItems: MenuProps['items'] = [
    {
      key: 'html',
      label: 'Export HTML',
      icon: <DownloadOutlined />,
      onClick: handleExportHtml,
    },
    {
      key: 'source',
      label: 'Export Source Code',
      icon: <CodeOutlined />,
      onClick: handleExportSource,
    },
    {
      key: 'copy',
      label: 'Copy HTML to Clipboard',
      icon: <CopyOutlined />,
      onClick: handleCopyHtml,
    },
    {
      key: 'print',
      label: 'Print Preview',
      icon: <PrinterOutlined />,
      onClick: handlePrintPreview,
    },
  ];

  // Define tabs for the sidebar
  const sidebarTabs: TabsProps['items'] = [
    {
      key: 'test-data',
      label: <span><UserOutlined /> Test Data</span>,
      children: (
        <div className="variable-editor">
          <Paragraph type="secondary" className="mb-4">
            Modify test data values to see how your email will look with different content.
          </Paragraph>
          
          <div className="max-h-[calc(100vh-300px)] overflow-y-auto pr-1">
            {availableVariables.map((key) => (
              <div key={key} className="mb-4">
                <Form.Item
                  label={
                    <Text strong className="capitalize">
                      {key.replace(/([A-Z])/g, ' $1')}
                    </Text>
                  }
                  labelCol={{ span: 24 }}
                  wrapperCol={{ span: 24 }}
                  className="mb-1"
                >
                  <Input
                    value={previewData[key] || ''}
                    onChange={(e) => handleUpdatePreviewData({
                      ...previewData,
                      [key]: e.target.value
                    })}
                    placeholder={`Enter value for ${key}`}
                    allowClear
                  />
                </Form.Item>
              </div>
            ))}
          </div>
          
          <div className="mt-4 pt-4 border-t border-gray-200">
            <Paragraph type="secondary" className="text-xs">
              <InfoCircleOutlined /> Test data is saved in your browser and will be available the next time you preview this template.
            </Paragraph>
          </div>
        </div>
      ),
    },
    {
      key: 'template-info',
      label: <span><InfoCircleOutlined /> Template Info</span>,
      children: (
        <div className="template-info">
          <Collapse defaultActiveKey={['basic']} bordered={false} className="bg-transparent">
            <Panel header="Basic Information" key="basic" className="site-collapse-custom-panel">
              <div className="mb-3">
                <Text type="secondary" className="block text-xs">Template ID</Text>
                <Text strong className="word-break-all">{templateId}</Text>
              </div>
              <div className="mb-3">
                <Text type="secondary" className="block text-xs">Template Name</Text>
                <Text>{templateName}</Text>
              </div>
              <div>
                <Text type="secondary" className="block text-xs">Variables</Text>
                <div className="flex flex-wrap gap-2 mt-1">
                  {availableVariables.map(variable => (
                    <Tag key={variable} color="blue">
                      {`{{${variable}}}`}
                    </Tag>
                  ))}
                </div>
              </div>
            </Panel>
            <Panel header="Preview Settings" key="preview" className="site-collapse-custom-panel">
              <div className="mb-3">
                <Text type="secondary" className="block mb-1">Device Preview</Text>
                <Radio.Group 
                  value={viewMode} 
                  onChange={(e) => setViewMode(e.target.value)}
                  optionType="button"
                  buttonStyle="solid"
                  size="small"
                  className="w-full"
                >
                  <Radio.Button value="desktop" style={{ width: '33.33%', textAlign: 'center' }}>
                    <DesktopOutlined /> Desktop
                  </Radio.Button>
                  <Radio.Button value="tablet" style={{ width: '33.33%', textAlign: 'center' }}>
                    <TabletOutlined /> Tablet
                  </Radio.Button>
                  <Radio.Button value="mobile" style={{ width: '33.33%', textAlign: 'center' }}>
                    <MobileFilled /> Mobile
                  </Radio.Button>
                </Radio.Group>
              </div>
              <div>
                <Text type="secondary" className="block mb-1">Zoom Level: {zoomLevel}%</Text>
                <div className="flex items-center">
                  <Button 
                    icon={<CompressOutlined />} 
                    onClick={() => handleZoom(zoomLevel - 10)}
                    disabled={zoomLevel <= 50}
                    size="small"
                  />
                  <Slider 
                    min={50} 
                    max={150} 
                    value={zoomLevel} 
                    onChange={handleZoom} 
                    className="mx-2 flex-grow"
                  />
                  <Button 
                    icon={<ExpandOutlined />} 
                    onClick={() => handleZoom(zoomLevel + 10)}
                    disabled={zoomLevel >= 150}
                    size="small"
                  />
                </div>
              </div>
            </Panel>
          </Collapse>
        </div>
      ),
    },
  ];

  if (loading) {
    // return (
    //   <div className="flex flex-col justify-center items-center h-screen">
    //     <Spin size="large" />
    //     <div className="mt-4 text-lg">Loading preview...</div>
    //   </div>
    // )
	return <LoaderComponent />;
}

  if (!templateHtml) {
    return (
      <div className="p-8 flex justify-center items-center h-screen">
        <Card className="max-w-lg w-full shadow-lg">
          <Result
            status="warning"
            title="No template to preview"
            subTitle="There's no template data available for preview. Please go back to the editor and try again."
            extra={
              <Button 
                onClick={handleBackToEditor} 
                type="primary" 
                icon={<ArrowLeftOutlined />}
                size="large"
              >
                Back to Editor
              </Button>
            }
          />
        </Card>
      </div>
    )
  }

  return (
    <Layout className="min-h-screen">
      <Header className="bg-white px-6 shadow-sm flex items-center">
        <div className="flex items-center flex-1">
          <Button
            type="primary"
            icon={<ArrowLeftOutlined />}
            onClick={handleBackToEditor}
            className="mr-4"
          >
            Back to Editor
          </Button>
          <div className="mr-4 print:hidden">
            <Badge count={availableVariables.length} color="blue" overflowCount={99}>
              <MailOutlined className="text-xl" />
            </Badge>
          </div>
          <div>
            <Title level={4} className="mb-0">{templateName}</Title>
            <Text type="secondary" className="hidden sm:inline-block">Email Template Preview</Text>
          </div>
        </div>
        
        <Space className="print:hidden">
          <Dropdown menu={{ items: viewModeItems }} placement="bottomRight">
            <Button>
              {viewMode === 'desktop' && <DesktopOutlined />}
              {viewMode === 'tablet' && <TabletOutlined />}
              {viewMode === 'mobile' && <MobileFilled />}
              <span className="ml-2">{viewMode.charAt(0).toUpperCase() + viewMode.slice(1)} View</span>
            </Button>
          </Dropdown>
          
          <Dropdown menu={{ items: exportItems }} placement="bottomRight">
            <Button type="primary" icon={<DownloadOutlined />}>
              Export
            </Button>
          </Dropdown>
          
          <Tooltip title={siderCollapsed ? "Show Options" : "Hide Options"}>
            <Button
              type="text"
              icon={siderCollapsed ? <SettingOutlined /> : <CompressOutlined />}
              onClick={() => setSiderCollapsed(!siderCollapsed)}
            />
          </Tooltip>
        </Space>
      </Header>

      <Layout>
        <Content className="py-6 px-4 bg-gray-50">
          <div className={`
            mx-auto transition-all duration-300 ease-in-out
            ${viewMode === 'desktop' ? 'max-w-5xl' : ''}
            ${viewMode === 'tablet' ? 'max-w-lg' : ''}
            ${viewMode === 'mobile' ? 'max-w-xs' : ''}
          `}>
            <Card 
              className="shadow-lg overflow-hidden print:shadow-none"
              variant="borderless"
            >
              <div 
                className="bg-gray-100 rounded print:bg-white print:p-0 overflow-hidden"
                style={{
                  transform: `scale(${zoomLevel / 100})`,
                  transformOrigin: 'top left',
                  width: `${100 * (100 / zoomLevel)}%`,
                  height: `${100 * (100 / zoomLevel)}%`
                }}
              >
                <EmailPreview 
                  html={templateHtml}
                  previewData={previewData}
                  templateId={templateId}
                  availableVariables={availableVariables}
                  onUpdatePreviewData={handleUpdatePreviewData}
                />
              </div>
            </Card>
          </div>
        </Content>

        <Sider
          width={320}
          theme="light"
          collapsible
          collapsed={siderCollapsed}
          onCollapse={setSiderCollapsed}
          collapsedWidth={0}
          trigger={null}
          className="print:hidden border-l border-gray-200"
        >
          <Tabs
            defaultActiveKey="test-data"
            activeKey={activeTab}
            onChange={setActiveTab}
            items={sidebarTabs}
            tabBarStyle={{ padding: '0 16px', marginBottom: 0 }}
            className="h-full"
          />
        </Sider>
      </Layout>
      
      <FloatButton.Group
        trigger="hover"
        className="print:hidden"
        icon={<ToolOutlined />}
        tooltip="Tools"
      >
        <FloatButton
          icon={<PrinterOutlined />}
          tooltip="Print"
          onClick={handlePrintPreview}
        />
        <FloatButton
          icon={viewMode === 'desktop' ? <MobileFilled /> : <DesktopOutlined />}
          tooltip={viewMode === 'desktop' ? 'Mobile View' : 'Desktop View'}
          onClick={() => setViewMode(viewMode === 'desktop' ? 'mobile' : 'desktop')}
        />
        <FloatButton
          icon={siderCollapsed ? <EditOutlined /> : <EyeOutlined />}
          tooltip={siderCollapsed ? 'Show Editor' : 'Hide Editor'}
          onClick={() => setSiderCollapsed(!siderCollapsed)}
        />
      </FloatButton.Group>
    </Layout>
  )
}