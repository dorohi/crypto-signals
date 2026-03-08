import { useEffect } from "react";
import { observer } from "mobx-react-lite";
import { useStore } from "@/stores/RootStore";
import {
  Box,
  Typography,
  Button,
  Paper,
  Stack,
  Avatar,
} from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import LinkOffIcon from "@mui/icons-material/LinkOff";
import VpnKeyIcon from "@mui/icons-material/VpnKey";

const TelegramPage = observer(function TelegramPage() {
  const { telegramStore, authStore } = useStore();

  useEffect(() => {
    authStore.fetchMe();
  }, [authStore]);

  const handleGenerateCode = async () => {
    await telegramStore.generateCode();
  };

  const handleUnlink = async () => {
    await telegramStore.unlink();
  };

  return (
    <Box sx={{ maxWidth: 560 }}>
      <Typography variant="h5" fontWeight="bold" sx={{ mb: 3 }}>
        Интеграция с Telegram
      </Typography>

      {telegramStore.isLinked ? (
        <Paper variant="outlined" sx={{ p: 3 }}>
          <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 3 }}>
            <Avatar sx={{ bgcolor: "success.dark", width: 44, height: 44 }}>
              <CheckCircleIcon />
            </Avatar>
            <Box>
              <Typography variant="h6" color="success.main">Подключено</Typography>
              <Typography variant="body2" color="text.secondary">
                Ваш аккаунт Telegram привязан. Вы будете получать ценовые оповещения.
              </Typography>
            </Box>
          </Stack>
          <Button
            variant="contained"
            color="error"
            startIcon={<LinkOffIcon />}
            onClick={handleUnlink}
            disabled={telegramStore.loading}
          >
            {telegramStore.loading ? "Отвязка..." : "Отвязать Telegram"}
          </Button>
        </Paper>
      ) : (
        <Paper variant="outlined" sx={{ p: 3 }}>
          <Typography variant="h6" sx={{ mb: 2 }}>
            Привяжите аккаунт Telegram
          </Typography>

          <Stack spacing={1} sx={{ mb: 3 }}>
            <Typography variant="body2" color="text.secondary">
              1. Нажмите кнопку ниже, чтобы сгенерировать код привязки.
            </Typography>
            <Typography variant="body2" color="text.secondary">
              2. Откройте Telegram и найдите бота (имя бота задаётся администратором).
            </Typography>
            <Typography variant="body2" color="text.secondary">
              3. Отправьте команду: /link ВАШ_КОД
            </Typography>
            <Typography variant="body2" color="text.secondary">
              4. Вы начнёте получать ценовые оповещения!
            </Typography>
          </Stack>

          {telegramStore.linkCode ? (
            <Paper variant="outlined" sx={{ p: 2.5, bgcolor: "action.hover" }}>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                Ваш код привязки:
              </Typography>
              <Typography
                variant="h4"
                fontFamily="monospace"
                fontWeight="bold"
                color="primary"
                sx={{ letterSpacing: 4, mb: 1 }}
              >
                {telegramStore.linkCode}
              </Typography>
              <Typography variant="caption" color="text.secondary" display="block">
                Отправьте боту: /link {telegramStore.linkCode}
              </Typography>
              {telegramStore.expiresAt && (
                <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 0.5 }}>
                  Истекает: {new Date(telegramStore.expiresAt).toLocaleString("ru-RU")}
                </Typography>
              )}
            </Paper>
          ) : (
            <Button
              variant="contained"
              startIcon={<VpnKeyIcon />}
              onClick={handleGenerateCode}
              disabled={telegramStore.loading}
            >
              {telegramStore.loading ? "Генерация..." : "Сгенерировать код привязки"}
            </Button>
          )}
        </Paper>
      )}
    </Box>
  );
});

export default TelegramPage;
