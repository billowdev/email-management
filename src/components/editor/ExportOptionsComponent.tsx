// src/components/editor/ExportOptionsComponent.tsx
import React, { useState } from 'react';
import { Button, Dropdown, message } from 'antd';
import { DownloadOutlined, DownOutlined } from '@ant-design/icons';
import type { MenuProps } from 'antd';
import {  getTemplateHeaderFooter, applyHeaderFooterToContent } from '@/services/emailTemplateService';
import { DEFAULT_BACKGROUND_SETTINGS } from '@/types/email-templates';
import { getTemplateBackground } from '@/services/emailBackgroundService';

interface ExportOptionsComponentProps {
  html: string;
  rawTemplateHtml: string;
  previewData: Record<string, any>;
  templateId: string;
  templateName?: string;
}

const ExportOptionsComponent: React.FC<ExportOptionsComponentProps> = ({
  html, // HTML with variables replaced with preview data
  rawTemplateHtml, // Original HTML with variable placeholders
  previewData,
  templateId,
  templateName = 'email-template'
}) => {
  const [exporting, setExporting] = useState<boolean>(false);

  // Create email-client-friendly HTML wrapper
  const wrapHtmlForEmail = (content: string): string => {
    return `<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
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
<body>
  ${content}
</body>
</html>`;
  };

  // Export complete template with background, header, and footer
  const exportCompleteTemplate = async () => {
    try {
      setExporting(true);
      
      // Get the background settings
      let backgroundSettings = DEFAULT_BACKGROUND_SETTINGS;
      try {
        const dbSettings = await getTemplateBackground(templateId);
        if (dbSettings) {
          backgroundSettings = dbSettings;
        }
      } catch (error) {
        console.error('Error loading background settings:', error);
      }
      
      // Create a DOM parser
      const parser = new DOMParser();
      let doc = parser.parseFromString(rawTemplateHtml, 'text/html');
      
      // Check if we need to create the email structure
      const needsStructure = !doc.querySelector('body > div[style*="margin: 0 auto"]');
      
      if (needsStructure) {
        // The current HTML doesn't have our email structure, we need to build it
        const emailContent = doc.body.innerHTML;
        
        // Clear the body
        doc.body.innerHTML = '';
        
        // Create the email structure
        const bodyStyles = `margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: ${backgroundSettings.bodyBgColor};`;
        doc.body.setAttribute('style', bodyStyles);
        
        // Create the outer container
        const outerContainer = doc.createElement('div');
        outerContainer.setAttribute('style', `width: 100%; margin: 0 auto; background-color: ${backgroundSettings.bodyBgColor};`);
        
        // Create the inner container
        const innerContainer = doc.createElement('div');
        innerContainer.setAttribute('style', `max-width: ${backgroundSettings.maxWidth}; margin: 0 auto; background-color: ${backgroundSettings.containerBgColor};`);
        
        // Create the header
        const header = doc.createElement('div');
        header.setAttribute('style', `background-color: ${backgroundSettings.headerBgColor}; padding: 24px 10px; text-align: center;`);
        header.innerHTML = '<div style="color: #FFFFFF; font-size: 24px; font-weight: bold; line-height: 150%;">Email Header</div>';
        
        // Create the content section
        const content = doc.createElement('div');
        content.setAttribute('style', `padding: 40px 20px; background-color: ${backgroundSettings.contentBgColor};`);
        content.innerHTML = emailContent;
        
        // Create the footer
        const footer = doc.createElement('div');
        footer.setAttribute('style', `background-color: ${backgroundSettings.footerBgColor}; padding: 20px 10px; text-align: center;`);
        footer.innerHTML = '<div style="color: #FFFFFF; font-size: 16px; line-height: 150%;">© 2025 Company Name. All rights reserved.</div>';
        
        // Assemble the structure
        innerContainer.appendChild(header);
        innerContainer.appendChild(content);
        innerContainer.appendChild(footer);
        outerContainer.appendChild(innerContainer);
        doc.body.appendChild(outerContainer);
      }
      
      // Apply header and footer to the template
      let completeHtml = doc.documentElement.outerHTML;
      
      try {
        completeHtml = await applyHeaderFooterToContent(templateId, completeHtml, {});
      } catch (error) {
        console.error('Error applying header/footer:', error);
        // Continue without header/footer if there's an error
      }
      
      const blob = new Blob([completeHtml], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${templateName.toLowerCase().replace(/\s+/g, '-')}-template.html`;
      a.click();
      URL.revokeObjectURL(url);
      
      message.success('Complete template exported successfully');
    } catch (error) {
      console.error('Error exporting complete template:', error);
      message.error('Failed to export complete template');
    } finally {
      setExporting(false);
    }
  };

  // Export the template with preview data
  const exportWithPreviewData = async () => {
    try {
      setExporting(true);
      
      // Apply header and footer with preview data
      let completeHtml = html;
      
      try {
        completeHtml = await applyHeaderFooterToContent(templateId, html, previewData);
      } catch (error) {
        console.error('Error applying header/footer:', error);
        // Continue without header/footer if there's an error
      }
      
      const blob = new Blob([completeHtml], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${templateName.toLowerCase().replace(/\s+/g, '-')}-with-data.html`;
      a.click();
      URL.revokeObjectURL(url);
      
      message.success('Template with preview data exported successfully');
    } catch (error) {
      console.error('Error exporting template with data:', error);
      message.error('Failed to export template with data');
    } finally {
      setExporting(false);
    }
  };

  // Export the template without backgrounds
  const exportWithoutBackgrounds = async () => {
    try {
      setExporting(true);
      
      // Parse the HTML to retain structure but remove backgrounds
      const parser = new DOMParser();
      const doc = parser.parseFromString(rawTemplateHtml, 'text/html');
      
      // Remove background colors from all elements
      const removeBackgrounds = (element: Element) => {
        const style = element.getAttribute('style');
        if (style && style.includes('background-color')) {
          const newStyle = style.replace(/background-color:\s*[^;]+;?/gi, 'background-color: #FFFFFF;');
          element.setAttribute('style', newStyle);
        }
        
        // Process children recursively
        Array.from(element.children).forEach(removeBackgrounds);
      };
      
      // Process the entire document
      removeBackgrounds(doc.documentElement);
      
      // Apply header and footer without backgrounds
      let noBackgroundHtml = doc.documentElement.outerHTML;
      
      try {
        // Apply header and footer content
        noBackgroundHtml = await applyHeaderFooterToContent(templateId, noBackgroundHtml, {});
        
        // Then remove backgrounds from the result
        const finalDoc = parser.parseFromString(noBackgroundHtml, 'text/html');
        removeBackgrounds(finalDoc.documentElement);
        noBackgroundHtml = finalDoc.documentElement.outerHTML;
      } catch (error) {
        console.error('Error applying header/footer:', error);
        // Continue without header/footer if there's an error
      }
      
      const blob = new Blob([noBackgroundHtml], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${templateName.toLowerCase().replace(/\s+/g, '-')}-no-backgrounds.html`;
      a.click();
      URL.revokeObjectURL(url);
      
      message.success('Template without backgrounds exported successfully');
    } catch (error) {
      console.error('Error exporting template without backgrounds:', error);
      message.error('Failed to export template without backgrounds');
    } finally {
      setExporting(false);
    }
  };

  // Export content only (minimal HTML)
  const exportContentOnly = async () => {
    try {
      setExporting(true);
      
      // Parse the HTML to extract only content
      const parser = new DOMParser();
      const doc = parser.parseFromString(rawTemplateHtml, 'text/html');
      
      // Try to find the content section
      let contentHtml = '';
      
      // Look for the content div (usually the one with padding in the middle)
      const contentDivs = doc.querySelectorAll('div[style*="padding"]');
      if (contentDivs.length > 1) {
        // If multiple divs with padding, the second is usually content (header, content, footer)
        contentHtml = contentDivs[1].innerHTML;
      } else if (contentDivs.length > 0) {
        // If only one, use that
        contentHtml = contentDivs[0].innerHTML;
      } else {
        // Fallback to body content
        contentHtml = doc.body.innerHTML;
      }
      
      // Wrap in minimal HTML
      const minimalHtml = `<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
<head>
  <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${templateName} - Content Only</title>
  <style type="text/css">
    body { margin: 0; padding: 20px; font-family: Arial, sans-serif; }
    .variable { color: #2563eb; font-weight: bold; }
  </style>
</head>
<body>
  ${contentHtml}
</body>
</html>`;
      
      const blob = new Blob([minimalHtml], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${templateName.toLowerCase().replace(/\s+/g, '-')}-content-only.html`;
      a.click();
      URL.revokeObjectURL(url);
      
      message.success('Content-only template exported successfully');
    } catch (error) {
      console.error('Error exporting content-only template:', error);
      message.error('Failed to export content-only template');
    } finally {
      setExporting(false);
    }
  };

  // Export header and footer only
  const exportHeaderFooterOnly = async () => {
    try {
      setExporting(true);
      
      // Get header/footer settings
      let headerFooterSettings = null;
      try {
        headerFooterSettings = await getTemplateHeaderFooter(templateId);
      } catch (error) {
        console.error('Error loading header/footer settings:', error);
        message.error('No header/footer settings found for this template');
        setExporting(false);
        return;
      }
      
      if (!headerFooterSettings) {
        message.error('No header/footer settings found for this template');
        setExporting(false);
        return;
      }
      
      // Create a clean HTML structure with just header and footer
      const cleanHtml = `<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
<head>
  <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${templateName} - Header and Footer</title>
  <style type="text/css">
    body { margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #FFFFFF; }
    .container { max-width: 650px; margin: 0 auto; background-color: #FFFFFF; }
    .content-placeholder { padding: 40px 20px; background-color: #F9F9F9; text-align: center; border: 1px dashed #CCCCCC; }
  </style>
</head>
<body>
  <div class="container">
    <!-- Content will be replaced with header and footer -->
    <div class="content-placeholder">
      <p>Your email content will appear here.</p>
      <p>Replace this section with your actual email content.</p>
    </div>
  </div>
</body>
</html>`;
      
      // Apply header and footer
      let headerFooterHtml = await applyHeaderFooterToContent(templateId, cleanHtml, {});
      
      const blob = new Blob([headerFooterHtml], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${templateName.toLowerCase().replace(/\s+/g, '-')}-header-footer.html`;
      a.click();
      URL.revokeObjectURL(url);
      
      message.success('Header and footer template exported successfully');
    } catch (error) {
      console.error('Error exporting header/footer template:', error);
      message.error('Failed to export header/footer template');
    } finally {
      setExporting(false);
    }
  };

  // Export JSON schema for the template (variables and their defaults)
  const exportVariableSchema = () => {
    try {
      setExporting(true);
      
      // Create JSON schema with variable keys and their default values
      const schema = Object.fromEntries(
        Object.keys(previewData).map(key => [key, previewData[key] || ''])
      );
      
      const blob = new Blob([JSON.stringify(schema, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${templateName.toLowerCase().replace(/\s+/g, '-')}-variables.json`;
      a.click();
      URL.revokeObjectURL(url);
      
      message.success('Template variables exported successfully');
    } catch (error) {
      console.error('Error exporting variable schema:', error);
      message.error('Failed to export variable schema');
    } finally {
      setExporting(false);
    }
  };

  const items: MenuProps['items'] = [
    {
      key: '1',
      label: 'Export Complete Template',
      onClick: exportCompleteTemplate,
    },
    {
      key: '2',
      label: 'Export With Preview Data',
      onClick: exportWithPreviewData,
    },
    {
      key: '3',
      label: 'Export Without Backgrounds',
      onClick: exportWithoutBackgrounds,
    },
    {
      key: '4',
      label: 'Export Content Only',
      onClick: exportContentOnly,
    },
    {
      key: '5',
      label: 'Export Header/Footer Only',
      onClick: exportHeaderFooterOnly,
    },
    {
      key: '6',
      label: 'Export Variables Schema',
      onClick: exportVariableSchema,
    },
  ];

  return (
    <Dropdown menu={{ items }} trigger={['click']}>
      <Button type="primary" loading={exporting} icon={<DownloadOutlined />}>
        Export <DownOutlined />
      </Button>
    </Dropdown>
  );
};

export default ExportOptionsComponent;