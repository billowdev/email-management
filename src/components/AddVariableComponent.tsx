import React, { useState } from 'react';
import { Button, Input, Space, Modal, Form, message } from 'antd';
import { PlusOutlined } from '@ant-design/icons';

interface AddVariableComponentProps {
  existingVariables: string[];
  onAddVariable: (variable: string) => void;
}

const AddVariableComponent: React.FC<AddVariableComponentProps> = ({
  existingVariables,
  onAddVariable
}) => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [form] = Form.useForm();

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

  const handleSubmit = () => {
    form.validateFields()
      .then(values => {
        const variableName = formatVariableKey(values.variableName);
        onAddVariable(variableName);
        setIsModalVisible(false);
        form.resetFields();
        message.success(`Variable {{.${variableName}}} added successfully`);
      })
      .catch(info => {
        console.log('Validate Failed:', info);
      });
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
      >
        <Form
          form={form}
          layout="vertical"
        >
          <Form.Item
            label="Variable Name"
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