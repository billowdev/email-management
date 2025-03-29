"use client"
import { useState } from 'react'
import EmailTemplateEditor from '@/components/EmailTemplateEditor'
import EmailPreview from '@/components/pages/email-preview/EmailPreview'
import { defaultTemplates, defaultPreviewData, PreviewData } from '@/types/email-templates'
import { Tabs } from 'antd'
import EmailTemplateTabs from './EmailTemplateTabs'

const { TabPane } = Tabs;

export default function EditorPage() {
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>(defaultTemplates[0].id)
  const [currentHtml, setCurrentHtml] = useState<string>(defaultTemplates[0].defaultContent)
  const [previewData, setPreviewData] = useState<PreviewData>(defaultPreviewData)
  const [activeTab, setActiveTab] = useState<string>("edit")
  
  // Find the selected template
  const selectedTemplate = defaultTemplates.find(t => t.id === selectedTemplateId) || defaultTemplates[0]
  
  const handleHtmlChange = (html: string) => {
    setCurrentHtml(html)
  }
  
  const handleUpdatePreviewData = (data: PreviewData) => {
    setPreviewData(data)
  }
  
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6 text-white">Email Template Editor - Rich text using Tiptap</h1>
      
      <div className="mb-6">
        <select 
          className="p-2 border rounded"
          value={selectedTemplateId}
          onChange={(e) => setSelectedTemplateId(e.target.value)}
        >
          {defaultTemplates.map(template => (
            <option key={template.id} value={template.id}>
              {template.name}
            </option>
          ))}
        </select>
      </div>
      
      <div className="mb-4">
        <h2 className="text-xl font-semibold">{selectedTemplate.name}</h2>
          <p className="text-sm text-gray-500">
          Available variables: {selectedTemplate.variables.map(v => (
            <span key={v} className="inline-block bg-blue-50 text-blue-700 px-1 py-0.5 rounded text-xs mr-1">
              {`{{.${v}}}`}
            </span>
          ))}
        </p>
      </div>
      
      {/* <Tabs activeKey={activeTab} onChange={setActiveTab}>
        <TabPane tab="Edit" key="edit">
          <EmailTemplateEditor 
            initialContent={selectedTemplate.defaultContent}
            templateId={selectedTemplate.id}
            availableVariables={selectedTemplate.variables}
            previewData={previewData}
            onHtmlChange={handleHtmlChange}
          />
        </TabPane>
        <TabPane tab="Preview" key="preview">
          <EmailPreview
            html={currentHtml}
            previewData={previewData}
            templateId={selectedTemplate.id}
            availableVariables={selectedTemplate.variables}
            onUpdatePreviewData={handleUpdatePreviewData}
          />
        </TabPane>
      </Tabs>
       */}
     
     <EmailTemplateTabs
    activeTab={activeTab}
    setActiveTab={setActiveTab}
    selectedTemplate={selectedTemplate}
    currentHtml={currentHtml}
    previewData={previewData}
    handleHtmlChange={handleHtmlChange}
    handleUpdatePreviewData={handleUpdatePreviewData}
  />
    </div>
  )
}