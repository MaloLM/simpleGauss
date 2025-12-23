
export type Language = 'en' | 'fr';

export interface GaussianCurve {
  id: string;
  name: string;
  mean: number;       // mu
  sigma: number;      // standard deviation
  amplitude: number;  // height (peak)
  color: string;
  isVisible: boolean;
  isLocked: boolean;
}

export interface ViewBox {
  xMin: number;
  xMax: number;
  yMin: number;
  yMax: number;
}

export type Theme = 'light' | 'dark';

export interface DragState {
  curveId: string;
  type: 'mean-amplitude' | 'sigma';
}

export interface ExportSettings {
  showTitle: boolean;
  title: string;
  showLegend: boolean;
  showScales: boolean;
  selectedCurveIds: string[];
}

export interface AppSettings {
  theme: Theme;
  handleSize: number;
  curveOpacity: number;
  language: Language;
}
