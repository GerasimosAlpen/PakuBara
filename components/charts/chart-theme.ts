export interface ChartColors {
  text: string;
  muted: string;
  faint: string;
  axis: string;
  grid: string;
  tooltipBg: string;
  tooltipBorder: string;
  sliderBg: string;
}

const LIGHT: ChartColors = {
  text: "#1c1917",
  muted: "#57534e",
  faint: "#57534e",
  axis: "#d6d3d1",
  grid: "#e7e5e4",
  tooltipBg: "#ffffff",
  tooltipBorder: "#d6d3d1",
  sliderBg: "#f5f5f4",
};

const DARK: ChartColors = {
  text: "#f5f5f4",
  muted: "#a8a29e",
  faint: "#a8a29e",
  axis: "#2d2424",
  grid: "#241d1d",
  tooltipBg: "#181414",
  tooltipBorder: "#3d3030",
  sliderBg: "#121010",
};

export function chartColors(isDark: boolean): ChartColors {
  return isDark ? DARK : LIGHT;
}
