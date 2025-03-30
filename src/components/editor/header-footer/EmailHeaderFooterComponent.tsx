// src/components/editor/EmailHeaderFooterComponent.tsx
import React, { useState, useEffect } from 'react';
import { Card, Typography, Tabs, Collapse, Form, Input, ColorPicker, Switch, Button, message, Space, Select } from 'antd';
import { EditOutlined, SaveOutlined, UndoOutlined } from '@ant-design/icons';
import { 
  getTemplateHeaderFooter, 
  updateTemplateHeaderFooter 
} from '@/services/emailTemplateService';

const { Title, Text } = Typography;
const { Panel } = Collapse;
const { TextArea } = Input;
const { Option } = Select;

interface HeaderFooterSettings {
  // Header settings
  headerEnabled: boolean;
  headerContent: string;
  headerTextColor: string;
  headerLogo?: string;
  headerLogoAlignment: 'left' | 'center' | 'right';
  headerLogoWidth: number;
  
  // Footer settings
  footerEnabled: boolean;
  footerContent: string;
  footerTextColor: string;
  footerShowSocialIcons: boolean;
  footerSocialLinks: {
    platform: string;
    url: string;
    enabled: boolean;
  }[];
  footerShowUnsubscribe: boolean;
  footerUnsubscribeText: string;
  footerUnsubscribeUrl: string;
  footerShowAddress: boolean;
  footerAddress: string;
  footerCopyrightText: string;
}

interface EmailHeaderFooterComponentProps {
  templateId: string;
  onHeaderFooterChange?: (settings: HeaderFooterSettings) => void;
}

const defaultHeaderFooterSettings: HeaderFooterSettings = {
  // Header defaults
  headerEnabled: true,
  headerContent: 'Company Name',
  headerTextColor: '#FFFFFF',
  headerLogo: '',
  headerLogoAlignment: 'center',
  headerLogoWidth: 200,
  
  // Footer defaults
  footerEnabled: true,
  footerContent: '',
  footerTextColor: '#FFFFFF',
  footerShowSocialIcons: true,
  footerSocialLinks: [
    { platform: 'facebook', url: 'https://facebook.com/', enabled: true },
    { platform: 'twitter', url: 'https://twitter.com/', enabled: true },
    { platform: 'instagram', url: 'https://instagram.com/', enabled: true },
    { platform: 'linkedin', url: 'https://linkedin.com/', enabled: false }
  ],
  footerShowUnsubscribe: true,
  footerUnsubscribeText: 'Unsubscribe',
  footerUnsubscribeUrl: '{{.unsubscribeUrl}}',
  footerShowAddress: true,
  footerAddress: '123 Main St, City, State 12345',
  footerCopyrightText: `© ${new Date().getFullYear()} Company Name. All Rights Reserved.`
};

const EmailHeaderFooterComponent: React.FC<EmailHeaderFooterComponentProps> = ({
  templateId,
  onHeaderFooterChange
}) => {
  const [form] = Form.useForm();
  const [settings, setSettings] = useState<HeaderFooterSettings>(defaultHeaderFooterSettings);
  const [loading, setLoading] = useState<boolean>(false);
  const [saving, setSaving] = useState<boolean>(false);
  const [hasChanges, setHasChanges] = useState<boolean>(false);
  
  // Load settings when templateId changes
  useEffect(() => {
    if (templateId) {
      loadHeaderFooterSettings();
    }
  }, [templateId]);
  
  // Load header/footer settings from the database
  const loadHeaderFooterSettings = async () => {
    try {
      setLoading(true);
      
      // Get settings from API
      const data = await getTemplateHeaderFooter(templateId);
      
      if (data) {
        // Update settings
        setSettings(data);
        form.setFieldsValue(data);
      } else {
        // Use defaults if no settings are found
        setSettings(defaultHeaderFooterSettings);
        form.setFieldsValue(defaultHeaderFooterSettings);
      }
      
      setLoading(false);
      setHasChanges(false);
    } catch (error) {
      console.error('Error loading header/footer settings:', error);
      message.error('Failed to load header and footer settings');
      setLoading(false);
    }
  };
  
  // Save header/footer settings to the database
  const saveHeaderFooterSettings = async () => {
    try {
      setSaving(true);
      
      // Get form values
      const values = await form.validateFields();
      
      // Update settings in database
      await updateTemplateHeaderFooter(templateId, values);
      
      // Update local state
      setSettings(values);
      
      // Notify parent component
      if (onHeaderFooterChange) {
        onHeaderFooterChange(values);
      }
      
      message.success('Header and footer settings saved successfully');
      setSaving(false);
      setHasChanges(false);
    } catch (error) {
      console.error('Error saving header/footer settings:', error);
      message.error('Failed to save header and footer settings');
      setSaving(false);
    }
  };
  
  // Reset to the last saved settings
  const resetSettings = () => {
    form.setFieldsValue(settings);
    setHasChanges(false);
  };
  
  // Handle form field changes
  const handleFormChange = () => {
    setHasChanges(true);
    
    // Get current values (this won't throw validation errors)
    const currentValues = form.getFieldsValue(true);
    
    // Notify parent component of changes
    if (onHeaderFooterChange) {
      onHeaderFooterChange(currentValues);
    }
  };
  
  return (
    <Card className="shadow-lg rounded-lg border-0 mb-6">
      <div className="flex justify-between items-center mb-4">
        <Title level={4} className="mb-0">Email Header & Footer</Title>
        <Space>
          <Button 
            icon={<UndoOutlined />} 
            onClick={resetSettings}
            disabled={!hasChanges || loading || saving}
          >
            Reset
          </Button>
          <Button 
            type="primary" 
            icon={<SaveOutlined />} 
            onClick={saveHeaderFooterSettings}
            loading={saving}
            disabled={!hasChanges || loading}
          >
            Save Changes
          </Button>
        </Space>
      </div>
      
      <Text className="mb-4 block">
        Customize the header and footer of your email template. These settings will be applied to all exports.
      </Text>
      
      <Form
        form={form}
        layout="vertical"
        initialValues={settings}
        onValuesChange={handleFormChange}
        disabled={loading || saving}
      >
        <Collapse defaultActiveKey={['header', 'footer']} className="mb-4">
          {/* Header Settings */}
          <Panel header="Header Settings" key="header">
            <Form.Item name="headerEnabled" valuePropName="checked">
              <Switch checkedChildren="Enabled" unCheckedChildren="Disabled" />
            </Form.Item>
            
            <Form.Item
              noStyle
              shouldUpdate={(prevValues, currentValues) => prevValues.headerEnabled !== currentValues.headerEnabled}
            >
              {({ getFieldValue }) => getFieldValue('headerEnabled') && (
                <>
                  <Form.Item 
                    label="Header Content" 
                    name="headerContent"
                    tooltip="Text or HTML to display in the header. Use variables like {{.companyName}}."
                  >
                    <TextArea 
                      rows={2}
                      placeholder="Company name or headline"
                    />
                  </Form.Item>
                  
                  <Form.Item label="Text Color" name="headerTextColor">
                    <ColorPicker />
                  </Form.Item>
                  
                  <Form.Item label="Logo URL" name="headerLogo">
                    <Input placeholder="https://example.com/logo.png" />
                  </Form.Item>
                  
                  <Form.Item
                    noStyle
                    shouldUpdate={(prevValues, currentValues) => 
                      prevValues.headerLogo !== currentValues.headerLogo
                    }
                  >
                    {({ getFieldValue }) => {
                      const logoUrl = getFieldValue('headerLogo');
                      return logoUrl && (
                        <div className="mb-4">
                          <div className="mt-2 p-2 bg-gray-50 rounded">
                            <p className="text-sm text-gray-500 mb-2">Logo Preview:</p>
                            <img 
                              src={logoUrl} 
                              alt="Logo Preview" 
                              style={{ maxWidth: '100%', maxHeight: '100px' }}
                              onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjUwIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iNTAiIGZpbGw9IiNkZGQiLz48dGV4dCB4PSI1MCUiIHk9IjUwJSIgZm9udC1zaXplPSIxMiIgdGV4dC1hbmNob3I9Im1pZGRsZSIgYWxpZ25tZW50LWJhc2VsaW5lPSJtaWRkbGUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZmlsbD0iIzY2NiI+SW1hZ2UgTm90IEZvdW5kPC90ZXh0Pjwvc3ZnPg==';
                              }}
                            />
                          </div>
                        </div>
                      );
                    }}
                  </Form.Item>
                  
                  <Form.Item label="Logo Alignment" name="headerLogoAlignment">
                    <Select>
                      <Option value="left">Left</Option>
                      <Option value="center">Center</Option>
                      <Option value="right">Right</Option>
                    </Select>
                  </Form.Item>
                  
                  <Form.Item label="Logo Width (px)" name="headerLogoWidth">
                    <Input type="number" min={50} max={600} />
                  </Form.Item>
                </>
              )}
            </Form.Item>
          </Panel>
          
          {/* Footer Settings */}
          <Panel header="Footer Settings" key="footer">
            <Form.Item name="footerEnabled" valuePropName="checked">
              <Switch checkedChildren="Enabled" unCheckedChildren="Disabled" />
            </Form.Item>
            
            <Form.Item
              noStyle
              shouldUpdate={(prevValues, currentValues) => prevValues.footerEnabled !== currentValues.footerEnabled}
            >
              {({ getFieldValue }) => getFieldValue('footerEnabled') && (
                <>
                  <Form.Item 
                    label="Footer Content" 
                    name="footerContent"
                    tooltip="Additional custom content for the footer"
                  >
                    <TextArea 
                      rows={2}
                      placeholder="Optional custom footer content"
                    />
                  </Form.Item>
                  
                  <Form.Item label="Text Color" name="footerTextColor">
                    <ColorPicker />
                  </Form.Item>
                  
                  <Form.Item label="Show Social Icons" name="footerShowSocialIcons" valuePropName="checked">
                    <Switch />
                  </Form.Item>
                  
                  <Form.Item
                    noStyle
                    shouldUpdate={(prevValues, currentValues) => 
                      prevValues.footerShowSocialIcons !== currentValues.footerShowSocialIcons
                    }
                  >
                    {({ getFieldValue }) => getFieldValue('footerShowSocialIcons') && (
                      <div className="ml-6 mb-4 p-3 border border-gray-200 rounded">
                        <Text strong className="block mb-2">Social Links</Text>
                        
                        <Form.List name="footerSocialLinks">
                          {(fields, { add, remove }) => (
                            <>
                              {fields.map(field => (
                                <div key={field.key} className="flex mb-2 items-center">
                                  <Form.Item
                                    {...field}
                                    name={[field.name, 'enabled']}
                                    valuePropName="checked"
                                    className="mb-0 mr-2"
                                  >
                                    <Switch size="small" />
                                  </Form.Item>
                                  
                                  <Form.Item
                                    {...field}
                                    name={[field.name, 'platform']}
                                    className="mb-0 mr-2 w-24"
                                  >
                                    <Select size="small">
                                      <Option value="facebook">Facebook</Option>
                                      <Option value="twitter">Twitter</Option>
                                      <Option value="instagram">Instagram</Option>
                                      <Option value="linkedin">LinkedIn</Option>
                                      <Option value="youtube">YouTube</Option>
                                    </Select>
                                  </Form.Item>
                                  
                                  <Form.Item
                                    {...field}
                                    name={[field.name, 'url']}
                                    className="mb-0 flex-1"
                                  >
                                    <Input size="small" placeholder="https://" />
                                  </Form.Item>
                                </div>
                              ))}
                              
                              <Form.Item>
                                <Button 
                                  type="dashed" 
                                  onClick={() => add({ platform: 'facebook', url: '', enabled: true })} 
                                  block
                                >
                                  + Add Social Link
                                </Button>
                              </Form.Item>
                            </>
                          )}
                        </Form.List>
                      </div>
                    )}
                  </Form.Item>
                  
                  <Form.Item label="Show Unsubscribe Link" name="footerShowUnsubscribe" valuePropName="checked">
                    <Switch />
                  </Form.Item>
                  
                  <Form.Item
                    noStyle
                    shouldUpdate={(prevValues, currentValues) => 
                      prevValues.footerShowUnsubscribe !== currentValues.footerShowUnsubscribe
                    }
                  >
                    {({ getFieldValue }) => getFieldValue('footerShowUnsubscribe') && (
                      <div className="ml-6 mb-4 p-3 border border-gray-200 rounded">
                        <Form.Item label="Unsubscribe Text" name="footerUnsubscribeText">
                          <Input placeholder="Unsubscribe" />
                        </Form.Item>
                        
                        <Form.Item 
                          label="Unsubscribe URL" 
                          name="footerUnsubscribeUrl"
                          tooltip="Use the variable {{.unsubscribeUrl}} for personalized links"
                        >
                          <Input placeholder="https://example.com/unsubscribe?email={{.email}}" />
                        </Form.Item>
                      </div>
                    )}
                  </Form.Item>
                  
                  <Form.Item label="Show Address" name="footerShowAddress" valuePropName="checked">
                    <Switch />
                  </Form.Item>
                  
                  <Form.Item
                    noStyle
                    shouldUpdate={(prevValues, currentValues) => 
                      prevValues.footerShowAddress !== currentValues.footerShowAddress
                    }
                  >
                    {({ getFieldValue }) => getFieldValue('footerShowAddress') && (
                      <Form.Item label="Company Address" name="footerAddress">
                        <TextArea 
                          rows={2}
                          placeholder="Company address and contact information"
                        />
                      </Form.Item>
                    )}
                  </Form.Item>
                  
                  <Form.Item label="Copyright Text" name="footerCopyrightText">
                    <Input placeholder={`© ${new Date().getFullYear()} Company Name. All Rights Reserved.`} />
                  </Form.Item>
                </>
              )}
            </Form.Item>
          </Panel>
        </Collapse>
        
        <div className="mt-4 p-4 bg-gray-50 rounded">
          <Title level={5}>Preview</Title>
          <div className="border rounded bg-white overflow-hidden">
            {/* Header Preview */}
            {form.getFieldValue('headerEnabled') && (
              <div 
                style={{ 
                  backgroundColor: form.getFieldValue('headerTextColor') === '#FFFFFF' ? '#33A8DF' : '#F5F5F5',
                  padding: '24px 20px',
                  textAlign: 'center'
                }}
              >
                {form.getFieldValue('headerLogo') ? (
                  <div style={{ 
                    textAlign: form.getFieldValue('headerLogoAlignment'),
                    marginBottom: form.getFieldValue('headerContent') ? '10px' : '0'
                  }}>
                    <img 
                      src={form.getFieldValue('headerLogo')} 
                      alt="Logo"
                      style={{ 
                        maxWidth: `${form.getFieldValue('headerLogoWidth')}px`,
                        maxHeight: '80px'
                      }}
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjUwIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iNTAiIGZpbGw9IiNkZGQiLz48dGV4dCB4PSI1MCUiIHk9IjUwJSIgZm9udC1zaXplPSIxMiIgdGV4dC1hbmNob3I9Im1pZGRsZSIgYWxpZ25tZW50LWJhc2VsaW5lPSJtaWRkbGUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZmlsbD0iIzY2NiI+SW1hZ2UgTm90IEZvdW5kPC90ZXh0Pjwvc3ZnPg==';
                      }}
                    />
                  </div>
                ) : null}
                
                {form.getFieldValue('headerContent') && (
                  <div 
                    style={{ 
                      color: form.getFieldValue('headerTextColor'),
                      fontSize: '22px',
                      fontWeight: 'bold'
                    }}
                  >
                    {form.getFieldValue('headerContent')}
                  </div>
                )}
              </div>
            )}
            
            {/* Content Placeholder */}
            <div style={{ padding: '30px 20px', minHeight: '100px', backgroundColor: '#FFFFFF' }}>
              <div className="h-24 flex items-center justify-center bg-gray-50 rounded border border-dashed border-gray-300">
                <Text type="secondary">Email Content Area</Text>
              </div>
            </div>
            
            {/* Footer Preview */}
            {form.getFieldValue('footerEnabled') && (
              <div 
                style={{ 
                  backgroundColor: form.getFieldValue('footerTextColor') === '#FFFFFF' ? '#33A8DF' : '#F5F5F5',
                  padding: '20px',
                  textAlign: 'center',
                  fontSize: '14px',
                  color: form.getFieldValue('footerTextColor')
                }}
              >
                {form.getFieldValue('footerContent') && (
                  <div style={{ marginBottom: '15px' }}>
                    {form.getFieldValue('footerContent')}
                  </div>
                )}
                
                {form.getFieldValue('footerShowSocialIcons') && (
                  <div style={{ marginBottom: '15px' }}>
                    {(form.getFieldValue('footerSocialLinks') || [])
                      .filter((link: any) => link.enabled)
                      .map((link: any, index: number) => (
                        <span 
                          key={index} 
                          style={{ 
                            display: 'inline-block', 
                            margin: '0 10px',
                            width: '24px',
                            height: '24px',
                            backgroundColor: '#FFFFFF',
                            borderRadius: '50%',
                            textAlign: 'center',
                            lineHeight: '24px'
                          }}
                        >
                          {link.platform.charAt(0).toUpperCase()}
                        </span>
                      ))
                    }
                  </div>
                )}
                
                {form.getFieldValue('footerShowAddress') && form.getFieldValue('footerAddress') && (
                  <div style={{ marginBottom: '10px', fontSize: '12px' }}>
                    {form.getFieldValue('footerAddress')}
                  </div>
                )}
                
                {form.getFieldValue('footerShowUnsubscribe') && (
                  <div style={{ marginBottom: '10px', fontSize: '12px' }}>
                    <a 
                      href="#" 
                      style={{ 
                        color: form.getFieldValue('footerTextColor'),
                        textDecoration: 'underline'
                      }}
                    >
                      {form.getFieldValue('footerUnsubscribeText')}
                    </a>
                  </div>
                )}
                
                <div style={{ fontSize: '12px' }}>
                  {form.getFieldValue('footerCopyrightText')}
                </div>
              </div>
            )}
          </div>
          <Text className="text-xs text-gray-500 block mt-2">
            This is a preview of your header and footer. Actual appearance may vary depending on email clients.
          </Text>
        </div>
      </Form>
    </Card>
  );
};

export default EmailHeaderFooterComponent;