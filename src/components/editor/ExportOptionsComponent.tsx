// src/components/editor/ExportOptionsComponent.tsx
import React, { useState } from 'react';
import { Button, Dropdown, message } from 'antd';
import { DownloadOutlined, DownOutlined } from '@ant-design/icons';
import type { MenuProps } from 'antd';
import { getTemplateBackground } from '@/services/emailBackgroundService';
import { DEFAULT_BACKGROUND_SETTINGS } from '@/types/email-templates';

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

  // Build complete template with layout and backgrounds
  const buildCompleteTemplate = async (content: string, withBackgrounds = true) => {
    try {
      // Get the background settings from database or use defaults
      let backgroundSettings = DEFAULT_BACKGROUND_SETTINGS;
      
      if (templateId && templateId !== 'default-template') {
        try {
          const dbSettings = await getTemplateBackground(templateId);
          if (dbSettings) {
            backgroundSettings = dbSettings;
          }
        } catch (error) {
          console.error('Error loading background settings:', error);
          // Continue with default settings
        }
      }
      
      // Parse the content HTML
      const parser = new DOMParser();
      const doc = parser.parseFromString(content, 'text/html');
      
      // Check if we already have the structure
      const hasStructure = doc.querySelector('body > div[style*="margin: 0 auto"]');
      
      let finalHtml: string;
      
      if (!hasStructure) {
        // We need to build the email structure
        const emailContent = doc.body ? doc.body.innerHTML : content;
        
        // Build the full HTML structure
        const bodyBgColor = withBackgrounds ? backgroundSettings.bodyBgColor : '#FFFFFF';
        const containerBgColor = withBackgrounds ? backgroundSettings.containerBgColor : '#FFFFFF';
        const headerBgColor = withBackgrounds ? backgroundSettings.headerBgColor : '#FFFFFF';
        const contentBgColor = withBackgrounds ? backgroundSettings.contentBgColor : '#FFFFFF';
        const footerBgColor = withBackgrounds ? backgroundSettings.footerBgColor : '#FFFFFF';
        
        finalHtml = `<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
<head>
  <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${templateName}</title>
  <style type="text/css">
    body { margin: 0; padding: 0; min-width: 100%; font-family: Arial, sans-serif; }
    .variable { color: #2563eb; font-weight: bold; }
  </style>
</head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: ${bodyBgColor};">
  <div style="width: 100%; margin: 0 auto; background-color: ${bodyBgColor};">
    <div style="max-width: ${backgroundSettings.maxWidth}; margin: 0 auto; background-color: ${containerBgColor};">
      <div style="background-color: ${headerBgColor}; padding: 24px 10px; text-align: center;">
        <div style="color: ${headerBgColor === '#FFFFFF' ? '#000000' : '#FFFFFF'}; font-size: 24px; font-weight: bold; line-height: 150%;">Email Header</div>
      </div>
      <div style="padding: 40px 20px; background-color: ${contentBgColor};">
        ${emailContent}
      </div>
      <div style="background-color: ${footerBgColor}; padding: 20px 10px; text-align: center;">
        <div style="color: ${footerBgColor === '#FFFFFF' ? '#000000' : '#FFFFFF'}; font-size: 16px; line-height: 150%;">© ${new Date().getFullYear()} ${templateName}. All rights reserved.</div>
      </div>
    </div>
  </div>
</body>
</html>`;
      } else {
        // The structure already exists, we need to update it if needed
        if (!withBackgrounds) {
          // Remove background colors if requested
          const allElements = doc.querySelectorAll('[style*="background-color"]');
          allElements.forEach(el => {
            const style = el.getAttribute('style') || '';
            const updatedStyle = style.replace(/background-color:\s*[^;]+;?/gi, 'background-color: #FFFFFF;');
            el.setAttribute('style', updatedStyle);
          });
        }
        
        finalHtml = doc.documentElement.outerHTML;
      }
      
      return finalHtml;
    } catch (error) {
      console.error('Error building complete template:', error);
      return content; // Return original content on error
    }
  };

  // Export the template with preview data
  const exportWithPreviewData = async () => {
    try {
      setExporting(true);
      
      // Build the complete template with preview data and backgrounds
      const completeHtml = await buildCompleteTemplate(html, true);
      
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

  // Export the raw template with variable placeholders
  const exportRawTemplate = async () => {
    try {
      setExporting(true);
      
      // Build the complete template with placeholders and backgrounds
      const completeHtml = await buildCompleteTemplate(rawTemplateHtml, true);
      
      const blob = new Blob([completeHtml], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${templateName.toLowerCase().replace(/\s+/g, '-')}-template.html`;
      a.click();
      URL.revokeObjectURL(url);
      
      message.success('Raw template exported successfully');
    } catch (error) {
      console.error('Error exporting raw template:', error);
      message.error('Failed to export raw template');
    } finally {
      setExporting(false);
    }
  };

  // Export the template without backgrounds
  const exportWithoutBackgrounds = async () => {
    try {
      setExporting(true);
      
      // Build the complete template without backgrounds
      const completeHtml = await buildCompleteTemplate(rawTemplateHtml, false);
      
      const blob = new Blob([completeHtml], { type: 'text/html' });
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
  const exportContentOnly = () => {
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
      onClick: exportRawTemplate,
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