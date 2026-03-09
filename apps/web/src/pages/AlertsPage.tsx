import { observer } from "mobx-react-lite";
import { useStore } from "@/stores/RootStore";
import {
  Box,
  Typography,
  Paper,
  Avatar,
  Stack,
  Button,
  Chip,
  CircularProgress,
} from "@mui/material";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";

const AlertsPage = observer(function AlertsPage() {
  const { alertStore } = useStore();

  const formatPrice = (price: number) => {
    if (price >= 1)
      return `$${price.toLocaleString("ru-RU", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    return `$${price.toPrecision(4)}`;
  };

  return (
    <Box>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h5" fontWeight="bold">История оповещений</Typography>
        <Typography variant="body2" color="text.secondary">
          {alertStore.total} всего оповещений
        </Typography>
      </Box>

      {!alertStore.initialized || alertStore.loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
          <CircularProgress />
        </Box>
      ) : alertStore.alerts.length === 0 ? (
        <Paper variant="outlined" sx={{ p: { xs: 4, sm: 6 }, textAlign: "center" }}>
          <Typography color="text.secondary">
            Оповещений пока нет. Они появятся здесь, когда отслеживаемые монеты
            превысят ваш порог изменения цены.
          </Typography>
        </Paper>
      ) : (
        <Stack spacing={1.5}>
          {alertStore.alerts.map((alert: any) => {
            const isUp = alert.changePercent > 0;
            return (
              <Paper key={alert.id} variant="outlined" sx={{ p: { xs: 1.5, sm: 2 } }}>
                <Stack direction="row" justifyContent="space-between" alignItems="center" spacing={2}>
                  <Stack direction="row" alignItems="center" spacing={{ xs: 1.5, sm: 2 }} sx={{ minWidth: 0 }}>
                    <Avatar
                      sx={{
                        width: { xs: 32, sm: 40 },
                        height: { xs: 32, sm: 40 },
                        bgcolor: isUp ? "success.dark" : "error.dark",
                      }}
                    >
                      {isUp ? <ArrowUpwardIcon fontSize="small" /> : <ArrowDownwardIcon fontSize="small" />}
                    </Avatar>
                    <Box sx={{ minWidth: 0 }}>
                      <Stack direction="row" alignItems="center" spacing={1}>
                        {alert.coin?.image && (
                          <Avatar src={alert.coin.image} sx={{ width: 20, height: 20 }} />
                        )}
                        <Typography variant="body2" fontWeight="medium" noWrap>
                          {alert.coin?.name || alert.coinId}
                        </Typography>
                        <Typography variant="caption" color="text.secondary" sx={{ display: { xs: "none", sm: "inline" } }}>
                          {alert.coin?.symbol?.toUpperCase()}
                        </Typography>
                      </Stack>
                      <Typography variant="caption" color="text.secondary">
                        {formatPrice(alert.previousPrice)} → {formatPrice(alert.currentPrice)}
                      </Typography>
                    </Box>
                  </Stack>
                  <Box sx={{ textAlign: "right", flexShrink: 0 }}>
                    <Typography
                      variant="body1"
                      fontWeight="bold"
                      color={isUp ? "success.main" : "error.main"}
                    >
                      {isUp ? "+" : ""}{alert.changePercent.toFixed(2)}%
                    </Typography>
                    <Typography variant="caption" color="text.secondary" display="block">
                      {new Date(alert.createdAt).toLocaleString("ru-RU")}
                    </Typography>
                    {alert.notifiedViaTg && (
                      <Chip label="TG" size="small" color="info" variant="outlined" sx={{ mt: 0.5, height: 20, fontSize: 10 }} />
                    )}
                  </Box>
                </Stack>
              </Paper>
            );
          })}
        </Stack>
      )}

      {alertStore.total > 50 && (
        <Stack direction="row" justifyContent="center" alignItems="center" spacing={2} sx={{ mt: 3 }}>
          <Button
            variant="outlined"
            size="small"
            onClick={() => alertStore.fetchAlerts(alertStore.page - 1)}
            disabled={alertStore.page <= 1}
          >
            Назад
          </Button>
          <Typography variant="body2" color="text.secondary">
            Страница {alertStore.page}
          </Typography>
          <Button
            variant="outlined"
            size="small"
            onClick={() => alertStore.fetchAlerts(alertStore.page + 1)}
            disabled={alertStore.page * 50 >= alertStore.total}
          >
            Вперёд
          </Button>
        </Stack>
      )}
    </Box>
  );
});

export default AlertsPage;
