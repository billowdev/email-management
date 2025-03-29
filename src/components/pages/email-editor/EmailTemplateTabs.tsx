import React from 'react';
import { Tabs } from 'antd';
import type { TabsProps } from 'antd';
import EmailTemplateEditor from '@/components/EmailTemplateEditor';
import EmailPreview from '../email-preview/EmailPreview';

// Define types for the template, preview data, and components
interface Template {
  id: string;
  defaultContent: string;
  variables: string[];
  // Add other template properties as needed
}

interface PreviewData {
  [key: string]: string;
}

interface EmailTemplateEditorProps {
  initialContent: string;
  templateId: string;
  availableVariables: string[];
  previewData: PreviewData;
  onHtmlChange: (html: string) => void;
}

interface EmailPreviewProps {
  html: string;
  previewData: PreviewData;
  templateId: string;
  availableVariables: string[];
  onUpdatePreviewData: (data: PreviewData) => void;
}

interface EmailTemplateTabsProps {
  activeTab: string;
  setActiveTab: (key: string) => void;
  selectedTemplate: Template;
  currentHtml: string;
  previewData: PreviewData;
  handleHtmlChange: (html: string) => void;
  handleUpdatePreviewData: (data: PreviewData) => void;
}

const EmailTemplateTabs: React.FC<EmailTemplateTabsProps> = ({
  activeTab,
  setActiveTab,
  selectedTemplate,
  currentHtml,
  previewData,
  handleHtmlChange,
  handleUpdatePreviewData
}) => {
  // Define items for the Tabs component
  const items: TabsProps['items'] = [
    {
      key: 'edit',
      label: 'Edit',
      children: (
        <EmailTemplateEditor 
          initialContent={selectedTemplate.defaultContent}
          templateId={selectedTemplate.id}
          availableVariables={selectedTemplate.variables}
          previewData={previewData}
          onHtmlChange={handleHtmlChange}
        />
      )
    },
    {
      key: 'preview',
      label: 'Preview',
      children: (
        <EmailPreview
          html={currentHtml}
          previewData={previewData}
          templateId={selectedTemplate.id}
          availableVariables={selectedTemplate.variables}
          onUpdatePreviewData={handleUpdatePreviewData}
        />
      )
    }
  ];

  return (
    <Tabs 
      activeKey={activeTab} 
      onChange={setActiveTab} 
      items={items}
    //   immediatelyRender={false}
    />
  );
};

export default EmailTemplateTabs;