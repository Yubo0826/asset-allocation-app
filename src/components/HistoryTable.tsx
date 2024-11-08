import * as React from 'react';
import Box from '@mui/material/Box';
import Collapse from '@mui/material/Collapse';
import IconButton from '@mui/material/IconButton';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';

import { HistoryRecord } from '../types'

import { useSelector, useDispatch } from 'react-redux'
import { RootState, AppDispatch } from '../redux/store'
import { deleteRecord } from '../redux/historyRecordSlice'

import { collection, query, where, getDocs, deleteDoc, getFirestore } from 'firebase/firestore'
import { initializeApp } from 'firebase/app'
import { firebaseConfig } from '../firebase-config'

const app = initializeApp(firebaseConfig)
const db = getFirestore(app)

interface RowProps {
  row: HistoryRecord
}

function Row({ row }: RowProps) {
  const [open, setOpen] = React.useState(false)
  const dispatch = useDispatch<AppDispatch>()
  const user = useSelector((state: RootState) => state.user)

  return (
    <React.Fragment>
      <TableRow sx={{ '& > *': { borderBottom: 'unset' } }}>
        <TableCell>
          <IconButton
            aria-label="expand row"
            size="small"
            onClick={() => setOpen(!open)}
          >
            {open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
          </IconButton>
        </TableCell>
        <TableCell component="th" scope="row">
          {new Date(row.date).toLocaleDateString()}
        </TableCell>
        <TableCell align="right">{row.totalValue.toLocaleString()}</TableCell>
        <TableCell align="right">{row.balance.toLocaleString()}</TableCell>
        <TableCell align="right">
        <p 
          onClick={async () => {
            const userRef = collection(db, `users/${user.uid}/assetHistory`) // 假設每位用戶有自己的 assetHistory 集合
            const q = query(userRef, where('date', '==', row.date))

            try {
              const querySnapshot = await getDocs(q)

              // 刪除查詢到的文件
              querySnapshot.forEach(async (docSnapshot) => {
                await deleteDoc(docSnapshot.ref)
              })

              // 從 Redux 狀態中刪除紀錄
              dispatch(deleteRecord(row.date))
              console.log(`Deleted record with date: ${row.date}`)
            } catch (error) {
              console.error('Failed to delete record from Firestore:', error)
            }
            dispatch(deleteRecord(row.date))
          }}
          className='delete-button'
        >
          刪除
        </p>
        </TableCell>
      </TableRow>
      <TableRow>
        <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={6}>
          <Collapse in={open} timeout="auto" unmountOnExit>
            <Box sx={{ margin: 1 }}>
              <Typography variant="h6" gutterBottom component="div">
                資產明細
              </Typography>
              <Table size="small" aria-label="assets">
                <TableHead>
                  <TableRow>
                    <TableCell>代號</TableCell>
                    <TableCell>公司</TableCell>
                    <TableCell align="right">股價 (USD)</TableCell>
                    <TableCell align="right">股數</TableCell>
                    <TableCell align="right">比例 (%)</TableCell>
                    <TableCell align="right">價值 (USD)</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {row.assets.map((asset, index) => (
                    <TableRow key={index}>
                      <TableCell>{asset.symbol}</TableCell>
                      <TableCell>{asset.companyName}</TableCell>
                      <TableCell align="right">{asset.price}</TableCell>
                      <TableCell align="right">{asset.balanced_share}</TableCell>
                      <TableCell align="right">{asset.balanced_rate.toFixed(2)}</TableCell>
                      <TableCell align="right">{asset.value.toFixed(2)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Box>
          </Collapse>
        </TableCell>
      </TableRow>
    </React.Fragment>
  )
}

export default function CollapsibleTable() {
  const history = useSelector((state: RootState) => state.historyRecord.records)

  return (
    <TableContainer component={Paper}>
      <Table aria-label="collapsible table">
        <TableHead>
          <TableRow>
            <TableCell />
            <TableCell>日期</TableCell>
            <TableCell align="right">資產總額</TableCell>
            <TableCell align="right">餘額</TableCell>
            <TableCell />
          </TableRow>
        </TableHead>
        <TableBody>
          {history.map((item, index) => (
            <Row key={index} row={item} />
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  )
}
