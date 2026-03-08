"use client";

import { useState, useCallback } from "react";
import { observer } from "mobx-react-lite";
import { useStore } from "@/stores/RootStore";
import {
  TextField,
  Paper,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Avatar,
  Button,
  Box,
} from "@mui/material";

export const CoinSearch = observer(function CoinSearch() {
  const { coinStore, watchlistStore } = useStore();
  const [query, setQuery] = useState("");
  const [adding, setAdding] = useState<string | null>(null);

  const handleSearch = useCallback(
    (value: string) => {
      setQuery(value);
      if (value.length >= 1) {
        coinStore.searchCoins(value);
      } else {
        coinStore.clearSearch();
      }
    },
    [coinStore]
  );

  const handleAdd = async (coinId: string) => {
    setAdding(coinId);
    try {
      await watchlistStore.addCoin(coinId);
      setQuery("");
      coinStore.clearSearch();
    } catch {
      // error handled in store
    }
    setAdding(null);
  };

  const watchlistCoinIds = new Set(
    watchlistStore.items.map((i: any) => i.coinId)
  );

  return (
    <Box sx={{ position: "relative" }}>
      <TextField
        fullWidth
        size="small"
        placeholder="Поиск монет для добавления..."
        value={query}
        onChange={(e) => handleSearch(e.target.value)}
      />
      {coinStore.searchResults.length > 0 && (
        <Paper
          sx={{
            position: "absolute",
            top: "100%",
            left: 0,
            right: 0,
            mt: 0.5,
            maxHeight: 256,
            overflow: "auto",
            zIndex: 10,
          }}
        >
          <List dense disablePadding>
            {coinStore.searchResults.map((coin: any) => {
              const inWatchlist = watchlistCoinIds.has(coin.id);
              return (
                <ListItem
                  key={coin.id}
                  secondaryAction={
                    <Button
                      size="small"
                      variant={inWatchlist ? "outlined" : "contained"}
                      disabled={inWatchlist || adding === coin.id}
                      onClick={() => handleAdd(coin.id)}
                      sx={{ minWidth: 90, fontSize: 12 }}
                    >
                      {inWatchlist
                        ? "Добавлено"
                        : adding === coin.id
                        ? "..."
                        : "Добавить"}
                    </Button>
                  }
                >
                  <ListItemAvatar sx={{ minWidth: 40 }}>
                    {coin.image ? (
                      <Avatar src={coin.image} sx={{ width: 28, height: 28 }} />
                    ) : (
                      <Avatar sx={{ width: 28, height: 28, fontSize: 12 }}>
                        {coin.symbol?.[0]?.toUpperCase()}
                      </Avatar>
                    )}
                  </ListItemAvatar>
                  <ListItemText
                    primary={coin.name}
                    secondary={coin.symbol.toUpperCase()}
                    primaryTypographyProps={{ fontSize: 14 }}
                    secondaryTypographyProps={{ fontSize: 11 }}
                  />
                </ListItem>
              );
            })}
          </List>
        </Paper>
      )}
    </Box>
  );
});