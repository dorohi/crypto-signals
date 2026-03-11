import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { observer } from "mobx-react-lite";
import { api } from "@/services/api";
import {
  Box,
  Typography,
  Paper,
  Stack,
  Avatar,
  Chip,
  CircularProgress,
  IconButton,
  ToggleButtonGroup,
  ToggleButton,
  Divider,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import { createChart, type IChartApi, type ISeriesApi, ColorType, AreaSeries } from "lightweight-charts";
import { useTheme } from "@mui/material/styles";

const PERIODS = [
  { label: "1ч", minutes: 60 },
  { label: "6ч", minutes: 360 },
  { label: "24ч", minutes: 1440 },
  { label: "3д", minutes: 4320 },
  { label: "7д", minutes: 10080 },
];

function PriceChart({ coinId }: { coinId: string }) {
  const muiTheme = useTheme();

  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const seriesRef = useRef<ISeriesApi<any> | null>(null);
  const allDataRef = useRef<{ time: number; value: number }[]>([]);

  // Создание графика
  useEffect(() => {
    if (!chartContainerRef.current) return;

    const bg = muiTheme.palette.background.paper;
    const textColor = muiTheme.palette.text.secondary;
    const gridColor = muiTheme.palette.divider;

    const chart = createChart(chartContainerRef.current, {
      layout: {
        background: { type: ColorType.Solid, color: bg },
        textColor,
      },
      grid: {
        vertLines: { color: gridColor },
        horzLines: { color: gridColor },
      },
      width: chartContainerRef.current.clientWidth,
      height: 400,
      timeScale: { timeVisible: true, secondsVisible: false },
      crosshair: {
        horzLine: { labelBackgroundColor: muiTheme.palette.primary.main },
        vertLine: { labelBackgroundColor: muiTheme.palette.primary.main },
      },
    });

    chartRef.current = chart;

    const handleResize = () => {
      if (chartContainerRef.current) {
        chart.applyOptions({ width: chartContainerRef.current.clientWidth });
      }
    };
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      chart.remove();
      chartRef.current = null;
      seriesRef.current = null;
    };
  }, [muiTheme]);

  // Загрузка ВСЕХ данных один раз
  useEffect(() => {
    if (!chartRef.current) return;

    api.getCoinSnapshots(coinId).then((res) => {
      if (!chartRef.current || res.data.length === 0) return;

      const mapped = res.data.map((s) => ({
        time: Math.floor(new Date(s.recordedAt).getTime() / 1000) as any,
        value: s.price,
      }));
      allDataRef.current = mapped;

      if (seriesRef.current) {
        chartRef.current!.removeSeries(seriesRef.current);
      }

      // Определяем точность по минимальной цене
      const minVal = Math.min(...mapped.map((d) => d.value));
      let precision = 2;
      if (minVal > 0 && minVal < 1) {
        precision = Math.max(2, Math.ceil(-Math.log10(minVal)) + 2);
      }

      const series = chartRef.current!.addSeries(AreaSeries, {
        lineColor: muiTheme.palette.primary.main,
        topColor: muiTheme.palette.primary.main + "40",
        bottomColor: muiTheme.palette.primary.main + "05",
        lineWidth: 2,
        priceFormat: {
          type: "price",
          precision,
          minMove: 1 / Math.pow(10, precision),
        },
      });
      series.setData(mapped);
      seriesRef.current = series;
      // Показать последние 24ч по умолчанию
      zoomTo(1440);
    }).catch(() => {});
  }, [coinId, muiTheme]);

  const zoomTo = (minutes: number) => {
    if (!chartRef.current || allDataRef.current.length === 0) return;
    const data = allDataRef.current;
    const lastTime = data[data.length - 1].time;
    const fromTime = lastTime - minutes * 60;
    const fromIdx = data.findIndex((d) => d.time >= fromTime);
    chartRef.current.timeScale().setVisibleLogicalRange({
      from: fromIdx >= 0 ? fromIdx : 0,
      to: data.length - 1,
    });
  };

  return (
    <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
      <Stack direction="row" justifyContent="flex-end" sx={{ mb: 1 }}>
        <ToggleButtonGroup size="small" exclusive>
          {PERIODS.map((p) => (
            <ToggleButton key={p.label} value={p.minutes} onClick={() => zoomTo(p.minutes)}>
              {p.label}
            </ToggleButton>
          ))}
        </ToggleButtonGroup>
      </Stack>
      <div ref={chartContainerRef} />
    </Paper>
  );
}

const CoinPage = observer(function CoinPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [details, setDetails] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    api.getCoinDetails(id).then((data) => {
      setDetails(data);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!details) {
    return (
      <Box sx={{ py: 4 }}>
        <Typography color="text.secondary">Монета не найдена</Typography>
      </Box>
    );
  }

  const md = details.market_data;
  const price = md?.current_price?.usd;
  const change24h = md?.price_change_percentage_24h;
  const change7d = md?.price_change_percentage_7d;
  const change30d = md?.price_change_percentage_30d;
  const change1y = md?.price_change_percentage_1y;
  const marketCap = md?.market_cap?.usd;
  const volume = md?.total_volume?.usd;
  const high24h = md?.high_24h?.usd;
  const low24h = md?.low_24h?.usd;
  const ath = md?.ath?.usd;
  const athDate = md?.ath_date?.usd;
  const athChange = md?.ath_change_percentage?.usd;
  const atl = md?.atl?.usd;
  const atlDate = md?.atl_date?.usd;
  const atlChange = md?.atl_change_percentage?.usd;
  const supply = md?.circulating_supply;
  const totalSupply = md?.total_supply;
  const maxSupply = md?.max_supply;
  const fdv = md?.fully_diluted_valuation?.usd;

  const fmtPrice = (p: number | null | undefined) => {
    if (!p) return "—";
    if (p >= 1) return `$${p.toLocaleString("ru-RU", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    return `$${p.toPrecision(4)}`;
  };

  const fmtBig = (n: number | null | undefined) => {
    if (!n) return "—";
    if (n >= 1e12) return `$${(n / 1e12).toFixed(2)} трлн`;
    if (n >= 1e9) return `$${(n / 1e9).toFixed(2)} млрд`;
    if (n >= 1e6) return `$${(n / 1e6).toFixed(2)} млн`;
    return `$${n.toLocaleString("ru-RU")}`;
  };

  const fmtChange = (val: number | null | undefined) => {
    if (val == null) return <Typography variant="body2">—</Typography>;
    return (
      <Typography variant="body2" component="span" color={val >= 0 ? "success.main" : "error.main"} fontWeight="bold">
        {val >= 0 ? "+" : ""}{val.toFixed(2)}%
      </Typography>
    );
  };

  const fmtDate = (d: string | undefined) => d ? new Date(d).toLocaleDateString("ru-RU") : "—";

  const fmtSupply = (n: number | null | undefined) => {
    if (!n) return "—";
    if (n >= 1e9) return `${(n / 1e9).toFixed(2)} млрд`;
    if (n >= 1e6) return `${(n / 1e6).toFixed(2)} млн`;
    return n.toLocaleString("ru-RU");
  };

  return (
    <Box>
      {/* Шапка */}
      <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 3 }}>
        <IconButton onClick={() => navigate(-1)}>
          <ArrowBackIcon />
        </IconButton>
        <Avatar src={details.image?.large} sx={{ width: 40, height: 40 }} />
        <Box>
          <Stack direction="row" alignItems="baseline" spacing={1} flexWrap="wrap">
            <Typography variant="h5" fontWeight="bold">{details.name}</Typography>
            <Typography variant="body2" color="text.secondary">{details.symbol?.toUpperCase()}</Typography>
            {details.market_cap_rank && (
              <Chip label={`#${details.market_cap_rank}`} size="small" variant="outlined" />
            )}
          </Stack>
          <Stack direction="row" alignItems="baseline" spacing={2}>
            <Typography variant="h5" fontWeight="bold">{fmtPrice(price)}</Typography>
            {fmtChange(change24h)}
          </Stack>
        </Box>
      </Stack>

      {/* График */}
      {id && <PriceChart coinId={id} />}

      {/* Статистика */}
      <Stack direction={{ xs: "column", md: "row" }} spacing={2} sx={{ mb: 2 }}>
        <Paper variant="outlined" sx={{ p: 2, flex: 1 }}>
          <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1.5 }}>Рыночные данные</Typography>
          <StatRow label="Капитализация" value={fmtBig(marketCap)} />
          <StatRow label="FDV" value={fmtBig(fdv)} />
          <StatRow label="Объём (24ч)" value={fmtBig(volume)} />
          <StatRow label="Макс. 24ч" value={fmtPrice(high24h)} />
          <StatRow label="Мин. 24ч" value={fmtPrice(low24h)} />
          <Divider sx={{ my: 1 }} />
          <StatRow label="В обращении" value={fmtSupply(supply)} />
          <StatRow label="Всего" value={fmtSupply(totalSupply)} />
          <StatRow label="Макс. эмиссия" value={fmtSupply(maxSupply)} />
        </Paper>

        <Paper variant="outlined" sx={{ p: 2, flex: 1 }}>
          <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1.5 }}>Изменение цены</Typography>
          <StatRow label="24 часа" value={fmtChange(change24h)} />
          <StatRow label="7 дней" value={fmtChange(change7d)} />
          <StatRow label="30 дней" value={fmtChange(change30d)} />
          <StatRow label="1 год" value={fmtChange(change1y)} />
          <Divider sx={{ my: 1 }} />
          <StatRow label="ATH" value={<>{fmtPrice(ath)} <Typography variant="caption" color="text.secondary" component="span">({fmtDate(athDate)})</Typography></>} />
          <StatRow label="От ATH" value={fmtChange(athChange)} />
          <StatRow label="ATL" value={<>{fmtPrice(atl)} <Typography variant="caption" color="text.secondary" component="span">({fmtDate(atlDate)})</Typography></>} />
          <StatRow label="От ATL" value={fmtChange(atlChange)} />
        </Paper>
      </Stack>

      {/* Сообщество */}
      {(details.community_data?.twitter_followers > 0 || details.community_data?.reddit_subscribers > 0) && (
        <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
          <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1.5 }}>Сообщество</Typography>
          {details.community_data.twitter_followers > 0 && (
            <StatRow label="Twitter подписчики" value={details.community_data.twitter_followers.toLocaleString("ru-RU")} />
          )}
          {details.community_data.reddit_subscribers > 0 && (
            <StatRow label="Reddit подписчики" value={details.community_data.reddit_subscribers.toLocaleString("ru-RU")} />
          )}
          {details.community_data.reddit_average_posts_48h > 0 && (
            <StatRow label="Reddit посты (48ч)" value={details.community_data.reddit_average_posts_48h} />
          )}
          {details.community_data.reddit_average_comments_48h > 0 && (
            <StatRow label="Reddit комментарии (48ч)" value={details.community_data.reddit_average_comments_48h} />
          )}
        </Paper>
      )}

      {/* Ссылки */}
      {(details.links?.homepage?.[0] || details.links?.blockchain_site?.length > 0) && (
        <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
          <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1.5 }}>Ссылки</Typography>
          <Stack direction="row" flexWrap="wrap" gap={1}>
            {details.links?.homepage?.[0] && (
              <Chip label="Сайт" component="a" href={details.links.homepage[0]} target="_blank" clickable icon={<OpenInNewIcon fontSize="small" />} size="small" />
            )}
            {details.links?.blockchain_site?.filter(Boolean).slice(0, 3).map((url: string, i: number) => (
              <Chip key={i} label={new URL(url).hostname.replace("www.", "")} component="a" href={url} target="_blank" clickable size="small" />
            ))}
            {details.links?.subreddit_url && (
              <Chip label="Reddit" component="a" href={details.links.subreddit_url} target="_blank" clickable size="small" />
            )}
            {details.links?.twitter_screen_name && (
              <Chip label={`@${details.links.twitter_screen_name}`} component="a" href={`https://twitter.com/${details.links.twitter_screen_name}`} target="_blank" clickable size="small" />
            )}
            {details.links?.repos_url?.github?.[0] && (
              <Chip label="GitHub" component="a" href={details.links.repos_url.github[0]} target="_blank" clickable size="small" />
            )}
            {details.links?.telegram_channel_identifier && (
              <Chip label="Telegram" component="a" href={`https://t.me/${details.links.telegram_channel_identifier}`} target="_blank" clickable size="small" />
            )}
          </Stack>
        </Paper>
      )}

      {/* Описание */}
      {details.description?.en && (
        <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
          <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1.5 }}>Описание</Typography>
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ "& a": { color: "primary.main" }, lineHeight: 1.8 }}
            dangerouslySetInnerHTML={{ __html: details.description.en }}
          />
        </Paper>
      )}

      {/* Категории */}
      {details.categories?.filter(Boolean).length > 0 && (
        <Paper variant="outlined" sx={{ p: 2 }}>
          <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1.5 }}>Категории</Typography>
          <Stack direction="row" flexWrap="wrap" gap={0.5}>
            {details.categories.filter(Boolean).map((c: string) => (
              <Chip key={c} label={c} size="small" variant="outlined" />
            ))}
          </Stack>
        </Paper>
      )}
    </Box>
  );
});

function StatRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ py: 0.5 }}>
      <Typography variant="body2" color="text.secondary">{label}</Typography>
      <Typography variant="body2" component="div">{value}</Typography>
    </Stack>
  );
}

export default CoinPage;
