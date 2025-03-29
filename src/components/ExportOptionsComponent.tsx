// src/components/ExportOptionsComponent.tsx
import React, { useState } from 'react';
import { Button, Dropdown, Menu, message } from 'antd';
import { DownloadOutlined, DownOutlined } from '@ant-design/icons';
import type { MenuProps } from 'antd';

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

  // Export the template with preview data
  const exportWithPreviewData = () => {
    try {
      setExporting(true);
      const emailSafeHTML = wrapHtmlForEmail(html);
      
      const blob = new Blob([emailSafeHTML], { type: 'text/html' });
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
  const exportRawTemplate = () => {
    try {
      setExporting(true);
      const emailSafeHTML = wrapHtmlForEmail(rawTemplateHtml);
      
      const blob = new Blob([emailSafeHTML], { type: 'text/html' });
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
      label: 'Export with Preview Data',
      onClick: exportWithPreviewData,
    },
    {
      key: '2',
      label: 'Export Raw Template',
      onClick: exportRawTemplate,
    },
    {
      key: '3',
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