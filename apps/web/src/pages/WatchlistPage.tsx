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
  IconButton,
  TextField,
  Avatar,
  Stack,
  Chip,
  CircularProgress,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  InputAdornment,
} from "@mui/material";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import DeleteIcon from "@mui/icons-material/Delete";
import TuneIcon from "@mui/icons-material/Tune";

const WatchlistPage = observer(function WatchlistPage() {
  const { watchlistStore, settingsStore } = useStore();

  // Меню
  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);
  const [menuItem, setMenuItem] = useState<any>(null);

  // Диалог удаления
  const [deleteDialog, setDeleteDialog] = useState(false);

  // Диалог настроек монеты
  const [settingsDialog, setSettingsDialog] = useState(false);
  const [editThreshold, setEditThreshold] = useState("");
  const [editPeriod, setEditPeriod] = useState("");

  const handleChangePage = (_: unknown, newPage: number) => {
    watchlistStore.fetchWatchlist(newPage + 1);
  };

  const openMenu = (e: React.MouseEvent<HTMLElement>, item: any) => {
    setMenuAnchor(e.currentTarget);
    setMenuItem(item);
  };

  const closeMenu = () => {
    setMenuAnchor(null);
  };

  const handleToggleActive = () => {
    if (menuItem) {
      watchlistStore.updateItem(menuItem.id, { isActive: !menuItem.isActive });
    }
    closeMenu();
  };

  const handleDeleteClick = () => {
    setDeleteDialog(true);
    setMenuAnchor(null);
  };

  const handleDeleteConfirm = () => {
    if (menuItem) {
      watchlistStore.removeCoin(menuItem.id);
    }
    setDeleteDialog(false);
    setMenuItem(null);
  };

  const handleSettingsClick = () => {
    if (menuItem) {
      setEditThreshold(menuItem.customThreshold?.toString() || "");
      setEditPeriod(menuItem.customPeriodMinutes?.toString() || "");
      setSettingsDialog(true);
    }
    setMenuAnchor(null);
  };

  const handleSettingsSave = async () => {
    if (menuItem) {
      const threshold = editThreshold ? parseFloat(editThreshold) : null;
      const period = editPeriod ? parseInt(editPeriod) : null;
      await watchlistStore.updateItem(menuItem.id, {
        customThreshold: threshold,
        customPeriodMinutes: period,
      });
    }
    setSettingsDialog(false);
    setMenuItem(null);
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
            {watchlistStore.total} монет отслеживается | Порог: {settingsStore.defaultThreshold}% | Период: {settingsStore.checkPeriodMinutes} мин
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
          <TableContainer sx={{ maxHeight: { xs: "calc(100vh - 274px)", md: "calc(100vh - 232px)" } }}>
            <Table size="small" stickyHeader sx={{ "& .MuiTableCell-root": { px: { xs: 1, md: 2 } } }}>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ width: 50 }}>#</TableCell>
                  <TableCell>Монета</TableCell>
                  <TableCell align="right">Цена</TableCell>
                  <TableCell align="right" sx={{ display: { xs: "none", md: "table-cell" } }}>Капитализация</TableCell>
                  <TableCell align="right">Порог / Период</TableCell>
                  <TableCell align="center" sx={{ width: 50 }}></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {watchlistStore.items.map((item: any) => (
                  <TableRow key={item.id} hover sx={{ opacity: item.isActive ? 1 : 0.45 }}>
                    <TableCell sx={{ color: "text.secondary" }}>
                      {item.coin.marketCapRank || "—"}
                    </TableCell>
                    <TableCell>
                      <Stack direction="row" alignItems="center" spacing={1.5}>
                        {item.coin.image && (
                          <Avatar src={item.coin.image} sx={{ width: 24, height: 24 }} />
                        )}
                        <Box>
                          <Typography variant="body2" fontWeight="medium" sx={{ maxWidth: { xs: 120, md: "none" }, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{item.coin.name}</Typography>
                          <Typography variant="caption" color="text.secondary">{item.coin.symbol.toUpperCase()}</Typography>
                        </Box>
                      </Stack>
                    </TableCell>
                    <TableCell align="right">{formatPrice(item.coin.currentPrice)}</TableCell>
                    <TableCell align="right" sx={{ color: "text.secondary", display: { xs: "none", md: "table-cell" } }}>
                      {item.coin.marketCap ? `$${(item.coin.marketCap / 1e9).toFixed(1)} млрд` : "Н/Д"}
                    </TableCell>
                    <TableCell align="right">
                      <Stack direction="row" spacing={0.5} justifyContent="flex-end">
                        <Chip
                          label={`${item.customThreshold ?? settingsStore.defaultThreshold}%`}
                          size="small"
                          variant="outlined"
                          color={item.customThreshold ? "primary" : "default"}
                        />
                        <Chip
                          label={`${item.customPeriodMinutes ?? settingsStore.checkPeriodMinutes}м`}
                          size="small"
                          variant="outlined"
                          color={item.customPeriodMinutes ? "primary" : "default"}
                        />
                      </Stack>
                    </TableCell>
                    <TableCell align="center">
                      <IconButton size="small" onClick={(e) => openMenu(e, item)}>
                        <MoreVertIcon fontSize="small" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
                {watchlistStore.items.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} align="center" sx={{ py: 6 }}>
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

      {/* Меню действий */}
      <Menu anchorEl={menuAnchor} open={Boolean(menuAnchor)} onClose={closeMenu}>
        <MenuItem onClick={handleSettingsClick}>
          <ListItemIcon><TuneIcon fontSize="small" /></ListItemIcon>
          <ListItemText>Настройки</ListItemText>
        </MenuItem>
        <MenuItem onClick={handleToggleActive}>
          <ListItemIcon>
            {menuItem?.isActive ? <VisibilityOffIcon fontSize="small" /> : <VisibilityIcon fontSize="small" />}
          </ListItemIcon>
          <ListItemText>{menuItem?.isActive ? "Деактивировать" : "Активировать"}</ListItemText>
        </MenuItem>
        <MenuItem onClick={handleDeleteClick} sx={{ color: "error.main" }}>
          <ListItemIcon><DeleteIcon fontSize="small" color="error" /></ListItemIcon>
          <ListItemText>Удалить</ListItemText>
        </MenuItem>
      </Menu>

      {/* Диалог настроек монеты */}
      <Dialog open={settingsDialog} onClose={() => { setSettingsDialog(false); setMenuItem(null); }} maxWidth="xs" fullWidth>
        <DialogTitle>
          {menuItem?.coin?.name} ({menuItem?.coin?.symbol?.toUpperCase()})
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Оставьте пустым, чтобы использовать общие настройки.
          </Typography>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              label="Порог оповещения"
              type="number"
              value={editThreshold}
              onChange={(e) => setEditThreshold(e.target.value)}
              placeholder={`${settingsStore.defaultThreshold}`}
              InputProps={{ endAdornment: <InputAdornment position="end">%</InputAdornment> }}
              inputProps={{ min: 0.1, step: 0.1 }}
              fullWidth
            />
            <TextField
              label="Период сверки"
              type="number"
              value={editPeriod}
              onChange={(e) => setEditPeriod(e.target.value)}
              placeholder={`${settingsStore.checkPeriodMinutes}`}
              InputProps={{ endAdornment: <InputAdornment position="end">мин</InputAdornment> }}
              inputProps={{ min: 1, step: 1 }}
              fullWidth
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => { setSettingsDialog(false); setMenuItem(null); }}>Отмена</Button>
          <Button onClick={handleSettingsSave} variant="contained">Сохранить</Button>
        </DialogActions>
      </Dialog>

      {/* Диалог подтверждения удаления */}
      <Dialog open={deleteDialog} onClose={() => { setDeleteDialog(false); setMenuItem(null); }}>
        <DialogTitle>Удалить монету?</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary">
            {menuItem?.coin?.name} ({menuItem?.coin?.symbol?.toUpperCase()}) будет удалена из вашего списка наблюдения.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => { setDeleteDialog(false); setMenuItem(null); }}>Отмена</Button>
          <Button onClick={handleDeleteConfirm} color="error" variant="contained">Удалить</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
});

export default WatchlistPage;
