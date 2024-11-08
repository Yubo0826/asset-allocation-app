import './App.css'
import { useState } from 'react'

import LoginBox from './components/LoginBox'
import SearchBox from './components/SearchBox'
import HistoryTable from './components/HistoryTable'
import PercentAreaChart from './components/PercentAreaChart'

import { RootState } from './redux/store'
import { useSelector } from 'react-redux'

import Container from '@mui/material/Container'
import Box from '@mui/material/Box'
import Tabs from '@mui/material/Tabs'
import Tab from '@mui/material/Tab'

import '@fontsource/roboto/300.css'
import '@fontsource/roboto/400.css'
import '@fontsource/roboto/500.css'
import '@fontsource/roboto/700.css'



const App: React.FC = () => {
  const [value, setValue] = useState(0)
  const user = useSelector((state: RootState) => state.user)

  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    console.log(event)
    setValue(newValue)
  }

  const tabContainer = () => {
    switch (value) {
      case 0:
        return <SearchBox />
      case 1:
        return <HistoryTable />
      case 2:
        return (
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <PercentAreaChart />
          </div>
        )
      default:
        return null
    }
  }

  return (
      <Container sx={{width: '85vw'}}>
        <Box sx={{width: '100%'}}>
          <div className='title-bar'>
            <h1 className='tiny5-regular'>{ user ? (user.displayName + '\'s ') : '' }Asset Allocation</h1>
            <LoginBox />
          </div>
          <Box sx={{ width: '100%', bgcolor: 'background.paper', margin: '25px 0' }}>
            <Tabs value={value} onChange={handleChange} centered>
              <Tab label="投資組合" />
              <Tab label="歷史紀錄" />
              <Tab label="統計資料" />
            </Tabs>
          </Box>

          {tabContainer()}
        </Box>
      </Container>

  )
}

export default App
