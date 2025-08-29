'use client';

import React from 'react';
import { Button, Space } from 'antd';
import { toastManager } from '../componments/common/ToastManager';

export default function TestToastSimplePage() {
  const testToast = () => {
    toastManager.errorIntl('toast.test.error');
  };

  const testSuccess = () => {
    toastManager.successIntl('toast.test.success');
  };

  const testWarning = () => {
    toastManager.warningIntl('toast.test.warning');
  };

  const testInfo = () => {
    toastManager.infoIntl('toast.test.info');
  };

  const testMultipleSuccess = () => {
    // 模拟多次触发相同消息的情况
    toastManager.successIntl('toast.test.successFirst');
    setTimeout(() => toastManager.successIntl('toast.test.successSecond'), 100);
    setTimeout(() => toastManager.successIntl('toast.test.successThird'), 200);
  };

  const testBackgroundColors = () => {
    // 测试背景色是否正确显示
    toastManager.errorIntl('toast.test.backgroundRed');
    setTimeout(() => toastManager.successIntl('toast.test.backgroundGreen'), 1000);
    setTimeout(() => toastManager.warningIntl('toast.test.backgroundYellow'), 2000);
    setTimeout(() => toastManager.infoIntl('toast.test.backgroundBlue'), 3000);
  };

  return (
    <div style={{ padding: '20px' }}>
      <h1>Toast 样式测试</h1>
      <p>这个页面用于测试 Toast 的样式是否正确显示</p>
      
      <Space direction="vertical" size="large">
        <div>
          <h3>测试各种 Toast 类型：</h3>
          <Space wrap>
            <Button danger onClick={testToast}>
              测试错误消息
            </Button>
            <Button type="primary" onClick={testSuccess}>
              测试成功消息
            </Button>
            <Button onClick={testWarning}>
              测试警告消息
            </Button>
            <Button onClick={testInfo}>
              测试信息消息
            </Button>
            <Button type="primary" onClick={testMultipleSuccess}>
              测试多次成功消息
            </Button>
            <Button onClick={testBackgroundColors}>
              测试背景色
            </Button>
          </Space>
        </div>
        
        <div style={{ 
          padding: '20px', 
          backgroundColor: '#f0f0f0', 
          borderRadius: '8px',
          border: '1px solid #ccc'
        }}>
          <h4>预期效果：</h4>
          <ul>
            <li>错误消息：红色渐变背景，白色文字（不是半透明）</li>
            <li>成功消息：绿色渐变背景，白色文字（不是半透明）</li>
            <li>警告消息：黄色渐变背景，白色文字（不是半透明）</li>
            <li>信息消息：蓝色渐变背景，白色文字（不是半透明）</li>
            <li>每种类型都应该有不同的实心背景色</li>
            <li>点击&quot;测试背景色&quot;按钮可以依次看到所有颜色</li>
          </ul>
        </div>
        
        <div style={{ 
          padding: '20px', 
          backgroundColor: '#fff3cd', 
          borderRadius: '8px',
          border: '1px solid #ffeaa7'
        }}>
          <h4>如果样式不正确：</h4>
          <p>请检查浏览器开发者工具中的 CSS 样式，确保我们的自定义样式没有被 Ant Design 的默认样式覆盖。</p>
        </div>
        
        <div style={{ 
          padding: '20px', 
          backgroundColor: '#e8f5e8', 
          borderRadius: '8px',
          border: '1px solid #b8e6b8'
        }}>
          <h4>调试设置：</h4>
          <ul>
            <li>在开发环境中，所有 Toast 消息都会停留 <strong>3 分钟（180秒）</strong>后自动消失</li>
            <li>这样设置是为了方便调试和观察样式效果</li>
            <li>可以使用&quot;清除所有 Toast&quot;按钮来手动清除消息</li>
            <li>在生产环境中，Toast 会自动恢复到正常的显示时间（3-4秒）</li>
            <li>系统会自动检测环境，无需手动配置</li>
          </ul>
        </div>
      </Space>
    </div>
  );
}
