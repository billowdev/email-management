import React, { useState } from 'react';
import { Button, Input, Modal, Form, message, Select } from 'antd';
import { PlusOutlined, LoadingOutlined } from '@ant-design/icons';
import { addVariable } from '@/services/emailTemplateService';

const { Option } = Select;

interface AddVariableComponentProps {
  existingVariables: string[];
  onAddVariable: (variable: string) => void;
  templateId?: string;
}

const AddVariableComponent: React.FC<AddVariableComponentProps> = ({
  existingVariables,
  onAddVariable,
  templateId
}) => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  // Format a variable key to follow conventions
  const formatVariableKey = (input: string) => {
    return input
      .trim()
      .replace(/\s+/g, '')      // Remove spaces
      .replace(/[^a-zA-Z0-9]/g, '') // Remove special characters
      .replace(/^[0-9]/, '')     // Ensure doesn't start with a number
      .replace(/^\w/, c => c.toLowerCase()); // Start with lowercase
  };

  const validateKeyUniqueness = (_: any, value: string) => {
    if (!value) return Promise.resolve();
    
    const exists = existingVariables.includes(value);
    return exists 
      ? Promise.reject(new Error('This variable already exists')) 
      : Promise.resolve();
  };

  const showModal = () => {
    setIsModalVisible(true);
    form.resetFields();
  };

  const handleCancel = () => {
    setIsModalVisible(false);
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);
      
      const variableName = formatVariableKey(values.variableName);
      
      // If templateId is provided, save to database
      if (templateId) {
        try {
          await addVariable(templateId, {
            key: variableName,
            name: values.displayName || variableName.charAt(0).toUpperCase() + variableName.slice(1).replace(/([A-Z])/g, ' $1').trim(),
            type: values.variableType,
            required: values.required || false,
            description: values.description || null,
            defaultValue: values.defaultValue || null
          });
          
          message.success(`Variable {{.${variableName}}} added to database successfully`);
        } catch (error) {
          console.error('Error adding variable to database:', error);
          message.error('Failed to add variable to database');
          setLoading(false);
          return;
        }
      }
      
      // Update local state
      onAddVariable(variableName);
      setIsModalVisible(false);
      form.resetFields();
      setLoading(false);
    } catch (info) {
      console.log('Validate Failed:', info);
    }
  };

  return (
    <>
      <Button 
        type="dashed" 
        icon={<PlusOutlined />} 
        onClick={showModal}
        className="mb-4"
      >
        Add New Variable
      </Button>
      
      <Modal
        title="Add New Variable"
        open={isModalVisible}
        onCancel={handleCancel}
        onOk={handleSubmit}
        okText="Add"
        confirmLoading={loading}
      >
        <Form
          form={form}
          layout="vertical"
        >
          <Form.Item
            label="Variable Name (Key)"
            name="variableName"
            rules={[
              { required: true, message: 'Please input a variable name' },
              { validator: validateKeyUniqueness }
            ]}
            help="This will be converted to camelCase format automatically"
          >
            <Input 
              placeholder="e.g. firstName, companyName, orderDate" 
              onChange={(e) => {
                // Auto-format the name as the user types
                const formattedName = formatVariableKey(e.target.value);
                form.setFieldValue('variableName', formattedName);
              }}
            />
          </Form.Item>
          
          <Form.Item
            label="Display Name"
            name="displayName"
            help="Human-readable name for this variable"
          >
            <Input placeholder="e.g. First Name, Company Name" />
          </Form.Item>
          
          <Form.Item
            label="Variable Type"
            name="variableType"
            initialValue="TEXT"
          >
            <Select>
              <Option value="TEXT">Text</Option>
              <Option value="EMAIL">Email</Option>
              <Option value="NUMBER">Number</Option>
              <Option value="DATE">Date</Option>
              <Option value="BOOLEAN">Yes/No</Option>
              <Option value="URL">URL</Option>
            </Select>
          </Form.Item>
          
          <Form.Item
            label="Default Value"
            name="defaultValue"
          >
            <Input placeholder="Default value when no data is provided" />
          </Form.Item>
          
          <Form.Item
            label="Description"
            name="description"
          >
            <Input.TextArea 
              placeholder="Optional description of what this variable is used for"
              rows={2}
            />
          </Form.Item>
          
          <Form.Item
            name="required"
            valuePropName="checked"
          >
            <input type="checkbox" /> Required variable
          </Form.Item>
          
          <div className="text-gray-500 text-sm">
            <p>This variable will be available in your template using:</p>
            <code className="bg-blue-50 text-blue-700 px-2 py-1 rounded">
              {'{{.'}
              {form.getFieldValue('variableName') || 'variableName'}
              {'}}'}
            </code>
          </div>
        </Form>
      </Modal>
    </>
  );
};

export default AddVariableComponent;