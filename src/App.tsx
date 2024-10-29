import React, { createContext, useState } from 'react'
import './App.css'

import SearchBox from './components/SearchBox'

import '@fontsource/roboto/300.css'
import '@fontsource/roboto/400.css'
import '@fontsource/roboto/500.css'
import '@fontsource/roboto/700.css'

import { getAuth, signInWithPopup, GoogleAuthProvider, signOut, User } from 'firebase/auth'
import { initializeApp } from 'firebase/app'
import Button from '@mui/material/Button'
import Avatar from '@mui/material/Avatar'
import { firebaseConfig } from './firebase-config'

const app = initializeApp(firebaseConfig)
const auth = getAuth(app)
const provider = new GoogleAuthProvider()


const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null)
  const UserContext = createContext<User | null>(null)

  const handleLogin = async () => {
    try {
      const result = await signInWithPopup(auth, provider)
      console.log(result)
      setUser(result.user)
    } catch (error) {
      console.error('Login failed:', error)
    }
  }

  const handleLogout = () => {
    signOut(auth).then(() => setUser(null)).catch((error) => console.error("Logout failed:", error));
  }

  return (
    <div>
      <h1>Asset Allocation</h1>

      <div style={{ textAlign: 'center', margin: '50px' }}>
        {user ? (
          <>
            <Avatar src={user.photoURL || ''} alt="Google Avatar" style={{ margin: '20px auto' }} />
            <h3>Welcome, {user.displayName}</h3>
            <Button variant="contained" color="secondary" onClick={handleLogout}>
              Logout
            </Button>
          </>
        ) : (
          <Button variant="contained" color="primary" onClick={handleLogin}>
            Sign in with Google
          </Button>
        )}
      </div>



      <h2>投資組合</h2>
      <UserContext.Provider value={user}>
        <SearchBox />
      </UserContext.Provider>

    </div>
  );
};

export default App;
