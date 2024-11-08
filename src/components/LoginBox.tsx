import { getAuth, signInWithPopup, GoogleAuthProvider, signOut, setPersistence, browserLocalPersistence } from 'firebase/auth'
import { initializeApp } from 'firebase/app'
// import Button from '@mui/material/Button'
import Avatar from '@mui/material/Avatar'
import Menu from '@mui/material/Menu'
import MenuItem from '@mui/material/MenuItem'
import ListItemIcon from '@mui/material/ListItemIcon'
import Logout from '@mui/icons-material/Logout'
import Tooltip from '@mui/material/Tooltip'
import IconButton from '@mui/material/IconButton'
import { firebaseConfig } from '../firebase-config'
import { getFirestore, doc, setDoc, getDoc, query, getDocs, collection } from 'firebase/firestore'
import { useEffect } from 'react'
import { onAuthStateChanged } from 'firebase/auth'

import { useSelector, useDispatch } from 'react-redux'
import { RootState, AppDispatch } from '../redux/store'
import { setUser, clearUser } from '../redux/userSlice'
import { addRecord, clearRecords } from '../redux/historyRecordSlice'
import { setAssets, clearAssets } from '../redux/currentAssetsSlice'
import axios from 'axios'
import { HistoryRecord, Asset } from '../types'
import { useState } from 'react'

const app = initializeApp(firebaseConfig)
const db = getFirestore(app)
const auth = getAuth(app)


function LoginBox() {
  const dispatch = useDispatch<AppDispatch>()
  const user = useSelector((state: RootState) => state.user)

  useEffect(() => {
    const fetchLatestPrices = async (assets: Asset[]) => {
      try {
        const updatedAssets = await Promise.all(
          assets.map(async (asset) => {
            const url = `https://financialmodelingprep.com/api/v3/profile/${asset.symbol}?apikey=${import.meta.env.VITE_FMP_APIKEY}`
            const response = await axios.get(url)
            console.log(response.data)
            asset.price = response.data[0]?.price || asset.price
            asset.balanced_rate = 0
            asset.balanced_share = 0
            asset.value = 0
            console.log('asset 最新票價:', asset.price)
            return asset
          })
        )
        dispatch(setAssets(updatedAssets))
      } catch (error) {
        console.error('Error fetching asset prices', error)
      }
    }

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        // 設置用戶資訊
        dispatch(setUser({
          uid: user.uid,
          displayName: user.displayName || '',
          email: user.email || '',
          photoURL: user.photoURL || '',
        }))
        // 清除之前的歷史紀錄 & 現有資產
        dispatch(clearRecords())
        dispatch(clearAssets())
        // 讀取用戶 firestore 資料，並設置於 Redux
        const userRef = doc(db, 'users', user.uid)
        const historyRef = collection(userRef, 'assetHistory')
        const q = query(historyRef)
        const querySnap = await getDocs(q)

        querySnap.forEach((doc) => {
          const data = doc.data() as HistoryRecord // 將資料強制轉換為 HistoryRecord 類型
          dispatch(addRecord(data))
        })

        // 把歷史資料最後一筆 (最新) 設置給 Current Assets
        if (!querySnap.empty) {
          const latestDoc = querySnap.docs[querySnap.size - 1]
          const latestRecord = latestDoc.data() as HistoryRecord
          console.log('latestRecord', latestRecord)
          await fetchLatestPrices(latestRecord.assets)
          // dispatch(addRecord(latestRecord))
          // dispatch(setAssets(data.assets))
        }
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
        // 用戶已存在，更新用戶資料
        await setDoc(userDocRef, {
          displayName: result.user.displayName || '',
          email: result.user.email || '',
          photoURL: result.user.photoURL || '',
        });
      } else {
        // 用戶不存在，創建新用戶
        await setDoc(userDocRef, {
          displayName: result.user.displayName || '',
          email: result.user.email || '',
          photoURL: result.user.photoURL || '',
        });
      }
    } catch (error) {
      console.error('Login failed:', error)
    }
  }

  const handleLogout = () => {
    signOut(auth).then(() => dispatch(clearUser())).catch((error) => console.error("Logout failed:", error))
  }

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
  const open = Boolean(anchorEl)
  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget)
  }
  const handleClose = () => {
    setAnchorEl(null)
  }

  return (
    <div>
      {user.uid ? (
        <>
          {/* <Avatar src={user.photoURL || ''} alt="Google Avatar" style={{ margin: '20px auto' }} />
          <h3>歡迎, {user.displayName}</h3>
          <Button variant="contained" color="secondary" onClick={handleLogout}>
            登出
          </Button> */}
          <Tooltip title="">
            <IconButton
              onClick={handleClick}
              size="small"
              sx={{ ml: 2 }}
              aria-controls={open ? 'account-menu' : undefined}
              aria-haspopup="true"
              aria-expanded={open ? 'true' : undefined}
            >
              <Avatar src={user.photoURL || ''} alt="Google Avatar" sx={{ width: 32, height: 32 }}></Avatar>
            </IconButton>
          </Tooltip>

          <Menu
            anchorEl={anchorEl}
            id="account-menu"
            open={open}
            onClose={handleClose}
            onClick={handleClose}
            slotProps={{
              paper: {
                elevation: 0,
                sx: {
                  overflow: 'visible',
                  filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.32))',
                  mt: 1.5,
                  '& .MuiAvatar-root': {
                    width: 32,
                    height: 32,
                    ml: -0.5,
                    mr: 1,
                  },
                  '&::before': {
                    content: '""',
                    display: 'block',
                    position: 'absolute',
                    top: 0,
                    right: 14,
                    width: 10,
                    height: 10,
                    bgcolor: 'background.paper',
                    transform: 'translateY(-50%) rotate(45deg)',
                    zIndex: 0,
                  },
                },
              },
            }}
            transformOrigin={{ horizontal: 'right', vertical: 'top' }}
            anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
            >
            <MenuItem onClick={handleLogout}>
              <ListItemIcon>
                <Logout fontSize="small" />
              </ListItemIcon>
              Logout
            </MenuItem>
          </Menu>
        </>
      ) : (
        <>
        <Tooltip title="">
          <IconButton
            onClick={handleLogin}
            size="small"
            sx={{ ml: 2 }}
            aria-controls={open ? 'account-menu' : undefined}
            aria-haspopup="true"
            aria-expanded={open ? 'true' : undefined}
          >
            <Avatar sx={{ width: 32, height: 32 }}></Avatar>
          </IconButton>
        </Tooltip>

        
        </>
        // <Button variant="contained" color="primary" onClick={handleLogin}>
        //   登入
        // </Button>
      )}


    
      

    </div>

  )
}

export default LoginBox
