
export type Language = 'en' | 'fr';

export type CurveKind = 'gaussian' | 'linear' | 'quadratic' | 'powerLaw' | 'exponential';

export interface BaseCurve {
  id: string;
  type: CurveKind;
  name: string;
  color: string;
  isVisible: boolean;
  isLocked: boolean;
}

export interface GaussianCurve extends BaseCurve {
  type: 'gaussian';
  mean: number;       // mu
  sigma: number;      // standard deviation
  amplitude: number;  // height (peak)
}

export interface LinearCurve extends BaseCurve {
  type: 'linear';
  slope: number;      // a
  intercept: number;  // b
}

export interface QuadraticCurve extends BaseCurve {
  type: 'quadratic';
  a: number;          // curvature
  h: number;          // vertex x
  k: number;          // vertex y
}

export interface PowerLawCurve extends BaseCurve {
  type: 'powerLaw';
  a: number;          // coefficient
  b: number;          // exponent
  h: number;          // vertex x
  k: number;          // vertex y
}

export interface ExponentialCurve extends BaseCurve {
  type: 'exponential';
  a: number;          // coefficient
  base: number;       // base (b)
  h: number;          // horizontal shift
  k: number;          // vertical shift
}

export type AnyCurve = GaussianCurve | LinearCurve | QuadraticCurve | PowerLawCurve | ExponentialCurve;

export interface ViewBox {
  xMin: number;
  xMax: number;
  yMin: number;
  yMax: number;
}

export type Theme = 'light' | 'dark';

export interface DragState {
  curveId: string;
  handleId: string;
}

export interface ExportSettings {
  showTitle: boolean;
  title: string;
  showLegend: boolean;
  showScales: boolean;
  showGrid: boolean;
  showAxes: boolean;
  showXValues: boolean;
  showYValues: boolean;
  selectedCurveIds: string[];
  backgroundColor: string;
}

export interface AppSettings {
  theme: Theme;
  handleSize: number;
  curveOpacity: number;
  language: Language;
}
