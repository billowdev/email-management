// src/services/emailTemplateService.ts
import { VariableType } from '@prisma/client';

// Define the base interfaces
export interface EmailTemplate {
  id: string;
  name: string;
  description?: string | null;
  defaultContent: string;
  createdAt: Date;
  updatedAt: Date;
  userId?: string | null;
  isSystem: boolean;
  foldererId?: string | null;
}

export interface TemplateVariable {
  id: string;
  key: string;
  name: string;
  type: VariableType;
  defaultValue?: string | null;
  description?: string | null;
  createdAt: Date;
  updatedAt: Date;
  required: boolean;
  emailTemplateId: string;
}

export interface PreviewData {
  id: string;
  name: string;
  data: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
  emailTemplateId: string;
}

// Type for template with relations
export type EmailTemplateWithRelations = EmailTemplate & {
  variables: TemplateVariable[];
  previewData: PreviewData[];
};

// Type for creating a new template
export interface CreateTemplatePayload {
  name: string;
  description?: string;
  defaultContent: string;
  variables?: Omit<TemplateVariable, 'id' | 'createdAt' | 'updatedAt' | 'emailTemplateId'>[];
  previewData?: Record<string, any>;
  userId?: string;
  folderId?: string;
}

// Helpers for frontend component compatibility
export function getVariableKeys(template: EmailTemplateWithRelations): string[] {
  return template.variables.map(v => v.key);
}

export function templateToSimpleFormat(template: EmailTemplateWithRelations) {
  return {
    id: template.id,
    name: template.name,
    description: template.description,
    defaultContent: template.defaultContent,
    variables: getVariableKeys(template)
  };
}

export function getPreviewDataObject(template: EmailTemplateWithRelations): Record<string, any> {
  if (template.previewData && template.previewData.length > 0) {
    return template.previewData[0].data;
  }
  return {};
}

// Fetch all templates
export async function getAllTemplates(): Promise<EmailTemplateWithRelations[]> {
  const response = await fetch(`/api/templates`);
  
  if (!response.ok) {
    throw new Error('Failed to fetch templates');
  }
  
  return response.json();
}

// Fetch a specific template by ID
export async function getTemplateById(id: string): Promise<EmailTemplateWithRelations> {
  const response = await fetch(`/api/templates/${id}`);
  
  if (!response.ok) {
    throw new Error('Failed to fetch template');
  }
  
  return response.json();
}

// Create a new template
export async function createTemplate(template: CreateTemplatePayload): Promise<EmailTemplateWithRelations> {
  const response = await fetch(`/api/templates`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(template),
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to create template');
  }
  
  return response.json();
}

// Update a template
export async function updateTemplate(
  id: string, 
  template: Partial<CreateTemplatePayload>
): Promise<EmailTemplateWithRelations> {
  const response = await fetch(`/api/templates/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(template),
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to update template');
  }
  
  return response.json();
}

// Delete a template
export async function deleteTemplate(id: string): Promise<void> {
  const response = await fetch(`/api/templates/${id}`, {
    method: 'DELETE',
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to delete template');
  }
}

// Add a variable to a template
export async function addVariable(
  templateId: string,
  variable: Omit<TemplateVariable, 'id' | 'createdAt' | 'updatedAt' | 'emailTemplateId'>
): Promise<TemplateVariable> {
  const response = await fetch(`/api/templates/${templateId}/variables`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(variable),
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to add variable');
  }
  
  return response.json();
}

// Update a variable
export async function updateVariable(
  templateId: string,
  variableId: string,
  variable: Partial<Omit<TemplateVariable, 'id' | 'createdAt' | 'updatedAt' | 'emailTemplateId'>>
): Promise<TemplateVariable> {
  const response = await fetch(`/api/templates/${templateId}/variables/${variableId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(variable),
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to update variable');
  }
  
  return response.json();
}

// Delete a variable
export async function deleteVariable(templateId: string, variableId: string): Promise<void> {
  const response = await fetch(`/api/templates/${templateId}/variables/${variableId}`, {
    method: 'DELETE',
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to delete variable');
  }
}

// Get all variables for a template
export async function getVariablesByTemplateId(templateId: string): Promise<TemplateVariable[]> {
  const response = await fetch(`/api/templates/${templateId}/variables`);
  
  if (!response.ok) {
    throw new Error('Failed to fetch variables');
  }
  
  return response.json();
}

// Update preview data for a template
export async function updatePreviewData(
  templateId: string, 
  previewData: Record<string, any>,
  name?: string
): Promise<PreviewData> {
  const response = await fetch(`/api/templates/${templateId}/preview`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ 
      data: previewData,
      name: name || 'Default Preview'
    }),
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to update preview data');
  }
  
  return response.json();
}

// Get preview data for a template
export async function getPreviewData(templateId: string): Promise<PreviewData> {
  const response = await fetch(`/api/templates/${templateId}/preview`);
  
  if (!response.ok) {
    throw new Error('Failed to fetch preview data');
  }
  
  return response.json();
}


/**
 * Get header/footer settings for a template
 */
export async function getTemplateHeaderFooter(templateId: string): Promise<any | null> {
  try {
    const response = await fetch(`/api/templates/${templateId}/header-footer`);
    
    if (!response.ok) {
      if (response.status === 404) {
        // No header/footer settings found, which is ok
        return null;
      }
      throw new Error('Failed to fetch header/footer settings');
    }
    
    return response.json();
  } catch (error) {
    console.error('Error fetching header/footer settings:', error);
    return null;
  }
}

/**
 * Update header/footer settings for a template
 */
export async function updateTemplateHeaderFooter(
  templateId: string, 
  settings: any
): Promise<any> {
  try {
    const response = await fetch(`/api/templates/${templateId}/header-footer`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(settings),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to update header/footer settings');
    }
    
    return response.json();
  } catch (error) {
    console.error('Error updating header/footer settings:', error);
    throw error;
  }
}



/**
 * Apply header/footer to HTML content
 * This function can be used to add header/footer to content when exporting
 */
export async function applyHeaderFooterToContent(
  templateId: string, 
  content: string,
  previewData: Record<string, any> = {}
): Promise<string> {
  try {
    // Get header/footer settings
    const settings = await getTemplateHeaderFooter(templateId);
    
    if (!settings) {
      // If no settings found, just return the original content
      return content;
    }
    
    // Create a DOM parser
    const parser = new DOMParser();
    const doc = parser.parseFromString(content, 'text/html');
    
    // Prepare variables for replacement
    const processText = (text: string): string => {
      if (!text) return '';
      
      // Replace variables in the text
      let processedText = text;
      Object.entries(previewData).forEach(([key, value]) => {
        const regex = new RegExp(`{{\.${key}}}`, 'g');
        processedText = processedText.replace(regex, String(value || ''));
      });
      
      return processedText;
    };
    
    // Check if the document already has a structure with header and footer
    const existingStructure = doc.querySelector('body > div > div > div[style*="background-color"]');
    
    // If structure exists, we'll replace the header and footer rather than adding new ones
    if (existingStructure) {
      // Find existing header and footer elements
      const divs = doc.querySelectorAll('body > div > div > div[style*="background-color"]');
      
      // If we have at least one div (usually the first is header, last is footer)
      if (divs.length > 0) {
        // Replace header if enabled
        if (settings.headerEnabled && divs.length > 0) {
          const headerDiv = divs[0];
          
          // Update header background color to match settings
          headerDiv.setAttribute('style', `
            background-color: ${settings.headerTextColor === '#FFFFFF' ? settings.headerBgColor || '#33A8DF' : '#F5F5F5'};
            padding: 24px 20px;
            text-align: center;
          `);
          
          // Build header content
          let headerHTML = '';
          
          // Add logo if available
          if (settings.headerLogo) {
            const logoAlignment = settings.headerLogoAlignment || 'center';
            headerHTML += `<div style="text-align: ${logoAlignment}; margin-bottom: ${settings.headerContent ? '10px' : '0'};">
              <img src="${settings.headerLogo}" alt="Logo" style="max-width: ${settings.headerLogoWidth || 200}px; max-height: 80px;" />
            </div>`;
          }
          
          // Add header content if available
          if (settings.headerContent) {
            headerHTML += `<div style="
              color: ${settings.headerTextColor || '#FFFFFF'};
              font-size: 22px;
              font-weight: bold;
            ">
              ${processText(settings.headerContent)}
            </div>`;
          }
          
          // Set the header content
          headerDiv.innerHTML = headerHTML;
        }
        
        // Replace footer if enabled
        if (settings.footerEnabled && divs.length > 1) {
          const footerDiv = divs[divs.length - 1];
          
          // Update footer background color to match settings
          footerDiv.setAttribute('style', `
            background-color: ${settings.footerTextColor === '#FFFFFF' ? settings.footerBgColor || '#33A8DF' : '#F5F5F5'};
            padding: 20px;
            text-align: center;
            font-size: 14px;
            color: ${settings.footerTextColor || '#FFFFFF'};
          `);
          
          // Build footer content
          let footerHTML = '';
          
          // Add footer content if available
          if (settings.footerContent) {
            footerHTML += `<div style="margin-bottom: 15px;">
              ${processText(settings.footerContent)}
            </div>`;
          }
          
          // Add social icons if enabled
          if (settings.footerShowSocialIcons && settings.footerSocialLinks?.length > 0) {
            footerHTML += '<div style="margin-bottom: 15px;">';
            
            settings.footerSocialLinks
              .filter((link: { enabled: boolean }) => link.enabled)
              .forEach((link: { platform: string; url: string }) => {
                footerHTML += `<a href="${link.url}" target="_blank" rel="noopener noreferrer" style="
                  display: inline-block;
                  margin: 0 10px;
                  width: 24px;
                  height: 24px;
                  background-color: #FFFFFF;
                  border-radius: 50%;
                  text-align: center;
                  line-height: 24px;
                  text-decoration: none;
                  color: #333333;
                  font-weight: bold;
                ">
                  ${link.platform.charAt(0).toUpperCase()}
                </a>`;
              });
            
            footerHTML += '</div>';
          }
          
          // Add company address if enabled
          if (settings.footerShowAddress && settings.footerAddress) {
            footerHTML += `<div style="margin-bottom: 10px; font-size: 12px;">
              ${processText(settings.footerAddress)}
            </div>`;
          }
          
          // Add unsubscribe link if enabled
          if (settings.footerShowUnsubscribe) {
            footerHTML += `<div style="margin-bottom: 10px; font-size: 12px;">
              <a href="${processText(settings.footerUnsubscribeUrl || '#')}" style="
                color: ${settings.footerTextColor || '#FFFFFF'};
                text-decoration: underline;
              ">
                ${settings.footerUnsubscribeText || 'Unsubscribe'}
              </a>
            </div>`;
          }
          
          // Add copyright text
          if (settings.footerCopyrightText) {
            footerHTML += `<div style="font-size: 12px;">
              ${processText(settings.footerCopyrightText)}
            </div>`;
          }
          
          // Set the footer content
          footerDiv.innerHTML = footerHTML;
        }
      }
    } else {
      // No existing structure, we need to create one from scratch
      
      // Get the existing body content
      const bodyContent = doc.body.innerHTML;
      
      // Clear the body
      doc.body.innerHTML = '';
      
      // Create the outer container
      const outerContainer = doc.createElement('div');
      outerContainer.setAttribute('style', 'width: 100%; margin: 0 auto; background-color: #FFFFFF;');
      
      // Create the inner container
      const innerContainer = doc.createElement('div');
      innerContainer.setAttribute('style', 'max-width: 650px; margin: 0 auto; background-color: #FFFFFF;');
      
      // Add header if enabled
      if (settings.headerEnabled) {
        const header = doc.createElement('div');
        header.setAttribute('style', `
          background-color: ${settings.headerTextColor === '#FFFFFF' ? settings.headerBgColor || '#33A8DF' : '#F5F5F5'};
          padding: 24px 20px;
          text-align: center;
        `);
        
        // Add logo if available
        if (settings.headerLogo) {
          const logoWrapper = doc.createElement('div');
          logoWrapper.setAttribute('style', `
            text-align: ${settings.headerLogoAlignment || 'center'};
            margin-bottom: ${settings.headerContent ? '10px' : '0'};
          `);
          
          const logo = doc.createElement('img');
          logo.setAttribute('src', settings.headerLogo);
          logo.setAttribute('alt', 'Logo');
          logo.setAttribute('style', `
            max-width: ${settings.headerLogoWidth || 200}px;
            max-height: 80px;
          `);
          
          logoWrapper.appendChild(logo);
          header.appendChild(logoWrapper);
        }
        
        // Add header content if available
        if (settings.headerContent) {
          const content = doc.createElement('div');
          content.setAttribute('style', `
            color: ${settings.headerTextColor || '#FFFFFF'};
            font-size: 22px;
            font-weight: bold;
          `);
          content.innerHTML = processText(settings.headerContent);
          header.appendChild(content);
        }
        
        innerContainer.appendChild(header);
      }
      
      // Add content
      const contentDiv = doc.createElement('div');
      contentDiv.setAttribute('style', 'padding: 40px 20px; background-color: #FFFFFF;');
      contentDiv.innerHTML = bodyContent;
      innerContainer.appendChild(contentDiv);
      
      // Add footer if enabled
      if (settings.footerEnabled) {
        const footer = doc.createElement('div');
        footer.setAttribute('style', `
          background-color: ${settings.footerTextColor === '#FFFFFF' ? settings.footerBgColor || '#33A8DF' : '#F5F5F5'};
          padding: 20px;
          text-align: center;
          font-size: 14px;
          color: ${settings.footerTextColor || '#FFFFFF'};
        `);
        
        // Add footer content if available
        if (settings.footerContent) {
          const content = doc.createElement('div');
          content.setAttribute('style', 'margin-bottom: 15px;');
          content.innerHTML = processText(settings.footerContent);
          footer.appendChild(content);
        }
        
        // Add social icons if enabled
        if (settings.footerShowSocialIcons && settings.footerSocialLinks?.length > 0) {
          const socialIcons = doc.createElement('div');
          socialIcons.setAttribute('style', 'margin-bottom: 15px;');
          
          settings.footerSocialLinks
            .filter((link: { enabled: boolean }) => link.enabled)
            .forEach((link: { platform: string; url: string }) => {
              const icon = doc.createElement('a');
              icon.setAttribute('href', link.url);
              icon.setAttribute('target', '_blank');
              icon.setAttribute('rel', 'noopener noreferrer');
              icon.setAttribute('style', `
                display: inline-block;
                margin: 0 10px;
                width: 24px;
                height: 24px;
                background-color: #FFFFFF;
                border-radius: 50%;
                text-align: center;
                line-height: 24px;
                text-decoration: none;
                color: #333333;
                font-weight: bold;
              `);
              icon.textContent = link.platform.charAt(0).toUpperCase();
              socialIcons.appendChild(icon);
            });
          
          footer.appendChild(socialIcons);
        }
        
        // Add company address if enabled
        if (settings.footerShowAddress && settings.footerAddress) {
          const address = doc.createElement('div');
          address.setAttribute('style', 'margin-bottom: 10px; font-size: 12px;');
          address.innerHTML = processText(settings.footerAddress);
          footer.appendChild(address);
        }
        
        // Add unsubscribe link if enabled
        if (settings.footerShowUnsubscribe) {
          const unsubscribe = doc.createElement('div');
          unsubscribe.setAttribute('style', 'margin-bottom: 10px; font-size: 12px;');
          
          const link = doc.createElement('a');
          link.setAttribute('href', processText(settings.footerUnsubscribeUrl || '#'));
          link.setAttribute('style', `
            color: ${settings.footerTextColor || '#FFFFFF'};
            text-decoration: underline;
          `);
          link.textContent = settings.footerUnsubscribeText || 'Unsubscribe';
          
          unsubscribe.appendChild(link);
          footer.appendChild(unsubscribe);
        }
        
        // Add copyright text
        if (settings.footerCopyrightText) {
          const copyright = doc.createElement('div');
          copyright.setAttribute('style', 'font-size: 12px;');
          copyright.textContent = processText(settings.footerCopyrightText);
          footer.appendChild(copyright);
        }
        
        innerContainer.appendChild(footer);
      }
      
      // Assemble the structure
      outerContainer.appendChild(innerContainer);
      doc.body.appendChild(outerContainer);
    }
    
    // Convert back to HTML string
    return doc.documentElement.outerHTML;
  } catch (error) {
    console.error('Error applying header/footer:', error);
    return content;
  }
}