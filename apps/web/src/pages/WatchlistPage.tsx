import { useState } from "react";
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
  TablePagination,
  Paper,
  Switch,
  IconButton,
  TextField,
  Avatar,
  Stack,
  Chip,
  CircularProgress,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import CheckIcon from "@mui/icons-material/Check";
import CloseIcon from "@mui/icons-material/Close";

const WatchlistPage = observer(function WatchlistPage() {
  const { watchlistStore, settingsStore } = useStore();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editThreshold, setEditThreshold] = useState("");

  const handleSaveThreshold = async (itemId: string) => {
    const value = editThreshold ? parseFloat(editThreshold) : null;
    await watchlistStore.updateItem(itemId, { customThreshold: value });
    setEditingId(null);
  };

  const handleChangePage = (_: unknown, newPage: number) => {
    watchlistStore.fetchWatchlist(newPage + 1);
  };

  const formatPrice = (price: number | null) => {
    if (!price) return "Н/Д";
    if (price >= 1)
      return `$${price.toLocaleString("ru-RU", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    return `$${price.toPrecision(4)}`;
  };

  return (
    <Box>
      <Stack direction={{ xs: "column", sm: "row" }} justifyContent="space-between" alignItems={{ sm: "center" }} spacing={2} sx={{ mb: 3 }}>
        <Box>
          <Typography variant="h5" fontWeight="bold">Список наблюдения</Typography>
          <Typography variant="body2" color="text.secondary">
            {watchlistStore.total} монет отслеживается | Порог по умолчанию: {settingsStore.defaultThreshold}%
          </Typography>
        </Box>
        <Box sx={{ width: { xs: "100%", sm: 280 } }}>
          <CoinSearch />
        </Box>
      </Stack>

      {!watchlistStore.initialized || watchlistStore.loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <Paper variant="outlined" sx={{ overflow: "hidden" }}>
          <TableContainer sx={{ maxHeight: "calc(100vh - 248px)" }}>
            <Table size="small" stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell>#</TableCell>
                  <TableCell>Монета</TableCell>
                  <TableCell align="right">Цена</TableCell>
                  <TableCell align="right" sx={{ display: { xs: "none", md: "table-cell" } }}>Капитализация</TableCell>
                  <TableCell align="right">Порог</TableCell>
                  <TableCell align="center">Активно</TableCell>
                  <TableCell align="right">Действия</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {watchlistStore.items.map((item: any) => (
                  <TableRow key={item.id} hover>
                    <TableCell sx={{ color: "text.secondary" }}>
                      {item.coin.marketCapRank || "—"}
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
                    <TableCell align="right" sx={{ color: "text.secondary", display: { xs: "none", md: "table-cell" } }}>
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
          <TablePagination
            component="div"
            count={watchlistStore.total}
            page={watchlistStore.page - 1}
            onPageChange={handleChangePage}
            rowsPerPage={watchlistStore.limit}
            rowsPerPageOptions={[20]}
            labelDisplayedRows={({ from, to, count }) => `${from}–${to} из ${count}`}
          />
        </Paper>
      )}
    </Box>
  );
});

export default WatchlistPage;
