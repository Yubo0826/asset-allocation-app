import React, { useCallback, useState } from 'react';
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

interface Stock {
  symbol: string,
  price: number,
  companyName: string,
  exchange: string,
  exchangeShortName: string,
  share: number  // 股數，美股100股=1張
}

function SearchBox() {
  // https://finmindtrade.com/analysis/#/data/api  
  const [searchQuery, setSearchQuery] = useState<string>('')
  const [searchOptions, setsearchOptions] = useState<Stock[]>([])
  // const [value, setValue] = useState<string>('')
  const [assets, setAssets] = useState<Stock[]>([
    {
      symbol: 'AAU',
      companyName: 'Almaden Minerals Ltd.',
      price: 1.15,
      exchange: 'American Stock Exchange',
      exchangeShortName: 'ASE',
      share: 0
    },
    {
      symbol: 'SSAU',
      companyName: 'Adsdsn zen Ltd.',
      price: 2.465,
      exchange: 'Taiwan Stock Exchange',
      exchangeShortName: 'TSE',
      share: 0
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

  // 處理搜尋框變更 onInputChange & inputValue
  const handleSearchChange = (event: React.SyntheticEvent, newInputValue: string) => {
    console.log(event);
    setSearchQuery(newInputValue)
    fetchSearchResults(newInputValue)
  }

  // 處理加入資產 onChange & value
  const handleValueChange = async (event: any, newValue: Stock | null) => {
    console.log(event)
    if (!newValue) return
    
    // setValue(newValue.symbol)
    const url: string = `https://financialmodelingprep.com/api/v3/profile/${newValue.symbol}?apikey=bKSqPjf3mVOT2AzgCzNR7ndIhzZMjyry`
    console.log(url)
    try {
      const response = await axios.get(url)
      console.log('加入資產', response.data)
      const newAsset = response.data
      newAsset[0].share = 0
      setAssets(prev => prev.concat(newAsset))
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

  const getCapital = (): number => {
    let capital: number = 0
    assets.forEach(asset => {
      console.log(asset.price)
      capital += (asset.price * asset.share * 100)
    })
    return Math.ceil(capital)
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

        <Button variant="outlined">平衡</Button>
      </div>



      <TableContainer component={Paper}>
        <Table sx={{ minWidth: 650 }} aria-label="simple table">
          <TableHead>
            <TableRow>
              <TableCell>代號</TableCell>
              <TableCell>公司</TableCell>
              <TableCell>股價</TableCell>
              {/* <TableCell>Exchange Short Name</TableCell>
              <TableCell>Exchange</TableCell> */}
              <TableCell>股數</TableCell>
              <TableCell>期望比例</TableCell>
              <TableCell>實際比例</TableCell>
              <TableCell>平衡股數</TableCell>
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
                {/* <TableCell>{asset.exchange}</TableCell>
                <TableCell>{asset.exchangeShortName}</TableCell> */}
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
                <TableCell>
                  <input className='table-input' type="text" /> %
                </TableCell>
                <TableCell></TableCell>
                <TableCell></TableCell>
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
              <TableCell colSpan={4} />
              <TableCell colSpan={2}>總資金</TableCell>
              <TableCell align="right">{getCapital()}</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </TableContainer>
    </>
  )
}

export default SearchBox