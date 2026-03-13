# 导出/导入训练模型

## 📤 导出训练结果

### 方法 1：浏览器控制台
1. 按 `F12` 打开开发者工具
2. 切换到 Console 标签
3. 输入以下代码：

```javascript
// 导出训练进度
const progress = localStorage.getItem('tetris_genetic_progress');
console.log(progress);

// 或者直接下载为文件
const data = localStorage.getItem('tetris_genetic_progress');
const blob = new Blob([data], { type: 'application/json' });
const url = URL.createObjectURL(blob);
const a = document.createElement('a');
a.href = url;
a.download = 'tetris-ai-model.json';
a.click();
```

### 方法 2：复制到剪贴板
```javascript
const progress = localStorage.getItem('tetris_genetic_progress');
navigator.clipboard.writeText(progress);
alert('训练数据已复制到剪贴板！');
```

---

## 📥 导入训练结果

### 方法 1：从文件导入
```javascript
// 1. 读取文件内容（假设内容在 jsonData 变量中）
const jsonData = '...'; // 粘贴你的 JSON 数据

// 2. 导入到 localStorage
localStorage.setItem('tetris_genetic_progress', jsonData);

// 3. 刷新页面
location.reload();
```

### 方法 2：直接粘贴
1. 按 `F12` 打开控制台
2. 输入：
```javascript
const importData = `粘贴你的 JSON 数据`;
localStorage.setItem('tetris_genetic_progress', importData);
location.reload();
```

---

## 🔄 分享训练模型

### 分享给朋友
1. 导出你的训练结果（JSON 文件）
2. 发送给朋友
3. 朋友导入后即可使用你训练好的 AI

### 备份训练结果
定期导出训练数据，防止浏览器清理缓存导致数据丢失。

---

## 🗑️ 清除训练数据

### 清除进化训练数据
```javascript
localStorage.removeItem('tetris_genetic_progress');
location.reload();
```

### 清除 AI 训练统计
```javascript
localStorage.removeItem('tetris_ai_stats');
location.reload();
```

### 清除所有数据
```javascript
localStorage.clear();
location.reload();
```

---

## 📊 查看训练数据

### 查看当前最佳权重
```javascript
const progress = JSON.parse(localStorage.getItem('tetris_genetic_progress'));
console.log('代数:', progress.generation);
console.log('最佳适应度:', progress.bestFitness);
console.log('最佳权重:', progress.bestWeights);
```

### 查看种群信息
```javascript
const progress = JSON.parse(localStorage.getItem('tetris_genetic_progress'));
console.log('种群大小:', progress.population.length);
console.log('所有个体:', progress.population);
```

---

## 🎯 高级用法

### 合并多次训练结果
如果你在不同设备上训练，可以合并结果：

```javascript
// 设备 A 的训练结果
const progressA = JSON.parse(localStorage.getItem('tetris_genetic_progress'));

// 设备 B 的训练结果（从文件导入）
const progressB = JSON.parse('...');

// 选择更好的结果
const bestProgress = progressA.bestFitness > progressB.bestFitness ? 
    progressA : progressB;

// 保存最佳结果
localStorage.setItem('tetris_genetic_progress', JSON.stringify(bestProgress));
location.reload();
```

### 手动设置权重
如果你想测试特定的权重参数：

```javascript
const customWeights = {
    completeLines: 1.0,
    aggregateHeight: -0.5,
    holes: -0.4,
    bumpiness: -0.2
};

// 临时测试（不保存）
game.ai.weights = customWeights;

// 或者保存为最佳权重
const progress = JSON.parse(localStorage.getItem('tetris_genetic_progress'));
progress.bestWeights = customWeights;
localStorage.setItem('tetris_genetic_progress', JSON.stringify(progress));
```

---

## 💡 提示

1. **定期备份** - 训练数据存储在浏览器中，清理缓存会丢失
2. **跨浏览器** - 不同浏览器的 localStorage 是独立的
3. **隐私模式** - 隐私/无痕模式下数据不会持久化
4. **存储限制** - localStorage 通常限制 5-10MB，训练数据很小不会超限
