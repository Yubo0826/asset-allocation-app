import React, { useState } from 'react';

// 定義資產類型
interface Asset {
  name: string;
  value: number;
}

// 固定比例配置函數
const fixedAllocationStrategy = (assets: Asset[], allocation: { [key: string]: number }): Asset[] => {
  const totalValue = assets.reduce((sum, asset) => sum + asset.value, 0);
  return assets.map(asset => {
    const targetValue = totalValue * (allocation[asset.name] || 0);
    return {
      ...asset,
      value: targetValue
    };
  });
};

const App: React.FC = () => {
  const [assets, setAssets] = useState<Asset[]>([
    { name: 'AAPL', value: 10000 },
    { name: 'TLT', value: 5000 },
    { name: 'GLD', value: 3000 }
  ]);
  
  const [allocation, setAllocation] = useState<{ [key: string]: number }>({
    'AAPL': 0.6,
    'TLT': 0.3,
    'GLD': 0.1
  });

  // 重新分配資產
  const rebalancePortfolio = () => {
    const updatedAssets = fixedAllocationStrategy(assets, allocation);
    setAssets(updatedAssets);
  };

  // 處理資產值的輸入更新
  const handleAssetChange = (index: number, newValue: number) => {
    const updatedAssets = [...assets];
    updatedAssets[index].value = newValue;
    setAssets(updatedAssets);
  };

  // 處理資產比例的輸入更新
  const handleAllocationChange = (name: string, newPercentage: number) => {
    setAllocation({
      ...allocation,
      [name]: newPercentage
    });
  };

  return (
    <div>
      <h1>Asset Allocation</h1>

      <h2>Asset Information</h2>
      {assets.map((asset, index) => (
        <div key={asset.name}>
          <label>{asset.name}:</label>
          <input
            type="number"
            value={asset.value}
            onChange={(e) => handleAssetChange(index, parseFloat(e.target.value))}
          />
        </div>
      ))}

      <h2>Asset Proportion</h2>
      {Object.keys(allocation).map(name => (
        <div key={name}>
          <label>{name} 比例 (%):</label>
          <input
            type="number"
            value={allocation[name] * 100}
            onChange={(e) => handleAllocationChange(name, parseFloat(e.target.value) / 100)}
          />
        </div>
      ))}

      <button onClick={rebalancePortfolio}>Rebalance</button>

      <h2>Assets after reallocation</h2>
      <ul>
        {assets.map(asset => (
          <li key={asset.name}>
            {asset.name}: {asset.value.toFixed(2)}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default App;
