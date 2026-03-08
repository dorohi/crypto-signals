import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { observer } from "mobx-react-lite";
import { useStore } from "@/stores/RootStore";
import {
  Box,
  Typography,
  TextField,
  Button,
  Alert,
  Paper,
} from "@mui/material";

const LoginPage = observer(function LoginPage() {
  const { authStore } = useStore();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await authStore.login(email, password);
      navigate("/watchlist");
    } catch {
      // error is in authStore.error
    }
  };

  return (
    <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh", p: 2 }}>
      <Paper sx={{ width: "100%", maxWidth: 420, p: 4 }}>
        <Typography variant="h5" fontWeight="bold" textAlign="center" gutterBottom>
          Крипто Сигналы
        </Typography>
        <Typography variant="body2" color="text.secondary" textAlign="center" sx={{ mb: 4 }}>
          Войдите в свой аккаунт
        </Typography>
        <form onSubmit={handleSubmit}>
          {authStore.error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {authStore.error}
            </Alert>
          )}
          <TextField
            fullWidth
            label="Эл. почта"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            sx={{ mb: 2 }}
          />
          <TextField
            fullWidth
            label="Пароль"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            sx={{ mb: 3 }}
          />
          <Button
            type="submit"
            fullWidth
            variant="contained"
            size="large"
            disabled={authStore.loading}
          >
            {authStore.loading ? "Вход..." : "Войти"}
          </Button>
        </form>
        <Typography variant="body2" color="text.secondary" textAlign="center" sx={{ mt: 3 }}>
          Нет аккаунта?{" "}
          <Link to="/register" style={{ color: "#008F11" }}>
            Зарегистрироваться
          </Link>
        </Typography>
      </Paper>
    </Box>
  );
});

export default LoginPage;
