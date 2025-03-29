// src/services/emailBackgroundService.ts
import { BackgroundSettings } from '@/types/email-templates';

// Function to get background settings for a template
export async function getTemplateBackground(templateId: string): Promise<BackgroundSettings | null> {
  try {
    const response = await fetch(`/api/templates/${templateId}/background`);
    
    if (!response.ok) {
      if (response.status === 404) {
        // No background settings found, which is ok
        return null;
      }
      throw new Error('Failed to fetch background settings');
    }
    
    return response.json();
  } catch (error) {
    console.error('Error fetching background settings:', error);
    return null;
  }
}

// Function to save background settings for a template
export async function saveTemplateBackground(
  templateId: string, 
  settings: BackgroundSettings
): Promise<BackgroundSettings> {
  try {
    const response = await fetch(`/api/templates/${templateId}/background`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(settings),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to save background settings');
    }
    
    return response.json();
  } catch (error) {
    console.error('Error saving background settings:', error);
    throw error;
  }
}


// Function to update email template background settings
export async function updateTemplateBackground(
	templateId: string,
	backgroundSettings: {
	  bodyBgColor: string;
	  containerBgColor: string;
	  headerBgColor: string;
	  contentBgColor: string;
	  footerBgColor: string;
	  maxWidth: string;
	}
  ): Promise<any> {
	try {
	  const response = await fetch(`/api/templates/${templateId}/background`, {
		method: 'PUT',
		headers: {
		  'Content-Type': 'application/json',
		},
		body: JSON.stringify(backgroundSettings),
	  });
	  
	  if (!response.ok) {
		const error = await response.json();
		throw new Error(error.error || 'Failed to update background settings');
	  }
	  
	  return response.json();
	} catch (error) {
	  console.error('Error updating background settings:', error);
	  throw error;
	}
  }