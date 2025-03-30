// src/components/editor/EmailTableComponent.tsx
import React, { useState } from 'react';
import { Editor } from '@tiptap/react';
import { Table } from '@tiptap/extension-table';
import { TableRow } from '@tiptap/extension-table-row';
import { TableCell } from '@tiptap/extension-table-cell';
import { TableHeader } from '@tiptap/extension-table-header';
import { Button, Modal, Form, InputNumber, Switch, Select, Radio, ColorPicker, Tooltip } from 'antd';
import { TableOutlined, DeleteOutlined, PlusOutlined, MinusOutlined, BorderOutlined } from '@ant-design/icons';
import type { Color } from 'antd/es/color-picker';

const { Option } = Select;

interface EmailTableComponentProps {
  editor: Editor | null;
}

const EmailTableComponent: React.FC<EmailTableComponentProps> = ({ editor }) => {
  const [isModalVisible, setIsModalVisible] = useState<boolean>(false);
  const [rows, setRows] = useState<number>(3);
  const [cols, setCols] = useState<number>(3);
  const [hasHeader, setHasHeader] = useState<boolean>(true);
  const [borderStyle, setBorderStyle] = useState<string>('solid');
  const [borderWidth, setBorderWidth] = useState<number>(1);
  const [borderColor, setBorderColor] = useState<string>('#e2e8f0');
  const [cellPadding, setCellPadding] = useState<number>(10);
  const [tableWidth, setTableWidth] = useState<string>('100%');
  const [headerBgColor, setHeaderBgColor] = useState<string>('#f8fafc');
  const [stripedRows, setStripedRows] = useState<boolean>(false);
  const [stripedColor, setStripedColor] = useState<string>('#f1f5f9');

  // Show the table insertion modal
  const showModal = () => {
    setIsModalVisible(true);
    // Reset to default values
    setRows(3);
    setCols(3);
    setHasHeader(true);
    setBorderStyle('solid');
    setBorderWidth(1);
    setBorderColor('#e2e8f0');
    setCellPadding(10);
    setTableWidth('100%');
    setHeaderBgColor('#f8fafc');
    setStripedRows(false);
    setStripedColor('#f1f5f9');
  };

  // Handle modal cancel
  const handleCancel = () => {
    setIsModalVisible(false);
  };

  // Insert table
  const insertTable = () => {
    if (!editor) return;
    
    // Generate the HTML table directly for better email client compatibility
    let tableHtml = `<table style="width: ${tableWidth}; border-collapse: collapse; margin: 15px 0;">`;
    
    // Add header row if requested
    if (hasHeader) {
      tableHtml += '<thead>';
      tableHtml += '<tr>';
      for (let i = 0; i < cols; i++) {
        tableHtml += `
          <th style="
            border: ${borderWidth}px ${borderStyle} ${borderColor}; 
            padding: ${cellPadding}px; 
            background-color: ${headerBgColor};
            text-align: left;
            font-weight: bold;
          ">
            Header ${i + 1}
          </th>
        `;
      }
      tableHtml += '</tr>';
      tableHtml += '</thead>';
    }
    
    // Add body rows
    tableHtml += '<tbody>';
    for (let r = 0; r < rows; r++) {
      const isEvenRow = r % 2 === 1;
      const rowBgColor = stripedRows && isEvenRow ? stripedColor : 'transparent';
      
      tableHtml += '<tr>';
      for (let c = 0; c < cols; c++) {
        tableHtml += `
          <td style="
            border: ${borderWidth}px ${borderStyle} ${borderColor}; 
            padding: ${cellPadding}px;
            background-color: ${rowBgColor};
          ">
            Cell ${r + 1}-${c + 1}
          </td>
        `;
      }
      tableHtml += '</tr>';
    }
    tableHtml += '</tbody>';
    tableHtml += '</table>';
    
    // Insert the HTML table
    editor.chain().focus().insertContent(tableHtml).run();
    setIsModalVisible(false);
  };

  const tableControls = () => {
    if (!editor) return null;
    
    return (
      <div className="flex space-x-2">
        <Tooltip title="Insert Table">
          <Button 
            icon={<TableOutlined />} 
            onClick={showModal}
          />
        </Tooltip>
        
        {editor.isActive('table') && (
          <>
            <Tooltip title="Add Row Below">
              <Button 
                icon={<PlusOutlined />} 
                onClick={() => editor.chain().focus().addRowAfter().run()}
              />
            </Tooltip>
          </>
        )}
      </div>
    );
  };

  if (!editor) return null;

  return (
    <>
      {tableControls()}
      
      <Modal
        title="Insert Email-Friendly Table"
        open={isModalVisible}
        onCancel={handleCancel}
        onOk={insertTable}
        okText="Insert Table"
        width={600}
      >
        <Form layout="vertical" className="mt-4">
          <div className="grid grid-cols-2 gap-4">
            <Form.Item label="Rows">
              <InputNumber
                min={1}
                max={20}
                value={rows}
                onChange={(value) => setRows(value || 3)}
                className="w-full"
              />
            </Form.Item>
            
            <Form.Item label="Columns">
              <InputNumber
                min={1}
                max={10}
                value={cols}
                onChange={(value) => setCols(value || 3)}
                className="w-full"
              />
            </Form.Item>
          </div>
          
          <Form.Item label="Table Width">
            <Select
              value={tableWidth}
              onChange={(value) => setTableWidth(value)}
              className="w-full"
            >
              <Option value="100%">Full Width (100%)</Option>
              <Option value="75%">Three Quarters (75%)</Option>
              <Option value="50%">Half Width (50%)</Option>
              <Option value="auto">Auto Width</Option>
            </Select>
          </Form.Item>
          
          <Form.Item label="Include Header Row">
            <Switch 
              checked={hasHeader} 
              onChange={(checked) => setHasHeader(checked)} 
            />
          </Form.Item>
          
          {hasHeader && (
            <Form.Item label="Header Background Color">
              <ColorPicker
                value={headerBgColor}
                onChange={(color) => setHeaderBgColor(color.toHexString())}
                showText
              />
            </Form.Item>
          )}
          
          <Form.Item label="Striped Rows">
            <Switch 
              checked={stripedRows} 
              onChange={(checked) => setStripedRows(checked)} 
            />
          </Form.Item>
          
          {stripedRows && (
            <Form.Item label="Striped Row Color">
              <ColorPicker
                value={stripedColor}
                onChange={(color) => setStripedColor(color.toHexString())}
                showText
              />
            </Form.Item>
          )}
          
          <div className="grid grid-cols-3 gap-4">
            <Form.Item label="Border Style">
              <Select
                value={borderStyle}
                onChange={(value) => setBorderStyle(value)}
                className="w-full"
              >
                <Option value="solid">Solid</Option>
                <Option value="dashed">Dashed</Option>
                <Option value="dotted">Dotted</Option>
                <Option value="none">None</Option>
              </Select>
            </Form.Item>
            
            <Form.Item label="Border Width (px)">
              <InputNumber
                min={0}
                max={5}
                value={borderWidth}
                onChange={(value) => setBorderWidth(value || 1)}
                className="w-full"
              />
            </Form.Item>
            
            <Form.Item label="Border Color">
              <ColorPicker
                value={borderColor}
                onChange={(color) => setBorderColor(color.toHexString())}
                showText
              />
            </Form.Item>
          </div>
          
          <Form.Item label="Cell Padding (px)">
            <InputNumber
              min={0}
              max={30}
              value={cellPadding}
              onChange={(value) => setCellPadding(value || 10)}
              className="w-full"
            />
          </Form.Item>
        </Form>
        
        <div className="mt-4 pt-4 border-t border-gray-200">
          <p className="text-sm text-gray-500 mb-2">Preview:</p>
          <div className="overflow-auto max-h-40 border rounded-md p-2">
            <table 
              style={{ 
                width: tableWidth, 
                borderCollapse: 'collapse',
                margin: '8px 0'
              }}
            >
              {hasHeader && (
                <thead>
                  <tr>
                    {Array.from({ length: Math.min(cols, 5) }).map((_, i) => (
                      <th 
                        key={`header-${i}`}
                        style={{
                          border: `${borderWidth}px ${borderStyle} ${borderColor}`,
                          padding: `${cellPadding}px`,
                          backgroundColor: headerBgColor,
                          textAlign: 'left',
                          fontWeight: 'bold'
                        }}
                      >
                        Header {i + 1}
                      </th>
                    ))}
                  </tr>
                </thead>
              )}
              <tbody>
                {Array.from({ length: Math.min(rows, 3) }).map((_, r) => {
                  const isEvenRow = r % 2 === 1;
                  const rowBgColor = stripedRows && isEvenRow ? stripedColor : 'transparent';
                  
                  return (
                    <tr key={`row-${r}`}>
                      {Array.from({ length: Math.min(cols, 5) }).map((_, c) => (
                        <td 
                          key={`cell-${r}-${c}`}
                          style={{
                            border: `${borderWidth}px ${borderStyle} ${borderColor}`,
                            padding: `${cellPadding}px`,
                            backgroundColor: rowBgColor
                          }}
                        >
                          Cell {r + 1}-{c + 1}
                        </td>
                      ))}
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {(rows > 3 || cols > 5) && (
              <div className="text-xs text-gray-400 text-center mt-2">
                Preview showing {Math.min(rows, 3)} rows × {Math.min(cols, 5)} columns
              </div>
            )}
          </div>
        </div>
      </Modal>
    </>
  );
};

export default EmailTableComponent;
            
      