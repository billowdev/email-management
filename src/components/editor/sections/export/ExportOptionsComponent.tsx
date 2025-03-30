// src/components/editor/sections/ExportOptionsComponent.tsx
import React, { useState, useRef } from 'react';
import { Button, Dropdown, message } from 'antd';
import { DownloadOutlined, DownOutlined } from '@ant-design/icons';
import type { MenuProps } from 'antd';
import { getTemplateHeaderFooter, applyHeaderFooterToContent } from '@/services/emailTemplateService';
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
  const contentRef = useRef<string>(html);
  
  // Update contentRef when html changes
  React.useEffect(() => {
    contentRef.current = html;
  }, [html]);


  // Export complete template with variables preserved (not replaced with data)
const exportTemplateWithVariables = async () => {
	try {
	  setExporting(true);
	  
	  // IMPORTANT: We need to start with the raw template HTML that contains variables
	  // NOT the html that has already had variables replaced
	  const templateContent = rawTemplateHtml;
	  
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
	  
	  // Create a very simple, clean template with our content
	  const cleanTemplate = `
  <!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
  <html xmlns="http://www.w3.org/1999/xhtml">
  <head>
	<meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
	<meta name="viewport" content="width=device-width, initial-scale=1.0" />
	<title>${templateName || 'Email Template'}</title>
	<style type="text/css">
	  body { margin: 0; padding: 0; min-width: 100%; font-family: Arial, sans-serif; }
	  .email-container { width: 100%; margin: 0 auto; max-width: ${backgroundSettings.maxWidth}; }
	  .email-header { background-color: ${backgroundSettings.headerBgColor}; padding: 20px; text-align: center; }
	  .email-body { background-color: ${backgroundSettings.contentBgColor}; padding: 40px 20px; }
	  .email-footer { background-color: ${backgroundSettings.footerBgColor}; padding: 20px; text-align: center; }
	  .variable { color: #2563eb; font-weight: bold; background-color: rgba(59, 130, 246, 0.1); border-radius: 0.25rem; padding: 2px 4px; }
	</style>
  </head>
  <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: ${backgroundSettings.bodyBgColor};">
	<div style="width: 100%; margin: 0 auto; background-color: ${backgroundSettings.bodyBgColor};">
	  <div class="email-container" style="margin: 0 auto; background-color: ${backgroundSettings.containerBgColor};">
		<!-- Header will be added here -->
		<div class="email-header-placeholder"></div>
		
		<!-- Main Content -->
		<div class="email-body" style="padding: 40px 20px; background-color: ${backgroundSettings.contentBgColor};">
		  ${templateContent}
		</div>
		
		<!-- Footer will be added here -->
		<div class="email-footer-placeholder"></div>
	  </div>
	</div>
  </body>
  </html>
	  `;
	  
	  // Create a DOM parser to work with the HTML
	  const parser = new DOMParser();
	  const doc = parser.parseFromString(cleanTemplate, 'text/html');
	  
	  // Now, let's add header and footer without using the applyHeaderFooterToContent function
	  // This way we can ensure variables don't get replaced
	  try {
		const headerPlaceholder = doc.querySelector('.email-header-placeholder');
		const footerPlaceholder = doc.querySelector('.email-footer-placeholder');
		
		// Get header/footer settings
		const headerFooterSettings = await getTemplateHeaderFooter(templateId);
		
		if (headerFooterSettings) {
		  // Create header
		  if (headerFooterSettings.headerEnabled) {
			const headerDiv = doc.createElement('div');
			headerDiv.className = 'email-header';
			headerDiv.style.backgroundColor = backgroundSettings.headerBgColor;
			headerDiv.style.padding = '20px';
			headerDiv.style.textAlign = 'center';
			
			let headerContent = '';
			
			// Add logo if available
			if (headerFooterSettings.headerLogo) {
			  const logoAlignment = headerFooterSettings.headerLogoAlignment || 'center';
			  headerContent += `
				<div style="text-align: ${logoAlignment}; margin-bottom: ${headerFooterSettings.headerContent ? '10px' : '0'};">
				  <img src="${headerFooterSettings.headerLogo}" alt="Logo" style="max-width: ${headerFooterSettings.headerLogoWidth || 200}px; max-height: 80px;" />
				</div>
			  `;
			}
			
			// Add header text if available
			if (headerFooterSettings.headerContent) {
			  headerContent += `
				<div style="color: ${headerFooterSettings.headerTextColor || '#FFFFFF'}; font-size: 22px; font-weight: bold;">
				  ${headerFooterSettings.headerContent}
				</div>
			  `;
			}
			
			headerDiv.innerHTML = headerContent;
			
			// Replace placeholder with actual header
			headerPlaceholder?.parentNode?.replaceChild(headerDiv, headerPlaceholder);
		  } else {
			// If header is disabled, remove the placeholder
			headerPlaceholder?.remove();
		  }
		  
		  // Create footer
		  if (headerFooterSettings.footerEnabled) {
			const footerDiv = doc.createElement('div');
			footerDiv.className = 'email-footer';
			footerDiv.style.backgroundColor = backgroundSettings.footerBgColor;
			footerDiv.style.padding = '20px';
			footerDiv.style.textAlign = 'center';
			footerDiv.style.color = headerFooterSettings.footerTextColor || '#FFFFFF';
			
			let footerContent = '';
			
			// Add footer content if available
			if (headerFooterSettings.footerContent) {
			  footerContent += `
				<div style="margin-bottom: 15px;">
				  ${headerFooterSettings.footerContent}
				</div>
			  `;
			}
			
			// Add social icons if enabled
			if (headerFooterSettings.footerShowSocialIcons && headerFooterSettings.footerSocialLinks?.length > 0) {
			  footerContent += '<div style="margin-bottom: 15px;">';
			  
			  headerFooterSettings.footerSocialLinks
        .filter((link: { enabled: boolean; url: string; platform: string }) => link.enabled)
        .forEach((link: { enabled: boolean; url: string; platform: string }) => {
				  footerContent += `
					<a href="${link.url}" target="_blank" rel="noopener noreferrer" style="
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
					</a>
				  `;
				});
			  
			  footerContent += '</div>';
			}
			
			// Add company address if enabled
			if (headerFooterSettings.footerShowAddress && headerFooterSettings.footerAddress) {
			  footerContent += `
				<div style="margin-bottom: 10px; font-size: 12px;">
				  ${headerFooterSettings.footerAddress}
				</div>
			  `;
			}
			
			// Add unsubscribe link if enabled
			if (headerFooterSettings.footerShowUnsubscribe) {
			  footerContent += `
				<div style="margin-bottom: 10px; font-size: 12px;">
				  <a href="${headerFooterSettings.footerUnsubscribeUrl || '#'}" style="
					color: ${headerFooterSettings.footerTextColor || '#FFFFFF'};
					text-decoration: underline;
				  ">
					${headerFooterSettings.footerUnsubscribeText || 'Unsubscribe'}
				  </a>
				</div>
			  `;
			}
			
			// Add copyright text
			if (headerFooterSettings.footerCopyrightText) {
			  footerContent += `
				<div style="font-size: 12px;">
				  ${headerFooterSettings.footerCopyrightText}
				</div>
			  `;
			}
			
			footerDiv.innerHTML = footerContent;
			
			// Replace placeholder with actual footer
			footerPlaceholder?.parentNode?.replaceChild(footerDiv, footerPlaceholder);
		  } else {
			// If footer is disabled, remove the placeholder
			footerPlaceholder?.remove();
		  }
		} else {
		  // If no header/footer settings, remove the placeholders
		  headerPlaceholder?.remove();
		  footerPlaceholder?.remove();
		}
	  } catch (error) {
		console.error('Error adding header/footer:', error);
		// Remove placeholders if we couldn't add header/footer
		doc.querySelector('.email-header-placeholder')?.remove();
		doc.querySelector('.email-footer-placeholder')?.remove();
	  }
	  
	  // Final check to make sure variables are preserved
	  // Look for elements with variables and add a class to style them
	  const allElements = doc.querySelectorAll('*');
	  allElements.forEach(el => {
		if (el.innerHTML && el.innerHTML.includes('{{.')) {
		  // This is a text node containing a variable
		  const updatedContent = el.innerHTML.replace(
			/{{\.([^}]+)}}/g, 
			'<span class="variable">{{.$1}}</span>'
		  );
		  el.innerHTML = updatedContent;
		}
	  });
	  
	  // Get the complete HTML
	  const completeHtml = '<!DOCTYPE html>\n' + doc.documentElement.outerHTML;
	  
	  // Create and download the file
	  const blob = new Blob([completeHtml], { type: 'text/html' });
	  const url = URL.createObjectURL(blob);
	  const a = document.createElement('a');
	  a.href = url;
	  a.download = `${templateName.toLowerCase().replace(/\s+/g, '-')}-template-with-variables.html`;
	  a.click();
	  URL.revokeObjectURL(url);
	  
	  message.success('Template with variables exported successfully');
	} catch (error) {
	  console.error('Error exporting template with variables:', error);
	  message.error('Failed to export template with variables');
	} finally {
	  setExporting(false);
	}
  };
  
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

  // Extract actual content from HTML structure
  const extractContentFromHtml = (htmlString: string): string => {
    try {
      const parser = new DOMParser();
      const doc = parser.parseFromString(htmlString, 'text/html');
      
      // First, look for a content section (usually div with padding in the middle)
      const contentDivs = doc.querySelectorAll('div[style*="padding"]');
      if (contentDivs.length > 0) {
        // Find the one that's likely the content (not header/footer)
        for (let i = 0; i < contentDivs.length; i++) {
          const div = contentDivs[i];
          const style = div.getAttribute('style') || '';
          
          // If it's not clearly a header/footer (usually has text-align: center)
          if (!style.includes('text-align: center') && div.innerHTML.trim()) {
            return div.innerHTML;
          }
        }
        
        // If we can't determine which is content, use the one with the most content
        let contentDiv = contentDivs[0];
        let maxLength = contentDiv.innerHTML.length;
        
        for (let i = 1; i < contentDivs.length; i++) {
          if (contentDivs[i].innerHTML.length > maxLength) {
            contentDiv = contentDivs[i];
            maxLength = contentDiv.innerHTML.length;
          }
        }
        
        return contentDiv.innerHTML;
      }
      
      // If no content section found, return the body content
      return doc.body.innerHTML;
    } catch (error) {
      console.error('Error extracting content:', error);
      return htmlString; // Return original if extraction fails
    }
  };

  // Export complete template with background, header, and footer
  const exportCompleteTemplate = async () => {
    try {
      setExporting(true);
      
      // Store the content for safekeeping
      const originalContent = contentRef.current || html;
      const rawContent = rawTemplateHtml || originalContent;
      let extractedContent = extractContentFromHtml(originalContent);
      
      // Make a copy of extracted content for backup
      const backupContent = extractedContent;
      
      // Log content for debugging
      console.log('Original extracted content length:', extractedContent.length);
      
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
      
      // Instead of creating a completely new document, let's try to preserve
      // the original structure if it exists
      let baseHtml = '';
      const parser = new DOMParser();
      
      // Check if the original HTML already has a proper structure
      const structureCheck = parser.parseFromString(originalContent, 'text/html');
      const hasStructure = structureCheck.querySelector('body > div > div[style*="max-width"]') !== null;
      
      if (hasStructure) {
        // If it has structure, use it as the base but ensure content is preserved
        const contentDiv = structureCheck.querySelector('div[style*="padding"][style*="background-color"]');
        if (contentDiv) {
          // Make sure the content div has our extracted content
          contentDiv.innerHTML = extractedContent;
        }
        
        // Update background settings on existing structure
        const bodyElement = structureCheck.querySelector('body');
        if (bodyElement) {
          bodyElement.setAttribute('style', `margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: ${backgroundSettings.bodyBgColor};`);
        }
        
        const outerDiv = structureCheck.querySelector('body > div');
        if (outerDiv) {
          outerDiv.setAttribute('style', `width: 100%; margin: 0 auto; background-color: ${backgroundSettings.bodyBgColor};`);
        }
        
        const innerDiv = structureCheck.querySelector('body > div > div[style*="max-width"]');
        if (innerDiv) {
          innerDiv.setAttribute('style', `max-width: ${backgroundSettings.maxWidth}; margin: 0 auto; background-color: ${backgroundSettings.containerBgColor};`);
        }
        
        baseHtml = structureCheck.documentElement.outerHTML;
      } else {
        // Create a new structured document if no structure exists
        const doc = parser.parseFromString(`
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
<head>
  <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${templateName || 'Email Template'}</title>
</head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: ${backgroundSettings.bodyBgColor};">
  <div style="width: 100%; margin: 0 auto; background-color: ${backgroundSettings.bodyBgColor};">
    <div style="max-width: ${backgroundSettings.maxWidth}; margin: 0 auto; background-color: ${backgroundSettings.containerBgColor};">
      <!-- Content will be inserted here -->
      <div id="email-content" data-content-marker="true" style="padding: 40px 20px; background-color: ${backgroundSettings.contentBgColor};">
        ${extractedContent}
      </div>
    </div>
  </div>
</body>
</html>`, 'text/html');
        
        baseHtml = doc.documentElement.outerHTML;
      }
      
      // Apply header and footer
      let completeHtml = baseHtml;
      
      try {
        // First, make 100% sure our content is in the document
        const contentCheck = parser.parseFromString(completeHtml, 'text/html');
        const contentDivs = contentCheck.querySelectorAll('div[style*="padding"][style*="background-color"]');
        let hasContent = false;
        
        for (let i = 0; i < contentDivs.length; i++) {
          if (contentDivs[i].innerHTML.trim()) {
            hasContent = true;
            break;
          }
        }
        
        if (!hasContent) {
          console.warn('No content found in template before header/footer application');
          // Look for any div that could be a content container
          const possibleContainers = contentCheck.querySelectorAll('div');
          
          for (let i = 0; i < possibleContainers.length; i++) {
            const div = possibleContainers[i];
            const style = div.getAttribute('style') || '';
            
            // Skip divs that are clearly headers or footers
            if (style.includes('text-align: center')) continue;
            
            // Insert content in the most likely container
            if (style.includes('padding') || style.includes('margin: 0 auto')) {
              div.innerHTML = extractedContent;
              console.log('Inserted content into container', i);
              break;
            }
          }
          
          completeHtml = contentCheck.documentElement.outerHTML;
        }
        
        // Now apply header/footer
        completeHtml = await applyHeaderFooterToContent(templateId, completeHtml, previewData);
        
        // Verify one last time the content is still there
        const finalCheck = parser.parseFromString(completeHtml, 'text/html');
        
        // First, look for our content marker
        const markedContent = finalCheck.querySelector('[data-content-marker="true"]');
        if (markedContent) {
          console.log('Found content marker, content is preserved');
        } else {
          // Try regular content detection
          const allDivs = finalCheck.querySelectorAll('div[style*="padding"]');
          let contentFound = false;
          
          for (let i = 0; i < allDivs.length; i++) {
            // Check if this div has non-trivial content
            const content = allDivs[i].innerHTML;
            if (content && content.length > 50) {
              contentFound = true;
              break;
            }
          }
          
          if (!contentFound) {
            console.warn('Content still missing after header/footer application');
            
            // Last resort: manually insert our content between header and footer
            const allContainers = finalCheck.querySelectorAll('div[style*="background-color"]');
            if (allContainers.length >= 2) {
              // Assuming first is header, last is footer
              const contentContainer = finalCheck.createElement('div');
              contentContainer.setAttribute('style', `padding: 40px 20px; background-color: ${backgroundSettings.contentBgColor};`);
              contentContainer.innerHTML = backupContent;
              
              // Insert after first container (header)
              allContainers[0].after(contentContainer);
              
              completeHtml = finalCheck.documentElement.outerHTML;
            }
          }
        }
      } catch (error) {
        console.error('Error applying header/footer:', error);
        // If header/footer application completely fails, use our backup approach
        
        // Create a clean document with the content
        const backupDoc = parser.parseFromString(`
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
<head>
  <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${templateName || 'Email Template'}</title>
</head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: ${backgroundSettings.bodyBgColor};">
  <div style="width: 100%; margin: 0 auto; background-color: ${backgroundSettings.bodyBgColor};">
    <div style="max-width: ${backgroundSettings.maxWidth}; margin: 0 auto; background-color: ${backgroundSettings.containerBgColor};">
      <!-- Backup content insertion point -->
      <div style="padding: 40px 20px; background-color: ${backgroundSettings.contentBgColor};">
        ${backupContent}
      </div>
    </div>
  </div>
</body>
</html>`, 'text/html');
        
        completeHtml = backupDoc.documentElement.outerHTML;
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
      
      // Store the content for safekeeping
      const originalContent = contentRef.current || html;
      
      // Apply header and footer with preview data
      let completeHtml = originalContent;
      
      try {
        completeHtml = await applyHeaderFooterToContent(templateId, originalContent, previewData);
        
        // Verify content is preserved
        const parser = new DOMParser();
        const doc = parser.parseFromString(completeHtml, 'text/html');
        
        // Check if content exists
        const contentDivs = doc.querySelectorAll('div[style*="padding"]');
        let contentExists = false;
        
        for (let i = 0; i < contentDivs.length; i++) {
          if (contentDivs[i].innerHTML.trim()) {
            contentExists = true;
            break;
          }
        }
        
        if (!contentExists) {
          console.warn('Content missing in header/footer application');
          
          // Extract content from original and insert it
          const extractedContent = extractContentFromHtml(originalContent);
          
          // Find a suitable container to insert content
          const containers = doc.querySelectorAll('div[style*="margin: 0 auto"]');
          if (containers.length > 0) {
            // Create content div
            const contentDiv = doc.createElement('div');
            contentDiv.setAttribute('style', 'padding: 40px 20px; background-color: #FFFFFF;');
            contentDiv.innerHTML = extractedContent;
            
            // Insert after header if exists, otherwise at beginning
            const header = containers[0].querySelector('div[style*="text-align: center"]');
            if (header) {
              header.after(contentDiv);
            } else {
              containers[0].prepend(contentDiv);
            }
            
            // Update HTML
            completeHtml = doc.documentElement.outerHTML;
          }
        }
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
      
      // Store the content for safekeeping
      const originalContent = contentRef.current || html;
      
      // Parse the HTML to retain structure but remove backgrounds
      const parser = new DOMParser();
      const doc = parser.parseFromString(originalContent, 'text/html');
      
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
        // First ensure content is preserved
        const extractedContent = extractContentFromHtml(originalContent);
        
        // Apply header and footer content
        noBackgroundHtml = await applyHeaderFooterToContent(templateId, noBackgroundHtml, previewData);
        
        // Then remove backgrounds from the result
        const finalDoc = parser.parseFromString(noBackgroundHtml, 'text/html');
        removeBackgrounds(finalDoc.documentElement);
        
        // Check if content was preserved
        const contentExists = finalDoc.body.textContent && finalDoc.body.textContent.trim().length > 0;
        
        if (!contentExists) {
          console.warn('Content lost during header/footer application, restoring it');
          
          // Find a container to insert content
          const container = finalDoc.querySelector('div[style*="margin: 0 auto"] > div');
          if (container) {
            const contentDiv = finalDoc.createElement('div');
            contentDiv.setAttribute('style', 'padding: 40px 20px; background-color: #FFFFFF;');
            contentDiv.innerHTML = extractedContent;
            container.appendChild(contentDiv);
          }
        }
        
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
      
      // Store the content for safekeeping
      const originalContent = contentRef.current || html;
      
      // Extract just the content
      const extractedContent = extractContentFromHtml(originalContent);
      
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
  ${extractedContent}
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
      let headerFooterHtml = await applyHeaderFooterToContent(templateId, cleanHtml, previewData);
      
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
    {
      key: '7',
      label: 'Export Template With Variables',
      onClick: exportTemplateWithVariables,
    }
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