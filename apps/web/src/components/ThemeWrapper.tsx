import { observer } from "mobx-react-lite";
import { ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import { useStore } from "@/stores/RootStore";
import { getTheme } from "@/lib/theme";

export const ThemeWrapper = observer(function ThemeWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const { themeStore } = useStore();

  return (
    <ThemeProvider theme={getTheme(themeStore.current)}>
      <CssBaseline />
      {children}
    </ThemeProvider>
  );
});
