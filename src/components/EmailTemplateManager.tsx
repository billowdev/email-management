"use client"
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { 
  getAllTemplates, 
  createTemplate,
  updateTemplate,
  deleteTemplate,
  updatePreviewData,
  templateToSimpleFormat,
  getPreviewDataObject,
  EmailTemplateWithRelations,
  addVariable
} from '@/services/emailTemplateService'
import EmailTemplateEditor from '@/components/EmailTemplateEditor'
import AddVariableComponent from '@/components/AddVariableComponent'
// Import Ant Design components
import { 
  Typography, 
  Select, 
  Input, 
  Button, 
  Space, 
  Card, 
  Alert, 
  Tag, 
  Divider,
  Layout,
  Popconfirm,
  Modal,
  message,
  Spin
} from 'antd'
import { 
  PlusOutlined, 
  EyeOutlined, 
  SaveOutlined,
  DeleteOutlined,
  InfoCircleOutlined,
  LoadingOutlined
} from '@ant-design/icons'
import { Header } from 'antd/es/layout/layout'

const { Title, Text, Paragraph } = Typography;
const { Option } = Select;
const { Content } = Layout;

interface EmailTemplateManagerProps {
  onSelectTemplate?: (template: EmailTemplateWithRelations, html: string) => void;
}

const EmailTemplateManager: React.FC<EmailTemplateManagerProps> = ({ 
  onSelectTemplate 
}) => {
  const router = useRouter()
  const [selectedTemplate, setSelectedTemplate] = useState<EmailTemplateWithRelations | null>(null)
  const [templateList, setTemplateList] = useState<EmailTemplateWithRelations[]>([])
  const [newTemplateName, setNewTemplateName] = useState<string>('')
  const [currentHtml, setCurrentHtml] = useState<string>('')
  const [previewData, setPreviewData] = useState<Record<string, any>>({})
  const [loading, setLoading] = useState<boolean>(true)
  const [saveLoading, setSaveLoading] = useState<boolean>(false)
  const [createLoading, setCreateLoading] = useState<boolean>(false)
  const [deleteConfirmVisible, setDeleteConfirmVisible] = useState<boolean>(false)
  
  // Load templates from API
  useEffect(() => {
    loadTemplates();
  }, [])
  
  const loadTemplates = async () => {
    try {
      setLoading(true);
      const templates = await getAllTemplates();
      setTemplateList(templates);
      
      // Select first template if none selected
      if (templates.length > 0 && !selectedTemplate) {
        const firstTemplate = templates[0];
        setSelectedTemplate(firstTemplate);
        setCurrentHtml(firstTemplate.defaultContent);
        setPreviewData(getPreviewDataObject(firstTemplate));
        
        if (onSelectTemplate) {
          onSelectTemplate(firstTemplate, firstTemplate.defaultContent);
        }
      }
      
      setLoading(false);
    } catch (error) {
      console.error('Error loading templates:', error);
      message.error('Failed to load templates');
      setLoading(false);
    }
  };
  
  // Handle HTML changes
  const handleHtmlChange = (html: string) => {
    setCurrentHtml(html);
    
    if (selectedTemplate && onSelectTemplate) {
      onSelectTemplate(selectedTemplate, html);
    }
  }
  
  // Save current template
  const saveCurrentTemplate = async () => {
    if (!selectedTemplate) return;
    
    try {
      setSaveLoading(true);
      
      // Update the template content
      await updateTemplate(selectedTemplate.id, {
        defaultContent: currentHtml
      });
      
      // Update the preview data if it has changed
      await updatePreviewData(selectedTemplate.id, previewData);
      
      message.success('Template saved successfully');
      setSaveLoading(false);
    } catch (error) {
      console.error('Error saving template:', error);
      message.error('Failed to save template');
      setSaveLoading(false);
    }
  };
  
  // Create a new template
  const createNewTemplate = async () => {
    if (!newTemplateName) return;
    
    try {
      setCreateLoading(true);
      
      const newTemplate = await createTemplate({
        name: newTemplateName,
        description: '',
        defaultContent: '<p>Start creating your template here...</p>',
        variables: [
          { 
            key: 'firstName', 
            name: 'First Name', 
            type: 'TEXT', 
            required: false 
          },
          { 
            key: 'lastName', 
            name: 'Last Name', 
            type: 'TEXT', 
            required: false 
          },
          { 
            key: 'email', 
            name: 'Email', 
            type: 'EMAIL', 
            required: true 
          }
        ],
        previewData: {
          firstName: 'John',
          lastName: 'Doe',
          email: 'john.doe@example.com'
        }
      });
      
      // Add to template list and select it
      setTemplateList(prev => [...prev, newTemplate]);
      setSelectedTemplate(newTemplate);
      setCurrentHtml(newTemplate.defaultContent);
      setPreviewData(getPreviewDataObject(newTemplate));
      setNewTemplateName('');
      
      if (onSelectTemplate) {
        onSelectTemplate(newTemplate, newTemplate.defaultContent);
      }
      
      message.success(`Template "${newTemplateName}" created successfully`);
      setCreateLoading(false);
    } catch (error) {
      console.error('Error creating template:', error);
      message.error('Failed to create template');
      setCreateLoading(false);
    }
  };
  
  // Handle template selection change
  const handleTemplateChange = async (templateId: string) => {
    const selected = templateList.find(t => t.id === templateId);
    
    if (selected) {
      setSelectedTemplate(selected);
      setCurrentHtml(selected.defaultContent);
      setPreviewData(getPreviewDataObject(selected));
      
      if (onSelectTemplate) {
        onSelectTemplate(selected, selected.defaultContent);
      }
    }
  };
  
  // Delete the current template
  const handleDeleteTemplate = async () => {
    if (!selectedTemplate) return;
    
    try {
      await deleteTemplate(selectedTemplate.id);
      
      // Remove from list and select another template
      const updatedList = templateList.filter(t => t.id !== selectedTemplate.id);
      setTemplateList(updatedList);
      
      if (updatedList.length > 0) {
        const firstTemplate = updatedList[0];
        setSelectedTemplate(firstTemplate);
        setCurrentHtml(firstTemplate.defaultContent);
        setPreviewData(getPreviewDataObject(firstTemplate));
        
        if (onSelectTemplate) {
          onSelectTemplate(firstTemplate, firstTemplate.defaultContent);
        }
      } else {
        setSelectedTemplate(null);
        setCurrentHtml('');
        setPreviewData({});
      }
      
      message.success('Template deleted successfully');
      setDeleteConfirmVisible(false);
    } catch (error) {
      console.error('Error deleting template:', error);
      message.error('Failed to delete template');
      setDeleteConfirmVisible(false);
    }
  };
  
  // Preview the current template
  const previewCurrentTemplate = () => {
    if (!selectedTemplate) return;
    
    // Store current template in localStorage for the preview page
    localStorage.setItem('preview-template-id', selectedTemplate.id);
    localStorage.setItem('preview-template-html', currentHtml);
    localStorage.setItem('preview-template-data', JSON.stringify(previewData));
    
    // Navigate to preview page
    router.push('/email-preview');
  };
  
  // Handle adding a new variable
  const handleAddVariable = async (variableName: string) => {
    if (!selectedTemplate) return;
    
    try {
      // First check if variable already exists
      if (selectedTemplate.variables.some(v => v.key === variableName)) {
        message.error(`Variable ${variableName} already exists`);
        return;
      }
      
      // Add the variable through the API
      const newVariable = await addVariable(selectedTemplate.id, {
        key: variableName,
        name: variableName.charAt(0).toUpperCase() + variableName.slice(1).replace(/([A-Z])/g, ' $1').trim(),
        type: 'TEXT',
        required: false
      });
      
      // Update local state
      setSelectedTemplate(prev => {
        if (!prev) return prev;
        
        return {
          ...prev,
          variables: [...prev.variables, newVariable]
        };
      });
      
      // Update preview data with an empty value for the new variable
      const updatedPreviewData = { ...previewData, [variableName]: '' };
      setPreviewData(updatedPreviewData);
      
      // Update preview data in the database
      await updatePreviewData(selectedTemplate.id, updatedPreviewData);
      
      message.success(`Variable {{.${variableName}}} added successfully`);
    } catch (error) {
      console.error('Error adding variable:', error);
      message.error('Failed to add variable');
    }
  };
  
  // Get variables for the selected template
  const getVariableKeys = () => {
    if (!selectedTemplate) return [];
    return selectedTemplate.variables.map(v => v.key);
  };
  
  // Calculate whether the template can be deleted
  const canDeleteTemplate = selectedTemplate && !selectedTemplate.isSystem;
  
  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Spin indicator={<LoadingOutlined style={{ fontSize: 24 }} spin />} />
        <span className="ml-2">Loading templates...</span>
      </div>
    );
  }
  
  return (
    <Layout className="min-h-screen bg-gray-50">
      <Content className="container mx-auto p-4 md:p-6">
        <Header className="bg-white p-6 rounded-lg shadow-sm mb-6">
          <div className="flex justify-between items-center">
            <div>
              <Title level={3} className="mb-0">Email Template Editor</Title>
              <Text type="secondary">Create and manage email templates</Text>
            </div>
            <Space>
              {selectedTemplate && (
                <>
                  <Button 
                    key="save" 
                    type="primary" 
                    icon={<SaveOutlined />}
                    onClick={saveCurrentTemplate}
                    loading={saveLoading}
                  >
                    Save
                  </Button>
                  <Button 
                    key="preview" 
                    type="default" 
                    icon={<EyeOutlined />} 
                    onClick={previewCurrentTemplate}
                  >
                    Full Page Preview
                  </Button>
                  {canDeleteTemplate && (
                    <Button 
                      key="delete" 
                      type="default" 
                      danger
                      icon={<DeleteOutlined />}
                      onClick={() => setDeleteConfirmVisible(true)}
                    >
                      Delete
                    </Button>
                  )}
                </>
              )}
            </Space>
          </div>
        </Header>
        
        <Card className="mb-6 shadow-sm">
          <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
            <div className="w-full md:w-auto">
              <Text strong className="block mb-2">Template</Text>
              <Select 
                className="w-full min-w-[200px]"
                value={selectedTemplate?.id}
                onChange={handleTemplateChange}
                optionLabelProp="label"
                loading={loading}
              >
                {templateList.map(template => (
                  <Option key={template.id} value={template.id} label={template.name}>
                    <Space>
                      <span>{template.name}</span>
                      {template.isSystem && <Tag color="blue">System</Tag>}
                    </Space>
                  </Option>
                ))}
              </Select>
            </div>
            
            <Divider type="vertical" className="hidden md:block h-10" />
            
            <div className="flex-grow">
              <Text strong className="block mb-2">Create New Template</Text>
              <Space.Compact className="w-full">
                <Input
                  placeholder="New template name"
                  value={newTemplateName}
                  onChange={(e) => setNewTemplateName(e.target.value)}
                />
                <Button
                  type="primary"
                  icon={<PlusOutlined />}
                  onClick={createNewTemplate}
                  disabled={!newTemplateName || createLoading}
                  loading={createLoading}
                >
                  Create
                </Button>
              </Space.Compact>
            </div>
          </div>
        </Card>
        
        {selectedTemplate ? (
          <Card className="mb-6 shadow-sm">
            <Title level={4} className="mb-1">{selectedTemplate.name}</Title>
            {selectedTemplate.description && (
              <Paragraph type="secondary">{selectedTemplate.description}</Paragraph>
            )}
            
            {/* Variables Section */}
            <div className="mb-4">
              <Text strong>Available variables: </Text>
              <div className="mt-2">
                {selectedTemplate.variables.map(v => (
                  <Tag 
                    key={v.id} 
                    color="blue" 
                    className="mr-1 mb-1"
                  >
                    {`{{.${v.key}}}`}
                  </Tag>
                ))}
              </div>
            </div>
            
            {/* Add Variable Component */}
            <AddVariableComponent 
              existingVariables={getVariableKeys()}
              onAddVariable={handleAddVariable}
            />
            
            <Divider />
            
            {/* Email Template Editor */}
            <EmailTemplateEditor 
              initialContent={currentHtml}
              templateId={selectedTemplate.id}
              availableVariables={getVariableKeys()}
              onHtmlChange={handleHtmlChange}
              previewData={previewData}
              onVariablesChange={(variables) => {
                // This is handled by the individual variable components now
              }}
            />
          </Card>
        ) : (
          <Alert
            message="No template selected"
            description="Please select a template from the dropdown or create a new one."
            type="info"
            showIcon
          />
        )}
        
        <Alert
          message="Tips for using the email editor"
          description={
            <ul className="list-disc pl-5 mt-2">
              <li>Use the variables from the sidebar to personalize your email</li>
              <li>Add custom variables to extend your template capabilities</li>
              <li>Toggle the Preview button to see how your email will look with sample data</li>
              <li>Click "Full Page Preview" to see your email in a dedicated page</li>
              <li>Export your template to get HTML that works in email clients</li>
              <li>Click Save to store your changes in the database</li>
            </ul>
          }
          type="info"
          showIcon
          icon={<InfoCircleOutlined />}
          className="mb-6"
        />
      </Content>
      
      {/* Delete Confirmation Modal */}
      <Modal
        title="Delete Template"
        open={deleteConfirmVisible}
        onCancel={() => setDeleteConfirmVisible(false)}
        footer={[
          <Button key="cancel" onClick={() => setDeleteConfirmVisible(false)}>
            Cancel
          </Button>,
          <Button 
            key="delete" 
            type="primary" 
            danger
            onClick={handleDeleteTemplate}
          >
            Delete
          </Button>
        ]}
      >
        <p>Are you sure you want to delete the template "{selectedTemplate?.name}"?</p>
        <p>This action cannot be undone.</p>
      </Modal>
    </Layout>
  )
}

export default EmailTemplateManager