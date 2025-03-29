// import EditorPage from "@/components/pages/email-editor/EditorPage";
// import { ConfigProvider } from "antd";
// // Removed the import as CompatibleApp is not exported from '@ant-design/compatible'

// export default function App() {
//   return (
//     <ConfigProvider>
//         <main>
//           {/* No event handlers passed here */}
//           <EditorPage />
//         </main>
//     </ConfigProvider>
//   )
// }

"use client"
import { useState } from 'react'
import EmailTemplateManager from '@/components/EmailTemplateManager'
import { ConfigProvider } from "antd"
import { EmailTemplateWithRelations } from '@/services/emailTemplateService'

export default function EditorPage() {
  const [selectedTemplate, setSelectedTemplate] = useState<EmailTemplateWithRelations | null>(null)
  const [currentHtml, setCurrentHtml] = useState<string>('')
  
  const handleSelectTemplate = (template: EmailTemplateWithRelations, html: string) => {
    setSelectedTemplate(template)
    setCurrentHtml(html)
  }
  
  return (
    <ConfigProvider>
      <main>
        <EmailTemplateManager 
          onSelectTemplate={handleSelectTemplate}
        />
      </main>
    </ConfigProvider>
  )
}