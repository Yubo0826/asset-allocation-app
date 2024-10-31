import { getAuth, signInWithPopup, GoogleAuthProvider, signOut, setPersistence, browserLocalPersistence } from 'firebase/auth'
import { initializeApp } from 'firebase/app'
import Button from '@mui/material/Button'
import Avatar from '@mui/material/Avatar'
import { firebaseConfig } from '../firebase-config'
import { useUser } from '../UserContext'
import { getFirestore, collection, addDoc, doc, setDoc, getDoc } from 'firebase/firestore'

const app = initializeApp(firebaseConfig)
console.log(firebaseConfig);

const db = getFirestore(app)
const auth = getAuth(app)
const provider = new GoogleAuthProvider()

function LoginBox() {
  const { user, setUser } = useUser()

  const handleLogin = async () => {
    try {
      // 设置持久性为本地存储
      // await setPersistence(auth, browserLocalPersistence)
      const result = await signInWithPopup(auth, provider)
      console.log(result)

      // 检查用户是否已存在
      const userDocRef = doc(db, "users", result.user.uid);
      const userDocSnap = await getDoc(userDocRef);

      if (userDocSnap.exists()) {
        // 用户已存在，更新用户信息
        await setDoc(userDocRef, {
          displayName: result.user.displayName || '',
          email: result.user.email || '',
          photoURL: result.user.photoURL || '',
        });
      } else {
        // 用户不存在，创建新用户
        await setDoc(userDocRef, {
          displayName: result.user.displayName || '',
          email: result.user.email || '',
          photoURL: result.user.photoURL || '',
        });
      }

      setUser({
        uid: result.user.uid,
        displayName: result.user.displayName || '',
        email: result.user.email || '',
        photoURL: result.user.photoURL || '',
      })
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

export default LoginBox;
