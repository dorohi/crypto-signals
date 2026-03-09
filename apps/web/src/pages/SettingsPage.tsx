import { useEffect, useState } from "react";
import { observer } from "mobx-react-lite";
import { useStore } from "@/stores/RootStore";
import {
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  InputAdornment,
  Switch,
  Stack,
} from "@mui/material";
import ScheduleIcon from "@mui/icons-material/Schedule";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import TrendingDownIcon from "@mui/icons-material/TrendingDown";
import TelegramIcon from "@mui/icons-material/Telegram";
import TuneIcon from "@mui/icons-material/Tune";

const SettingsPage = observer(function SettingsPage() {
  const { settingsStore } = useStore();
  const [threshold, setThreshold] = useState("");
  const [period, setPeriod] = useState("");

  useEffect(() => {
    settingsStore.fetchSettings();
  }, [settingsStore]);

  useEffect(() => {
    setThreshold(settingsStore.defaultThreshold.toString());
    setPeriod(settingsStore.checkPeriodMinutes.toString());
  }, [settingsStore.defaultThreshold, settingsStore.checkPeriodMinutes]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const thresholdVal = parseFloat(threshold);
    const periodVal = parseInt(period);
    const data: any = {};
    if (thresholdVal > 0) data.defaultThreshold = thresholdVal;
    if (periodVal >= 1) data.checkPeriodMinutes = periodVal;
    if (Object.keys(data).length > 0) {
      await settingsStore.updateSettings(data);
    }
  };

  return (
    <Box>
      <Typography variant="h5" fontWeight="bold" sx={{ mb: 3 }}>Настройки</Typography>

      {/* Два блока сверху в ряд */}
      <Stack direction={{ xs: "column", md: "row" }} spacing={2} sx={{ mb: 2 }}>
        <Paper variant="outlined" sx={{ p: 3, flex: 1 }}>
          <Typography variant="h6" sx={{ mb: 1 }}>Порог и период</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Монитор сравнивает текущую цену с ценой за указанный период. Если разница превышает порог — оповещение.
          </Typography>
          <form onSubmit={handleSave}>
            <Stack spacing={2}>
              <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
                <TextField
                  label="Порог"
                  type="number"
                  value={threshold}
                  onChange={(e) => setThreshold(e.target.value)}
                  inputProps={{ min: 0.1, step: 0.1 }}
                  InputProps={{
                    endAdornment: <InputAdornment position="end">%</InputAdornment>,
                  }}
                  sx={{ flex: 1 }}
                />
                <TextField
                  label="Период сверки"
                  type="number"
                  value={period}
                  onChange={(e) => setPeriod(e.target.value)}
                  inputProps={{ min: 1, step: 1 }}
                  InputProps={{
                    endAdornment: <InputAdornment position="end">мин</InputAdornment>,
                  }}
                  sx={{ flex: 1 }}
                />
              </Stack>
              <Button type="submit" variant="contained" disabled={settingsStore.saving}>
                {settingsStore.saving ? "Сохранение..." : "Сохранить"}
              </Button>
            </Stack>
          </form>
        </Paper>

        <Paper variant="outlined" sx={{ p: 3, flex: 1 }}>
          <Typography variant="h6" sx={{ mb: 1 }}>Направление мониторинга</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            При каком изменении цены получать оповещения.
          </Typography>
          <Stack spacing={2}>
            <Stack direction="row" alignItems="center" justifyContent="space-between">
              <Stack direction="row" alignItems="center" spacing={1.5}>
                <TrendingUpIcon color="success" />
                <Box>
                  <Typography variant="body2">Рост цены</Typography>
                  <Typography variant="caption" color="text.secondary">Оповещать когда цена выросла</Typography>
                </Box>
              </Stack>
              <Switch
                checked={settingsStore.alertOnUp}
                onChange={(_, checked) => settingsStore.updateSettings({ alertOnUp: checked })}
                disabled={settingsStore.saving}
              />
            </Stack>
            <Stack direction="row" alignItems="center" justifyContent="space-between">
              <Stack direction="row" alignItems="center" spacing={1.5}>
                <TrendingDownIcon color="error" />
                <Box>
                  <Typography variant="body2">Падение цены</Typography>
                  <Typography variant="caption" color="text.secondary">Оповещать когда цена упала</Typography>
                </Box>
              </Stack>
              <Switch
                checked={settingsStore.alertOnDown}
                onChange={(_, checked) => settingsStore.updateSettings({ alertOnDown: checked })}
                disabled={settingsStore.saving}
              />
            </Stack>
          </Stack>
        </Paper>
      </Stack>

      {/* Как это работает */}
      <Paper variant="outlined" sx={{ p: 3 }}>
        <Typography variant="h6" sx={{ mb: 2 }}>Как это работает</Typography>
        <List dense disablePadding>
          <ListItem disableGutters>
            <ListItemIcon sx={{ minWidth: 36 }}><ScheduleIcon fontSize="small" color="action" /></ListItemIcon>
            <ListItemText
              primary="Монитор проверяет цены каждую минуту и сравнивает с ценой за указанный период назад."
              primaryTypographyProps={{ variant: "body2", color: "text.secondary" }}
            />
          </ListItem>
          <ListItem disableGutters>
            <ListItemIcon sx={{ minWidth: 36 }}><TrendingUpIcon fontSize="small" color="action" /></ListItemIcon>
            <ListItemText
              primary="Сравнивает с максимумом (для падений) и минимумом (для роста) за период — ловит реальные движения."
              primaryTypographyProps={{ variant: "body2", color: "text.secondary" }}
            />
          </ListItem>
          <ListItem disableGutters>
            <ListItemIcon sx={{ minWidth: 36 }}><TelegramIcon fontSize="small" color="action" /></ListItemIcon>
            <ListItemText
              primary="Если ваш аккаунт Telegram привязан, вы получите уведомление мгновенно."
              primaryTypographyProps={{ variant: "body2", color: "text.secondary" }}
            />
          </ListItem>
          <ListItem disableGutters>
            <ListItemIcon sx={{ minWidth: 36 }}><TuneIcon fontSize="small" color="action" /></ListItemIcon>
            <ListItemText
              primary="Можно задать индивидуальные пороги и периоды для каждой монеты через меню в списке наблюдения."
              primaryTypographyProps={{ variant: "body2", color: "text.secondary" }}
            />
          </ListItem>
        </List>
      </Paper>
    </Box>
  );
});

export default SettingsPage;
