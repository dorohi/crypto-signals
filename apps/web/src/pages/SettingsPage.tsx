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
} from "@mui/material";
import ScheduleIcon from "@mui/icons-material/Schedule";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import TelegramIcon from "@mui/icons-material/Telegram";
import TuneIcon from "@mui/icons-material/Tune";

const SettingsPage = observer(function SettingsPage() {
  const { settingsStore } = useStore();
  const [threshold, setThreshold] = useState("");

  useEffect(() => {
    settingsStore.fetchSettings();
  }, [settingsStore]);

  useEffect(() => {
    setThreshold(settingsStore.defaultThreshold.toString());
  }, [settingsStore.defaultThreshold]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const value = parseFloat(threshold);
    if (value > 0) {
      await settingsStore.updateThreshold(value);
    }
  };

  return (
    <Box sx={{ maxWidth: 560 }}>
      <Typography variant="h5" fontWeight="bold" sx={{ mb: 3 }}>Настройки</Typography>

      <Paper variant="outlined" sx={{ p: 3, mb: 2 }}>
        <Typography variant="h6" sx={{ mb: 1 }}>Порог оповещения</Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Укажите процент изменения цены по умолчанию, при котором срабатывает
          оповещение. Вы можете переопределить его для каждой монеты в списке наблюдения.
        </Typography>
        <form onSubmit={handleSave}>
          <Box sx={{ display: "flex", gap: 2, alignItems: "flex-end" }}>
            <TextField
              label="Порог по умолчанию"
              type="number"
              value={threshold}
              onChange={(e) => setThreshold(e.target.value)}
              inputProps={{ min: 0.1, step: 0.1 }}
              InputProps={{
                endAdornment: <InputAdornment position="end">%</InputAdornment>,
              }}
              sx={{ flex: 1 }}
            />
            <Button
              type="submit"
              variant="contained"
              disabled={settingsStore.saving}
              sx={{ height: 56 }}
            >
              {settingsStore.saving ? "Сохранение..." : "Сохранить"}
            </Button>
          </Box>
        </form>
      </Paper>

      <Paper variant="outlined" sx={{ p: 3 }}>
        <Typography variant="h6" sx={{ mb: 2 }}>Как это работает</Typography>
        <List dense disablePadding>
          <ListItem disableGutters>
            <ListItemIcon sx={{ minWidth: 36 }}><ScheduleIcon fontSize="small" color="action" /></ListItemIcon>
            <ListItemText
              primary="Монитор проверяет цены каждую минуту через CoinGecko API."
              primaryTypographyProps={{ variant: "body2", color: "text.secondary" }}
            />
          </ListItem>
          <ListItem disableGutters>
            <ListItemIcon sx={{ minWidth: 36 }}><TrendingUpIcon fontSize="small" color="action" /></ListItemIcon>
            <ListItemText
              primary="Если цена монеты изменилась больше вашего порога (вверх или вниз), создаётся оповещение."
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
              primary="Вы можете задать индивидуальные пороги для каждой монеты в списке наблюдения."
              primaryTypographyProps={{ variant: "body2", color: "text.secondary" }}
            />
          </ListItem>
        </List>
      </Paper>
    </Box>
  );
});

export default SettingsPage;
