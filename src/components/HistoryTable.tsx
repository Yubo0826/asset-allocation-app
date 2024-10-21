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

interface Stock {
  symbol: string, // 股票代號
  price: number,
  companyName: string
}

interface Asset extends Stock {
  share: number,  // (可輸入) 股數
  expected_rate: number, // (可輸入) 期望比例
  balanced_share: number, // 平衡後股數
  balanced_rate: number  // 平衡後實際比例
}

interface HistoryRecord {
  date: string  // 紀錄的日期
  assets: Asset[]  // 資產清單
  totalValue: number // 當前總資產值
  balance: number // 當前餘額
}

// 模擬歷史資料
// const historyList: HistoryRecord[] = [
//   {
//     date: '2024-10-21T08:22:20.587Z',
//     totalValue: 2490,
//     balance: 10,
//     assets: [
//       {
//         symbol: 'AAU',
//         companyName: 'Almaden Minerals Ltd.',
//         price: 50,
//         share: 20,
//         expected_rate: 60,
//         balanced_rate: 0,
//         balanced_share: 0
//       }
//     ]
//   },
//   {
//     date: '2024-10-21T08:22:20.587Z',
//     totalValue: 2490,
//     balance: 10,
//     assets: [
//       {
//         symbol: 'AAU',
//         companyName: 'Almaden Minerals Ltd.',
//         price: 50,
//         share: 20,
//         expected_rate: 60,
//         balanced_rate: 0,
//         balanced_share: 0
//       }
//     ]
//   }
// ];

// 調整 Row 組件來接收正確的 props
function Row(props: { row: HistoryRecord }) {
  const { row } = props;
  const [open, setOpen] = React.useState(false);

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
        <TableCell align="right">{row.totalValue}</TableCell>
        <TableCell align="right">{row.balance}</TableCell>
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
                    <TableCell align="right">股價</TableCell>
                    <TableCell align="right">持有股數</TableCell>
                    <TableCell align="right">期望比例 (%)</TableCell>
                    <TableCell align="right">平衡後比例 (%)</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {row.assets.map((asset, index) => (
                    <TableRow key={index}>
                      <TableCell>{asset.symbol}</TableCell>
                      <TableCell>{asset.companyName}</TableCell>
                      <TableCell align="right">{asset.price}</TableCell>
                      <TableCell align="right">{asset.share}</TableCell>
                      <TableCell align="right">{asset.expected_rate}</TableCell>
                      <TableCell align="right">{asset.balanced_rate}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Box>
          </Collapse>
        </TableCell>
      </TableRow>
    </React.Fragment>
  );
}

interface CollapsibleTableProps {
  historyList: HistoryRecord[]
}

export default function CollapsibleTable({ historyList }: CollapsibleTableProps) {
  return (
    <TableContainer component={Paper}>
      <Table aria-label="collapsible table">
        <TableHead>
          <TableRow>
            <TableCell />
            <TableCell>日期</TableCell>
            <TableCell align="right">資產總額</TableCell>
            <TableCell align="right">餘額</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {historyList.map((item, index) => (
            <Row key={index} row={item} />
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
