# Gaussian Construction Tool - Developer Guide

This project is a high-performance, interactive web application for visualizing and constructing Gaussian (Normal Distribution) curves. It allows users to manipulate mathematical parameters directly via SVG-based handles.

## 🚀 Technical Stack

- **Framework**: React 19 (Functional Components, Hooks)
- **Styling**: Tailwind CSS (Utility-first CSS)
- **Graphics**: SVG for the primary canvas, HTML5 Canvas for high-resolution exports.
- **Icons**: Lucide React
- **Mathematics**: Custom implementation of the Probability Density Function (PDF) for normal distributions.

## 🏗 Project Structure

- `App.tsx`: Main application state controller (manages curves, global settings, and export logic).
- `types.ts`: TypeScript interfaces for mathematical models and app state.
- `constants.tsx`: Default values, color palettes, and initial view configuration.
- `components/`:
    - `ConstructionCanvas.tsx`: The primary interactive engine. Handles coordinate mapping (Math space to SVG space), panning, and interaction logic.
    - `Handle.tsx`: Generic draggable node component with accessibility hit areas.
    - `Sidebar.tsx`: Administrative panel for curve management and property inputs.
    - `ExportModal.tsx`: Configuration for the high-res PNG generator.
    - `SettingsModal.tsx`: Global UX preferences (theme, language, node size).
- `services/mathUtils.ts`: Pure mathematical functions for Gaussian calculations and SVG path generation.

## 🧮 Mathematical Engine

The core of the application is the Gaussian function:
`f(x) = A * e^(-((x - μ)²) / (2σ²))`

Where:
- `A` (**Amplitude**): The height of the peak.
- `μ` (**Mean/Mu**): The horizontal center of the curve.
- `σ` (**Standard Deviation/Sigma**): The width/spread of the curve.

### Path Generation
Paths are generated in `mathUtils.ts` by sampling the function across the current visible `xMin` to `xMax` range. We use a high resolution (default 250 points) to ensure smoothness even when zoomed in or when the curve is highly leptokurtic (sharp peak).

## 🎨 Coordinate Systems & Panning

The app utilizes a "Math-First" coordinate system:
1.  The SVG `viewBox` is mapped to mathematical units (e.g., -7 to 7 on the X-axis).
2.  `vector-effect: non-scaling-stroke` is applied to paths and axes to ensure lines stay thin regardless of the zoom/pan state.
3.  **Panning**: Implemented via a `panOffset` state. It translates the SVG view window relative to the math origin.

## 📸 Export Mechanism

The export feature (`App.tsx` useEffect) uses a sophisticated "SVG-to-Canvas" pipeline:
1.  Captures the raw SVG DOM.
2.  Serializes it to an XML string.
3.  Loads it into an HTML5 `Image` via a Blob URL.
4.  Renders the image onto a high-resolution `canvas` (scaled up 4x for print quality).
5.  Overlays UI-style elements (Titles, Legends) directly onto the canvas context before triggering a PNG download.

## 🛠 Development Tips

### Adding New Tools
If you want to add a new distribution type (e.g., Cauchy or Poisson):
1.  Add the math function to `mathUtils.ts`.
2.  Update `types.ts` to include the specific parameters for that distribution.
3.  Modify `ConstructionCanvas.tsx` to conditionally render different path generators based on curve type.

### Handling Performance
The app is optimized for real-time interaction. If adding 20+ curves, consider:
- Wrapping `generateGaussianPath` in `useMemo` within the map loop (though currently fast enough for standard use).
- Debouncing the `onUpdateCurve` calls if they trigger expensive side effects.

### Theme Support
The app uses a dual-layer theme approach:
- Tailwind classes for UI elements.
- Dynamic color constants passed into the SVG for grid and axis rendering based on the `theme` state.

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key (useless)
3. Run the app:
   `npm run dev`
