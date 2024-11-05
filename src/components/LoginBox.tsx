import { getAuth, signInWithPopup, GoogleAuthProvider, signOut, setPersistence, browserLocalPersistence } from 'firebase/auth'
import { initializeApp } from 'firebase/app'
import Button from '@mui/material/Button'
import Avatar from '@mui/material/Avatar'
import { firebaseConfig } from '../firebase-config'
// import { useUser } from '../UserContext'
import { getFirestore, doc, setDoc, getDoc, query, getDocs, collection } from 'firebase/firestore'
import { useEffect } from 'react'
import { onAuthStateChanged } from 'firebase/auth'

import { useSelector, useDispatch } from 'react-redux'
import { RootState, AppDispatch } from '../redux/store'
import { setUser, clearUser } from '../redux/userSlice'
import { addRecord, clearRecords } from '../redux/historyRecordSlice'
import { setAssets } from '../redux/currentAssetsSlice'

import { HistoryRecord } from '../types'

const app = initializeApp(firebaseConfig)
const db = getFirestore(app)
const auth = getAuth(app)


function LoginBox() {
  // const { user, setUser } = useUser()
  const dispatch = useDispatch<AppDispatch>()
  const user = useSelector((state: RootState) => state.user)
  // const historyRecord = useSelector((state: RootState) => state.historyRecord.records)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        // 設置用戶資訊
        dispatch(setUser({
          uid: user.uid,
          displayName: user.displayName || '',
          email: user.email || '',
          photoURL: user.photoURL || '',
        }))
        // 清除之前的歷史紀錄
        dispatch(clearRecords())
        // 讀取用戶 firestore 資料，並設置於 Redux
        const userRef = doc(db, 'users', user.uid)
        const historyRef = collection(userRef, 'assetHistory')
        const q = query(historyRef)
        const querySnap = await getDocs(q)
        querySnap.forEach((doc) => {
          const data = doc.data() as HistoryRecord // 將資料強制轉換為 HistoryRecord 類型
          dispatch(addRecord(data))
          // 把歷史資料最後一筆 (最新) 設置給 Current Assets
          dispatch(setAssets(data.assets))
        })
      } else {
        dispatch(clearUser())
      }
    })

    return () => unsubscribe() // 清除監聽器
  }, [])

  const handleLogin = async () => {
    try {
      // 設置登入資訊本地儲存
      await setPersistence(auth, browserLocalPersistence)
      const provider = new GoogleAuthProvider()
      const result = await signInWithPopup(auth, provider)
      console.log(result)

      // 檢查用戶是否存在
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

      dispatch(setUser({
        uid: result.user.uid,
        displayName: result.user.displayName || '',
        email: result.user.email || '',
        photoURL: result.user.photoURL || '',
      }))
      // 清除之前的歷史紀錄
      dispatch(clearRecords())
      // 讀取用戶 firestore 資料，並設置於 Redux
      const userRef = doc(db, 'users', user.uid)
      const historyRef = collection(userRef, 'assetHistory')
      const q = query(historyRef)
      const querySnap = await getDocs(q)
      querySnap.forEach((doc) => {
        const data = doc.data() as HistoryRecord // 將資料強制轉換為 HistoryRecord 類型
        dispatch(addRecord(data))
      })
    } catch (error) {
      console.error('Login failed:', error)
    }
  }

  const handleLogout = () => {
    signOut(auth).then(() => dispatch(clearUser())).catch((error) => console.error("Logout failed:", error))
  }

  return (
    <div style={{ textAlign: 'center', margin: '50px' }}>
      {user.uid ? (
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
