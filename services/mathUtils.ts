
/**
 * Calculates the y-value of a Gaussian curve at point x.
 * f(x) = A * e^(-((x - mu)^2) / (2 * sigma^2))
 */
export const calculateGaussian = (x: number, mu: number, sigma: number, amplitude: number): number => {
  if (sigma === 0) return x === mu ? amplitude : 0;
  const exponent = -Math.pow(x - mu, 2) / (2 * Math.pow(sigma, 2));
  return amplitude * Math.exp(exponent);
};

/**
 * Generates a path string for an SVG polyline/path representing the Gaussian curve.
 */
export const generateGaussianPath = (
  mu: number, 
  sigma: number, 
  amplitude: number, 
  xMin: number, 
  xMax: number, 
  resolution: number = 200
): string => {
  const points: [number, number][] = [];
  const step = (xMax - xMin) / resolution;
  
  for (let x = xMin; x <= xMax; x += step) {
    const y = calculateGaussian(x, mu, sigma, amplitude);
    points.push([x, y]);
  }
  
  // Create path string (e.g. "M x1 y1 L x2 y2 ...")
  return points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p[0]} ${p[1]}`).join(' ');
};

/**
 * Calculates the y-value of a power law curve at point x.
 * f(x) = a * |x - h|^b + k
 */
export const calculatePowerLaw = (x: number, a: number, b: number, h: number, k: number): number => {
  const dx = Math.abs(x - h);
  if (dx === 0 && b < 0) return 1000; // Avoid infinity
  return a * Math.pow(dx, b) + k;
};

/**
 * Generates a path string for an SVG polyline/path representing the power law curve.
 */
export const generatePowerLawPath = (
  a: number,
  b: number,
  h: number,
  k: number,
  xMin: number,
  xMax: number,
  resolution: number = 200
): string => {
  const points: [number, number][] = [];
  const step = (xMax - xMin) / resolution;
  
  for (let x = xMin; x <= xMax; x += step) {
    const y = calculatePowerLaw(x, a, b, h, k);
    // Clamp y to avoid SVG rendering issues with extreme values
    const clampedY = Math.max(-100, Math.min(100, y));
    points.push([x, clampedY]);
  }
  
  return points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p[0]} ${p[1]}`).join(' ');
};

/**
 * Calculates the y-value of a linear curve at point x.
 * f(x) = a * x + b
 */
export const calculateLinear = (x: number, slope: number, intercept: number): number => {
  return slope * x + intercept;
};

/**
 * Generates a path string for an SVG polyline/path representing the linear curve.
 */
export const generateLinearPath = (
  slope: number,
  intercept: number,
  xMin: number,
  xMax: number
): string => {
  const y1 = calculateLinear(xMin, slope, intercept);
  const y2 = calculateLinear(xMax, slope, intercept);
  return `M ${xMin} ${y1} L ${xMax} ${y2}`;
};

/**
 * Calculates the y-value of a quadratic curve at point x.
 * f(x) = a * (x - h)^2 + k
 */
export const calculateQuadratic = (x: number, a: number, h: number, k: number): number => {
  return a * Math.pow(x - h, 2) + k;
};

/**
 * Generates a path string for an SVG polyline/path representing the quadratic curve.
 */
export const generateQuadraticPath = (
  a: number,
  h: number,
  k: number,
  xMin: number,
  xMax: number,
  resolution: number = 200
): string => {
  const points: [number, number][] = [];
  const step = (xMax - xMin) / resolution;
  
  for (let x = xMin; x <= xMax; x += step) {
    const y = calculateQuadratic(x, a, h, k);
    points.push([x, y]);
  }
  
  return points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p[0]} ${p[1]}`).join(' ');
};

/**
 * Maps a value from one range to another.
 */
export const mapRange = (val: number, inMin: number, inMax: number, outMin: number, outMax: number): number => {
  return ((val - inMin) * (outMax - outMin)) / (inMax - inMin) + outMin;
};
