'use client'

import React, { useState, useEffect } from 'react'
import {
  Container,
  Typography,
  Button,
  TextField,
  List,
  ListItem,
  ListItemText,
  IconButton,
  Switch,
  Paper,
  Box,
  CircularProgress,
  Snackbar,
} from '@mui/material'
import DeleteIcon from '@mui/icons-material/Delete'
import { ThemeProvider, createTheme } from '@mui/material/styles'
import { User } from '../../types/rotation'

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

export default function UserManagement() {
  const [name, setName] = useState<string>('')
  const [email, setEmail] = useState<string>('')
  const [userList, setUserList] = useState<User[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const [snackbar, setSnackbar] = useState({ open: false, message: '' })

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    try {
      setLoading(true)
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users`)
      if (!res.ok) {
        throw new Error(`ユーザーデータの取得に失敗しました: ${res.statusText}`)
      }
      const users: User[] = await res.json()
      setUserList(users)
      setError(null)
    } catch (err) {
      console.error("ユーザー取得エラー:", err)
      setError(err instanceof Error ? err.message : "不明なエラーが発生しました")
    } finally {
      setLoading(false)
    }
  }

  const addUser = async () => {
    if (name && email) {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ user: { name, email, active: true } }),
        })
        if (!res.ok) {
          throw new Error(`ユーザーの追加に失敗しました: ${res.statusText}`)
        }
        const newUser: User = await res.json()
        setUserList([...userList, newUser])
        setName('')
        setEmail('')
        setSnackbar({ open: true, message: 'ユーザーを追加しました' })
      } catch (err) {
        console.error("ユーザー追加エラー:", err)
        setError(err instanceof Error ? err.message : "不明なエラーが発生しました")
      }
    }
  }

  const deleteUser = async (id: number) => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/${id}`, { method: 'DELETE' })
      if (!res.ok) {
        throw new Error(`ユーザーの削除に失敗しました: ${res.statusText}`)
      }
      setUserList(userList.filter(user => user.id !== id))
      setSnackbar({ open: true, message: 'ユーザーを削除しました' })
    } catch (err) {
      console.error("ユーザー削除エラー:", err)
      setError(err instanceof Error ? err.message : "不明なエラーが発生しました")
    }
  }

  const toggleActive = async (id: number, active: boolean) => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user: { active: !active } }),
      })
      if (!res.ok) {
        throw new Error(`ユーザーのステータス更新に失敗しました: ${res.statusText}`)
      }
      const updatedUsers = userList.map(user => user.id === id ? { ...user, active: !active } : user)
      setUserList(updatedUsers)
      setSnackbar({ open: true, message: 'ユーザーのステータスを更新しました' })
    } catch (err) {
      console.error("ユーザーステータス更新エラー:", err)
      setError(err instanceof Error ? err.message : "不明なエラーが発生しました")
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
            ユーザー管理
          </Typography>
          <Box my={4} display="flex" gap={2} justifyContent="center">
            <TextField
              label="名前"
              value={name}
              onChange={(e) => setName(e.target.value)}
              variant="outlined"
            />
            <TextField
              label="メールアドレス"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              variant="outlined"
            />
            <Button variant="contained" color="primary" onClick={addUser}>
              ユーザー追加
            </Button>
          </Box>
          <List>
            {userList.map(user => (
              <ListItem
                key={user.id}
                sx={{ bgcolor: 'background.default', mb: 1, borderRadius: 1 }}
                secondaryAction={
                  <>
                    <Switch
                      checked={user.active}
                      onChange={() => toggleActive(user.id, user.active)}
                      color="primary"
                    />
                    <IconButton edge="end" aria-label="削除" onClick={() => deleteUser(user.id)}>
                      <DeleteIcon />
                    </IconButton>
                  </>
                }
              >
                <ListItemText
                  primary={user.name}
                  secondary={user.email}
                  primaryTypographyProps={{ color: 'text.primary' }}
                  secondaryTypographyProps={{ color: 'text.secondary' }}
                />
              </ListItem>
            ))}
          </List>
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
