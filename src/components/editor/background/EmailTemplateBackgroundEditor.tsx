// src/components/EmailTemplateBackgroundEditor.tsx
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
import EmailHeaderFooterComponent from '../header-footer/EmailHeaderFooterComponent';
import LoaderComponent from '@/components/LoaderComponent';

const { Title, Text } = Typography;
const { Panel } = Collapse;

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
  const [previewLoading, setPreviewLoading] = useState<boolean>(false);

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
          } else {
            console.log('No header/footer settings found, using defaults');
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

 // Generate header HTML based on settings
const generateHeaderHTML = () => {
  if (!headerFooterSettings || !headerFooterSettings.headerEnabled) {
    // Return empty string if no settings or header is disabled
    return '';
  }

  let headerHTML = '';
  
  // Add logo if available
  if (headerFooterSettings.headerLogo) {
    const logoAlignment = headerFooterSettings.headerLogoAlignment || 'center';
    const logoWidth = headerFooterSettings.headerLogoWidth || 200;
    
    headerHTML += `<div style="text-align: ${logoAlignment}; margin-bottom: ${headerFooterSettings.headerContent ? '10px' : '0'};">
      <img src="${headerFooterSettings.headerLogo}" alt="Logo" style="max-width: ${logoWidth}px; max-height: 80px;" />
    </div>`;
  }
  
  // Add header content if available
  if (headerFooterSettings.headerContent) {
    headerHTML += `<div style="
      color: ${headerFooterSettings.headerTextColor || '#FFFFFF'}; 
      font-size: 22px; 
      font-weight: bold;
      text-align: ${headerFooterSettings.headerLogo ? headerFooterSettings.headerLogoAlignment || 'center' : 'center'};
    ">
      ${headerFooterSettings.headerContent}
    </div>`;
  }
  
  return headerHTML;
};

 // Generate footer HTML based on settings
const generateFooterHTML = () => {
  if (!headerFooterSettings || !headerFooterSettings.footerEnabled) {
    // Return empty string if no settings or footer is disabled
    return '';
  }

  let footerHTML = '';
  
  // Add footer content if available
  if (headerFooterSettings.footerContent) {
    footerHTML += `<div style="margin-bottom: 15px; color: ${headerFooterSettings.footerTextColor || '#FFFFFF'};">
      ${headerFooterSettings.footerContent}
    </div>`;
  }
  
  // Add social icons if enabled
  if (headerFooterSettings.footerShowSocialIcons && headerFooterSettings.footerSocialLinks?.length > 0) {
    footerHTML += '<div style="margin-bottom: 15px;">';
    
    headerFooterSettings.footerSocialLinks
      .filter((link: any) => link.enabled)
      .forEach((link: any) => {
        footerHTML += `<span 
          style="
            display: inline-block; 
            margin: 0 10px;
            width: 24px;
            height: 24px;
            background-color: #FFFFFF;
            border-radius: 50%;
            text-align: center;
            line-height: 24px;
            color: #333333;
            font-weight: bold;
          "
        >
          ${link.platform.charAt(0).toUpperCase()}
        </span>`;
      });
    
    footerHTML += '</div>';
  }
  
  // Add company address if enabled
  if (headerFooterSettings.footerShowAddress && headerFooterSettings.footerAddress) {
    footerHTML += `<div style="margin-bottom: 10px; font-size: 12px; color: ${headerFooterSettings.footerTextColor || '#FFFFFF'};">
      ${headerFooterSettings.footerAddress}
    </div>`;
  }
  
  // Add unsubscribe link if enabled
  if (headerFooterSettings.footerShowUnsubscribe) {
    footerHTML += `<div style="margin-bottom: 10px; font-size: 12px;">
      <a href="${headerFooterSettings.footerUnsubscribeUrl || '#'}" 
         style="color: ${headerFooterSettings.footerTextColor || '#FFFFFF'}; text-decoration: underline;">
        ${headerFooterSettings.footerUnsubscribeText || 'Unsubscribe'}
      </a>
    </div>`;
  }
  
  // Add copyright text
  if (headerFooterSettings.footerCopyrightText) {
    footerHTML += `<div style="font-size: 12px; color: ${headerFooterSettings.footerTextColor || '#FFFFFF'};">
      ${headerFooterSettings.footerCopyrightText}
    </div>`;
  }
  
  return footerHTML;
};

const updatePreview = async () => {
  try {
    setPreviewLoading(true);
    
    // First, preserve the original content
    let originalContent = currentHtml;
    
    // Create a DOM parser
    const parser = new DOMParser();
    const doc = parser.parseFromString(currentHtml, 'text/html');
    
    // Extract the actual content - this is what's getting lost
    // First check if we already have a structured template
    let contentHtml = '';
    const existingContentSection = doc.querySelector('div[style*="padding"][style*="background-color"]');
    
    if (existingContentSection) {
      // If we already have a structure, extract the content from the content section
      contentHtml = existingContentSection.innerHTML;
    } else {
      // If no structure, the entire body is the content
      contentHtml = doc.body.innerHTML;
    }
    
    // Now create or update the email structure
    const needsStructure = !doc.querySelector('body > div[style*="margin: 0 auto"]');
    
    if (needsStructure) {
      // The current HTML doesn't have our email structure, we need to build it
      
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
      
      // Create the header if we have header settings
      if (headerFooterSettings && headerFooterSettings.headerEnabled) {
        const header = doc.createElement('div');
        header.setAttribute('style', `background-color: ${settings.headerBgColor}; padding: 24px 10px; text-align: center;`);
        header.innerHTML = generateHeaderHTML();
        innerContainer.appendChild(header);
      }
      
      // Create the content section
      const content = doc.createElement('div');
      content.setAttribute('style', `padding: 40px 20px; background-color: ${settings.contentBgColor};`);
      content.innerHTML = contentHtml; // Use the preserved content
      innerContainer.appendChild(content);
      
      // Create the footer if we have footer settings
      if (headerFooterSettings && headerFooterSettings.footerEnabled) {
        const footer = doc.createElement('div');
        footer.setAttribute('style', `background-color: ${settings.footerBgColor}; padding: 20px 10px; text-align: center;`);
        footer.innerHTML = generateFooterHTML();
        innerContainer.appendChild(footer);
      }
      
      // Assemble the structure
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
              
              // Find content section and make sure it's updated
              const contentSections = innerContainers[i].querySelectorAll('div[style*="padding"]');
              let contentUpdated = false;
              
              if (contentSections.length > 0) {
                for (let j = 0; j < contentSections.length; j++) {
                  const sectionStyle = contentSections[j].getAttribute('style') || '';
                  // Only update sections that are content (not header/footer)
                  if (!sectionStyle.includes('text-align: center') && 
                      !sectionStyle.includes(settings.headerBgColor) && 
                      !sectionStyle.includes(settings.footerBgColor)) {
                    // This is likely the content section
                    (contentSections[j] as HTMLElement).style.backgroundColor = settings.contentBgColor;
                    
                    // Make sure content is preserved and stays put
                    if (!contentUpdated && contentHtml) {
                      contentSections[j].innerHTML = contentHtml;
                      contentUpdated = true;
                    }
                  }
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
    
    // Apply header/footer from the database
    if (templateId) {
      try {
        // Create a proper structure with content preserved before applying header/footer
        // This is a temporary solution - ideally, applyHeaderFooterToContent should be fixed
        const tempParser = new DOMParser();
        const tempDoc = tempParser.parseFromString(updatedHtml, 'text/html');
        
        // Double-check if content is still there
        const mainContent = tempDoc.querySelector('div[style*="padding"][style*="background-color"]:not([style*="text-align: center"])');
        if (!mainContent || !mainContent.innerHTML.trim()) {
          console.warn("Content seems missing before applying header/footer, restoring it");
          
          // Try to find content container and restore content
          const contentContainer = tempDoc.querySelector('div[style*="padding"][style*="background-color"]:not([style*="text-align"])');
          if (contentContainer) {
            contentContainer.innerHTML = contentHtml;
          }
          
          // Update HTML before applying header/footer
          updatedHtml = tempDoc.documentElement.outerHTML;
        }
        
        // Now apply header and footer
        updatedHtml = await applyHeaderFooterToContent(templateId, updatedHtml, {});
        
        // One more check after header/footer application to ensure content is still there
        const finalParser = new DOMParser();
        const finalDoc = finalParser.parseFromString(updatedHtml, 'text/html');
        const finalContent = finalDoc.querySelector('div[style*="padding"][style*="background-color"]:not([style*="text-align: center"])');
        
        if (!finalContent || !finalContent.innerHTML.trim()) {
          console.warn("Content lost after applying header/footer, fixing");
          
          // Find content container between header and footer
          const containers = finalDoc.querySelectorAll('div[style*="background-color"]');
          if (containers.length > 1) {
            // Assume first is header, last is footer, anything in between might be content
            for (let i = 1; i < containers.length - 1; i++) {
              const containerStyle = containers[i].getAttribute('style') || '';
              if (containerStyle.includes('padding') && !containerStyle.includes('text-align: center')) {
                containers[i].innerHTML = contentHtml;
                break;
              }
            }
          }
          
          // If we couldn't find a suitable container, try a different approach
          if (!finalDoc.querySelector('div[style*="padding"][style*="background-color"]:not([style*="text-align: center"])')) {
            // Find the main container and insert a new content div
            const mainContainer = finalDoc.querySelector('div[style*="max-width"]');
            if (mainContainer) {
              const newContent = finalDoc.createElement('div');
              newContent.setAttribute('style', `padding: 40px 20px; background-color: ${settings.contentBgColor};`);
              newContent.innerHTML = contentHtml;
              
              // Insert after header (if it exists) or as first child
              const header = mainContainer.querySelector('div[style*="text-align: center"]');
              if (header) {
                header.after(newContent);
              } else {
                mainContainer.prepend(newContent);
              }
            }
          }
          
          // Update HTML again
          updatedHtml = finalDoc.documentElement.outerHTML;
        }
      } catch (error) {
        console.error('Error applying header/footer to preview:', error);
        
        // If header/footer application fails, ensure we at least have the content
        const fallbackParser = new DOMParser();
        const fallbackDoc = fallbackParser.parseFromString(updatedHtml, 'text/html');
        
        // Check if content is present
        const contentCheck = fallbackDoc.querySelector('div[style*="padding"][style*="background-color"]:not([style*="text-align: center"])');
        if (!contentCheck || !contentCheck.innerHTML.trim()) {
          console.warn("Content missing in fallback, restoring");
          
          // Try to find main container
          const mainContainer = fallbackDoc.querySelector('div[style*="max-width"]');
          if (mainContainer) {
            // Create content div
            const contentDiv = fallbackDoc.createElement('div');
            contentDiv.setAttribute('style', `padding: 40px 20px; background-color: ${settings.contentBgColor};`);
            contentDiv.innerHTML = contentHtml;
            mainContainer.appendChild(contentDiv);
          }
          
          updatedHtml = fallbackDoc.documentElement.outerHTML;
        }
      }
    }
    
    // Final sanity check to ensure content is present
    const finalCheckParser = new DOMParser();
    const finalCheckDoc = finalCheckParser.parseFromString(updatedHtml, 'text/html');
    let contentPresent = false;
    
    // Look for content within properly structured elements
    const contentElements = finalCheckDoc.querySelectorAll('div[style*="padding"]');
    for (let i = 0; i < contentElements.length; i++) {
      const el = contentElements[i];
      const style = el.getAttribute('style') || '';
      
      // Skip header/footer elements
      if (!style.includes('text-align: center') && el.innerHTML.trim()) {
        contentPresent = true;
        break;
      }
    }
    
    // If content still missing, force it back in
    if (!contentPresent) {
      console.warn("Final attempt to restore content");
      // Find the container element
      const container = finalCheckDoc.querySelector('div[style*="max-width"]');
      if (container) {
        const forceContent = finalCheckDoc.createElement('div');
        forceContent.setAttribute('style', `padding: 40px 20px; background-color: ${settings.contentBgColor};`);
        forceContent.innerHTML = contentHtml;
        
        // Insert in the middle if there are multiple children
        if (container.children.length >= 2) {
          container.insertBefore(forceContent, container.children[1]);
        } else {
          container.appendChild(forceContent);
        }
        
        updatedHtml = finalCheckDoc.documentElement.outerHTML;
      }
    }
    
    setPreviewHtml(updatedHtml);
    setPreviewLoading(false);
  } catch (error) {
    console.error('Error updating preview:', error);
    // In case of error, at least try to show the original content
    setPreviewHtml(currentHtml);
    setPreviewLoading(false);
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
        <Title level={5}>Preview Email with Background</Title>
        <div className="border rounded bg-white p-1 overflow-hidden" style={{height: '300px'}}>
          {previewLoading ? (
            <div className="flex items-center justify-center h-full">
              <Spin indicator={<LoadingOutlined style={{ fontSize: 24 }} spin />} />
              <Text className="ml-2">Updating preview...</Text>
            </div>
          ) : (
            <div className="h-full overflow-auto">
              <div 
                dangerouslySetInnerHTML={{ __html: previewHtml }} 
                style={{ transform: 'scale(0.7)', transformOrigin: 'top left' }}
              />
            </div>
          )}
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