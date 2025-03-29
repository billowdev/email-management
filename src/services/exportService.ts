// src/services/exportService.ts

/**
 * Service for exporting email templates in various formats
 */

import { EmailTemplateWithRelations } from './emailTemplateService';

/**
 * Creates a proper email-client-friendly HTML wrapper
 */
export const wrapHtmlForEmail = (content: string): string => {
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

/**
 * Exports an HTML template with variable placeholders
 */
export const exportRawTemplate = (
  htmlContent: string,
  templateName: string = 'email-template'
): void => {
  try {
    const emailSafeHTML = wrapHtmlForEmail(htmlContent);
    
    const blob = new Blob([emailSafeHTML], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${templateName.toLowerCase().replace(/\s+/g, '-')}-template.html`;
    a.click();
    URL.revokeObjectURL(url);
    
  } catch (error) {
    console.error('Error exporting raw template:', error);
    throw error;
  }
};

/**
 * Exports an HTML template with variables replaced by preview data
 */
export const exportTemplateWithData = (
  htmlWithData: string,
  templateName: string = 'email-template'
): void => {
  try {
    const emailSafeHTML = wrapHtmlForEmail(htmlWithData);
    
    const blob = new Blob([emailSafeHTML], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${templateName.toLowerCase().replace(/\s+/g, '-')}-with-data.html`;
    a.click();
    URL.revokeObjectURL(url);
    
    // return true;
  } catch (error) {
    console.error('Error exporting template with data:', error);
    throw error;
  }
};

/**
 * Exports a JSON schema of the template variables
 */
export const exportVariableSchema = (
  previewData: Record<string, any>,
  templateName: string = 'email-template'
): void => {
  try {
    // Create JSON schema with variable keys and their values
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
    
    // return true;
  } catch (error) {
    console.error('Error exporting variable schema:', error);
    throw error;
  }
};

/**
 * Exports a complete email template package (zip file with template and variables)
 */
export const exportCompleteTemplatePackage = async (
  template: EmailTemplateWithRelations,
  htmlContent: string,
  previewData: Record<string, any>
): Promise<void> => {
  try {
    // For this implementation, we'd need to use a library like JSZip
    // This is a placeholder for future implementation
    console.warn('Export complete template package not implemented yet');
    
    // For now, just export the raw template
    exportRawTemplate(htmlContent, template.name);
  } catch (error) {
    console.error('Error exporting template package:', error);
    throw error;
  }
};