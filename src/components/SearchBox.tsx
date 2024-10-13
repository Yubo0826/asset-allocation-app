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

interface Stock {
  symbol: string,
  price: string,
  companyName: string,
  exchange: string,
  exchangeShortName: string
}

function SearchBox() {
  // https://mui.com/material-ui/react-autocomplete/#asynchronous-requests
  const [searchQuery, setSearchQuery] = useState<string>('')
  const [searchOptions, setsearchOptions] = useState<Stock[]>([])
  const [value, setValue] = useState<string | null>('')
  const [assets, setAssets] = useState<Stock[]>([
    {
      symbol: 'AAU',
      price: 'Almaden Minerals Ltd.',
      companyName: '0.1465',
      exchange: 'American Stock Exchange',
      exchangeShortName: 'ASE'
    },
    {
      symbol: 'SSAU',
      price: 'Adsdsn zen Ltd.',
      companyName: '2.465',
      exchange: 'Taiwan Stock Exchange',
      exchangeShortName: 'TSE'
    }
  ])

  const fetchSearchResults = useCallback(
    debounce(async (newInputValue: string) => {
      if (!newInputValue) return

      const url: string = `https://financialmodelingprep.com/api/v3/search?query=${newInputValue}&apikey=bKSqPjf3mVOT2AzgCzNR7ndIhzZMjyry`
      setLoading(true)
      try {
        const response = await axios.get(url)
        setsearchOptions(response.data)
      } catch (error) {
        console.error('Error fetch search results', error)
      } finally {
        setLoading(false)
      }
    }, 500)
  )

  // 處理搜尋框變更 onInputChange & inputValue
  const handleSearchChange = (event: React.SyntheticEvent, newInputValue: string) => {
    setSearchQuery(newInputValue)
    fetchSearchResults(newInputValue)
  }

  // 處理加入資產 onChange & value
  const handleValueChange = async (event: any, newValue: Stock | null) => {
    if (!newValue) return
    setValue(newValue.symbol)
    const symbol = convertDotToASCII(newValue.symbol)
    const url: string = `https://financialmodelingprep.com/api/v3/profile/${symbol}?apikey=bKSqPjf3mVOT2AzgCzNR7ndIhzZMjyry`
    try {
      const response = await axios.get(url)
      console.log(response.data)
      setAssets(prev => prev.concat(response.data))
      console.log(assets)
    } catch (error) {
      console.error('Error fetch symbol profile', error)
    }
  }

  // 有些symbol有點號
  // 例如 "2330.TW" 轉成 "2330%2ETW"
  function convertDotToASCII(str: string): string {
    return str.replace('.', '%2E') // .的ASCII是'46'
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
    const newAssets = assets.filter((item, index) => index !== targetIndex)
    setAssets(newAssets)
  }

  return (
    <>
      <div>{`value: ${value !== null ? `'${value}'` : 'null'}`}</div>
      <div>{`inputValue: '${searchQuery}'`}</div>

      <Autocomplete
        inputValue={searchQuery}
        onInputChange={handleSearchChange}
        value={value}
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
            label="Search Symbol"
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

      <Button variant="contained">Balance</Button>


      <TableContainer component={Paper}>
        <Table sx={{ minWidth: 650 }} aria-label="simple table">
          <TableHead>
            <TableRow>
              <TableCell>Symbol</TableCell>
              <TableCell>Name</TableCell>
              <TableCell>Price</TableCell>
              <TableCell>Exchange Short Name</TableCell>
              <TableCell>Exchange</TableCell>
              <TableCell>Action</TableCell>
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
                <TableCell>{asset.exchange}</TableCell>
                <TableCell>{asset.exchangeShortName}</TableCell>
                <TableCell>
                  <p 
                    onClick={() => handleDelete(index)}
                  >
                    Delete
                  </p>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </>
  )
}

export default SearchBox