## Demo網站

[yubo0826.github.io/asset-allocation-app/](https://yubo0826.github.io/asset-allocation-app/)

## 用途

建立好資產配置後，定期檢查自己的投資組合，看看是否需要進行「再平衡」。

此網站幫助你快速計算平衡股數，調整投資組合到自己當初設定的比重，以維持適合的風險比例。

## 開發工具


- 框架：React

- 建構工具：Vite

- UI框架：MUI

- Data API： [Financial Modeling Prep API](https://site.financialmodelingprep.com/)

- 資料庫: Firestore | Firebase

## 如何使用?

### Part1. 創建現有資產:

1. 輸入代號/股數/期望比例(規定總和100%)
2. 系統算出總資金(總市值)
    
    註: 總資金 = 每股 "持有股數*股價" 的總和
    
3. 系統算出 平衡後實際比例/平衡後股數增減值
4. 按"紀錄"，紀錄第一筆紀錄

### Part2. 當有新資金 or 新資產進入

1. 按"新增資金"按鈕，輸入新資金
2. 可以額外新增其他股， 修改整體期望比例
3. 以 "前一筆紀錄"的總資金+新資金，去計算 平衡後實際比例/平衡後股數增減值
4. 按"紀錄"，新增一筆紀錄

