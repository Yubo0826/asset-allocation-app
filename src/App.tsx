import React from 'react'
import './App.css'

import SearchBox from './components/SearchBox'
import LoginBox from './components/LoginBox'

import { UserProvider } from './UserContext'

import '@fontsource/roboto/300.css'
import '@fontsource/roboto/400.css'
import '@fontsource/roboto/500.css'
import '@fontsource/roboto/700.css'



const App: React.FC = () => {

  return (
    <UserProvider>
      <h1>Asset Allocation</h1>
      <LoginBox />
      <h2>投資組合</h2>
      <SearchBox />
    </UserProvider>

  )
}

export default App
