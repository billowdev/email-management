// src/components/editor/EmailSectionsComponent.tsx
import React, { useState } from 'react';
import { Editor } from '@tiptap/react';
import { Button, Dropdown, Menu, Modal, Tooltip, Space, Tabs, Radio, Input, ColorPicker, InputNumber, Select } from 'antd';
import { 
  LayoutOutlined, 
  DownOutlined, 
  AppstoreOutlined, 
  SplitCellsOutlined, 
  DashOutlined, 
  PoweroffOutlined 
} from '@ant-design/icons';
import type { MenuProps } from 'antd';
import type { Color } from 'antd/es/color-picker';
import type { TabsProps } from 'antd';

const { TextArea } = Input;
const { Option } = Select;

interface EmailSectionsComponentProps {
  editor: Editor | null;
}

const EmailSectionsComponent: React.FC<EmailSectionsComponentProps> = ({ editor }) => {
  const [isModalVisible, setIsModalVisible] = useState<boolean>(false);
  const [currentSection, setCurrentSection] = useState<string>('');
  // Button settings
  const [buttonText, setButtonText] = useState<string>('Click Here');
  const [buttonUrl, setButtonUrl] = useState<string>('https://');
  const [buttonBgColor, setButtonBgColor] = useState<string>('#2563eb');
  const [buttonTextColor, setButtonTextColor] = useState<string>('#ffffff');
  const [buttonWidth, setButtonWidth] = useState<number>(200);
  const [buttonAlignment, setButtonAlignment] = useState<string>('center');
  // Divider settings
  const [dividerWidth, setDividerWidth] = useState<number>(100);
  const [dividerHeight, setDividerHeight] = useState<number>(1);
  const [dividerColor, setDividerColor] = useState<string>('#e5e7eb');
  // Header settings
  const [headerText, setHeaderText] = useState<string>('Section Header');
  const [headerSize, setHeaderSize] = useState<string>('h2');
  const [headerColor, setHeaderColor] = useState<string>('#111827');
  const [headerAlignment, setHeaderAlignment] = useState<string>('left');
  // Spacer settings
  const [spacerHeight, setSpacerHeight] = useState<number>(20);

  // Show the section insertion modal
  const showModal = (sectionType: string) => {
    setCurrentSection(sectionType);
    
    // Reset form values
    if (sectionType === 'button') {
      setButtonText('Click Here');
      setButtonUrl('https://');
      setButtonBgColor('#2563eb');
      setButtonTextColor('#ffffff');
      setButtonWidth(200);
      setButtonAlignment('center');
    } else if (sectionType === 'divider') {
      setDividerWidth(100);
      setDividerHeight(1);
      setDividerColor('#e5e7eb');
    } else if (sectionType === 'header') {
      setHeaderText('Section Header');
      setHeaderSize('h2');
      setHeaderColor('#111827');
      setHeaderAlignment('left');
    } else if (sectionType === 'spacer') {
      setSpacerHeight(20);
    }
    
    setIsModalVisible(true);
  };

  // Handle modal cancel
  const handleCancel = () => {
    setIsModalVisible(false);
  };

  // Insert CTA button
  const insertButton = () => {
    if (!editor) return;
    
    // Ensure we have a URL
    let finalUrl = buttonUrl;
    if (!finalUrl.startsWith('http')) {
      finalUrl = 'https://' + finalUrl;
    }
    
    // Create alignment style
    const alignStyle = buttonAlignment === 'center' 
      ? 'display: block; margin: 0 auto; text-align: center;' 
      : buttonAlignment === 'right' 
        ? 'display: block; margin-left: auto; text-align: right;' 
        : 'display: block; margin-right: auto; text-align: left;';
    
    // Create button HTML
    const buttonHtml = `
      <div style="${alignStyle} margin-top: 15px; margin-bottom: 15px;">
        <a href="${finalUrl}" 
          style="
            background-color: ${buttonBgColor}; 
            color: ${buttonTextColor}; 
            padding: 10px 20px; 
            text-decoration: none; 
            border-radius: 4px; 
            display: inline-block;
            font-weight: bold;
            text-align: center;
            width: ${buttonWidth}px;
            max-width: 100%;
          "
          target="_blank"
        >
          ${buttonText}
        </a>
      </div>
    `;
    
    editor.chain().focus().insertContent(buttonHtml).run();
    setIsModalVisible(false);
  };

  // Insert divider
  const insertDivider = () => {
    if (!editor) return;
    
    const dividerHtml = `
      <div style="width: 100%; padding: 10px 0;">
        <div style="
          width: ${dividerWidth}%; 
          height: ${dividerHeight}px; 
          background-color: ${dividerColor}; 
          margin: 0 auto;
        "></div>
      </div>
    `;
    
    editor.chain().focus().insertContent(dividerHtml).run();
    setIsModalVisible(false);
  };

  // Insert header
  const insertHeader = () => {
    if (!editor) return;
    
    const headingTag = headerSize; // h1, h2, h3, etc.
    
    const headerHtml = `
      <${headingTag} style="
        color: ${headerColor};
        text-align: ${headerAlignment};
        margin-top: 20px;
        margin-bottom: 10px;
      ">
        ${headerText}
      </${headingTag}>
    `;
    
    editor.chain().focus().insertContent(headerHtml).run();
    setIsModalVisible(false);
  };

  // Insert spacer
  const insertSpacer = () => {
    if (!editor) return;
    
    const spacerHtml = `
      <div style="height: ${spacerHeight}px; width: 100%; content: ' ';"></div>
    `;
    
    editor.chain().focus().insertContent(spacerHtml).run();
    setIsModalVisible(false);
  };

  // Handle the insertion of the selected section type
  const handleInsertSection = () => {
    switch (currentSection) {
      case 'button':
        insertButton();
        break;
      case 'divider':
        insertDivider();
        break;
      case 'header':
        insertHeader();
        break;
      case 'spacer':
        insertSpacer();
        break;
      default:
        setIsModalVisible(false);
    }
  };

  // Get modal content based on the current section type
  const getModalContent = () => {
    switch (currentSection) {
      case 'button':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Button Text</label>
              <Input 
                value={buttonText} 
                onChange={(e) => setButtonText(e.target.value)} 
                placeholder="Click Here"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Button URL</label>
              <Input 
                value={buttonUrl} 
                onChange={(e) => setButtonUrl(e.target.value)} 
                placeholder="https://example.com" 
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Background Color</label>
                <ColorPicker
                  value={buttonBgColor}
                  onChange={(color) => setButtonBgColor(color.toHexString())}
                  showText
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Text Color</label>
                <ColorPicker
                  value={buttonTextColor}
                  onChange={(color) => setButtonTextColor(color.toHexString())}
                  showText
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Button Width (px)</label>
              <InputNumber 
                min={100} 
                max={600} 
                value={buttonWidth} 
                onChange={(value) => setButtonWidth(value || 200)} 
                className="w-full"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Alignment</label>
              <Radio.Group 
                options={[
                  { label: 'Left', value: 'left' },
                  { label: 'Center', value: 'center' },
                  { label: 'Right', value: 'right' },
                ]} 
                onChange={(e) => setButtonAlignment(e.target.value)} 
                value={buttonAlignment} 
                optionType="button" 
                buttonStyle="solid"
              />
            </div>
            
            <div className="mt-4 pt-4 border-t border-gray-200">
              <p className="text-sm text-gray-500 mb-2">Preview:</p>
              <div style={{ textAlign: buttonAlignment as React.CSSProperties['textAlign'] }}>
                <button 
                  style={{
                    backgroundColor: buttonBgColor,
                    color: buttonTextColor,
                    padding: '10px 20px',
                    border: 'none',
                    borderRadius: '4px',
                    fontWeight: 'bold',
                    cursor: 'pointer',
                    width: `${buttonWidth}px`,
                    maxWidth: '100%',
                  }}
                >
                  {buttonText}
                </button>
              </div>
            </div>
          </div>
        );
      
      case 'divider':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Width (%)</label>
              <InputNumber 
                min={10} 
                max={100} 
                value={dividerWidth} 
                onChange={(value) => setDividerWidth(value || 100)} 
                className="w-full"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Height (px)</label>
              <InputNumber 
                min={1} 
                max={20} 
                value={dividerHeight} 
                onChange={(value) => setDividerHeight(value || 1)} 
                className="w-full"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Color</label>
              <ColorPicker
                value={dividerColor}
                onChange={(color) => setDividerColor(color.toHexString())}
                showText
              />
            </div>
            
            <div className="mt-4 pt-4 border-t border-gray-200">
              <p className="text-sm text-gray-500 mb-2">Preview:</p>
              <div style={{ width: '100%', padding: '10px 0' }}>
                <div style={{
                  width: `${dividerWidth}%`,
                  height: `${dividerHeight}px`,
                  backgroundColor: dividerColor,
                  margin: '0 auto',
                }}></div>
              </div>
            </div>
          </div>
        );
      
      case 'header':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Header Text</label>
              <Input 
                value={headerText} 
                onChange={(e) => setHeaderText(e.target.value)} 
                placeholder="Section Header" 
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Header Size</label>
              <Select
                value={headerSize}
                onChange={(value) => setHeaderSize(value)}
                className="w-full"
              >
                <Option value="h1">H1 - Large</Option>
                <Option value="h2">H2 - Medium</Option>
                <Option value="h3">H3 - Small</Option>
              </Select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Text Color</label>
              <ColorPicker
                value={headerColor}
                onChange={(color) => setHeaderColor(color.toHexString())}
                showText
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Alignment</label>
              <Radio.Group 
                options={[
                  { label: 'Left', value: 'left' },
                  { label: 'Center', value: 'center' },
                  { label: 'Right', value: 'right' },
                ]} 
                onChange={(e) => setHeaderAlignment(e.target.value)} 
                value={headerAlignment} 
                optionType="button" 
                buttonStyle="solid"
              />
            </div>
            
            <div className="mt-4 pt-4 border-t border-gray-200">
              <p className="text-sm text-gray-500 mb-2">Preview:</p>
              <div>
                {headerSize === 'h1' && (
                  <h1 style={{ color: headerColor, textAlign: headerAlignment as any }}>
                    {headerText}
                  </h1>
                )}
                {headerSize === 'h2' && (
                  <h2 style={{ color: headerColor, textAlign: headerAlignment as any }}>
                    {headerText}
                  </h2>
                )}
                {headerSize === 'h3' && (
                  <h3 style={{ color: headerColor, textAlign: headerAlignment as any }}>
                    {headerText}
                  </h3>
                )}
              </div>
            </div>
          </div>
        );
      
      case 'spacer':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Height (px)</label>
              <InputNumber 
                min={5} 
                max={100} 
                value={spacerHeight} 
                onChange={(value) => setSpacerHeight(value || 20)} 
                className="w-full"
              />
            </div>
            
            <div className="mt-4 pt-4 border-t border-gray-200">
              <p className="text-sm text-gray-500 mb-2">Preview:</p>
              <div className="border border-dashed border-gray-300 relative">
                <div style={{ height: `${spacerHeight}px` }}></div>
                <div className="absolute inset-0 flex items-center justify-center text-gray-400 text-xs">
                  Spacer: {spacerHeight}px
                </div>
              </div>
            </div>
          </div>
        );
      
      default:
        return null;
    }
  };

  // Dropdown menu items for the email section types
  const items: MenuProps['items'] = [
    {
      key: 'button',
      label: 'Call-to-Action Button',
      icon: <PoweroffOutlined />,
      onClick: () => showModal('button'),
    },
    {
      key: 'divider',
      label: 'Divider',
      icon: <DashOutlined />,
      onClick: () => showModal('divider'),
    },
    {
      key: 'header',
      label: 'Section Header',
      icon: <AppstoreOutlined />,
      onClick: () => showModal('header'),
    },
    {
      key: 'spacer',
      label: 'Spacer',
      icon: <SplitCellsOutlined />,
      onClick: () => showModal('spacer'),
    },
  ];

  if (!editor) return null;

  return (
    <>
      <Tooltip title="Insert Email Sections">
        <Dropdown menu={{ items }} trigger={['click']}>
          <Button icon={<LayoutOutlined />}>
            Email Sections <DownOutlined />
          </Button>
        </Dropdown>
      </Tooltip>
      
      <Modal
        title={`Insert ${currentSection === 'button' ? 'Call-to-Action Button' : 
                         currentSection === 'divider' ? 'Divider' : 
                         currentSection === 'header' ? 'Section Header' : 
                         currentSection === 'spacer' ? 'Spacer' : 'Email Section'}`}
        open={isModalVisible}
        onCancel={handleCancel}
        footer={[
          <Button key="cancel" onClick={handleCancel}>
            Cancel
          </Button>,
          <Button key="insert" type="primary" onClick={handleInsertSection}>
            Insert
          </Button>,
        ]}
        width={500}
      >
        {getModalContent()}
      </Modal>
    </>
  );
};

export default EmailSectionsComponent;