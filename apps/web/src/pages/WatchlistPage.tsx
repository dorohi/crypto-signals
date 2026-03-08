import { useEffect, useState } from "react";
import { observer } from "mobx-react-lite";
import { useStore } from "@/stores/RootStore";
import { CoinSearch } from "@/components/CoinSearch";
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Switch,
  IconButton,
  TextField,
  Card,
  CardContent,
  Avatar,
  Stack,
  Chip,
  CircularProgress,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import CheckIcon from "@mui/icons-material/Check";
import CloseIcon from "@mui/icons-material/Close";

const WatchlistPage = observer(function WatchlistPage() {
  const { watchlistStore, settingsStore } = useStore();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editThreshold, setEditThreshold] = useState("");
  const muiTheme = useTheme();
  const isMobile = useMediaQuery(muiTheme.breakpoints.down("md"));

  useEffect(() => {
    watchlistStore.fetchWatchlist();
    settingsStore.fetchSettings();
  }, [watchlistStore, settingsStore]);

  const handleSaveThreshold = async (itemId: string) => {
    const value = editThreshold ? parseFloat(editThreshold) : null;
    await watchlistStore.updateItem(itemId, { customThreshold: value });
    setEditingId(null);
  };

  const formatPrice = (price: number | null) => {
    if (!price) return "Н/Д";
    if (price >= 1)
      return `$${price.toLocaleString("ru-RU", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    return `$${price.toPrecision(4)}`;
  };

  return (
    <Box sx={{ maxWidth: 1200 }}>
      <Stack direction={{ xs: "column", sm: "row" }} justifyContent="space-between" alignItems={{ sm: "center" }} spacing={2} sx={{ mb: 3 }}>
        <Box>
          <Typography variant="h5" fontWeight="bold">Список наблюдения</Typography>
          <Typography variant="body2" color="text.secondary">
            {watchlistStore.items.length} монет отслеживается | Порог по умолчанию: {settingsStore.defaultThreshold}%
          </Typography>
        </Box>
        <Box sx={{ width: { xs: "100%", sm: 280 } }}>
          <CoinSearch />
        </Box>
      </Stack>

      {watchlistStore.loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
          <CircularProgress />
        </Box>
      ) : isMobile ? (
        <Stack spacing={1.5}>
          {watchlistStore.items.length === 0 && (
            <Paper sx={{ p: 4, textAlign: "center" }}>
              <Typography color="text.secondary">
                В вашем списке нет монет. Используйте поиск выше, чтобы добавить.
              </Typography>
            </Paper>
          )}
          {watchlistStore.items.map((item: any, index: number) => (
            <Card key={item.id} variant="outlined">
              <CardContent sx={{ p: 2, "&:last-child": { pb: 2 } }}>
                <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1.5 }}>
                  <Stack direction="row" alignItems="center" spacing={1.5}>
                    {item.coin.image && (
                      <Avatar src={item.coin.image} sx={{ width: 32, height: 32 }} />
                    )}
                    <Box>
                      <Typography variant="body2" fontWeight="medium">{item.coin.name}</Typography>
                      <Typography variant="caption" color="text.secondary">
                        {item.coin.symbol.toUpperCase()} · #{item.coin.marketCapRank || index + 1}
                      </Typography>
                    </Box>
                  </Stack>
                  <Box sx={{ textAlign: "right" }}>
                    <Typography variant="body2" fontWeight="medium">{formatPrice(item.coin.currentPrice)}</Typography>
                    <Typography variant="caption" color="text.secondary">
                      {item.coin.marketCap ? `$${(item.coin.marketCap / 1e9).toFixed(1)} млрд` : ""}
                    </Typography>
                  </Box>
                </Stack>
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Stack direction="row" alignItems="center" spacing={1}>
                    <Switch
                      size="small"
                      checked={item.isActive}
                      onChange={() => watchlistStore.updateItem(item.id, { isActive: !item.isActive })}
                    />
                    {editingId === item.id ? (
                      <Stack direction="row" alignItems="center" spacing={0.5}>
                        <TextField
                          size="small"
                          type="number"
                          value={editThreshold}
                          onChange={(e) => setEditThreshold(e.target.value)}
                          placeholder={`${settingsStore.defaultThreshold}`}
                          inputProps={{ step: 0.1, min: 0.1, style: { width: 50, padding: "4px 8px", fontSize: 12 } }}
                        />
                        <Typography variant="caption">%</Typography>
                        <IconButton size="small" color="success" onClick={() => handleSaveThreshold(item.id)}><CheckIcon fontSize="small" /></IconButton>
                        <IconButton size="small" onClick={() => setEditingId(null)}><CloseIcon fontSize="small" /></IconButton>
                      </Stack>
                    ) : (
                      <Chip
                        label={`${item.customThreshold ? `${item.customThreshold}% (свой)` : `${settingsStore.defaultThreshold}%`}`}
                        size="small"
                        variant="outlined"
                        onClick={() => { setEditingId(item.id); setEditThreshold(item.customThreshold?.toString() || ""); }}
                      />
                    )}
                  </Stack>
                  <IconButton size="small" color="error" onClick={() => watchlistStore.removeCoin(item.id)}>
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </Stack>
              </CardContent>
            </Card>
          ))}
        </Stack>
      ) : (
        <TableContainer component={Paper} variant="outlined">
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>#</TableCell>
                <TableCell>Монета</TableCell>
                <TableCell align="right">Цена</TableCell>
                <TableCell align="right">Капитализация</TableCell>
                <TableCell align="right">Порог</TableCell>
                <TableCell align="center">Активно</TableCell>
                <TableCell align="right">Действия</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {watchlistStore.items.map((item: any, index: number) => (
                <TableRow key={item.id} hover>
                  <TableCell sx={{ color: "text.secondary" }}>
                    {item.coin.marketCapRank || index + 1}
                  </TableCell>
                  <TableCell>
                    <Stack direction="row" alignItems="center" spacing={1.5}>
                      {item.coin.image && (
                        <Avatar src={item.coin.image} sx={{ width: 28, height: 28 }} />
                      )}
                      <Box>
                        <Typography variant="body2" fontWeight="medium">{item.coin.name}</Typography>
                        <Typography variant="caption" color="text.secondary">{item.coin.symbol.toUpperCase()}</Typography>
                      </Box>
                    </Stack>
                  </TableCell>
                  <TableCell align="right">{formatPrice(item.coin.currentPrice)}</TableCell>
                  <TableCell align="right" sx={{ color: "text.secondary" }}>
                    {item.coin.marketCap ? `$${(item.coin.marketCap / 1e9).toFixed(1)} млрд` : "Н/Д"}
                  </TableCell>
                  <TableCell align="right">
                    {editingId === item.id ? (
                      <Stack direction="row" alignItems="center" justifyContent="flex-end" spacing={0.5}>
                        <TextField
                          size="small"
                          type="number"
                          value={editThreshold}
                          onChange={(e) => setEditThreshold(e.target.value)}
                          placeholder={`${settingsStore.defaultThreshold}`}
                          inputProps={{ step: 0.1, min: 0.1, style: { width: 60, padding: "4px 8px", fontSize: 13 } }}
                        />
                        <Typography variant="caption">%</Typography>
                        <IconButton size="small" color="success" onClick={() => handleSaveThreshold(item.id)}><CheckIcon fontSize="small" /></IconButton>
                        <IconButton size="small" onClick={() => setEditingId(null)}><CloseIcon fontSize="small" /></IconButton>
                      </Stack>
                    ) : (
                      <Chip
                        label={`${item.customThreshold ? `${item.customThreshold}% (свой)` : `${settingsStore.defaultThreshold}%`}`}
                        size="small"
                        variant="outlined"
                        onClick={() => { setEditingId(item.id); setEditThreshold(item.customThreshold?.toString() || ""); }}
                        sx={{ cursor: "pointer" }}
                      />
                    )}
                  </TableCell>
                  <TableCell align="center">
                    <Switch
                      size="small"
                      checked={item.isActive}
                      onChange={() => watchlistStore.updateItem(item.id, { isActive: !item.isActive })}
                    />
                  </TableCell>
                  <TableCell align="right">
                    <IconButton size="small" color="error" onClick={() => watchlistStore.removeCoin(item.id)}>
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
              {watchlistStore.items.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 6 }}>
                    <Typography color="text.secondary">
                      В вашем списке нет монет. Используйте поиск выше, чтобы добавить.
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );
});

export default WatchlistPage;
