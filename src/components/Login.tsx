import React, { useState } from 'react'
import { getAuth, signInWithPopup, GoogleAuthProvider, signOut, User } from 'firebase/auth'
import { initializeApp } from 'firebase/app'
// import { getAnalytics } from "firebase/analytics"
import Button from '@mui/material/Button'
import Avatar from '@mui/material/Avatar'
import { firebaseConfig } from '../firebase-config'

const app = initializeApp(firebaseConfig)
// const analytics = getAnalytics(app)
const auth = getAuth(app)
const provider = new GoogleAuthProvider()

function Login() {
  const [user, setUser] = useState<User | null>(null)

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
    <div style={{ textAlign: 'center', marginTop: '50px' }}>
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
  )
}

export default Login
