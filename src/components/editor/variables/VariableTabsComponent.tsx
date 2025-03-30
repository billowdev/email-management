// src/components/VariableTabsComponent.tsx
import React, { useState, useEffect } from 'react';
import { Tabs, Button, Badge, Input, Typography, Space, Tooltip, message, Spin } from 'antd';
import type { TabsProps } from 'antd';
import { EditOutlined, DeleteOutlined, LoadingOutlined } from '@ant-design/icons';
import { updatePreviewData, deleteVariable, updateVariable } from '@/services/emailTemplateService';

const { Text } = Typography;

interface VariableTabsProps {
  availableVariables: string[];
  insertVariable: (variable: string) => void;
  previewMode: boolean;
  localPreviewData: Record<string, any>;
  setLocalPreviewData: React.Dispatch<React.SetStateAction<Record<string, any>>>;
  onEditVariable?: (variable: string) => void;
  onDeleteVariable?: (variable: string) => void;
  templateId?: string;
}

const VariableTabs: React.FC<VariableTabsProps> = ({
  availableVariables,
  insertVariable,
  previewMode,
  localPreviewData,
  setLocalPreviewData,
  onEditVariable,
  onDeleteVariable,
  templateId
}) => {
  const [activeTab, setActiveTab] = useState<string>("variables");
  const [saving, setSaving] = useState<boolean>(false);
  const [deleteLoading, setDeleteLoading] = useState<Record<string, boolean>>({});
  
  // Handle updating preview data in the database
  const handleUpdatePreviewData = async (key: string, value: string) => {
    // Update local state immediately for responsive UI
    const updatedData = {
      ...localPreviewData,
      [key]: value
    };
    
    setLocalPreviewData(updatedData);
    
    // If template ID is provided, save to database
    if (templateId) {
      try {
        setSaving(true);
        await updatePreviewData(templateId, updatedData);
        setSaving(false);
      } catch (error) {
        console.error('Error saving preview data:', error);
        setSaving(false);
        message.error('Failed to save preview data');
      }
    }
  };
  
  // Handle variable deletion with proper database update
  const handleDeleteVariable = async (variable: string) => {
    if (!templateId) {
      if (onDeleteVariable) {
        onDeleteVariable(variable);
      }
      return;
    }
    
    try {
      // Set loading state for this specific variable
      setDeleteLoading(prev => ({ ...prev, [variable]: true }));
      
      // First, we need to get the variable ID from the key
      // This would require adding a function to get variables by template ID
      const variables = await getVariablesByTemplateId(templateId);
      const variableToDelete = variables.find((v: { key: string; id: string }) => v.key === variable);
      
      if (!variableToDelete) {
        message.error(`Variable ${variable} not found`);
        setDeleteLoading(prev => ({ ...prev, [variable]: false }));
        return;
      }
      
      // Delete from database
      await deleteVariable(templateId, variableToDelete.id);
      
      // Update local state via the callback
      if (onDeleteVariable) {
        onDeleteVariable(variable);
      }
      
      // Remove from preview data
      const updatedPreviewData = { ...localPreviewData };
      delete updatedPreviewData[variable];
      setLocalPreviewData(updatedPreviewData);
      
      // Update preview data in database
      await updatePreviewData(templateId, updatedPreviewData);
      
      message.success(`Variable {{.${variable}}} deleted successfully`);
    } catch (error) {
      console.error('Error deleting variable:', error);
      message.error('Failed to delete variable');
    } finally {
      setDeleteLoading(prev => ({ ...prev, [variable]: false }));
    }
  };
  
  // Create items array for Tabs
  const tabItems: TabsProps['items'] = [
    {
      key: 'variables',
      label: (
        <span>
          <Badge color="blue" />
          Variables
        </span>
      ),
      children: (
        <div className="flex flex-col gap-2 max-h-[400px] overflow-auto">
          {availableVariables.map((variable) => (
            <div key={variable} className="flex justify-between items-center">
              <Button
                onClick={() => insertVariable(variable)}
                disabled={previewMode}
                className="text-left flex-grow bg-gray-50 hover:bg-gray-100"
              >
                <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs">
                  {`{{.${variable}}}`}
                </span>
              </Button>
              
              {!previewMode && (
                <Space className="ml-2">
                  {onEditVariable && (
                    <Tooltip title="Edit variable">
                      <Button 
                        icon={<EditOutlined />} 
                        size="small"
                        onClick={() => onEditVariable(variable)}
                      />
                    </Tooltip>
                  )}
                  
                  {onDeleteVariable && (
                    <Tooltip title="Remove variable">
                      <Button 
                        icon={deleteLoading[variable] ? <LoadingOutlined /> : <DeleteOutlined />} 
                        size="small" 
                        danger
                        loading={deleteLoading[variable]}
                        onClick={() => handleDeleteVariable(variable)}
                      />
                    </Tooltip>
                  )}
                </Space>
              )}
            </div>
          ))}
        </div>
      )
    }
  ];
  
  // Conditionally add test data tab
  if (previewMode) {
    tabItems.push({
      key: 'test-data',
      label: (
        <span>
          <Badge color="green" />
          Test Data {saving && '(Saving...)'}
        </span>
      ),
      children: (
        <div className="flex flex-col gap-3 max-h-[400px] overflow-auto">
          {availableVariables.map((key) => (
            <div key={key}>
              <Text className="text-xs text-gray-500">{key}</Text>
              <Input
                value={localPreviewData[key] || ''}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                  handleUpdatePreviewData(key, e.target.value)
                }
                className="w-full"
                size="small"
              />
            </div>
          ))}
        </div>
      )
    });
  }
  
  return (
    <Tabs 
      activeKey={activeTab}
      onChange={setActiveTab}
      items={tabItems}
    />
  );
};

// This function needs to be implemented in the component
// or imported from your service
async function getVariablesByTemplateId(templateId: string) {
  const response = await fetch(`/api/templates/${templateId}/variables`);
  if (!response.ok) {
    throw new Error('Failed to fetch variables');
  }
  return response.json();
}

export default VariableTabs;