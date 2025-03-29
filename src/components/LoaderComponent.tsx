import React, { useEffect, useState } from 'react';
import { Spin, Typography, Progress, Card, Space } from 'antd';
import { LoadingOutlined, MailOutlined } from '@ant-design/icons';

const { Text, Title } = Typography;

/**
 * Professional loading component for email preview
 */
const LoaderComponent = () => {
  const [progress, setProgress] = useState(0);
  
  // Simulate loading progress
  useEffect(() => {
    const interval = setInterval(() => {
      setProgress(oldProgress => {
        // Gradually increase progress with slight randomness
        const newProgress = Math.min(oldProgress + Math.random() * 3, 99);
        return newProgress;
      });
    }, 150);

    return () => {
      clearInterval(interval);
    };
  }, []);

  return (
    <div className="flex justify-center items-center h-screen bg-gray-50">
      <Card 
        className="w-full max-w-md shadow-md"
        variant="borderless"
      >
        <div className="text-center py-6">
          <Space direction="vertical" size="large" className="w-full">
            
            {/* Loading spinner */}
            <div className="text-center">
              <Spin 
                indicator={<LoadingOutlined style={{ fontSize: 24 }} spin />} 
              />
              <Title level={5} className="mt-3">
                Loading...
              </Title>
            </div>
            
            {/* Progress indicator */}
            <div className="w-full px-8">
              <Progress 
                percent={Math.round(progress)} 
                status="active" 
                strokeColor="#1890ff"
                size="small"
              />
              <Text type="secondary" className="text-xs mt-2 block">
                Preparing resources...
              </Text>
            </div>
          </Space>
        </div>
      </Card>
    </div>
  );
};

export default LoaderComponent;