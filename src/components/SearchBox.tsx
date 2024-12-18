import React, { useCallback, useState, useEffect } from 'react';
import axios from 'axios';
import { debounce } from 'lodash'

import ControlPointIcon from '@mui/icons-material/ControlPoint';
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
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';

import Snackbar, { SnackbarCloseReason } from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';

import { getFirestore, collection, addDoc, doc } from 'firebase/firestore'
import { initializeApp } from 'firebase/app'
import { firebaseConfig } from '../firebase-config'

import { useSelector, useDispatch } from 'react-redux'
import { RootState, AppDispatch } from '../redux/store'
import { addRecord } from '../redux/historyRecordSlice'
import { addAsset, deleteAsset, setShares, setExpectedRate, balace, calculateBalancedRate } from '../redux/currentAssetsSlice'

import { Stock, HistoryRecord } from '../types'

const app = initializeApp(firebaseConfig)
const db = getFirestore(app)


function SearchBox() {
  const [searchQuery, setSearchQuery] = useState<string>('')
  const [searchOptions, setsearchOptions] = useState<Stock[]>([])

  const dispatch = useDispatch<AppDispatch>()
  const user = useSelector((state: RootState) => state.user)
  const assets = useSelector((state: RootState) => state.assets)

  useEffect(() => {
    console.log('assets:', assets)
  }, [])

  const fetchSearchResults = useCallback(
    debounce(async (newInputValue: string) => {
      if (!newInputValue) return
      const url: string = `https://financialmodelingprep.com/api/v3/search?query=${newInputValue}&apikey=${import.meta.env.VITE_FMP_APIKEY}`
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
    }, 750), []
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
    
    const url: string = `https://financialmodelingprep.com/api/v3/profile/${newValue.symbol}?apikey=${import.meta.env.VITE_FMP_APIKEY}`
    console.log(url)
    try {
      const response = await axios.get(url)
      console.log('加入資產', response.data)
      const newAsset = {
        symbol: response.data[0].symbol,
        price: response.data[0].price,
        companyName: response.data[0].companyName,
        share: 0,
        balanced_share: 0,
        expected_rate: 0,
        balanced_rate: 0,
        value: 0
      }
      dispatch(addAsset(newAsset))
      setSearchQuery('')
      console.log('目前資產', assets)
      handleAddAssetPopupClose()
    } catch (error) {
      alert('只能選美股喔')
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

  const handleDelete = (symbol: string) => {
    dispatch(deleteAsset(symbol))
  }


  const [totalValue, setTotalValue] = useState<number>(0)
  const [balanced_total_value, setBalanceTotalValue] = useState<number>(0) // 平衡後總資金
  const [balance, setBalance] = useState<number>(0)  // 餘額
  const [accumulateNewMoney, setAccumlateNewMoney] = useState<number>(0)  // 累積的新資金
  
  // 按下平衡按鈕
  const handleBalance = () => {
    if (!checkExpectedRateTotal()) {
      alert('期望比例總和必須為100%')
      return
    }

    // 計算平衡前總額資產
    let total: number = 0
    assets.forEach(asset => {
      const share = asset.share
      total += (asset.price * share)
    })
    console.log('total:', total)
    console.log('newMoneyInputValue:', newMoneyInputValue)
    console.log('accumulateNewMoney:', accumulateNewMoney)
    total += newMoneyInputValue
    total += accumulateNewMoney
    setAccumlateNewMoney(prev => prev + newMoneyInputValue)
    setTotalValue(total)

    dispatch(balace(total))

    // 詢問使用者是否紀錄這筆資料
    // setsavePopup(true)
  }

  useEffect(() => {
    let newBalancedTotalValue = 0
    let newBalance = 0
    console.log('useEffect')
    assets.forEach(asset => {
      newBalancedTotalValue += asset.value
      newBalance += (totalValue * asset.expected_rate) % asset.price
    })

    setBalanceTotalValue(newBalancedTotalValue)
    setBalance(newBalance)

    // 算出各股平衡後實際比例
    dispatch(calculateBalancedRate(newBalancedTotalValue))
  }, [totalValue])
  
  // 檢查期望比例總和是否為100
  const checkExpectedRateTotal = (): boolean => {
    let total: number = 0
    assets.forEach(asset => {
      total += asset.expected_rate
    })

    return total === 100 ? true : false
  }

  // const [history, setHistory] = useState<HistoryRecord[]>([
  //   {"date":"2024-10-27T07:35:17.869Z","assets":[{"symbol":"VT","companyName":"Vanguard Total World Stock Index Fund","price":118.62,"share":2300,"expected_rate":25,"balanced_rate":25.015372708757255,"balanced_share":1820,"value":215888.4},{"symbol":"SPY","companyName":"SPDR S&P 500 ETF Trust","price":577.99,"share":530,"expected_rate":35,"balanced_rate":34.959764452142245,"balanced_share":522,"value":301710.78},{"symbol":"BND","companyName":"Vanguard Total Bond Market Index Fund","price":73.19,"share":3050,"expected_rate":25,"balanced_rate":25.01793347504606,"balanced_share":2950,"value":215910.5},{"symbol":"VWO","companyName":"Vanguard Emerging Markets Stock Index Fund","price":47.13,"share":1300,"expected_rate":15,"balanced_rate":15.006929364054432,"balanced_share":2748,"value":129513.24}],"totalValue":863022.92,"balance":474.6399999986643},{"date":"2024-10-28T07:35:28.117Z","assets":[{"symbol":"VT","companyName":"Vanguard Total World Stock Index Fund","price":118.62,"share":2300,"expected_rate":35,"balanced_rate":35.01865098836839,"balanced_share":2548,"value":302243.76},{"symbol":"SPY","companyName":"SPDR S&P 500 ETF Trust","price":577.99,"share":530,"expected_rate":20,"balanced_rate":19.956237194973287,"balanced_share":298,"value":172241.02},{"symbol":"BND","companyName":"Vanguard Total Bond Market Index Fund","price":73.19,"share":3050,"expected_rate":10,"balanced_rate":10.006353076370031,"balanced_share":1180,"value":86364.2},{"symbol":"VWO","companyName":"Vanguard Emerging Markets Stock Index Fund","price":47.13,"share":1300,"expected_rate":35,"balanced_rate":35.0187587402883,"balanced_share":6413,"value":302244.69}],"totalValue":863093.6699999999,"balance":596.3599999971971},{"date":"2024-10-29T07:35:55.950Z","assets":[{"symbol":"VT","companyName":"Vanguard Total World Stock Index Fund","price":118.62,"share":2300,"expected_rate":30,"balanced_rate":30.008871788581075,"balanced_share":2184,"value":259066.08000000002},{"symbol":"SPY","companyName":"SPDR S&P 500 ETF Trust","price":577.99,"share":530,"expected_rate":25,"balanced_rate":24.97285932336482,"balanced_share":373,"value":215590.27},{"symbol":"BND","companyName":"Vanguard Total Bond Market Index Fund","price":73.19,"share":3050,"expected_rate":25,"balanced_rate":25.009953106591315,"balanced_share":2950,"value":215910.5},{"symbol":"VWO","companyName":"Vanguard Emerging Markets Stock Index Fund","price":47.13,"share":1300,"expected_rate":20,"balanced_rate":20.008315781462795,"balanced_share":3665,"value":172731.45}],"totalValue":863298.3,"balance":272.4899999984002}
  // ])


  // 將目前資產現況儲存於歷史紀錄
  const updateHistory = async () => {
    const newRecord: HistoryRecord = {
      date: new Date().toISOString(),
      assets: JSON.parse(JSON.stringify(assets)),
      totalValue: balanced_total_value,
      balance
    }
    dispatch(addRecord(newRecord))
    setSnackbarOpen(true)

    // 儲存到資料庫
    if (user.uid) {
      try {
        const userRef = doc(db, 'users', user.uid)
        const historyRef = collection(userRef, 'assetHistory')
        await addDoc(historyRef, newRecord)
        console.log('Record saved successfully')
      } catch (error) {
        console.error('Error saving record to Firestore:', error)
      }
    } else {
      alert('請先登入喔!')
    }
  }

  // 按下平衡後，詢問使用者是否紀錄這筆資料
  const [savePopup, setsavePopup] = useState<boolean>(false)
  const handleSavePopupClose = (agree: boolean) => {
    if (agree) updateHistory()
    setsavePopup(false)
  }

  // 新增資金
  const [addMoneyPopup, setAddMoneyPopup] = useState<boolean>(false)
  const [newMoneyInputValue, setNewMoneyInputValue] = useState<number>(0)

  const handleAddMoneyPopupClose = () => {
    setAddMoneyPopup(false)
  }
  const handleAddMoney = () => {
    // assets.map(asset => {
    //   asset.share = asset.balanced_share
    //   return asset

    // })
    if (newMoneyInputValue <= 0) {
      alert('新資金請大於0')
      return
    }
    // dispatch(balace(totalValue + newMoneyInputValue))
    handleBalance()
    handleAddMoneyPopupClose()
    setNewMoneyInputValue(0)
  }

  // 新增資產視窗
  const [addAssetPopup, setAddAssetPopup] = useState<boolean>(false)
  const handleAddAssetPopupClose = () => {
    setAddAssetPopup(false)
  }

  // 左下儲存成功提示
  const [SnackbarOpen, setSnackbarOpen] = React.useState(false)

  const handleSnackbarClose = (
    event?: React.SyntheticEvent | Event,
    reason?: SnackbarCloseReason,
  ) => {
    console.log(event)
    if (reason === 'clickaway') {
      return
    }

    setSnackbarOpen(false)
  }

  return (
    <>
      <div className='button-bar'>
        {/* <button onClick={test}>test</button> */}
        <Button onClick={ updateHistory } color='error' variant="contained">儲存</Button>
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
              <TableCell>今日股價</TableCell>
              <TableCell>持有股數</TableCell>
              <TableCell>期望比例 (%)</TableCell>
              <TableCell>實際比例 (%)</TableCell>
              <TableCell>平衡後股數</TableCell>
              <TableCell align='right'>價值</TableCell>
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
                <TableCell>{asset.price}</TableCell>

                {/* 股數 */}
                <TableCell>
                  <input 
                    value={asset.share} 
                    onChange={e => {
                      dispatch(setShares({ index, value: parseInt(e.target.value) }))
                    }}
                    className='table-input' 
                    type="number" />
                </TableCell>

                {/* 期望比例 */}
                <TableCell>
                <input 
                    value={asset.expected_rate} 
                    onChange={e => {
                      dispatch(setExpectedRate({ index, value: parseInt(e.target.value) }))
                    }} 
                    className='table-input' 
                    type="number" />
                </TableCell>
                {/* 平衡後實際比例 */}
                <TableCell>
                    { asset.balanced_rate ? asset.balanced_rate.toFixed(2) : '-' }
                </TableCell>
                {/* 平衡股數 */}
                <TableCell>
                  { asset.balanced_share ? asset.balanced_share : '-' }
                </TableCell>
                {/* 價值 */}
                <TableCell>
                  { asset.value ? asset.value.toFixed(2) : '-' }
                </TableCell>
                
                <TableCell>
                  <p 
                    onClick={() => handleDelete(asset.symbol)}
                    className='delete-button'
                  >
                    刪除
                  </p>
                </TableCell>
              </TableRow>
            ))}

            <TableRow>
              <TableCell  colSpan={9} >
                <p className='newAssetRow' onClick={() => setAddAssetPopup(true)}>
                  <ControlPointIcon></ControlPointIcon>
                  新增資產
                </p>
              </TableCell>
            </TableRow>


            <TableRow>
              <TableCell rowSpan={3} />
              <TableCell rowSpan={3} />
              <TableCell rowSpan={3} />
              <TableCell rowSpan={3} />
              <TableCell rowSpan={3} />
              <TableCell colSpan={2}>總資金</TableCell>
              <TableCell align="right" sx={{whiteSpace: 'nowrap'}}>
                { totalValue.toLocaleString() } 
                { accumulateNewMoney ? <span> {'(+' + accumulateNewMoney + ')'}</span> : <span></span> }
                
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell colSpan={2}>平衡後資金</TableCell>
              <TableCell align="right">{ balanced_total_value.toLocaleString() } </TableCell>
            </TableRow>
            <TableRow>
              <TableCell colSpan={2}>餘額</TableCell>
              <TableCell align="right">{ balance.toLocaleString() } </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </TableContainer>


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
      >
        <DialogTitle>增添資金</DialogTitle>
        <DialogContent>
          {/* <DialogContentText>
            To subscribe to this website, please enter your email address here. We
            will send updates occasionally.
          </DialogContentText> */}
          <TextField
            value={newMoneyInputValue}
            onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
              setNewMoneyInputValue(parseFloat(event.target.value))
            }}
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
          <Button onClick={handleAddMoney}>平衡</Button>
        </DialogActions>
      </Dialog>


      {/* 彈出視窗: 新增資產 */}
      <Dialog
        open={addAssetPopup}
        onClose={handleAddAssetPopupClose}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">
          {"新增資產"}
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            輸入股票代號，只能選美股喔。
          </DialogContentText>
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
                  margin="dense"
                  variant="standard"
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
        </DialogContent>
        <DialogActions>
          <Button onClick={handleAddAssetPopupClose}>關閉</Button>
        </DialogActions>
      </Dialog>


      {/* 左下，紀錄成功提示 */}
      <Snackbar open={SnackbarOpen} autoHideDuration={4500} onClose={handleSnackbarClose}>
        <Alert
          onClose={handleSnackbarClose}
          severity="success"
          variant="filled"
          sx={{ width: '100%' }}
        >
          儲存成功!
        </Alert>
      </Snackbar>
    </>
  )
}

export default SearchBox