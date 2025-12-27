# Math Curve Construction Tool - Developer Guide

This project is a high-performance, interactive web application for visualizing and constructing various mathematical curves. It is a versatile tool for manipulating multiple distribution and function types directly via SVG-based handles.

## 🚀 Technical Stack

- **Framework**: React 19 (Functional Components, Hooks)
- **Styling**: Tailwind CSS (Utility-first CSS)
- **Graphics**: SVG for the primary interactive canvas, HTML5 Canvas for high-resolution exports.
- **Icons**: Lucide React
- **Mathematics**: Custom implementations of various probability density functions and algebraic curves.
- **Internationalization**: Built-in support for English and French.

## 🏗 Project Structure

- `App.tsx`: Main application state controller. Manages the collection of curves, global settings, and the export pipeline.
- `types.ts`: TypeScript interfaces for all curve models (Gaussian, Linear, Quadratic, etc.) and application state.
- `constants.tsx`: Default values, color palettes, and initial view configuration.
- `translations.ts`: Localization strings for the UI.
- `components/`:
    - `ConstructionCanvas.tsx`: The primary interactive engine. Handles coordinate mapping (Math space to SVG space), panning, and real-time interaction logic.
    - `Handle.tsx`: Generic draggable node component used to manipulate curve parameters.
    - `Sidebar.tsx`: Management panel for adding, removing, and fine-tuning curves.
    - `ExportModal.tsx`: Configuration for the high-res PNG generator.
    - `SettingsModal.tsx`: Global UX preferences (theme, language, handle size).
    - `CanvasSettingsModal.tsx`: Specific settings for the canvas view (grid, axes, etc.).
- `services/mathUtils.ts`: Pure mathematical functions for curve calculations and SVG path generation.

## 🧮 Mathematical Engine

The application supports five distinct curve types, each with its own set of interactive parameters:

### 1. Gaussian (Normal Distribution)
`f(x) = A * e^(-((x - μ)²) / (2σ²))`
- **A** (Amplitude): Peak height.
- **μ** (Mean): Horizontal center.
- **σ** (Standard Deviation): Curve spread.

### 2. Linear
`f(x) = a * x + b`
- **a** (Slope): Steepness of the line.
- **b** (Intercept): Y-value at x=0.

### 3. Quadratic
`f(x) = a * (x - h)² + k`
- **a** (Curvature): Direction and "width" of the parabola.
- **h** (Vertex X): Horizontal position of the vertex.
- **k** (Vertex Y): Vertical position of the vertex.

### 4. Power Law
`f(x) = a * |x - h|^b + k`
- **a** (Coefficient): Scaling factor.
- **b** (Exponent): Growth/decay rate.
- **h/k**: Positional offsets.

### 5. Exponential
`f(x) = a * base^(x - h) + k`
- **a** (Coefficient): Scaling factor.
- **base**: The base of the exponent.
- **h/k**: Positional offsets.

## 🎨 Interaction & Coordinate Systems

The app utilizes a "Math-First" coordinate system:
1.  **Mapping**: The SVG `viewBox` is dynamically mapped to mathematical units.
2.  **Non-Scaling Strokes**: `vector-effect: non-scaling-stroke` ensures that lines and axes maintain consistent thickness regardless of zoom level.
3.  **Interactive Handles**: Each curve type has specific handles that map SVG drag events back to mathematical parameter changes.

## 📸 Export Mechanism

The export feature uses a sophisticated "SVG-to-Canvas" pipeline:
1.  Captures the raw SVG DOM.
2.  Serializes it to an XML string and loads it into an HTML5 `Image`.
3.  Renders onto a high-resolution `canvas` (scaled for print quality).
4.  Overlays UI elements like titles, legends, and scales directly onto the canvas before downloading as PNG.

## 🛠 Development

### Adding New Curve Types
1.  Define the curve interface in `types.ts`.
2.  Implement the calculation and path generation logic in `mathUtils.ts`.
3.  Add the curve's handle logic in `ConstructionCanvas.tsx`.
4.  Update the `Sidebar.tsx` to allow adding the new type.

### Run Locally

**Prerequisites:** Node.js

1. Install dependencies:
   `npm install`
2. Run the app:
   `npm run dev`
