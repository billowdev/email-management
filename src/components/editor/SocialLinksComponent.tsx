// src/components/editor/SocialLinksComponent.tsx
import React, { useState } from 'react';
import { Editor } from '@tiptap/react';
import { Button, Modal, Form, Input, Checkbox, Select, Radio, Tooltip } from 'antd';
import { ShareAltOutlined, InstagramOutlined, FacebookOutlined, TwitterOutlined, LinkedinOutlined, YoutubeOutlined } from '@ant-design/icons';

const { Option } = Select;

interface SocialLink {
  platform: string;
  url: string;
  enabled: boolean;
}

interface SocialLinksComponentProps {
  editor: Editor | null;
}

const SocialLinksComponent: React.FC<SocialLinksComponentProps> = ({ editor }) => {
  const [isModalVisible, setIsModalVisible] = useState<boolean>(false);
  const [socialLinks, setSocialLinks] = useState<SocialLink[]>([
    { platform: 'facebook', url: 'https://facebook.com/', enabled: true },
    { platform: 'twitter', url: 'https://twitter.com/', enabled: true },
    { platform: 'instagram', url: 'https://instagram.com/', enabled: true },
    { platform: 'linkedin', url: 'https://linkedin.com/', enabled: true },
    { platform: 'youtube', url: 'https://youtube.com/', enabled: false },
  ]);
  const [iconSize, setIconSize] = useState<string>('32px');
  const [iconSpacing, setIconSpacing] = useState<string>('10px');
  const [alignment, setAlignment] = useState<string>('center');
  const [style, setStyle] = useState<string>('colored');

  // Show the social links insertion modal
  const showModal = () => {
    setIsModalVisible(true);
  };

  // Handle modal cancel
  const handleCancel = () => {
    setIsModalVisible(false);
  };

  // Update social link URL
  const updateLinkUrl = (index: number, url: string) => {
    const updatedLinks = [...socialLinks];
    updatedLinks[index].url = url;
    setSocialLinks(updatedLinks);
  };

  // Toggle social link enabled state
  const toggleLinkEnabled = (index: number, enabled: boolean) => {
    const updatedLinks = [...socialLinks];
    updatedLinks[index].enabled = enabled;
    setSocialLinks(updatedLinks);
  };

  // Get icon content for each platform
  const getIconContent = (platform: string, style: string) => {
    // SVG icons for social platforms
    // Using Base64 encoded SVGs for maximum email client compatibility
    
    // Simple versions (just monochrome)
    const simpleIcons: Record<string, string> = {
      facebook: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGNsYXNzPSJsdWNpZGUgbHVjaWRlLWZhY2Vib29rIj48cGF0aCBkPSJNMTggMmgtM2EzIDMgMCAwIDAtMyAzdjNoLTN2NGgzdjNhOCA4IDAgMCAwIDggOCIvPjxwYXRoIGQ9Ik0xNSA5aDV2NGgtNW0wLTRzMi01LTItNWgtM2MtNSAwLTUgOC01IDh2M2MwIDUgMyA1IDMgNSIvPjwvc3ZnPg==',
      twitter: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGNsYXNzPSJsdWNpZGUgbHVjaWRlLXR3aXR0ZXIiPjxwYXRoIGQ9Ik0yMiA0cy0yLjkgMS4zLTUsMmMwIDAtMi42LTIuNS02LTFjMCAwLTMuMzEgMS40OTgtNC0uNSIvPjxwYXRoIGQ9Ik0yIDIyIDMuNSA5IDR2Mm4xNmw0LjkxNy02LjA0M0MxOS41LTIgMjIgNC41IDIyIDQuNXYzYzExLTQuNSA5LjUgNC41IDIgMTEuNXY0LjVsLTMtMWMtMS41LTMtOS0zLjUtOSAxWiIvPjwvc3ZnPg==',
      instagram: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGNsYXNzPSJsdWNpZGUgbHVjaWRlLWluc3RhZ3JhbSI+PHJlY3QgeD0iMiIgeT0iMiIgd2lkdGg9IjIwIiBoZWlnaHQ9IjIwIiByeD0iNSIgcnk9IjUiLz48cGF0aCBkPSJNMTYgMTEuMzdBNCA0IDAgMSAxIDEyLjYzIDhBNCA0IDAgMCAxIDE2IDExLjM3WiIvPjxsaW5lIHgxPSIxNy41IiB5MT0iNi41IiB4Mj0iMTcuNTEiIHkyPSI2LjUiLz48L3N2Zz4=',
      linkedin: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGNsYXNzPSJsdWNpZGUgbHVjaWRlLWxpbmtlZGluIj48cGF0aCBkPSJNMTYgOGE2IDYgMCAwIDEgNiA2djdoLTR2LTdhMiAyIDAgMCAwLTIuM0wyIDIxaC00di0xMmg0Ii8+PHBhdGggZD0iTTIgOGg0djEyaC00eiIvPjxwYXRoIGQ9Ik0yIDhoNC02YTIgMiAwIDAgMSAtMiJ2LTPrb3VuZCIvPjwvc3ZnPg==',
      youtube: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGNsYXNzPSJsdWNpZGUgbHVjaWRlLXlvdXR1YmUiPjxwYXRoIGQ9Ik0yMi41NCAxNmMuMzIgMS4yLjM3IDQuNi0uOTcgNS44Yy0xLjM1IDEuMjQtMTQuMDYgMS4yNC0xNS40NCAwcy0xLjMtNC42LS45OC01LjhjLjAxLS4wNC4wMi0uMDcuMDMtLjF2LS4yYzAgLjEyLS4wMi4xNC0uMDMuMi4zMi0xLjIuMzctNC42LS45Ny01LjgtMS4zNS0xLjI0LTE0LjA2LTEuMjQtMTUuNDQgMC0xLjM5IDEuMjMtMS4zIDQuNi0uOTggNS44Ii8+PHBvbHlnb24gcG9pbnRzPSIxMCAxNSAxNSAxMiAxMCA5IDEwIDE1Ii8+PC9zdmc+',
    };
    
    // Colored versions (colored backgrounds with white icons)
    const coloredBackgrounds: Record<string, string> = {
      facebook: '#1877F2',
      twitter: '#1DA1F2',
      instagram: '#E4405F',
      linkedin: '#0A66C2',
      youtube: '#FF0000',
    };
    
    // Circular versions (rounded)
    const circleStyle = 'border-radius: 50%; display: inline-block;';
    
    if (style === 'simple') {
      return `<img src="${simpleIcons[platform]}" alt="${platform}" style="width: ${iconSize}; height: ${iconSize}; filter: invert(0.5);">`;
    } else if (style === 'circle') {
      return `<div style="background-color: #f2f2f2; ${circleStyle} width: ${iconSize}; height: ${iconSize}; text-align: center; line-height: ${iconSize};">
                <img src="${simpleIcons[platform]}" alt="${platform}" style="width: calc(${iconSize} * 0.6); height: calc(${iconSize} * 0.6); vertical-align: middle; filter: invert(0.5);">
              </div>`;
    } else {
      // Default to colored
      return `<div style="background-color: ${coloredBackgrounds[platform]}; ${style === 'rounded' ? 'border-radius: 8px;' : ''} width: ${iconSize}; height: ${iconSize}; text-align: center; line-height: ${iconSize};">
                <img src="${simpleIcons[platform]}" alt="${platform}" style="width: calc(${iconSize} * 0.6); height: calc(${iconSize} * 0.6); vertical-align: middle; filter: invert(1);">
              </div>`;
    }
  };

  // Insert social links
  const insertSocialLinks = () => {
    if (!editor) return;
    
    const enabledLinks = socialLinks.filter(link => link.enabled);
    if (enabledLinks.length === 0) {
      return;
    }
    
    // Create the HTML for the social links
    let socialLinksHtml = `
      <div style="text-align: ${alignment}; margin: 20px 0;">
    `;
    
    enabledLinks.forEach((link, index) => {
      socialLinksHtml += `
        <a href="${link.url}" target="_blank" rel="noopener noreferrer" style="display: inline-block; margin: 0 ${iconSpacing};">
          ${getIconContent(link.platform, style)}
        </a>
      `;
    });
    
    socialLinksHtml += `
      </div>
    `;
    
    // Insert the HTML into the editor
    editor.chain().focus().insertContent(socialLinksHtml).run();
    setIsModalVisible(false);
  };

  if (!editor) return null;

  return (
    <>
      <Tooltip title="Insert Social Media Links">
        <Button 
          icon={<ShareAltOutlined />} 
          onClick={showModal}
        >
          Social Links
        </Button>
      </Tooltip>
      
      <Modal
        title="Insert Social Media Links"
        open={isModalVisible}
        onCancel={handleCancel}
        onOk={insertSocialLinks}
        okText="Insert"
        width={550}
      >
        <Form layout="vertical" className="mt-4">
          <p className="mb-4 text-gray-500">Enable and configure social media links to add to your email template.</p>
          
          {socialLinks.map((link, index) => (
            <div key={index} className="flex items-center mb-4 pb-2 border-b border-gray-100">
              <Checkbox 
                checked={link.enabled} 
                onChange={(e) => toggleLinkEnabled(index, e.target.checked)}
                className="mr-3"
              />
              
              <div className="mr-3 min-w-10" style={{ width: '32px', height: '32px' }}>
                {link.platform === 'facebook' && <FacebookOutlined style={{ fontSize: '24px', color: '#1877F2' }} />}
                {link.platform === 'twitter' && <TwitterOutlined style={{ fontSize: '24px', color: '#1DA1F2' }} />}
                {link.platform === 'instagram' && <InstagramOutlined style={{ fontSize: '24px', color: '#E4405F' }} />}
                {link.platform === 'linkedin' && <LinkedinOutlined style={{ fontSize: '24px', color: '#0A66C2' }} />}
                {link.platform === 'youtube' && <YoutubeOutlined style={{ fontSize: '24px', color: '#FF0000' }} />}
              </div>
              
              <div className="flex-grow">
                <span className="block text-sm font-medium capitalize mb-1">{link.platform}</span>
                <Input
                  value={link.url}
                  onChange={(e) => updateLinkUrl(index, e.target.value)}
                  placeholder={`https://${link.platform}.com/yourprofile`}
                  disabled={!link.enabled}
                />
              </div>
            </div>
          ))}
          
          <div className="grid grid-cols-2 gap-4 mt-6">
            <Form.Item label="Icon Size">
              <Select
                value={iconSize}
                onChange={(value) => setIconSize(value)}
                className="w-full"
              >
                <Option value="24px">Small (24px)</Option>
                <Option value="32px">Medium (32px)</Option>
                <Option value="40px">Large (40px)</Option>
                <Option value="48px">Extra Large (48px)</Option>
              </Select>
            </Form.Item>
            
            <Form.Item label="Icon Spacing">
              <Select
                value={iconSpacing}
                onChange={(value) => setIconSpacing(value)}
                className="w-full"
              >
                <Option value="5px">Compact (5px)</Option>
                <Option value="10px">Normal (10px)</Option>
                <Option value="15px">Wide (15px)</Option>
                <Option value="20px">Extra Wide (20px)</Option>
              </Select>
            </Form.Item>
          </div>
          
          <Form.Item label="Icon Style">
            <Radio.Group 
              value={style} 
              onChange={(e) => setStyle(e.target.value)} 
              className="w-full"
            >
              <Radio.Button value="colored">Colored</Radio.Button>
              <Radio.Button value="rounded">Rounded</Radio.Button>
              <Radio.Button value="circle">Circle</Radio.Button>
              <Radio.Button value="simple">Simple</Radio.Button>
            </Radio.Group>
          </Form.Item>
          
          <Form.Item label="Alignment">
            <Radio.Group 
              value={alignment} 
              onChange={(e) => setAlignment(e.target.value)} 
              className="w-full"
            >
              <Radio.Button value="left">Left</Radio.Button>
              <Radio.Button value="center">Center</Radio.Button>
              <Radio.Button value="right">Right</Radio.Button>
            </Radio.Group>
          </Form.Item>
          
          <div className="mt-4 p-3 bg-gray-50 rounded">
            <p className="text-sm text-gray-500 mb-2">Preview:</p>
            <div style={{ textAlign: alignment as React.CSSProperties['textAlign'] }}>
              {socialLinks.filter(link => link.enabled).map((link, index) => (
                <div 
                  key={index} 
                  style={{ 
                    display: 'inline-block', 
                    margin: `0 ${iconSpacing}`,
                  }}
                  dangerouslySetInnerHTML={{ __html: getIconContent(link.platform, style) }}
                />
              ))}
            </div>
          </div>
        </Form>
      </Modal>
    </>
  );
};

export default SocialLinksComponent;