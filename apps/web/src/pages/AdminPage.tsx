import { useEffect, useState } from "react";
import { observer } from "mobx-react-lite";
import { useStore } from "@/stores/RootStore";
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Switch,
  IconButton,
  Tooltip,
  CircularProgress,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Stack,
} from "@mui/material";
import LockResetIcon from "@mui/icons-material/LockReset";
import TelegramIcon from "@mui/icons-material/Telegram";
import LinkOffIcon from "@mui/icons-material/LinkOff";

const AdminPage = observer(function AdminPage() {
  const { authStore, adminStore } = useStore();
  const [passwordDialog, setPasswordDialog] = useState<{ open: boolean; userId: string; userName: string }>({
    open: false,
    userId: "",
    userName: "",
  });
  const [newPassword, setNewPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState(false);

  useEffect(() => {
    if (authStore.isAdmin) {
      adminStore.fetchUsers();
    }
  }, [authStore.isAdmin, adminStore]);

  if (!authStore.isAdmin) {
    return (
      <Box sx={{ py: 4 }}>
        <Alert severity="error">Доступ запрещён</Alert>
      </Box>
    );
  }

  if (adminStore.loading && adminStore.users.length === 0) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  const handleOpenPasswordDialog = (userId: string, userName: string) => {
    setPasswordDialog({ open: true, userId, userName });
    setNewPassword("");
    setPasswordError("");
    setPasswordSuccess(false);
  };

  const handleClosePasswordDialog = () => {
    setPasswordDialog({ open: false, userId: "", userName: "" });
    setNewPassword("");
    setPasswordError("");
    setPasswordSuccess(false);
  };

  const handleChangePassword = async () => {
    if (newPassword.length < 6) {
      setPasswordError("Минимум 6 символов");
      return;
    }
    setPasswordSaving(true);
    setPasswordError("");
    try {
      await adminStore.changePassword(passwordDialog.userId, newPassword);
      setPasswordSuccess(true);
      setTimeout(handleClosePasswordDialog, 1000);
    } catch (e: any) {
      setPasswordError(e.message || "Ошибка");
    } finally {
      setPasswordSaving(false);
    }
  };

  const handleToggleRole = async (userId: string, isAdmin: boolean) => {
    try {
      await adminStore.toggleRole(userId, isAdmin);
    } catch (e: any) {
      alert(e.message || "Ошибка");
    }
  };

  return (
    <Box>
      <Stack direction="row" alignItems="baseline" spacing={2} sx={{ mb: 3 }}>
        <Typography variant="h5" fontWeight="bold">Пользователи</Typography>
        <Typography variant="body2" color="text.secondary">
          {adminStore.users.length}
        </Typography>
      </Stack>

      <TableContainer component={Paper} variant="outlined">
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Имя</TableCell>
              <TableCell>Эл. почта</TableCell>
              <TableCell>Роль</TableCell>
              <TableCell align="center">Telegram</TableCell>
              <TableCell>Регистрация</TableCell>
              <TableCell align="center">Watchlist</TableCell>
              <TableCell align="center">Алерты</TableCell>
              <TableCell align="center">Сделки</TableCell>
              <TableCell align="center">Действия</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {adminStore.users.map((user) => (
              <TableRow key={user.id} hover>
                <TableCell>
                  <Typography variant="body2" fontWeight={500}>{user.name}</Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="body2" color="text.secondary">{user.email}</Typography>
                </TableCell>
                <TableCell>
                  <Stack direction="row" alignItems="center" spacing={1}>
                    <Chip
                      label={user.isAdmin ? "Админ" : "Пользователь"}
                      color={user.isAdmin ? "primary" : "default"}
                      size="small"
                    />
                    <Tooltip title={user.id === authStore.user?.id ? "Нельзя снять у себя" : (user.isAdmin ? "Снять админа" : "Сделать админом")}>
                      <span>
                        <Switch
                          size="small"
                          checked={user.isAdmin}
                          disabled={user.id === authStore.user?.id}
                          onChange={(_, checked) => handleToggleRole(user.id, checked)}
                        />
                      </span>
                    </Tooltip>
                  </Stack>
                </TableCell>
                <TableCell align="center">
                  <Tooltip title={user.telegramLinked ? "Привязан" : "Не привязан"}>
                    {user.telegramLinked ? (
                      <TelegramIcon fontSize="small" color="primary" />
                    ) : (
                      <LinkOffIcon fontSize="small" color="disabled" />
                    )}
                  </Tooltip>
                </TableCell>
                <TableCell>
                  <Typography variant="body2" color="text.secondary">
                    {new Date(user.createdAt).toLocaleDateString("ru-RU")}
                  </Typography>
                </TableCell>
                <TableCell align="center">{user.stats.watchlist}</TableCell>
                <TableCell align="center">{user.stats.alerts}</TableCell>
                <TableCell align="center">{user.stats.transactions}</TableCell>
                <TableCell align="center">
                  <Tooltip title="Сменить пароль">
                    <IconButton size="small" onClick={() => handleOpenPasswordDialog(user.id, user.name)}>
                      <LockResetIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={passwordDialog.open} onClose={handleClosePasswordDialog} maxWidth="xs" fullWidth>
        <DialogTitle>Сменить пароль: {passwordDialog.userName}</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            fullWidth
            type="password"
            label="Новый пароль"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            error={!!passwordError}
            helperText={passwordError}
            sx={{ mt: 1 }}
          />
          {passwordSuccess && (
            <Alert severity="success" sx={{ mt: 2 }}>Пароль изменён</Alert>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClosePasswordDialog}>Отмена</Button>
          <Button onClick={handleChangePassword} variant="contained" disabled={passwordSaving}>
            {passwordSaving ? "Сохранение..." : "Сменить"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
});

export default AdminPage;
