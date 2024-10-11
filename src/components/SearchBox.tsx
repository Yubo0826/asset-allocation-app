import React, { useEffect, useState } from 'react';
import axios from 'axios';

import TextField from '@mui/material/TextField';
import Autocomplete from '@mui/material/Autocomplete';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';

interface Stock {
  symbol: string,
  price: string,
  name: string,
  exchange: string,
  exchangeShortName: string
}

function SearchBox() {
  // https://mui.com/material-ui/react-autocomplete/#asynchronous-requests
  const [open, setOpen] = React.useState(false);
  const [searchQuery, setSearchQuery] = useState<string>('')
  const [searchResults, setSearchResults] = useState<Stock[]>([])
  const [value, setValue] = useState<string>('')
  const [currentAssets, setCurrentAssets] = useState<Stock[]>([])
  const [loading, setLoading] = React.useState(false);

  // 處理搜尋框變更 onInputChange & inputValue
  const handleSearchChange = (event: React.SyntheticEvent, newInputValue: string) => {
    setSearchQuery(newInputValue)
    const url: string = `https://financialmodelingprep.com/api/v3/search?query=${newInputValue}&apikey=bKSqPjf3mVOT2AzgCzNR7ndIhzZMjyry`
    axios.get(url).then(response => {
      console.log(response.data)
      setSearchResults(response.data)
    })
  }

  // 處理選取 onChange & value
  const handleValueChange = (event: React.SyntheticEvent, newValue: string) => {
    setValue(newValue)
    const symbol = convertDotToASCII(newValue)
    const url: string = `https://financialmodelingprep.com/api/v3/profile/${symbol}?apikey=bKSqPjf3mVOT2AzgCzNR7ndIhzZMjyry`
    axios.get(url).then(response => {
      console.log(response.data)
      setCurrentAssets(prev => [...prev, response.data])
    })
  }

  // 有些symbol有點號
  // 例如 "2330.TW"
  function convertDotToASCII(str: string): string {
    return str.split('.').join(String.fromCharCode(46)) // .的ASCII是'46'
  }

  return (
    <>
      <Autocomplete
        inputValue={searchQuery}
        onInputChange={handleSearchChange}
        value={value}
        onChange={handleValueChange}
        options={searchResults}
        getOptionLabel={(option) => option.symbol}
        sx={{ width: 300 }}
        renderInput={(params) => <TextField {...params} label="Symbol" />}
      />

      <Autocomplete
        sx={{ width: 300 }}
        open={open}
        onOpen={handleOpen}
        onClose={handleClose}
        isOptionEqualToValue={(option, value) => option.title === value.title}
        getOptionLabel={(option) => option.title}
        options={options}
        loading={loading}
        renderInput={(params) => (
          <TextField
            {...params}
            label="Asynchronous"
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
            {currentAssets.map((asset) => (
              <TableRow
                key={asset.symbol}
                sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
              >
                <TableCell component="th" scope="row">
                  {asset.symbol}
                </TableCell>
                <TableCell align="right">{asset.name}</TableCell>
                <TableCell align="right">{asset.price}</TableCell>
                <TableCell align="right">{asset.exchange}</TableCell>
                <TableCell align="right">{asset.exchangeShortName}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </>
  )
}

export default SearchBox