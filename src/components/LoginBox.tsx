import { getAuth, signInWithPopup, GoogleAuthProvider, signOut } from 'firebase/auth'
import { initializeApp } from 'firebase/app'
import Button from '@mui/material/Button'
import Avatar from '@mui/material/Avatar'
import { firebaseConfig } from '../firebase-config'
import { useUser } from '../UserContext'

const app = initializeApp(firebaseConfig)
const auth = getAuth(app)
const provider = new GoogleAuthProvider()

function LoginBox() {
  const { user, setUser } = useUser()
  const handleLogin = async () => {
    try {
      const result = await signInWithPopup(auth, provider)
      console.log(result)
      setUser(
        {
          uid: result.user.uid,
          displayName: result.user.displayName || '',
          email: result.user.email || '',
          photoURL: result.user.photoURL || '',
        }
      )
    } catch (error) {
      console.error('Login failed:', error)
    }
  }

  const handleLogout = () => {
    signOut(auth).then(() => setUser(null)).catch((error) => console.error("Logout failed:", error));
  }

  return (
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
  )
}


export default LoginBox