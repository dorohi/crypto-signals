import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { observer } from "mobx-react-lite";
import { useStore } from "@/stores/RootStore";
import { api } from "@/services/api";
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
  IconButton,
  Avatar,
  Stack,
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
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Tooltip,
  List,
  ListItem,
  Chip,
  InputAdornment,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import ReceiptLongIcon from "@mui/icons-material/ReceiptLong";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import TrendingDownIcon from "@mui/icons-material/TrendingDown";
import SearchIcon from "@mui/icons-material/Search";
import EditIcon from "@mui/icons-material/Edit";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";

const formatUsd = (value: number) => {
  if (Math.abs(value) >= 1) {
    return `$${value.toLocaleString("ru-RU", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }
  if (value === 0) return "$0.00";
  return `$${value.toPrecision(4)}`;
};

const formatPrice = (price: number | null) => {
  if (!price) return "Н/Д";
  return formatUsd(price);
};

const formatPercent = (pct: number) => {
  const sign = pct >= 0 ? "+" : "";
  return `${sign}${pct.toFixed(2)}%`;
};

const PnlText = ({ value, percent, size = "body2" }: { value: number; percent: number; size?: any }) => {
  const color = value >= 0 ? "success.main" : "error.main";
  return (
    <Box>
      <Typography variant={size} sx={{ color, fontWeight: "medium" }}>
        {value >= 0 ? "+" : ""}{formatUsd(value)}
      </Typography>
      <Typography variant="caption" sx={{ color }}>
        {formatPercent(percent)}
      </Typography>
    </Box>
  );
};

const PortfolioPage = observer(function PortfolioPage() {
  const { portfolioStore, coinStore } = useStore();
  const navigate = useNavigate();
  const muiTheme = useTheme();
  const isMobile = useMediaQuery(muiTheme.breakpoints.down("md"));

  // Меню
  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);
  const [menuPosition, setMenuPosition] = useState<any>(null);

  // Диалог добавления/редактирования транзакции
  const [txDialog, setTxDialog] = useState(false);
  const [txEditId, setTxEditId] = useState<string | null>(null);
  const [txType, setTxType] = useState<"buy" | "sell">("buy");
  const [txCoinId, setTxCoinId] = useState("");
  const [txCoinLabel, setTxCoinLabel] = useState("");
  const [txQuantity, setTxQuantity] = useState("");
  const [txPrice, setTxPrice] = useState("");
  const [txFee, setTxFee] = useState("");
  const [txNote, setTxNote] = useState("");
  const [txDate, setTxDate] = useState(new Date().toISOString().slice(0, 10));
  const [txSaving, setTxSaving] = useState(false);

  // Поиск монеты в диалоге
  const [coinQuery, setCoinQuery] = useState("");
  const [coinResults, setCoinResults] = useState<any[]>([]);
  const [coinSearching, setCoinSearching] = useState(false);

  // Диалог удаления
  const [deleteDialog, setDeleteDialog] = useState(false);

  // Меню транзакции
  const [txMenuAnchor, setTxMenuAnchor] = useState<null | HTMLElement>(null);
  const [txMenuTarget, setTxMenuTarget] = useState<any>(null);

  // Диалог транзакций по монете
  const [historyDialog, setHistoryDialog] = useState(false);
  const [historyTransactions, setHistoryTransactions] = useState<any[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyCoinName, setHistoryCoinName] = useState("");

  const summary = portfolioStore.summary;
  const positions = portfolioStore.positions;

  const openMenu = (e: React.MouseEvent<HTMLElement>, position: any) => {
    setMenuAnchor(e.currentTarget);
    setMenuPosition(position);
  };

  const closeMenu = () => {
    setMenuAnchor(null);
  };

  const openTxDialog = (coinId?: string, coinLabel?: string, editTx?: any) => {
    setTxEditId(editTx?.id || null);
    setTxType(editTx?.type || "buy");
    setTxCoinId(coinId || "");
    setTxCoinLabel(coinLabel || "");
    setTxQuantity(editTx ? String(editTx.quantity) : "");
    setTxPrice(editTx ? String(editTx.price) : "");
    setTxFee(editTx?.fee ? String(editTx.fee) : "");
    setTxNote(editTx?.note || "");
    setTxDate(editTx ? new Date(editTx.date).toISOString().slice(0, 10) : new Date().toISOString().slice(0, 10));
    setCoinQuery("");
    setCoinResults([]);
    setTxDialog(true);
  };

  const handleTxSave = async () => {
    if (!txCoinId || !txQuantity || !txPrice) return;
    setTxSaving(true);
    try {
      if (txEditId) {
        await portfolioStore.updateTransaction(txEditId, {
          type: txType,
          quantity: parseFloat(txQuantity),
          price: parseFloat(txPrice),
          fee: txFee ? parseFloat(txFee) : 0,
          note: txNote || undefined,
          date: txDate || undefined,
        });
        // Обновим историю если открыта
        if (historyDialog && menuPosition) {
          const result = await api.getPortfolioTransactions(menuPosition.coinId);
          setHistoryTransactions(result.data);
        }
      } else {
        await portfolioStore.addTransaction({
          coinId: txCoinId,
          type: txType,
          quantity: parseFloat(txQuantity),
          price: parseFloat(txPrice),
          fee: txFee ? parseFloat(txFee) : undefined,
          note: txNote || undefined,
          date: txDate || undefined,
        });
        // Обновим историю если открыта
        if (historyDialog && menuPosition) {
          const result = await api.getPortfolioTransactions(menuPosition.coinId);
          setHistoryTransactions(result.data);
        }
      }
      setTxDialog(false);
    } catch {
      // error handled in store
    }
    setTxSaving(false);
  };

  const handleCoinSearch = useCallback(async (value: string) => {
    setCoinQuery(value);
    if (value.length >= 1) {
      setCoinSearching(true);
      try {
        const result = await api.searchCoins(value);
        setCoinResults(result.data);
      } catch {
        setCoinResults([]);
      }
      setCoinSearching(false);
    } else {
      setCoinResults([]);
    }
  }, []);

  const selectCoin = (coin: any) => {
    setTxCoinId(coin.id);
    setTxCoinLabel(`${coin.name} (${coin.symbol.toUpperCase()})`);
    setCoinQuery("");
    setCoinResults([]);
  };

  const openDuplicateTxDialog = (tx: any, coinLabel: string) => {
    setTxEditId(null);
    setTxType(tx.type);
    setTxCoinId(tx.coinId);
    setTxCoinLabel(coinLabel);
    setTxQuantity(String(tx.quantity));
    setTxPrice(String(tx.price));
    setTxFee(tx.fee ? String(tx.fee) : "");
    setTxNote(tx.note || "");
    setTxDate(new Date().toISOString().slice(0, 10));
    setCoinQuery("");
    setCoinResults([]);
    setTxDialog(true);
  };

  const handleAddTxFromMenu = () => {
    if (menuPosition) {
      openTxDialog(menuPosition.coinId, `${menuPosition.coin.name} (${menuPosition.coin.symbol.toUpperCase()})`);
    }
    closeMenu();
  };

  const handleHistoryClick = async () => {
    if (!menuPosition) return;
    closeMenu();
    setHistoryCoinName(`${menuPosition.coin.name} (${menuPosition.coin.symbol.toUpperCase()})`);
    setHistoryLoading(true);
    setHistoryDialog(true);
    try {
      const result = await api.getPortfolioTransactions(menuPosition.coinId);
      setHistoryTransactions(result.data);
    } catch {
      setHistoryTransactions([]);
    }
    setHistoryLoading(false);
  };

  const handleDeleteClick = () => {
    setDeleteDialog(true);
    setMenuAnchor(null);
  };

  const handleDeleteConfirm = async () => {
    if (menuPosition) {
      await portfolioStore.deleteCoin(menuPosition.coinId);
    }
    setDeleteDialog(false);
    setMenuPosition(null);
  };

  const handleDeleteTx = async (txId: string) => {
    await portfolioStore.deleteTransaction(txId);
    // Обновим историю
    setHistoryTransactions((prev) => prev.filter((t) => t.id !== txId));
  };

  return (
    <Box>
      <Stack direction={{ xs: "column", sm: "row" }} justifyContent="space-between" alignItems={{ sm: "center" }} spacing={2} sx={{ mb: 3 }}>
        <Box>
          <Typography variant="h5" fontWeight="bold">Портфель</Typography>
          <Typography variant="body2" color="text.secondary">
            {positions.length} позиций
          </Typography>
        </Box>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => openTxDialog()}>
          Добавить транзакцию
        </Button>
      </Stack>

      {!portfolioStore.initialized || portfolioStore.loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <>
          {/* Сводка портфеля */}
          {summary && positions.length > 0 && (
            <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr 1fr", sm: "1fr 1fr 1fr 1fr" }, gap: 2, mb: 3 }}>
              <Paper variant="outlined" sx={{ p: 2 }}>
                <Typography variant="caption" color="text.secondary">Общая стоимость</Typography>
                <Typography variant="h6" fontWeight="bold">{formatUsd(summary.totalValue)}</Typography>
              </Paper>
              <Paper variant="outlined" sx={{ p: 2 }}>
                <Typography variant="caption" color="text.secondary">Вложено</Typography>
                <Typography variant="h6" fontWeight="bold">{formatUsd(summary.totalInvested)}</Typography>
              </Paper>
              <Paper variant="outlined" sx={{ p: 2 }}>
                <Typography variant="caption" color="text.secondary">Прибыль / Убыток</Typography>
                <PnlText value={summary.totalPnl} percent={summary.totalPnlPercent} size="h6" />
              </Paper>
              <Paper variant="outlined" sx={{ p: 2 }}>
                <Typography variant="caption" color="text.secondary">Лучший / Худший</Typography>
                {summary.best && (
                  <Stack direction="row" alignItems="center" spacing={0.5}>
                    <TrendingUpIcon fontSize="small" color="success" />
                    <Typography variant="body2">
                      {summary.best.symbol.toUpperCase()} {formatPercent(summary.best.pnlPercent)}
                    </Typography>
                  </Stack>
                )}
                {summary.worst && (
                  <Stack direction="row" alignItems="center" spacing={0.5}>
                    <TrendingDownIcon fontSize="small" color="error" />
                    <Typography variant="body2">
                      {summary.worst.symbol.toUpperCase()} {formatPercent(summary.worst.pnlPercent)}
                    </Typography>
                  </Stack>
                )}
                {!summary.best && !summary.worst && (
                  <Typography variant="body2" color="text.secondary">Н/Д</Typography>
                )}
              </Paper>
            </Box>
          )}

          {/* Таблица позиций */}
          <Paper variant="outlined" sx={{ overflow: "hidden" }}>
            <TableContainer sx={{ maxHeight: { xs: "calc(100vh - 400px)", md: "calc(100vh - 340px)" } }}>
              <Table size="small" stickyHeader sx={{ "& .MuiTableCell-root": { px: { xs: 1, md: 2 } } }}>
                <TableHead>
                  <TableRow>
                    <TableCell>Монета</TableCell>
                    <TableCell align="right">Количество</TableCell>
                    <TableCell align="right" sx={{ display: { xs: "none", md: "table-cell" } }}>Ср. цена покупки</TableCell>
                    <TableCell align="right">Текущая цена</TableCell>
                    <TableCell align="right" sx={{ display: { xs: "none", sm: "table-cell" } }}>Стоимость</TableCell>
                    <TableCell align="right">P&L</TableCell>
                    <TableCell align="center" sx={{ width: 50 }}></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {positions.map((pos: any) => (
                    <TableRow key={pos.coinId} hover>
                      <TableCell>
                        <Stack direction="row" alignItems="center" spacing={1.5}>
                          {pos.coin.image && (
                            <Avatar src={pos.coin.image} sx={{ width: 24, height: 24 }} />
                          )}
                          <Box>
                            <Typography
                              variant="body2"
                              fontWeight="medium"
                              sx={{
                                maxWidth: { xs: 100, md: "none" },
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                whiteSpace: "nowrap",
                                cursor: "pointer",
                                "&:hover": { textDecoration: "underline" },
                              }}
                              onClick={() => navigate(`/coin/${pos.coinId}`)}
                            >
                              {pos.coin.name}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {pos.coin.symbol.toUpperCase()}
                            </Typography>
                          </Box>
                        </Stack>
                      </TableCell>
                      <TableCell align="right">
                        <Typography variant="body2">
                          {pos.holdings.toLocaleString("ru-RU", { maximumFractionDigits: 8 })}
                        </Typography>
                      </TableCell>
                      <TableCell align="right" sx={{ display: { xs: "none", md: "table-cell" } }}>
                        {formatPrice(pos.avgBuyPrice)}
                      </TableCell>
                      <TableCell align="right">
                        {formatPrice(pos.currentPrice)}
                      </TableCell>
                      <TableCell align="right" sx={{ display: { xs: "none", sm: "table-cell" } }}>
                        {formatUsd(pos.currentValue)}
                      </TableCell>
                      <TableCell align="right">
                        <PnlText value={pos.pnl} percent={pos.pnlPercent} />
                      </TableCell>
                      <TableCell align="center">
                        <IconButton size="small" onClick={(e) => openMenu(e, pos)}>
                          <MoreVertIcon fontSize="small" />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                  {positions.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={7} align="center" sx={{ py: 6 }}>
                        <Typography color="text.secondary">
                          Портфель пуст. Добавьте первую транзакцию.
                        </Typography>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </>
      )}

      {/* Меню действий */}
      <Menu anchorEl={menuAnchor} open={Boolean(menuAnchor)} onClose={closeMenu}>
        <MenuItem onClick={handleAddTxFromMenu}>
          <ListItemIcon><AddIcon fontSize="small" /></ListItemIcon>
          <ListItemText>Добавить транзакцию</ListItemText>
        </MenuItem>
        <MenuItem onClick={handleHistoryClick}>
          <ListItemIcon><ReceiptLongIcon fontSize="small" /></ListItemIcon>
          <ListItemText>Транзакции</ListItemText>
        </MenuItem>
        <MenuItem onClick={handleDeleteClick} sx={{ color: "error.main" }}>
          <ListItemIcon><DeleteIcon fontSize="small" color="error" /></ListItemIcon>
          <ListItemText>Удалить</ListItemText>
        </MenuItem>
      </Menu>

      {/* Диалог добавления транзакции */}
      <Dialog open={txDialog} onClose={() => setTxDialog(false)} maxWidth="xs" fullWidth fullScreen={isMobile}>
        <DialogTitle>{txEditId ? "Редактировать транзакцию" : "Добавить транзакцию"}</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <ToggleButtonGroup
              value={txType}
              exclusive
              onChange={(_, v) => v && setTxType(v)}
              fullWidth
              size="small"
            >
              <ToggleButton value="buy" color="success">Покупка</ToggleButton>
              <ToggleButton value="sell" color="error">Продажа</ToggleButton>
            </ToggleButtonGroup>

            {/* Выбор монеты */}
            {txCoinId ? (
              <Stack direction="row" alignItems="center" justifyContent="space-between">
                <Typography variant="body2" fontWeight="medium">{txCoinLabel}</Typography>
                {!txEditId && <Button size="small" onClick={() => { setTxCoinId(""); setTxCoinLabel(""); }}>Изменить</Button>}
              </Stack>
            ) : (
              <Box sx={{ position: "relative" }}>
                <TextField
                  fullWidth
                  size="small"
                  placeholder="Поиск монеты..."
                  value={coinQuery}
                  onChange={(e) => handleCoinSearch(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon fontSize="small" color="action" />
                      </InputAdornment>
                    ),
                  }}
                  autoFocus
                />
                {coinResults.length > 0 && (
                  <Paper
                    sx={{
                      position: "absolute",
                      top: "100%",
                      left: 0,
                      right: 0,
                      mt: 0.5,
                      maxHeight: 200,
                      overflow: "auto",
                      zIndex: 10,
                    }}
                  >
                    <List dense disablePadding>
                      {coinResults.map((coin: any) => (
                        <ListItem
                          key={coin.id}
                          component="div"
                          onClick={() => selectCoin(coin)}
                          sx={{ cursor: "pointer", "&:hover": { bgcolor: "action.hover" } }}
                        >
                          {coin.image && (
                            <Avatar src={coin.image} sx={{ width: 24, height: 24, mr: 1 }} />
                          )}
                          <ListItemText
                            primary={coin.name}
                            secondary={coin.symbol.toUpperCase()}
                            primaryTypographyProps={{ fontSize: 14 }}
                            secondaryTypographyProps={{ fontSize: 11 }}
                          />
                        </ListItem>
                      ))}
                    </List>
                  </Paper>
                )}
              </Box>
            )}

            <TextField
              label="Количество"
              type="number"
              value={txQuantity}
              onChange={(e) => setTxQuantity(e.target.value)}
              inputProps={{ min: 0, step: "any" }}
              fullWidth
            />
            <TextField
              label="Цена за монету"
              type="number"
              value={txPrice}
              onChange={(e) => setTxPrice(e.target.value)}
              InputProps={{ startAdornment: <InputAdornment position="start">$</InputAdornment> }}
              inputProps={{ min: 0, step: "any" }}
              fullWidth
            />
            <TextField
              label="Дата"
              type="date"
              value={txDate}
              onChange={(e) => setTxDate(e.target.value)}
              fullWidth
              InputLabelProps={{ shrink: true }}
            />
            <TextField
              label="Комиссия (опционально)"
              type="number"
              value={txFee}
              onChange={(e) => setTxFee(e.target.value)}
              InputProps={{ startAdornment: <InputAdornment position="start">$</InputAdornment> }}
              inputProps={{ min: 0, step: "any" }}
              fullWidth
            />
            <TextField
              label="Заметка (опционально)"
              value={txNote}
              onChange={(e) => setTxNote(e.target.value)}
              fullWidth
              multiline
              rows={2}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setTxDialog(false)}>Отмена</Button>
          <Button
            onClick={handleTxSave}
            variant="contained"
            disabled={!txCoinId || !txQuantity || !txPrice || txSaving}
            color={txType === "buy" ? "success" : "error"}
          >
            {txSaving ? "Сохранение..." : txEditId ? "Сохранить" : txType === "buy" ? "Купить" : "Продать"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Диалог истории транзакций */}
      <Dialog open={historyDialog} onClose={() => setHistoryDialog(false)} maxWidth="sm" fullWidth fullScreen={isMobile}>
        <DialogTitle>Транзакции — {historyCoinName}</DialogTitle>
        <DialogContent sx={{ p: 1 }}>
          {historyLoading ? (
            <Box sx={{ display: "flex", justifyContent: "center", py: 3 }}>
              <CircularProgress size={28} />
            </Box>
          ) : historyTransactions.length === 0 ? (
            <Typography color="text.secondary" sx={{ py: 2 }}>Нет транзакций</Typography>
          ) : (
            <TableContainer>
              <Table size="small" sx={{ '& .MuiTableCell-root': { px: 1, py: '3px' } }}>
                <TableHead>
                  <TableRow>
                    <TableCell>Тип</TableCell>
                    <TableCell align="right">Кол-во</TableCell>
                    <TableCell align="right">Цена</TableCell>
                    <TableCell align="right">Сумма</TableCell>
                    <TableCell>Дата</TableCell>
                    <TableCell align="center" sx={{ width: 50 }}></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {historyTransactions.map((tx: any) => (
                    <TableRow key={tx.id} hover>
                      <TableCell>
                        <Tooltip title={tx.type === "buy" ? "Покупка" : "Продажа"}>
                          {tx.type === "buy" ? (
                            <TrendingUpIcon fontSize="small" color="success" />
                          ) : (
                            <TrendingDownIcon fontSize="small" color="error" />
                          )}
                        </Tooltip>
                      </TableCell>
                      <TableCell align="right">
                        {parseFloat(tx.quantity).toLocaleString("ru-RU", { maximumFractionDigits: 8 })}
                      </TableCell>
                      <TableCell align="right">{formatUsd(tx.price)}</TableCell>
                      <TableCell align="right">{formatUsd(tx.quantity * tx.price)}</TableCell>
                      <TableCell>
                        {new Date(tx.date).toLocaleDateString("ru-RU")}
                        {tx.fee > 0 && (
                          <Typography variant="caption" display="block" color="text.secondary">
                            Ком.: {formatUsd(tx.fee)}
                          </Typography>
                        )}
                        {tx.note && (
                          <Typography variant="caption" display="block" color="text.secondary" sx={{ maxWidth: 150, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                            {tx.note}
                          </Typography>
                        )}
                      </TableCell>
                      <TableCell align="center">
                        <IconButton size="small" onClick={(e) => { setTxMenuAnchor(e.currentTarget); setTxMenuTarget(tx); }}>
                          <MoreVertIcon fontSize="small" />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setHistoryDialog(false)}>Закрыть</Button>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => { if (menuPosition) openTxDialog(menuPosition.coinId, historyCoinName); }}
          >
            Новая транзакция
          </Button>
        </DialogActions>
      </Dialog>

      {/* Меню действий транзакции */}
      <Menu anchorEl={txMenuAnchor} open={Boolean(txMenuAnchor)} onClose={() => setTxMenuAnchor(null)}>
        <MenuItem onClick={() => { if (txMenuTarget) openTxDialog(txMenuTarget.coinId, historyCoinName, txMenuTarget); setTxMenuAnchor(null); }}>
          <ListItemIcon><EditIcon fontSize="small" /></ListItemIcon>
          <ListItemText>Редактировать</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => { if (txMenuTarget) openDuplicateTxDialog(txMenuTarget, historyCoinName); setTxMenuAnchor(null); }}>
          <ListItemIcon><ContentCopyIcon fontSize="small" /></ListItemIcon>
          <ListItemText>Дублировать</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => { if (txMenuTarget) handleDeleteTx(txMenuTarget.id); setTxMenuAnchor(null); }} sx={{ color: "error.main" }}>
          <ListItemIcon><DeleteIcon fontSize="small" color="error" /></ListItemIcon>
          <ListItemText>Удалить</ListItemText>
        </MenuItem>
      </Menu>

      {/* Диалог подтверждения удаления */}
      <Dialog open={deleteDialog} onClose={() => { setDeleteDialog(false); setMenuPosition(null); }}>
        <DialogTitle>Удалить позицию?</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary">
            Все транзакции по {menuPosition?.coin?.name} ({menuPosition?.coin?.symbol?.toUpperCase()}) будут удалены из портфеля.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => { setDeleteDialog(false); setMenuPosition(null); }}>Отмена</Button>
          <Button onClick={handleDeleteConfirm} color="error" variant="contained">Удалить</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
});

export default PortfolioPage;
