"use client"
import React, { useState, useEffect } from 'react';
import { Card, Typography, Button, Input, Select, Space, Table, Modal, Form, Divider, Tooltip, Alert } from 'antd';
import { PlusOutlined, DeleteOutlined, EditOutlined, InfoCircleOutlined } from '@ant-design/icons';
import type { TableProps } from 'antd';

const { Title, Text, Paragraph } = Typography;
const { Option } = Select;

// Define variable type options
type VariableType = 'text' | 'date' | 'number' | 'email' | 'url' | 'boolean';

interface CustomVariable {
  id: string;
  name: string;
  key: string;
  type: VariableType;
  defaultValue: string;
  description?: string;
}

interface VariableConfigurationProps {
  existingVariables?: string[];
  onVariablesChange?: (variables: string[]) => void;
  templateId?: string;
}

const VariableConfiguration: React.FC<VariableConfigurationProps> = ({
  existingVariables = [],
  onVariablesChange,
  templateId = 'default',
}) => {
  const [variables, setVariables] = useState<CustomVariable[]>([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [editingVariable, setEditingVariable] = useState<CustomVariable | null>(null);
  
  // Load saved variables from localStorage on component mount
  useEffect(() => {
    const savedVariables = localStorage.getItem(`custom-variables-${templateId}`);
    if (savedVariables) {
      try {
        const parsedVariables = JSON.parse(savedVariables) as CustomVariable[];
        setVariables(parsedVariables);
      } catch (e) {
        console.error('Error loading saved variables', e);
      }
    } else {
      // Convert existing variable strings to CustomVariable objects
      const initialVariables = existingVariables.map(v => ({
        id: `var-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        name: v.charAt(0).toUpperCase() + v.slice(1).replace(/([A-Z])/g, ' $1').trim(),
        key: v,
        type: 'text' as VariableType,
        defaultValue: '',
        description: ''
      }));
      setVariables(initialVariables);
    }
  }, [existingVariables, templateId]);

  // Update localStorage and notify parent when variables change
  useEffect(() => {
    localStorage.setItem(`custom-variables-${templateId}`, JSON.stringify(variables));
    
    if (onVariablesChange) {
      // Extract just the keys for the parent component
      const variableKeys = variables.map(v => v.key);
      onVariablesChange(variableKeys);
    }
  }, [variables, templateId, onVariablesChange]);

  const showModal = (variable?: CustomVariable) => {
    if (variable) {
      setEditingVariable(variable);
      form.setFieldsValue(variable);
    } else {
      setEditingVariable(null);
      form.resetFields();
    }
    setIsModalVisible(true);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
    form.resetFields();
  };

  const handleSubmit = () => {
    form.validateFields()
      .then(values => {
        const newVariable: CustomVariable = {
          id: editingVariable?.id || `var-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          name: values.name,
          key: values.key,
          type: values.type,
          defaultValue: values.defaultValue || '',
          description: values.description || '',
        };

        if (editingVariable) {
          // Update existing variable
          setVariables(prev => prev.map(v => v.id === editingVariable.id ? newVariable : v));
        } else {
          // Add new variable
          setVariables(prev => [...prev, newVariable]);
        }

        setIsModalVisible(false);
        form.resetFields();
      })
      .catch(info => {
        console.log('Validate Failed:', info);
      });
  };

  const handleDelete = (id: string) => {
    Modal.confirm({
      title: 'Are you sure you want to delete this variable?',
      content: 'This will remove the variable from your template. Any instances of this variable in your template will need to be updated manually.',
      okText: 'Yes, Delete',
      okType: 'danger',
      cancelText: 'Cancel',
      onOk() {
        setVariables(prev => prev.filter(v => v.id !== id));
      },
    });
  };

  // Format a variable key to follow conventions
  const formatVariableKey = (input: string) => {
    return input
      .trim()
      .replace(/\s+/g, '_')      // Replace spaces with underscores
      .replace(/[^a-zA-Z0-9_]/g, '') // Remove special characters
      .replace(/^[0-9]/, '')     // Ensure doesn't start with a number
      .toLowerCase();            // Convert to lowercase
  };

  const validateKeyUniqueness = (_: any, value: string) => {
    if (!value) return Promise.resolve();
    
    // Skip validation for the current editing variable
    if (editingVariable && editingVariable.key === value) {
      return Promise.resolve();
    }
    
    const exists = variables.some(v => v.key === value);
    return exists 
      ? Promise.reject(new Error('This variable key already exists')) 
      : Promise.resolve();
  };

  // Table columns configuration
  const columns: TableProps<CustomVariable>['columns'] = [
    {
      title: 'Variable Name',
      dataIndex: 'name',
      key: 'name',
      render: (text: string, record: CustomVariable) => (
        <Space>
          <Text strong>{text}</Text>
          {record.description && (
            <Tooltip title={record.description}>
              <InfoCircleOutlined style={{ color: '#1890ff' }} />
            </Tooltip>
          )}
        </Space>
      ),
    },
    {
      title: 'Key',
      dataIndex: 'key',
      key: 'key',
      render: (text: string) => (
        <code className="bg-gray-100 px-2 py-1 rounded">
          {`{{.${text}}}`}
        </code>
      ),
    },
    {
      title: 'Type',
      dataIndex: 'type',
      key: 'type',
      render: (type: VariableType) => (
        <Tag color={
          type === 'text' ? 'blue' :
          type === 'date' ? 'green' :
          type === 'number' ? 'purple' :
          type === 'email' ? 'cyan' :
          type === 'url' ? 'geekblue' : 'orange'
        }>
          {type.charAt(0).toUpperCase() + type.slice(1)}
        </Tag>
      ),
    },
    {
      title: 'Default Value',
      dataIndex: 'defaultValue',
      key: 'defaultValue',
      render: (text: string, record: CustomVariable) => (
        text ? <Text>{text}</Text> : <Text type="secondary">None</Text>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: CustomVariable) => (
        <Space>
          <Button 
            icon={<EditOutlined />} 
            size="small" 
            onClick={() => showModal(record)}
          />
          <Button 
            icon={<DeleteOutlined />} 
            size="small" 
            danger
            onClick={() => handleDelete(record.id)}
          />
        </Space>
      ),
    },
  ];

  // For the Tag component in the Type column
  const Tag = ({ children, color }: { children: React.ReactNode, color: string }) => (
    <span className={`px-2 py-0.5 rounded-full text-xs font-medium bg-${color}-100 text-${color}-800`}>
      {children}
    </span>
  );

  return (
    <Card className="shadow-lg rounded-lg border-0 mb-6">
      <div className="flex justify-between items-center mb-4">
        <Title level={4} className="mb-0">Template Variables</Title>
        <Button 
          type="primary" 
          icon={<PlusOutlined />} 
          onClick={() => showModal()}
        >
          Add Variable
        </Button>
      </div>
      
      {variables.length === 0 ? (
        <Alert
          message="No custom variables"
          description="Add variables to personalize your email templates. Variables can be inserted in your email content using the format {{.variableName}}."
          type="info"
          showIcon
        />
      ) : (
        <Table 
          dataSource={variables} 
          columns={columns} 
          rowKey="id"
          pagination={false}
          size="middle"
          className="mb-4"
        />
      )}
      
      <Paragraph className="mt-4 text-sm text-gray-500">
        <InfoCircleOutlined className="mr-2" />
        Variables can be used throughout your email template using the format <code>{'{{.variableName}}'}</code>.
        Add custom variables to make your templates more flexible and dynamic.
      </Paragraph>
      
      <Modal
        title={editingVariable ? "Edit Variable" : "Add New Variable"}
        open={isModalVisible}
        onCancel={handleCancel}
        onOk={handleSubmit}
        okText={editingVariable ? "Update" : "Add"}
      >
        <Form
          form={form}
          layout="vertical"
        >
          <Form.Item
            label="Variable Name"
            name="name"
            rules={[{ required: true, message: 'Please input a display name' }]}
          >
            <Input placeholder="e.g. First Name" />
          </Form.Item>
          
          <Form.Item
            label="Variable Key"
            name="key"
            rules={[
              { required: true, message: 'Please input a key' },
              { validator: validateKeyUniqueness }
            ]}
            help="This is how you'll reference the variable in your template"
          >
            <Input 
              placeholder="e.g. firstName" 
              onChange={(e) => {
                // Auto-format the key as the user types
                const formattedKey = formatVariableKey(e.target.value);
                form.setFieldValue('key', formattedKey);
              }}
            />
          </Form.Item>
          
          <Form.Item
            label="Variable Type"
            name="type"
            initialValue="text"
            rules={[{ required: true }]}
          >
            <Select>
              <Option value="text">Text</Option>
              <Option value="date">Date</Option>
              <Option value="number">Number</Option>
              <Option value="email">Email</Option>
              <Option value="url">URL</Option>
              <Option value="boolean">Yes/No</Option>
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
              placeholder="Optional description of the variable purpose"
              rows={2}
            />
          </Form.Item>
        </Form>
      </Modal>
    </Card>
  );
};

export default VariableConfiguration;