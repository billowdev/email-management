// src/services/emailTemplateService.ts
import { VariableType } from '@prisma/client';
const API_BASE_URL = process.env.NEXT_PUBLIC_API || '';

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
  const response = await fetch(`${API_BASE_URL}/api/templates`);
  
  if (!response.ok) {
    throw new Error('Failed to fetch templates');
  }
  
  return response.json();
}

// Fetch a specific template by ID
export async function getTemplateById(id: string): Promise<EmailTemplateWithRelations> {
  const response = await fetch(`${API_BASE_URL}/api/templates/${id}`);
  
  if (!response.ok) {
    throw new Error('Failed to fetch template');
  }
  
  return response.json();
}

// Create a new template
export async function createTemplate(template: CreateTemplatePayload): Promise<EmailTemplateWithRelations> {
  const response = await fetch(`${API_BASE_URL}/api/templates`, {
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
  const response = await fetch(`${API_BASE_URL}/api/templates/${id}`, {
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
  const response = await fetch(`${API_BASE_URL}/api/templates/${id}`, {
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
  const response = await fetch(`${API_BASE_URL}/api/templates/${templateId}/variables`, {
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
  const response = await fetch(`${API_BASE_URL}/api/templates/${templateId}/variables/${variableId}`, {
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
  const response = await fetch(`${API_BASE_URL}/api/templates/${templateId}/variables/${variableId}`, {
    method: 'DELETE',
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to delete variable');
  }
}

// Get all variables for a template
export async function getVariablesByTemplateId(templateId: string): Promise<TemplateVariable[]> {
  const response = await fetch(`${API_BASE_URL}/api/templates/${templateId}/variables`);
  
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
  const response = await fetch(`${API_BASE_URL}/api/templates/${templateId}/preview`, {
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
  const response = await fetch(`${API_BASE_URL}/api/templates/${templateId}/preview`);
  
  if (!response.ok) {
    throw new Error('Failed to fetch preview data');
  }
  
  return response.json();
}
