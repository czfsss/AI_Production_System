# 故障名称数据使用说明

## 概述

`faultNames.ts` 文件包含了完整的设备故障名称数据库，提供了多种便捷的函数来获取和管理故障信息。

## 功能特性

### 1. 完整的故障名称数据库

包含 154 种不同的设备故障类型，涵盖：

- SE 相关故障
- MAX 相关故障
- VE 相关故障
- HCF 相关故障
- 其他设备故障

### 2. 分类管理

故障按设备类型自动分类，便于按设备类型筛选故障。

### 3. 随机选择功能

提供多种随机选择故障的方法，适用于模拟测试。

## 使用方法

### 基本导入

```typescript
import {
  FAULT_NAMES,
  FAULT_CATEGORIES,
  getRandomFaultName,
  getRandomFaultNameByCategory,
  getMultipleRandomFaultNames,
  searchFaultNames,
} from '../data/faultNames'
```

### 1. 获取随机故障名称

```typescript
// 获取一个随机故障
const randomFault = getRandomFaultName()
console.log(randomFault) // 例如: "SE跑条"
```

### 2. 按设备类型获取随机故障

```typescript
// 获取 SE 相关的随机故障
const seFault = getRandomFaultNameByCategory('SE')

// 获取 MAX 相关的随机故障
const maxFault = getRandomFaultNameByCategory('MAX')

// 获取 VE 相关的随机故障
const veFault = getRandomFaultNameByCategory('VE')
```

### 3. 获取多个不重复的随机故障

```typescript
// 获取 5 个不重复的随机故障
const multipleFaults = getMultipleRandomFaultNames(5)
console.log(multipleFaults)
// 例如: ["SE跑条", "MAX搓板堵塞", "VE风道堵塞", "HCF堵塞", "连接机器停止"]
```

### 4. 搜索故障名称

```typescript
// 搜索包含"断裂"的故障
const breakageFaults = searchFaultNames('断裂')
console.log(breakageFaults)
// 返回所有包含"断裂"的故障名称

// 搜索 MAX 相关故障
const maxFaults = searchFaultNames('MAX')
```

### 5. 直接访问数据

```typescript
// 访问所有故障名称
console.log(FAULT_NAMES.length) // 154

// 访问分类数据
console.log(FAULT_CATEGORIES.SE) // 所有 SE 相关故障
console.log(FAULT_CATEGORIES.MAX) // 所有 MAX 相关故障
```

## 在设备监控系统中的应用

### 模拟设备故障

在 `useDeviceBinding.ts` 中已经集成：

```typescript
import { getRandomFaultName } from '../data/faultNames'

// 模拟故障时使用随机故障名称
const simulateDeviceFault = () => {
  if (deviceStatus.value === 'running') {
    faultName.value = getRandomFaultName()
    // ... 其他逻辑
  }
}
```

### 故障历史记录生成

```typescript
// 生成模拟的故障历史记录
const generateMockFaultHistory = (count: number) => {
  return Array.from({ length: count }, (_, index) => ({
    id: index + 1,
    faultName: getRandomFaultName(),
    timestamp: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000),
    deviceType: ['SE', 'MAX', 'VE', 'HCF'][Math.floor(Math.random() * 4)],
  }))
}
```

### 故障统计分析

```typescript
// 按设备类型统计故障数量
const getFaultStatistics = () => {
  return {
    SE: FAULT_CATEGORIES.SE.length,
    MAX: FAULT_CATEGORIES.MAX.length,
    VE: FAULT_CATEGORIES.VE.length,
    HCF: FAULT_CATEGORIES.HCF.length,
    OTHER: FAULT_CATEGORIES.OTHER.length,
    total: FAULT_NAMES.length,
  }
}
```

## 扩展和维护

### 添加新故障

如需添加新的故障名称，请在 `FAULT_NAMES` 数组中添加：

```typescript
export const FAULT_NAMES = [
  // ... 现有故障
  '新故障名称',
  // ...
] as const
```

### 自定义分类

可以根据需要创建新的分类：

```typescript
export const CUSTOM_CATEGORIES = {
  CRITICAL: FAULT_NAMES.filter((name) => name.includes('断裂') || name.includes('堵塞')),
  MAINTENANCE: FAULT_NAMES.filter((name) => name.includes('位置') || name.includes('调节')),
}
```

## 类型安全

所有函数都提供了完整的 TypeScript 类型支持，确保代码的类型安全性。
