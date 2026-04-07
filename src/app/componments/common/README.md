# 通用UI组件样式库

本目录包含了项目的通用UI组件样式，这些样式被设计为可重用、可扩展的模块化CSS组件。

## 📁 文件结构

```
common/
├── index.css          # 主入口文件，导入所有通用样式
├── buttons.css        # 按钮样式
├── containers.css     # 容器样式
├── forms.css          # 表单样式
├── states.css         # 状态样式
├── Common.css         # 通用样式
├── Toast.css          # Toast通知样式
└── README.md          # 说明文档
```

## 🚀 快速开始

### 导入所有通用样式

```css
@import './common/index.css';
```

### 按需导入

```css
@import './common/buttons.css';    /* 按钮样式 */
@import './common/containers.css'; /* 容器样式 */
@import './common/forms.css';      /* 表单样式 */
@import './common/states.css';     /* 状态样式 */
```

## 📚 样式组件

### 1. 按钮样式 (buttons.css)

#### 基础按钮
```html
<button class="base-btn">基础按钮</button>
```

#### 主题按钮
```html
<button class="base-btn btn-primary">主要按钮</button>
<button class="base-btn btn-secondary">次要按钮</button>
<button class="base-btn btn-danger">危险按钮</button>
```

#### 尺寸变体
```html
<button class="base-btn btn-primary btn-sm">小按钮</button>
<button class="base-btn btn-primary btn-md">中等按钮</button>
<button class="base-btn btn-primary btn-lg">大按钮</button>
```

#### 特殊按钮
```html
<button class="filter-btn">过滤器按钮</button>
<button class="icon-btn">图标按钮</button>
```

### 2. 容器样式 (containers.css)

#### 基础容器
```html
<div class="base-container">基础容器</div>
```

#### 卡片容器
```html
<div class="card-container">卡片容器</div>
```

#### 列表容器
```html
<div class="list-container">列表容器</div>
```

#### 表单容器
```html
<div class="form-container">表单容器</div>
```

### 3. 表单样式 (forms.css)

#### 基础表单元素
```html
<div class="form-group">
  <label class="form-label">用户名</label>
  <input type="text" class="form-input">
</div>
```

#### 复选框和单选框
```html
<div class="checkbox-group">
  <label class="checkbox-item">
    <input type="checkbox" class="form-checkbox">
    <span>选项1</span>
  </label>
</div>
```

### 4. 状态样式 (states.css)

#### 空状态
```html
<div class="empty-state">
  <div class="empty-icon">📭</div>
  <div class="empty-title">暂无数据</div>
  <div class="empty-description">这里还没有内容</div>
</div>
```

#### 加载状态
```html
<div class="loading-state">
  <div class="loading-spinner"></div>
  <span class="loading-text">加载中...</span>
</div>
```

#### 错误/成功状态
```html
<div class="error-state">
  <div class="error-icon">❌</div>
  <div class="error-title">出错了</div>
  <div class="error-description">请稍后再试</div>
</div>
```

## 🎨 设计原则

### 1. 模块化
每个样式文件专注于特定的UI组件类型，便于维护和扩展。

### 2. 一致性
使用统一的命名规范和CSS变量，确保样式的一致性。

### 3. 响应式
所有样式都包含移动端适配，支持不同屏幕尺寸。

### 4. 可扩展性
通过CSS类组合的方式，可以轻松创建新的样式变体。

## 🔧 自定义主题

可以通过修改CSS变量来自定义主题：

```css
:root {
  --color-primary: #your-color;
  --spacing-base: 1rem;
  --radius-md: 0.5rem;
  /* ... 其他变量 */
}
```

## 📱 移动端优化

所有样式都针对移动端进行了优化，包括：
- 触摸友好的按钮尺寸
- 适当的间距
- 优化的字体大小
- 防止水平滚动

## 🚨 注意事项

1. **导入顺序**: 确保在组件样式之前导入通用样式
2. **命名冲突**: 避免使用与通用样式相同的类名
3. **覆盖样式**: 可以通过添加额外的类或使用CSS变量来覆盖默认样式

## 📝 更新日志

### v1.0.0
- 初始版本
- 提取了按钮、容器、表单、状态等通用样式
- 支持响应式设计
- 统一的主题系统

## 🤝 贡献

当添加新的通用样式时，请遵循以下原则：

1. 将样式添加到相应的专用文件中
2. 使用CSS变量而非硬编码值
3. 添加移动端适配
4. 更新本文档

## 📄 许可证

本样式库遵循项目的许可证协议。
