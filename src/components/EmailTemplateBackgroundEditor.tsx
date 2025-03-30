"use client"
import React, { useState, useEffect } from 'react';
import { Card, Typography, Tabs, Space, Collapse, ColorPicker, Input, Button, message, Spin } from 'antd';
import type { TabsProps } from 'antd';
import type { Color } from 'antd/es/color-picker';
import { 
  BgColorsOutlined, 
  BorderOutlined, 
  LayoutOutlined, 
  SaveOutlined,
  UndoOutlined,
  LoadingOutlined,
  EditOutlined
} from '@ant-design/icons';
import { BackgroundSettings, DEFAULT_BACKGROUND_SETTINGS } from '@/types/email-templates';
import { getTemplateBackground, saveTemplateBackground } from '@/services/emailBackgroundService';
import { getTemplateHeaderFooter, updateTemplateHeaderFooter, applyHeaderFooterToContent } from '@/services/emailTemplateService';
import LoaderComponent from './LoaderComponent';
import EmailHeaderFooterComponent from './EmailHeaderFooterComponent';

const { Title, Text } = Typography;
const { Panel } = Collapse;
const { TabPane } = Tabs;

interface EmailTemplateBackgroundEditorProps {
  currentHtml: string;
  onHtmlChange: (html: string) => void;
  templateId: string;
}

const EmailTemplateBackgroundEditor: React.FC<EmailTemplateBackgroundEditorProps> = ({
  currentHtml,
  onHtmlChange,
  templateId
}) => {
  const [activeTab, setActiveTab] = useState<string>('background');
  const [settings, setSettings] = useState<BackgroundSettings>(DEFAULT_BACKGROUND_SETTINGS);
  const [lastSavedSettings, setLastSavedSettings] = useState<BackgroundSettings>(DEFAULT_BACKGROUND_SETTINGS);
  const [previewHtml, setPreviewHtml] = useState<string>(currentHtml);
  const [loading, setLoading] = useState<boolean>(false);
  const [saveLoading, setSaveLoading] = useState<boolean>(false);
  const [headerFooterLoading, setHeaderFooterLoading] = useState<boolean>(false);
  const [headerFooterSettings, setHeaderFooterSettings] = useState<any>(null);

  // Load background settings from the database
  useEffect(() => {
    if (templateId) {
      setLoading(true);
      
      // Load background settings
      getTemplateBackground(templateId)
        .then(data => {
          if (data) {
            setSettings(data);
            setLastSavedSettings(data);
          } else {
            // No settings found, parse from HTML
            parseExistingHtml(currentHtml);
          }
          setLoading(false);
        })
        .catch(error => {
          console.error('Error loading background settings:', error);
          // Fallback to parsing HTML
          parseExistingHtml(currentHtml);
          setLoading(false);
        });
      
      // Load header/footer settings
      setHeaderFooterLoading(true);
      getTemplateHeaderFooter(templateId)
        .then(data => {
          if (data) {
            setHeaderFooterSettings(data);
          }
          setHeaderFooterLoading(false);
        })
        .catch(error => {
          console.error('Error loading header/footer settings:', error);
          setHeaderFooterLoading(false);
        });
    } else {
      // No template ID, parse from HTML
      parseExistingHtml(currentHtml);
    }
  }, [templateId]);

  // Update preview when settings change
  useEffect(() => {
    updatePreview();
  }, [settings, currentHtml, headerFooterSettings]);

  const parseExistingHtml = (html: string) => {
    try {
      // Create a DOM parser
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, 'text/html');
      
      // Try to extract background colors from the HTML
      let extractedSettings: Partial<BackgroundSettings> = {};
      
      // Body background color
      const bodyStyle = doc.body.getAttribute('style');
      if (bodyStyle) {
        const bodyBgMatch = bodyStyle.match(/background-color:\s*([^;]+)/i);
        if (bodyBgMatch) {
          extractedSettings.bodyBgColor = bodyBgMatch[1].trim();
        }
      }
      
      // Container div (typically the main wrapper)
      const mainContainers = doc.querySelectorAll('div[style*="margin: 0 auto"]');
      if (mainContainers.length > 0) {
        for (let i = 0; i < mainContainers.length; i++) {
          const container = mainContainers[i];
          const style = container.getAttribute('style') || '';
          
          // Check if it's the main wrapper
          if (style.includes('max-width')) {
            const bgMatch = style.match(/background-color:\s*([^;]+)/i);
            if (bgMatch) {
              extractedSettings.containerBgColor = bgMatch[1].trim();
            }
            
            const widthMatch = style.match(/max-width:\s*([^;]+)/i);
            if (widthMatch) {
              extractedSettings.maxWidth = widthMatch[1].trim();
            }
          }
        }
      }
      
      // Header background (typically first colored div)
      const possibleHeaders = doc.querySelectorAll('div[style*="background-color"]');
      if (possibleHeaders.length > 0) {
        const headerStyle = possibleHeaders[0].getAttribute('style') || '';
        const bgMatch = headerStyle.match(/background-color:\s*([^;]+)/i);
        if (bgMatch) {
          extractedSettings.headerBgColor = bgMatch[1].trim();
        }
      }
      
      // Footer (typically last colored div)
      if (possibleHeaders.length > 1) {
        const footerStyle = possibleHeaders[possibleHeaders.length - 1].getAttribute('style') || '';
        const bgMatch = footerStyle.match(/background-color:\s*([^;]+)/i);
        if (bgMatch) {
          extractedSettings.footerBgColor = bgMatch[1].trim();
        }
      }
      
      // Content background (typically middle section)
      const contentDivs = doc.querySelectorAll('div[style*="padding"]');
      for (let i = 0; i < contentDivs.length; i++) {
        const style = contentDivs[i].getAttribute('style') || '';
        if (style.includes('padding') && style.includes('background-color')) {
          const bgMatch = style.match(/background-color:\s*([^;]+)/i);
          if (bgMatch) {
            extractedSettings.contentBgColor = bgMatch[1].trim();
            break;
          }
        }
      }
      
      // Update settings with extracted values, falling back to defaults
      const updatedSettings = {
        bodyBgColor: extractedSettings.bodyBgColor || DEFAULT_BACKGROUND_SETTINGS.bodyBgColor,
        containerBgColor: extractedSettings.containerBgColor || DEFAULT_BACKGROUND_SETTINGS.containerBgColor,
        headerBgColor: extractedSettings.headerBgColor || DEFAULT_BACKGROUND_SETTINGS.headerBgColor,
        contentBgColor: extractedSettings.contentBgColor || DEFAULT_BACKGROUND_SETTINGS.contentBgColor,
        footerBgColor: extractedSettings.footerBgColor || DEFAULT_BACKGROUND_SETTINGS.footerBgColor,
        maxWidth: extractedSettings.maxWidth || DEFAULT_BACKGROUND_SETTINGS.maxWidth
      };
      
      setSettings(updatedSettings);
      setLastSavedSettings(updatedSettings);
      
    } catch (error) {
      console.error('Error parsing existing HTML:', error);
      // Fall back to default settings
      setSettings(DEFAULT_BACKGROUND_SETTINGS);
      setLastSavedSettings(DEFAULT_BACKGROUND_SETTINGS);
    }
  };

  const updatePreview = async () => {
    try {
      // Create a DOM parser
      const parser = new DOMParser();
      const doc = parser.parseFromString(currentHtml, 'text/html');
      
      // Check if we need to create the email structure
      const needsStructure = !doc.querySelector('body > div[style*="margin: 0 auto"]');
      
      if (needsStructure) {
        // The current HTML doesn't have our email structure, we need to build it
        const emailContent = doc.body.innerHTML;
        
        // Clear the body
        doc.body.innerHTML = '';
        
        // Create the email structure
        const bodyStyles = `margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: ${settings.bodyBgColor};`;
        doc.body.setAttribute('style', bodyStyles);
        
        // Create the outer container
        const outerContainer = doc.createElement('div');
        outerContainer.setAttribute('style', `width: 100%; margin: 0 auto; background-color: ${settings.bodyBgColor};`);
        
        // Create the inner container
        const innerContainer = doc.createElement('div');
        innerContainer.setAttribute('style', `max-width: ${settings.maxWidth}; margin: 0 auto; background-color: ${settings.containerBgColor};`);
        
        // Create the header
        const header = doc.createElement('div');
        header.setAttribute('style', `background-color: ${settings.headerBgColor}; padding: 24px 10px; text-align: center;`);
        header.innerHTML = '<div style="color: #FFFFFF; font-size: 24px; font-weight: bold; line-height: 150%;">Email Header</div>';
        
        // Create the content section
        const content = doc.createElement('div');
        content.setAttribute('style', `padding: 40px 20px; background-color: ${settings.contentBgColor};`);
        content.innerHTML = emailContent;
        
        // Create the footer
        const footer = doc.createElement('div');
        footer.setAttribute('style', `background-color: ${settings.footerBgColor}; padding: 20px 10px; text-align: center;`);
        footer.innerHTML = '<div style="color: #FFFFFF; font-size: 16px; line-height: 150%;">© 2025 Company Name. All rights reserved.</div>';
        
        // Assemble the structure
        innerContainer.appendChild(header);
        innerContainer.appendChild(content);
        innerContainer.appendChild(footer);
        outerContainer.appendChild(innerContainer);
        doc.body.appendChild(outerContainer);
      } else {
        // The template already has structure, update the styles
        
        // Update body background
        doc.body.style.backgroundColor = settings.bodyBgColor;
        
        // Update outer container
        const outerContainers = doc.querySelectorAll('body > div');
        if (outerContainers.length > 0) {
          (outerContainers[0] as HTMLElement).style.backgroundColor = settings.bodyBgColor;
          
          // Update inner container (with max-width)
          const innerContainers = outerContainers[0].querySelectorAll('div');
          if (innerContainers.length > 0) {
            for (let i = 0; i < innerContainers.length; i++) {
              const style = innerContainers[i].getAttribute('style') || '';
              if (style.includes('max-width')) {
                innerContainers[i].style.backgroundColor = settings.containerBgColor;
                innerContainers[i].style.maxWidth = settings.maxWidth;
                
                // Find header, content and footer sections
                const sections = innerContainers[i].children;
                if (sections.length > 0) {
                  // First section is usually the header
                  (sections[0] as HTMLElement).style.backgroundColor = settings.headerBgColor;
                  
                  // Middle section is usually the content
                  if (sections.length > 1) {
                    (sections[1] as HTMLElement).style.backgroundColor = settings.contentBgColor;
                  }
                  
                  // Last section is usually the footer
                  if (sections.length > 2) {
                    (sections[sections.length - 1] as HTMLElement).style.backgroundColor = settings.footerBgColor;
                  }
                }
                break;
              }
            }
          }
        }
      }
      
      // Convert back to HTML string
      let updatedHtml = doc.documentElement.outerHTML;
      
      // Apply header and footer if available
      if (headerFooterSettings && templateId) {
        try {
          updatedHtml = await applyHeaderFooterToContent(templateId, updatedHtml, {});
        } catch (error) {
          console.error('Error applying header/footer to preview:', error);
        }
      }
      
      setPreviewHtml(updatedHtml);
    } catch (error) {
      console.error('Error updating preview:', error);
      setPreviewHtml(currentHtml);
    }
  };

  const applyChanges = () => {
    // Apply changes to the main editor
    onHtmlChange(previewHtml);
    
    // Save to database if we have a template ID
    if (templateId) {
      setSaveLoading(true);
      saveTemplateBackground(templateId, settings)
        .then(savedSettings => {
          setLastSavedSettings(savedSettings);
          setSaveLoading(false);
          message.success('Background settings saved to database');
        })
        .catch(error => {
          console.error('Error saving background settings:', error);
          setSaveLoading(false);
          message.error('Failed to save background settings to database');
        });
    } else {
      // Just update locally
      setLastSavedSettings({...settings});
      message.info('Changes applied to editor (not saved to database)');
    }
  };

  const resetChanges = () => {
    // Reset to last saved settings
    setSettings({...lastSavedSettings});
  };

  // Handle header/footer changes
  const handleHeaderFooterChange = (newSettings: any) => {
    setHeaderFooterSettings(newSettings);
    updatePreview();
  };

  // Tab items for the editor
  const tabItems: TabsProps['items'] = [
    {
      key: 'background',
      label: (
        <span>
          <BgColorsOutlined /> Background & Layout
        </span>
      ),
      children: (
        <>
          <div className="flex justify-between items-center mb-4">
            <Title level={4} className="mb-0">Email Background & Structure</Title>
            <Space>
              <Button 
                icon={<UndoOutlined />} 
                onClick={resetChanges}
                disabled={JSON.stringify(settings) === JSON.stringify(lastSavedSettings)}
              >
                Reset
              </Button>
              <Button 
                type="primary" 
                icon={<SaveOutlined />} 
                onClick={applyChanges}
                loading={saveLoading}
                disabled={JSON.stringify(settings) === JSON.stringify(lastSavedSettings)}
              >
                {templateId ? 'Save & Apply' : 'Apply Changes'}
              </Button>
            </Space>
          </div>
          
          <Text className="mb-4 block">
            Customize the background colors and structure of your email template.
            {templateId && <span className="text-green-600 ml-2">Your changes will be saved to the database.</span>}
          </Text>
          
          <Collapse defaultActiveKey={['general', 'sections']} className="mb-4">
            <Panel header="General Settings" key="general">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm mb-2">Email Body Background</label>
                  <div className="flex items-center">
                    <ColorPicker
                      value={settings.bodyBgColor}
                      onChange={(color) => setSettings({...settings, bodyBgColor: color.toHexString()})}
                      showText
                    />
                    <Text className="ml-2">Outside container</Text>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm mb-2">Container Background</label>
                  <div className="flex items-center">
                    <ColorPicker
                      value={settings.containerBgColor}
                      onChange={(color) => setSettings({...settings, containerBgColor: color.toHexString()})}
                      showText
                    />
                    <Text className="ml-2">Main container</Text>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm mb-2">Container Width</label>
                  <Input
                    value={settings.maxWidth}
                    onChange={(e) => setSettings({...settings, maxWidth: e.target.value})}
                    placeholder="e.g. 650px"
                    className="w-32"
                  />
                </div>
              </div>
            </Panel>
            
            <Panel header="Section Colors" key="sections">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm mb-2">Header Background</label>
                  <ColorPicker
                    value={settings.headerBgColor}
                    onChange={(color) => setSettings({...settings, headerBgColor: color.toHexString()})}
                    showText
                  />
                </div>
                
                <div>
                  <label className="block text-sm mb-2">Content Background</label>
                  <ColorPicker
                    value={settings.contentBgColor}
                    onChange={(color) => setSettings({...settings, contentBgColor: color.toHexString()})}
                    showText
                  />
                </div>
                
                <div>
                  <label className="block text-sm mb-2">Footer Background</label>
                  <ColorPicker
                    value={settings.footerBgColor}
                    onChange={(color) => setSettings({...settings, footerBgColor: color.toHexString()})}
                    showText
                  />
                </div>
              </div>
            </Panel>
          </Collapse>
        </>
      ),
    },
    {
      key: 'headerFooter',
      label: (
        <span>
          <LayoutOutlined /> Header & Footer
        </span>
      ),
      children: (
        <EmailHeaderFooterComponent 
          templateId={templateId} 
          onHeaderFooterChange={handleHeaderFooterChange}
        />
      ),
    },
  ];

  if (loading && headerFooterLoading) {
    return <LoaderComponent />;
  }

  return (
    <Card className="shadow-lg rounded-lg border-0 mb-6">
      <Tabs 
        activeKey={activeTab} 
        onChange={setActiveTab}
        items={tabItems}
        className="email-template-tabs"
      />
      
      {/* Preview section - shown for both tabs */}
      <div className="border rounded-md p-4 mb-4 bg-gray-50">
        <Title level={5}>Preview</Title>
        <div className="border rounded bg-white p-1 overflow-hidden" style={{height: '300px'}}>
          <div className="h-full overflow-auto">
            <div 
              dangerouslySetInnerHTML={{ __html: previewHtml }} 
              style={{ transform: 'scale(0.7)', transformOrigin: 'top left' }}
            />
          </div>
        </div>
        <Text className="text-xs text-gray-500 block mt-2">
          This is a scaled preview. {templateId 
            ? 'Click "Save & Apply" to update the editor and save to database.' 
            : 'Click "Apply Changes" to update the main editor.'}
        </Text>
      </div>
    </Card>
  );
};

export default EmailTemplateBackgroundEditor;