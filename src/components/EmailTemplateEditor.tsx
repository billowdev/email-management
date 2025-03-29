"use client"
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Placeholder from '@tiptap/extension-placeholder'
import TextAlign from '@tiptap/extension-text-align'
import Link from '@tiptap/extension-link'
import Image from '@tiptap/extension-image'
import Color from '@tiptap/extension-color'
import TextStyle from '@tiptap/extension-text-style'
import { useState, useEffect, useCallback } from 'react'
import { Node } from '@tiptap/core'
import { PreviewData,TemplateVariable  } from '@/types/email-templates'
import { 
  getVariablesByTemplateId, 
  addVariable, 
  updateVariable, 
  deleteVariable, 
  updatePreviewData 
} from '@/services/emailTemplateService';

// Import Ant Design components
import { Button, Select, Tooltip, Divider, Input, Card, Typography, Space, Tabs, Modal, Form, message } from 'antd'
import type { TabsProps } from 'antd'
import { 
  BoldOutlined, 
  ItalicOutlined, 
  AlignLeftOutlined, 
  AlignCenterOutlined, 
  AlignRightOutlined,
  LinkOutlined,
  EyeOutlined,
  EyeInvisibleOutlined,
  DownloadOutlined,
  FontColorsOutlined,
  OrderedListOutlined,
  UnorderedListOutlined,
  PlusOutlined,
  EditOutlined,
  BgColorsOutlined
} from '@ant-design/icons'
import VariableTabs from './VariableTabsComponent'
import AddVariableComponent from './AddVariableComponent'
import EmailTemplateBackgroundEditor from './EmailTemplateBackgroundEditor'

const { Title, Text } = Typography;
const { Option } = Select;

// Define custom variable node
const Variable = Node.create({
  name: 'variable',
  group: 'inline',
  inline: true,
  atom: true,

  addAttributes() {
    return {
      name: {
        default: '',
      },
    }
  },

  parseHTML() {
    return [
      {
        tag: 'span[data-type="variable"]',
      },
    ]
  },

  renderHTML({ node }) {
    return ['span', { 'data-type': 'variable', class: 'variable bg-blue-100 text-blue-700 px-1 py-0.5 rounded text-sm font-medium' }, `{{.${node.attrs.name}}}`]
  },
})

interface EmailTemplateEditorProps {
  initialContent?: string;
  templateId?: string;
  availableVariables?: string[];
  onHtmlChange?: (html: string) => void;
  previewData?: PreviewData;
  onVariablesChange?: (variables: string[]) => void;
  // onAddVariable: (variableName: string) => Promise<void>;
  // onDeleteVariable: (variableName: string) => Promise<void>;
}

const EmailTemplateEditor: React.FC<EmailTemplateEditorProps> = ({
  initialContent = '',
  templateId = 'default-template',
  availableVariables = ['firstName', 'lastName', 'companyName', 'email'],
  onHtmlChange,
  previewData = {},
  onVariablesChange,
  // onAddVariable,
}) => {
  const [isMounted, setIsMounted] = useState<boolean>(false)
  const [htmlOutput, setHtmlOutput] = useState<string>('')
  const [previewMode, setPreviewMode] = useState<boolean>(false)
  const [localPreviewData, setLocalPreviewData] = useState<PreviewData>(previewData)
  const [variables, setVariables] = useState<string[]>(availableVariables)
  const [isEditModalVisible, setIsEditModalVisible] = useState<boolean>(false)
  const [editingVariable, setEditingVariable] = useState<string>('')
  const [newVariableName, setNewVariableName] = useState<string>('')
  const [form] = Form.useForm();
  const [activeTabKey, setActiveTabKey] = useState<string>('content');

  
  const [variablesLoading, setVariablesLoading] = useState<boolean>(false);
  const [templateVariables, setTemplateVariables] = useState<TemplateVariable[]>([]);

  const editor = useEditor({
    extensions: [
      StarterKit,
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      Placeholder.configure({
        placeholder: 'Type your email template here...',
      }),
      Link.configure({
        openOnClick: false,
      }),
      Image,
      TextStyle,
      Color,
      Variable,
    ],
    content: initialContent,
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      setHtmlOutput(html);
      if (onHtmlChange) {
        onHtmlChange(html);
      }
      localStorage.setItem(`email-template-${templateId}`, html);
    },
  })

  // Load template variables from database if templateId is provided
  useEffect(() => {
    if (templateId && templateId !== 'default-template') {
      setVariablesLoading(true);
      getVariablesByTemplateId(templateId)
        .then(variables => {
          setTemplateVariables(variables.map(variable => ({
            ...variable,
            type: variable.type.toLowerCase() as TemplateVariable['type'],
          })));
          setVariables(variables.map(v => v.key));
          setVariablesLoading(false);
        })
        .catch(error => {
          console.error('Error loading template variables:', error);
          setVariablesLoading(false);
        });
    } else {
      // Use the provided availableVariables if no templateId
      setVariables(availableVariables);
    }
  }, [templateId, availableVariables]);


  // Handle Next.js hydration
  useEffect(() => {
    setIsMounted(true)
    
    // Load saved template if available
    const savedTemplate = localStorage.getItem(`email-template-${templateId}`);
    if (savedTemplate && editor && !initialContent) {
      editor.commands.setContent(savedTemplate);
    }

    // Initialize variables state
    setVariables(availableVariables);
  }, [editor, initialContent, templateId, availableVariables])

  // Update local preview data when prop changes
  useEffect(() => {
    setLocalPreviewData(previewData);
  }, [previewData]);

  // Insert variable at cursor position
  const insertVariable = useCallback((variableName: string) => {
    if (!editor) return;
    
    editor
      .chain()
      .focus()
      .insertContent({
        type: 'variable',
        attrs: { name: variableName },
      })
      .run();
  }, [editor])

  // // Add a new variable
  // const handleAddVariable = (variableName: string) => {
  //   // Check if variable already exists
  //   if (variables.includes(variableName)) {
  //     return;
  //   }
    
  //   // Add the new variable to the list
  //   const updatedVariables = [...variables, variableName];
  //   setVariables(updatedVariables);
    
  //   // Update parent component if needed
  //   if (onVariablesChange) {
  //     onVariablesChange(updatedVariables);
  //   }
    
  //   // Add to preview data
  //   setLocalPreviewData(prev => ({
  //     ...prev,
  //     [variableName]: ''
  //   }));
  // };

    // Add a new variable
    const handleAddVariable = async (variableName: string) => {
      // Check if variable already exists
      if (variables.includes(variableName)) {
        return;
      }
      
      // Add the new variable to the list
      const updatedVariables = [...variables, variableName];
      setVariables(updatedVariables);
      
      // Update parent component if needed
      if (onVariablesChange) {
        onVariablesChange(updatedVariables);
      }
      
      // Add to preview data
      const updatedPreviewData = {
        ...localPreviewData,
        [variableName]: ''
      };
      
      setLocalPreviewData(updatedPreviewData);
      
      // If templateId is provided, save preview data to database
      if (templateId && templateId !== 'default-template') {
        try {
          await updatePreviewData(templateId, updatedPreviewData);
        } catch (error) {
          console.error('Error updating preview data:', error);
          message.error('Failed to update preview data');
        }
      }
    };

  // Show edit modal for a variable
  const showEditModal = (variable: string) => {
    setEditingVariable(variable);
    setNewVariableName(variable);
    setIsEditModalVisible(true);
  };

 // Handle variable rename in the database
 const handleRenameVariable = async () => {
  if (!newVariableName || newVariableName === editingVariable) {
    setIsEditModalVisible(false);
    return;
  }
  
  // Check if new name already exists
  if (variables.includes(newVariableName)) {
    message.error(`Variable ${newVariableName} already exists`);
    return;
  }
  
  // Update the HTML content to replace all instances of the old variable with the new one
  if (editor) {
    const oldPattern = new RegExp(`{{\.${editingVariable}}}`, 'g');
    const newReplacement = `{{.${newVariableName}}}`;
    
    // Get current HTML and replace variable references
    const currentHtml = editor.getHTML();
    const updatedHtml = currentHtml.replace(oldPattern, newReplacement);
    
    // Update editor content
    editor.commands.setContent(updatedHtml);
  }
  
  // If we have a templateId, update the variable in the database
  if (templateId && templateId !== 'default-template') {
    try {
      // Find the variable in templateVariables
      const variableToUpdate = templateVariables.find(v => v.key === editingVariable);
      
      if (variableToUpdate) {
        await updateVariable(templateId, variableToUpdate.id, {
          key: newVariableName,
          name: newVariableName.charAt(0).toUpperCase() + newVariableName.slice(1).replace(/([A-Z])/g, ' $1').trim()
        });
        
        // Update local templateVariables state
        setTemplateVariables(prev => 
          prev.map(v => v.key === editingVariable 
            ? { ...v, key: newVariableName, name: newVariableName.charAt(0).toUpperCase() + newVariableName.slice(1).replace(/([A-Z])/g, ' $1').trim() } 
            : v
          )
        );
      }
    } catch (error) {
      console.error('Error updating variable in database:', error);
      message.error('Failed to update variable in database');
      setIsEditModalVisible(false);
      return;
    }
  }
  
  // Update variables list
  const updatedVariables = variables.map(v => v === editingVariable ? newVariableName : v);
  setVariables(updatedVariables);
  
  // Update parent component if needed
  if (onVariablesChange) {
    onVariablesChange(updatedVariables);
  }
  
  // Update preview data
  const updatedPreviewData = { ...localPreviewData };
  if (editingVariable in updatedPreviewData) {
    updatedPreviewData[newVariableName] = updatedPreviewData[editingVariable];
    delete updatedPreviewData[editingVariable];
    setLocalPreviewData(updatedPreviewData);
    
    // If templateId is provided, save preview data to database
    if (templateId && templateId !== 'default-template') {
      try {
        await updatePreviewData(templateId, updatedPreviewData);
      } catch (error) {
        console.error('Error updating preview data:', error);
        message.error('Failed to update preview data');
      }
    }
  }
  
  setIsEditModalVisible(false);
  message.success(`Variable renamed from ${editingVariable} to ${newVariableName}`);
};
  // Handle variable deletion
  const handleDeleteVariable = async (variableName: string) => {
    // If we have a templateId, delete the variable from the database
    if (templateId && templateId !== 'default-template') {
      try {
        // Find the variable in templateVariables
        const variableToDelete = templateVariables.find(v => v.key === variableName);
        
        if (variableToDelete) {
          await deleteVariable(templateId, variableToDelete.id);
          
          // Update local templateVariables state
          setTemplateVariables(prev => prev.filter(v => v.key !== variableName));
        }
      } catch (error) {
        console.error('Error deleting variable from database:', error);
        message.error('Failed to delete variable from database');
        return;
      }
    }
    
    // Update variables list
    const updatedVariables = variables.filter(v => v !== variableName);
    setVariables(updatedVariables);
    
    // Update parent component if needed
    if (onVariablesChange) {
      onVariablesChange(updatedVariables);
    }
    
    // Update preview data
    const updatedPreviewData = { ...localPreviewData };
    delete updatedPreviewData[variableName];
    setLocalPreviewData(updatedPreviewData);
    
    // If templateId is provided, save preview data to database
    if (templateId && templateId !== 'default-template') {
      try {
        await updatePreviewData(templateId, updatedPreviewData);
      } catch (error) {
        console.error('Error updating preview data:', error);
        message.error('Failed to update preview data');
      }
    }
    
    message.success(`Variable ${variableName} deleted successfully`);
  };

  // FIXED: Generate preview with variables replaced
  const getPreviewHTML = useCallback(() => {
    if (!htmlOutput) return '';
    
    let previewHTML = htmlOutput;
    
    // Replace all variables with their values
    if (localPreviewData && Object.keys(localPreviewData).length > 0) {
      Object.entries(localPreviewData).forEach(([key, value]) => {
        // More robust regex pattern that properly escapes the dot
        const regex = new RegExp(`{{\\s*\\.\\s*${key}\\s*}}`, 'g');
        previewHTML = previewHTML.replace(regex, String(value || ''));
      });
    }
    
    return previewHTML;
  }, [htmlOutput, localPreviewData])

  // Export the template HTML with backgrounds and structure
  const exportTemplate = useCallback(() => {
    // Get current content
    const templateContent = editor?.getHTML() || '';
    
    // Create a DOM parser for proper HTML structure
    const parser = new DOMParser();
    
    // First check if we have a properly structured email template
    // by wrapping the current content in a basic structure
    let exportDoc = parser.parseFromString(`
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
<head>
  <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Email Template</title>
  <style type="text/css">
    body { margin: 0; padding: 0; min-width: 100%; font-family: Arial, sans-serif; }
    .variable { color: #2563eb; font-weight: bold; }
  </style>
</head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #D9D9D9;">
  <div style="width: 100%; margin: 0 auto; background-color: #D9D9D9;">
    <div style="max-width: 650px; margin: 0 auto; background-color: #FFFFFF;">
      <div style="background-color: #33A8DF; padding: 24px 10px; text-align: center;">
        <div style="color: #FFFFFF; font-size: 24px; font-weight: bold; line-height: 150%;">Email Header</div>
      </div>
      <div style="padding: 40px 20px; background-color: #FFFFFF;">
        ${templateContent}
      </div>
      <div style="background-color: #33A8DF; padding: 20px 10px; text-align: center;">
        <div style="color: #FFFFFF; font-size: 16px; line-height: 150%;">© 2025 Company Name. All rights reserved.</div>
      </div>
    </div>
  </div>
</body>
</html>
    `, 'text/html');

    // Check if the current htmlOutput already has our structure
    // If so, use that instead of the default structure
    if (htmlOutput.includes('width: 100%; margin: 0 auto;')) {
      // The current HTML already has structure, use it entirely
      exportDoc = parser.parseFromString(htmlOutput, 'text/html');
    }
    
    // Replace variables with their preview values for export
    if (localPreviewData && Object.keys(localPreviewData).length > 0) {
      const bodyHTML = exportDoc.body.innerHTML;
      let updatedHTML = bodyHTML;
      
      Object.entries(localPreviewData).forEach(([key, value]) => {
        const regex = new RegExp(`{{\\s*\\.\\s*${key}\\s*}}`, 'g');
        updatedHTML = updatedHTML.replace(regex, String(value || ''));
      });
      
      exportDoc.body.innerHTML = updatedHTML;
    }
    
    // Get the complete HTML
    const emailSafeHTML = exportDoc.documentElement.outerHTML;
    
    // Download as HTML file
    const blob = new Blob([emailSafeHTML], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `email-template-${templateId}.html`;
    a.click();
    URL.revokeObjectURL(url);
  }, [editor, templateId, htmlOutput, localPreviewData])

  // Format a variable key to follow conventions
  const formatVariableKey = (input: string) => {
    return input
      .trim()
      .replace(/\s+/g, '')      // Remove spaces
      .replace(/[^a-zA-Z0-9]/g, '') // Remove special characters
      .replace(/^[0-9]/, '')     // Ensure doesn't start with a number
      .replace(/^\w/, c => c.toLowerCase()); // Start with lowercase
  };

  // Style rules for editor
  const editorClassNames = `
    prose max-w-none min-h-[300px] focus:outline-none p-4
  `;

  // Style override for editor content
  useEffect(() => {
    if (editor) {
      // Add custom styles for the variable nodes in the editor
      const style = document.createElement('style');
      style.innerHTML = `
        .ProseMirror .variable {
          background-color: rgba(59, 130, 246, 0.1);
          border-radius: 0.25rem;
          padding: 0.125rem 0.25rem;
          color: rgb(29, 78, 216);
          font-weight: 500;
          white-space: nowrap;
        }
        .ProseMirror p.is-editor-empty:first-child::before {
          content: attr(data-placeholder);
          float: left;
          color: #9ca3af;
          pointer-events: none;
          height: 0;
        }
        .ProseMirror {
          min-height: 300px;
          padding: 1rem;
          border-radius: 0.375rem;
        }
        .ant-tabs-content {
          height: 100%;
        }
      `;
      document.head.appendChild(style);
      
      return () => {
        document.head.removeChild(style);
      };
    }
  }, [editor]);

  // Define Editor Toolbar
  const EditorToolbar = () => (
    <div className="bg-white border-b mb-4 pb-4">
      <Space direction="horizontal" className="flex flex-wrap gap-2">
        <Space>
          <Tooltip title="Bold">
            <Button 
              type={editor?.isActive('bold') ? 'primary' : 'default'}
              icon={<BoldOutlined />} 
              onClick={() => editor?.chain().focus().toggleBold().run()}
              disabled={previewMode}
            />
          </Tooltip>
          <Tooltip title="Italic">
            <Button 
              type={editor?.isActive('italic') ? 'primary' : 'default'}
              icon={<ItalicOutlined />} 
              onClick={() => editor?.chain().focus().toggleItalic().run()}
              disabled={previewMode}
            />
          </Tooltip>
          <Tooltip title="Heading">
            <Button 
              type={editor?.isActive('heading', { level: 2 }) ? 'primary' : 'default'}
              onClick={() => editor?.chain().focus().toggleHeading({ level: 2 }).run()}
              disabled={previewMode}
            >
              H2
            </Button>
          </Tooltip>
        </Space>
        
        <Divider type="vertical" className="h-8" />
        
        <Space>
          <Tooltip title="Align Left">
            <Button 
              type={editor?.isActive({ textAlign: 'left' }) ? 'primary' : 'default'}
              icon={<AlignLeftOutlined />} 
              onClick={() => editor?.chain().focus().setTextAlign('left').run()}
              disabled={previewMode}
            />
          </Tooltip>
          <Tooltip title="Align Center">
            <Button 
              type={editor?.isActive({ textAlign: 'center' }) ? 'primary' : 'default'}
              icon={<AlignCenterOutlined />} 
              onClick={() => editor?.chain().focus().setTextAlign('center').run()}
              disabled={previewMode}
            />
          </Tooltip>
          <Tooltip title="Align Right">
            <Button 
              type={editor?.isActive({ textAlign: 'right' }) ? 'primary' : 'default'}
              icon={<AlignRightOutlined />} 
              onClick={() => editor?.chain().focus().setTextAlign('right').run()}
              disabled={previewMode}
            />
          </Tooltip>
        </Space>
        
        <Divider type="vertical" className="h-8" />
        
        <Space>
          <Tooltip title="Ordered List">
            <Button 
              type={editor?.isActive('orderedList') ? 'primary' : 'default'}
              icon={<OrderedListOutlined />} 
              onClick={() => editor?.chain().focus().toggleOrderedList().run()}
              disabled={previewMode}
            />
          </Tooltip>
          <Tooltip title="Bullet List">
            <Button 
              type={editor?.isActive('bulletList') ? 'primary' : 'default'}
              icon={<UnorderedListOutlined />} 
              onClick={() => editor?.chain().focus().toggleBulletList().run()}
              disabled={previewMode}
            />
          </Tooltip>
        </Space>
        
        <Divider type="vertical" className="h-8" />
        
        <Space>
          <Select
            placeholder="Text Color"
            style={{ width: 120 }}
            value={editor?.getAttributes('textStyle').color || '#000000'}
            onChange={(value: string) => {
              editor?.chain().focus().setColor(value).run();
            }}
            popupMatchSelectWidth={false}
            disabled={previewMode}
          >
            <Option value="#000000">
              <Space>
                <span className="inline-block w-4 h-4 bg-black rounded-sm"></span>
                Black
              </Space>
            </Option>
            <Option value="#2563eb">
              <Space>
                <span className="inline-block w-4 h-4 bg-blue-600 rounded-sm"></span>
                Blue
              </Space>
            </Option>
            <Option value="#059669">
              <Space>
                <span className="inline-block w-4 h-4 bg-green-600 rounded-sm"></span>
                Green
              </Space>
            </Option>
            <Option value="#dc2626">
              <Space>
                <span className="inline-block w-4 h-4 bg-red-600 rounded-sm"></span>
                Red
              </Space>
            </Option>
            <Option value="#7c3aed">
              <Space>
                <span className="inline-block w-4 h-4 bg-purple-600 rounded-sm"></span>
                Purple
              </Space>
            </Option>
          </Select>
          
          <Tooltip title="Add Link">
            <Button 
              type={editor?.isActive('link') ? 'primary' : 'default'}
              icon={<LinkOutlined />} 
              onClick={() => {
                const url = window.prompt('Enter the URL:');
                if (url) {
                  editor?.chain().focus().setLink({ href: url }).run();
                }
              }}
              disabled={previewMode}
            />
          </Tooltip>
        </Space>
        
        <div className="ml-auto">
          <Space>
            <Tooltip title={previewMode ? "Edit Mode" : "Preview Mode"}>
              <Button 
                type={previewMode ? 'primary' : 'default'}
                icon={previewMode ? <EyeInvisibleOutlined /> : <EyeOutlined />}
                onClick={() => setPreviewMode(!previewMode)}
              >
                {previewMode ? 'Edit' : 'Preview'}
              </Button>
            </Tooltip>
            <Button 
              type="primary" 
              icon={<DownloadOutlined />}
              onClick={exportTemplate}
            >
              Export
            </Button>
          </Space>
        </div>
      </Space>
    </div>
  );

  // Define tabs for the editor
  const tabItems: TabsProps['items'] = [
    {
      key: 'content',
      label: (
        <span>
          <EditOutlined /> Content
        </span>
      ),
      children: (
        <>
          {/* Editor Toolbar */}
          <EditorToolbar />
          
          {/* Main Editor Area */}
          <div className="flex flex-col lg:flex-row">
            <div className="w-full lg:w-3/4 mb-4 lg:mb-0 lg:pr-4">
              <Card 
                className="h-full shadow-sm" 
                styles={{ body: { padding: 0, height: '100%' } }}
              >
                {previewMode ? (
                  <div 
                    className="p-6 min-h-[400px] prose max-w-none h-full overflow-auto"
                    dangerouslySetInnerHTML={{ __html: getPreviewHTML() }}
                  />
                ) : (
                  <EditorContent editor={editor} className={editorClassNames} />
                )}
              </Card>
            </div>
            
            <div className="w-full lg:w-1/4">
              <Card className="h-full shadow-sm">
                {/* Variable Management Section */}
                <div className="mb-4">
                  <div className="flex justify-between items-center mb-2">
                    <Text strong>Email Variables</Text>
                    <AddVariableComponent 
                      existingVariables={variables}
                      onAddVariable={handleAddVariable}
                    />
                  </div>
                  <div className="flex flex-wrap gap-2 max-h-[150px] overflow-auto border p-2 rounded-md">
                    {variables.map((variable) => (
                      <Button
                        key={variable}
                        type="text"
                        size="small"
                        className="flex items-center bg-blue-50 text-blue-700 rounded hover:bg-blue-100 mb-1"
                        onClick={() => insertVariable(variable)}
                        disabled={previewMode}
                      >
                        <span className="mr-1">{`{{.${variable}}}`}</span>
                        <Tooltip title="Edit variable name">
                          <EditOutlined
                            className="text-xs cursor-pointer"
                            onClick={(e) => {
                              e.stopPropagation();
                              showEditModal(variable);
                            }}
                          />
                        </Tooltip>
                      </Button>
                    ))}
                  </div>
                </div>
                
                <Divider />
                
                <VariableTabs 
                  availableVariables={variables}
                  insertVariable={insertVariable}
                  previewMode={previewMode}
                  localPreviewData={localPreviewData}
                  setLocalPreviewData={setLocalPreviewData}
                />
              </Card>
            </div>
          </div>
        </>
      ),
    },
    {
      key: 'preview',
      label: (
        <span>
          <EyeOutlined /> Preview & Layout
        </span>
      ),
      children: (
        <>
          <EmailTemplateBackgroundEditor
            currentHtml={htmlOutput || initialContent}
            templateId={templateId}
            onHtmlChange={(html) => {
              if (editor) {
                editor.commands.setContent(html);
              }
              if (onHtmlChange) {
                onHtmlChange(html);
              }
              setHtmlOutput(html);
            }}
          />
        </>
      ),
    },
  ];

  if (!isMounted) {
    return null;
  }

  return (
    <Card className="shadow-lg rounded-lg border-0">
      <Tabs 
        activeKey={activeTabKey} 
        onChange={setActiveTabKey}
        items={tabItems}
        className="email-template-editor-tabs"
      />
      
      {/* Edit Variable Modal */}
      <Modal
        title="Edit Variable"
        open={isEditModalVisible}
        onCancel={() => setIsEditModalVisible(false)}
        onOk={handleRenameVariable}
        okText="Update"
      >
        <Form
          layout="vertical"
          initialValues={{ variableName: editingVariable }}
        >
          <Form.Item
            label="Variable Name"
            name="variableName"
            help="Changing this will update all occurrences in the template"
          >
            <Input 
              value={newVariableName}
              onChange={(e) => setNewVariableName(formatVariableKey(e.target.value))}
              placeholder="e.g. firstName, companyName"
            />
          </Form.Item>
          
          <div className="bg-gray-50 p-2 rounded">
            <Text type="secondary">
              Current: <code className="bg-blue-50 text-blue-700 px-1">{`{{.${editingVariable}}}`}</code>
            </Text>
            <br />
            <Text type="secondary">
              New: <code className="bg-blue-50 text-blue-700 px-1">{`{{.${newVariableName}}}`}</code>
            </Text>
          </div>
        </Form>
      </Modal>
    </Card>
  )
}

export default EmailTemplateEditor