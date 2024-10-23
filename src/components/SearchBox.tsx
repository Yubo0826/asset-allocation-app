import React, { useCallback, useEffect, useState } from 'react';
import axios from 'axios';
import { debounce } from 'lodash'

import TextField from '@mui/material/TextField';
import Autocomplete from '@mui/material/Autocomplete';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import CircularProgress from '@mui/material/CircularProgress';
import Button from '@mui/material/Button';

import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
// import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';

import HistoryTable from './HistoryTable'
import PercentAreaChart from './PercentAreaChart'

interface Stock {
  symbol: string, // 股票代號
  price: number,
  companyName: string
}

interface Asset extends Stock {
  share: number,  // (可輸入) 股數
  expected_rate: number, // (可輸入) 期望比例
  balanced_share: number, // 平衡後股數
  balanced_rate: number,  // 平衡後實際比例
  value: number // 平衡後的價值 (balanced_share * price)
}

interface HistoryRecord {
  date: string  // 紀錄的日期
  assets: Asset[]  // 資產清單
  totalValue: number // 當前總資產值
  balance: number // 當前餘額
}


function SearchBox() {
  const [searchQuery, setSearchQuery] = useState<string>('')
  const [searchOptions, setsearchOptions] = useState<Stock[]>([])
  const [assets, setAssets] = useState<Asset[]>([
    {
      symbol: 'AAU',
      companyName: 'Almaden Minerals Ltd.',
      price: 50,
      share: 20,
      expected_rate: 60,
      balanced_rate: 0,
      balanced_share: 0,
      value: 0
    },
    {
      symbol: 'TLL',
      companyName: 'Adsdsn zen Ltd.',
      price: 30,
      share: 50,
      expected_rate: 40,
      balanced_rate: 0,
      balanced_share: 0,
      value: 0
    }
  ])

  const fetchSearchResults = useCallback(
    debounce(async (newInputValue: string) => {
      if (!newInputValue) return
      const url: string = `https://financialmodelingprep.com/api/v3/search?query=${newInputValue}&apikey=bKSqPjf3mVOT2AzgCzNR7ndIhzZMjyry`
      setLoading(true)
      try {
        const response = await axios.get(url)
        console.log('搜尋結果', response.data)
        setsearchOptions(response.data)
      } catch (error) {
        console.error('Error fetch search results', error)
      } finally {
        setLoading(false)
      }
    }, 500), []
  )

  // 搜尋框變更 onInputChange & inputValue
  const handleSearchChange = (event: React.SyntheticEvent, newInputValue: string) => {
    console.log(event);
    setSearchQuery(newInputValue)
    fetchSearchResults(newInputValue)
  }

  // 加入資產 onChange & value
  const handleValueChange = async (event: any, newValue: Stock | null) => {
    console.log(event)
    if (!newValue) return
    
    const url: string = `https://financialmodelingprep.com/api/v3/profile/${newValue.symbol}?apikey=bKSqPjf3mVOT2AzgCzNR7ndIhzZMjyry`
    console.log(url)
    try {
      const response = await axios.get(url)
      console.log('加入資產', response.data)
      const newAsset = response.data
      newAsset[0].share = 0
      newAsset[0].balanced_share = 0
      newAsset[0].expected_rate = 0
      newAsset[0].balanced_rate = 0
      newAsset[0].value = 0
      setAssets(prev => prev.concat(newAsset))
      setSearchQuery('')
      console.log('目前資產', assets)
    } catch (error) {
      console.error('Error fetch symbol profile', error)
    }
  }

  // 搜尋框選單開關事件
  const [open, setOpen] = React.useState(false);
  const [loading, setLoading] = React.useState(false);

  const handleOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false)
    setsearchOptions([])
  };

  const handleDelete = (targetIndex: number) => {
    const newAssets = assets.filter((item, index) => {
      console.log(item);
      return index !== targetIndex
    })
    setAssets(newAssets)
  }

  // 取得總資金
  const [totalValue, setTotalValue] = useState<number>(0)
  const getTotalValue = (): number => {
    let total: number = 0
    assets.forEach(asset => {
      total += (asset.price * asset.share)
    })
    return Math.ceil(total)
  }


  // 取得該股平衡後的股數
  const getBalancedShare = (asset: Asset): number => {
    return Math.floor(
      getTotalValue() * asset.expected_rate / (asset.price * 100) 
    )
  } 

  // 取得該股平衡後的餘額
  const getBalance = (asset: Asset): number => {
    return (getTotalValue() * asset.expected_rate) % (asset.price)
  } 

  const [balanced_total_value, setBalanceTotalValue] = useState<number>(0) // 平衡後總資金
  const [balance, setBalance] = useState<number>(0)  // 餘額
  
  // 按下平衡按鈕
  const handleBalance = () => {
    if (!checkExpectedRateTotal()) {
      alert('期望比例總和必須為100%')
      return
    }

    // 計算平衡前總額資產
    let total: number = 0
    assets.forEach(asset => {
      total += (asset.price * asset.share)
    })
    setTotalValue(Math.ceil(total) + addMoney)

    let balance: number = 0 // 餘額
    let balancedTotalValue: number = 0
    // 算出各股平衡後股數
    assets.forEach(asset => {
      asset.balanced_share = getBalancedShare(asset)
      asset.value = asset.balanced_share * asset.price
      balancedTotalValue += asset.value
      balance += getBalance(asset)
    })
    setBalanceTotalValue(balancedTotalValue)
    setBalance(balance)
    
    // 算出各股平衡後實際比例
    setAssets(prev => {
      return prev.map(item => {
        console.log(balanced_total_value);
        
        item.balanced_rate = (item.price * item.balanced_share / balancedTotalValue) * 100
        return item
      })
    })

    // 詢問使用者是否紀錄這筆資料
    setsavePopup(true)
  }
  
  // 檢查期望比例總和是否為100
  const checkExpectedRateTotal = (): boolean => {
    let total: number = 0
    assets.forEach(asset => {
      total += asset.expected_rate
    })

    return total === 100 ? true : false
  }


  const [history, setHistory] = useState<HistoryRecord[]>([])

  // 將目前資產現況儲存於歷史紀錄
  const updateHistory = () => {
    const newRecord: HistoryRecord = {
      date: new Date().toISOString(),
      assets: JSON.parse(JSON.stringify(assets)),
      totalValue: balanced_total_value,
      balance
    };
    setHistory([...history, newRecord])
    console.log(history)
  }

  // 按下平衡後，詢問使用者是否紀錄這筆資料
  const [savePopup, setsavePopup] = useState<boolean>(false)
  const handleSavePopupClose = (agree: boolean) => {
    if (agree) updateHistory()
    setsavePopup(false)
  }

  // 新增資金視窗
  const [addMoneyPopup, setAddMoneyPopup] = useState<boolean>(false)
  const [addMoney, setAddMoney] = useState<number>(0)

  const handleAddMoneyPopupClose = () => {
    setAddMoneyPopup(false)
  }

  return (
    <>
      {/* <div>{`value: ${value !== null ? `'${value}'` : 'null'}`}</div>
      <div>{`inputValue: '${searchQuery}'`}</div> */}

      <div className='search-input'>
        <Autocomplete
          inputValue={searchQuery}
          onInputChange={handleSearchChange}
          onChange={handleValueChange}
          sx={{ width: 300 }}
          open={open}
          onOpen={handleOpen}
          onClose={handleClose}
          isOptionEqualToValue={(option, value) => option.symbol === value.symbol}
          getOptionLabel={(option) => option?.symbol || ''}
          options={searchOptions}
          loading={loading}
          filterOptions={(x) => x}
          renderInput={(params) => (
            <TextField
              {...params}
              label="輸入代號"
              slotProps={{
                input: {
                  ...params.InputProps,
                  endAdornment: (
                    <React.Fragment>
                      {loading ? <CircularProgress color="inherit" size={20} /> : null}
                      {params.InputProps.endAdornment}
                    </React.Fragment>
                  ),
                },
              }}
            />
          )}
        />

        <div>
          <Button onClick={ () => setAddMoneyPopup(true) } style={{ marginRight: '15px' }} variant="outlined">新增資金</Button>
          <Button onClick={ handleBalance } variant="outlined">平衡</Button>
        </div>
      </div>



      <TableContainer component={Paper}>
        <Table sx={{ minWidth: 650 }} aria-label="simple table">
          <TableHead>
            <TableRow>
              <TableCell>代號</TableCell>
              <TableCell>公司</TableCell>
              <TableCell>股價</TableCell>
              <TableCell>持有股數</TableCell>
              <TableCell>期望比例 (%)</TableCell>
              <TableCell>實際比例 (%)</TableCell>
              <TableCell>平衡後股數</TableCell>
              <TableCell>價值</TableCell>
              <TableCell></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {assets.map((asset, index) => (
              <TableRow
                key={index}
                sx={{ '&:last-child td, &:last-child th': { border: 0 }, width: 800 }}
              >
                <TableCell component="th" scope="row">
                  {asset.symbol}
                </TableCell>
                <TableCell>{asset.companyName}</TableCell>
                <TableCell>{asset.price} </TableCell>

                {/* 股數 */}
                <TableCell>
                  <input 
                    value={asset.share} 
                    onChange={e => {
                      setAssets((prevAssets) => {
                        let result = [...prevAssets]
                        result[index].share = parseInt(e.target.value)
                        return result
                      })
                    }} 
                    className='table-input' 
                    type="number" />
                </TableCell>

                {/* 期望比例 */}
                <TableCell>
                <input 
                    value={asset.expected_rate} 
                    onChange={e => {
                      setAssets((prevAssets) => {
                        let result = [...prevAssets]
                        result[index].expected_rate = parseInt(e.target.value)
                        return result
                      })
                    }} 
                    className='table-input' 
                    type="number" />
                </TableCell>
                {/* 平衡後實際比例 */}
                <TableCell>
                    { Math.round(asset.balanced_rate) }
                </TableCell>
                {/* 平衡股數 */}
                <TableCell>
                  { asset.balanced_share }
                </TableCell>
                {/* 價值 */}
                <TableCell>
                  { asset.value }
                </TableCell>
                
                <TableCell>
                  <p 
                    onClick={() => handleDelete(index)}
                    className='delete-button'
                  >
                    Delete
                  </p>
                </TableCell>
              </TableRow>
            ))}



            <TableRow>
              <TableCell rowSpan={3} />
              <TableCell rowSpan={3} />
              <TableCell rowSpan={3} />
              <TableCell rowSpan={3} />
              <TableCell colSpan={2}>總資金</TableCell>
              <TableCell align="right">
                {/* { getTotalValue() }  */}
                { totalValue }
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell colSpan={2}>平衡後資金</TableCell>
              <TableCell align="right">{ Math.ceil(balanced_total_value) } </TableCell>
            </TableRow>
            <TableRow>
              <TableCell colSpan={2}>餘額</TableCell>
              <TableCell align="right">{ Math.ceil(balance) } </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </TableContainer>

      <h2 style={{ marginTop: '100px'}}>歷史資料</h2>
      <HistoryTable historyList={history}/>

      <h2 style={{ marginTop: '100px'}}>統計資料</h2>
      <PercentAreaChart historyList={history} />

       {/* 彈出視窗: 詢問使用者是否紀錄 */}
      <Dialog
        open={savePopup}
        onClose={handleSavePopupClose}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">
          {"是否要記錄這筆資料?"}
        </DialogTitle>
        {/* <DialogContent>
          <DialogContentText id="alert-dialog-description">
            可於下方看統計資料和
          </DialogContentText>
        </DialogContent> */}
        <DialogActions>
          <Button onClick={() => handleSavePopupClose(false)}>否</Button>
          <Button onClick={() => handleSavePopupClose(true)} autoFocus>
            是
          </Button>
        </DialogActions>
      </Dialog>


      {/* 彈出視窗: 新增資金 */}
      <Dialog
        open={addMoneyPopup}
        onClose={handleAddMoneyPopupClose}
        PaperProps={{
          component: 'form',
          onSubmit: (event: React.FormEvent<HTMLFormElement>) => {
            event.preventDefault();
            const formData = new FormData(event.currentTarget);
            const formJson = Object.fromEntries((formData as any).entries());
            // const email = formJson.email;
            // console.log(email);
            console.log('formJson.money', formJson.money);
            console.log('addMoney', addMoney);
            
            
            setAddMoney(prev => prev + formJson.money)
            console.log('addMoney', addMoney);
            handleBalance()
            handleAddMoneyPopupClose();
          },
        }}
      >
        <DialogTitle>添增資金</DialogTitle>
        <DialogContent>
          {/* <DialogContentText>
            To subscribe to this website, please enter your email address here. We
            will send updates occasionally.
          </DialogContentText> */}
          <TextField
            autoFocus
            required
            margin="dense"
            id="name"
            name="money"
            label="金額"
            type="number"
            fullWidth
            variant="standard"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleAddMoneyPopupClose}>取消</Button>
          <Button type="submit">確定</Button>
        </DialogActions>
      </Dialog>
    </>
  )
}

export default SearchBox