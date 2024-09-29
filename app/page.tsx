'use client'

import React, { useState, useEffect } from 'react'
import {
  Container,
  Typography,
  Button,
  List,
  ListItem,
  ListItemText,
  Paper,
  Box,
  CircularProgress,
  Snackbar,
} from '@mui/material'
import { ThemeProvider, createTheme } from '@mui/material/styles'
import { Rotation, MonthlyRotation } from '../types/rotation'
import { startOfWeek, addWeeks, format } from 'date-fns'
import { ja } from 'date-fns/locale'

const theme = createTheme({
  palette: {
    primary: {
      main: '#3f51b5',
    },
    secondary: {
      main: '#f50057',
    },
    background: {
      default: '#f5f5f5',
    },
  },
})

interface WeeklyRotation extends MonthlyRotation {
  startDate: Date;
}

export default function RotationManagement() {
  const [rotation, setRotation] = useState<Rotation | null>(null)
  const [monthlyRotation, setMonthlyRotation] = useState<WeeklyRotation[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const [snackbar, setSnackbar] = useState({ open: false, message: '' })

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setLoading(true)
      const rotationRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/rotations/1`)
      if (!rotationRes.ok) {
        throw new Error(`ローテーションデータの取得に失敗しました: ${rotationRes.statusText}`)
      }
      const rotationData: Rotation = await rotationRes.json()
      setRotation(rotationData)

      const monthlyRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/rotations/1/monthly_list`)
      if (!monthlyRes.ok) {
        throw new Error(`月次ローテーションデータの取得に失敗しました: ${monthlyRes.statusText}`)
      }
      const monthlyList: { monthly_rotation: MonthlyRotation[] } = await monthlyRes.json()
      
      // 現在の日付から最も近い月曜日を起点として4週間分の日付を計算
      const today = new Date()
      const startDate = startOfWeek(today, { weekStartsOn: 1 }) // 1は月曜日を表す
      const weeklyRotation = monthlyList.monthly_rotation.map((rotation, index) => ({
        ...rotation,
        startDate: addWeeks(startDate, index)
      }))
      
      setMonthlyRotation(weeklyRotation)
      setError(null)
    } catch (err) {
      console.error("データ取得エラー:", err)
      setError(err instanceof Error ? err.message : "不明なエラーが発生しました")
    } finally {
      setLoading(false)
    }
  }

  const rotateHandler = async () => {
    try {
      setLoading(true)
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/rotations/1/manual_rotate`, {
        method: 'POST',
      })
      if (!res.ok) {
        throw new Error(`ローテーションの更新に失敗しました: ${res.statusText}`)
      }
      const data = await res.json()
      setSnackbar({ open: true, message: data.message || '次の担当者に更新しました' })
      await fetchData()
    } catch (err) {
      console.error("ローテーション更新エラー:", err)
      setError(err instanceof Error ? err.message : "不明なエラーが発生しました")
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <CircularProgress />
      </Box>
    )
  }

  if (error) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <Typography color="error">{error}</Typography>
      </Box>
    )
  }

  return (
    <ThemeProvider theme={theme}>
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Paper elevation={3} sx={{ p: 4, bgcolor: 'background.paper' }}>
          <Typography variant="h4" component="h1" gutterBottom align="center" color="primary">
            ローテーション管理
          </Typography>
          <Box my={4} textAlign="center">
            <Typography variant="h5" component="h2" gutterBottom color="text.secondary">
              現在の担当者
            </Typography>
            <Typography variant="h4" component="p" gutterBottom color="text.primary">
              {rotation?.current_user ? rotation.current_user.name : 'なし'}
            </Typography>
            <Button
              variant="contained"
              color="primary"
              onClick={rotateHandler}
              sx={{ mt: 2 }}
            >
              次の担当者に更新
            </Button>
          </Box>
          <Box mt={4}>
            <Typography variant="h5" component="h3" gutterBottom align="center" color="text.secondary">
              今月のローテーション
            </Typography>
            <List>
              {monthlyRotation.map((item, index) => (
                <ListItem key={index} sx={{ bgcolor: 'background.default', mb: 1, borderRadius: 1 }}>
                  <ListItemText
                    primary={`${format(item.startDate, 'yyyy/MM/dd', { locale: ja })}週`}
                    secondary={item.user}
                    primaryTypographyProps={{ color: 'text.primary' }}
                    secondaryTypographyProps={{ color: 'text.secondary' }}
                  />
                </ListItem>
              ))}
            </List>
          </Box>
        </Paper>
        <Snackbar
          open={snackbar.open}
          autoHideDuration={6000}
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          message={snackbar.message}
        />
      </Container>
    </ThemeProvider>
  )
}
