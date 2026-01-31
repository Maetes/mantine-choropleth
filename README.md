# mantine-choropleth

A high-performance, canvas-rendered Choropleth Map component for [Mantine v8](https://mantine.dev/). Fully configurable with zoom, tooltips, legends, animations, and deep Mantine theme integration.

**[📺 Live Demo](https://maetes.github.io/mantine-choropleth/)**

## Features

- 🎨 **Mantine Theme Integration** - Automatically uses your Mantine theme colors and respects dark/light mode
- 🗺️ **Multiple Projections** - Mercator, Natural Earth, Equirectangular, Orthographic, Albers, and more
- 🔍 **Zoom & Pan** - Built-in zoom and pan support with configurable extent
- 💬 **Tooltips** - Hover or click tooltips with custom content support
- 📊 **Legend Component** - Built-in gradient legend with configurable position and styling
- ✨ **Smooth Animations** - Animated transitions when data changes
- 🌙 **Dark Mode Support** - Full dark mode support out of the box
- 📐 **Canvas Rendering** - High-performance canvas rendering for large datasets
- 🎯 **Hit Testing** - Accurate mouse interaction detection on map regions
- 📦 **TypeScript Support** - Full TypeScript support with exported types

## Installation

```bash
npm install mantine-choropleth
# or
yarn add mantine-choropleth
# or
pnpm add mantine-choropleth
```

### Peer Dependencies

This package requires the following peer dependencies:

```json
{
  "@mantine/core": "^8.0.0",
  "@mantine/hooks": "^8.0.0",
  "react": "^18.0.0 || ^19.0.0",
  "react-dom": "^18.0.0 || ^19.0.0"
}
```

## Quick Start

```tsx
import { MantineProvider } from '@mantine/core';
import { ChoroplethMap } from 'mantine-choropleth';
import '@mantine/core/styles.css';

// Your data matching GeoJSON feature IDs
const data = [
  { id: 'USA', value: 100 },
  { id: 'DEU', value: 80 },
  { id: 'FRA', value: 60 },
];

function App() {
  const [geoJson, setGeoJson] = useState(null);

  useEffect(() => {
    // Load your GeoJSON (bring your own!)
    fetch('https://example.com/world.geojson')
      .then(res => res.json())
      .then(setGeoJson);
  }, []);

  return (
    <MantineProvider>
      {geoJson && (
        <ChoroplethMap
          mapData={geoJson}
          data={data}
          propertyKey="iso_a3" // Key in GeoJSON properties to match data.id
          height={500}
        />
      )}
    </MantineProvider>
  );
}
```

## Props

### Required Props

| Prop | Type | Description |
|------|------|-------------|
| `mapData` | `FeatureCollection` | GeoJSON FeatureCollection to render |
| `data` | `ChoroplethDataPoint[]` | Data points to visualize |

### Data Types

```typescript
interface ChoroplethDataPoint {
  id: string;      // Must match GeoJSON feature property
  value: number;   // Value for color scaling
  label?: string;  // Optional label for tooltip
}
```

### Optional Props

#### Layout

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `width` | `number \| string` | `'100%'` | Map width |
| `height` | `number \| string` | `400` | Map height |
| `propertyKey` | `string` | `'id'` | GeoJSON property key to match data IDs |

#### Projection

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `projection` | `ProjectionType` | `'mercator'` | Map projection type |
| `projectionCenter` | `[number, number]` | - | Projection center [lon, lat] |
| `projectionScale` | `number` | - | Projection scale (auto-fit if not set) |
| `projectionRotation` | `[number, number, number]` | - | Projection rotation [λ, φ, γ] |

Available projections: `'mercator'`, `'equirectangular'`, `'orthographic'`, `'naturalEarth1'`, `'albers'`, `'albersUsa'`, `'conicEqualArea'`

#### Colors

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `colorSchemeType` | `ColorSchemeType` | `'sequential'` | Color scheme type |
| `colorInterpolator` | `(t: number) => string` | `d3.interpolateBlues` | D3 color interpolator |
| `categoricalColors` | `string[]` | - | Colors for categorical scheme |
| `useMantineColors` | `boolean` | `true` | Use Mantine theme colors |
| `mantineColor` | `MantineColor` | `'blue'` | Mantine color for sequential scheme |
| `colorDomain` | `[number, number]` | - | Color scale domain (auto-calculated if not set) |
| `divergingMidpoint` | `number` | - | Midpoint for diverging color scale |

Available color scheme types: `'sequential'`, `'diverging'`, `'categorical'`

#### Styling

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `defaultFill` | `string` | Theme-based | Fill color for regions without data |
| `strokeColor` | `string` | Theme-based | Border stroke color |
| `strokeWidth` | `number` | `0.5` | Border stroke width |
| `highlightStrokeColor` | `string` | Theme-based | Stroke color on hover/select |
| `highlightStrokeWidth` | `number` | `2` | Stroke width on hover/select |
| `dimOpacity` | `number` | `0.4` | Opacity for non-hovered regions |

#### Interactivity

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `tooltipMode` | `TooltipMode` | `'hover'` | Tooltip trigger mode |
| `tooltipContent` | `(feature, dataPoint?) => ReactNode` | - | Custom tooltip renderer |
| `zoomEnabled` | `boolean` | `false` | Enable zoom and pan |
| `zoomExtent` | `[number, number]` | `[1, 8]` | Zoom scale extent [min, max] |
| `onRegionClick` | `(feature, dataPoint?) => void` | - | Click callback |
| `onRegionHover` | `(feature \| null, dataPoint?) => void` | - | Hover callback |

Available tooltip modes: `'hover'`, `'click'`, `'none'`

#### Animation

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `animated` | `boolean` | `true` | Enable animations |
| `animationDuration` | `number` | `300` | Animation duration in ms |

#### Legend

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `legend` | `ChoroplethLegendProps` | - | Legend configuration |

```typescript
interface ChoroplethLegendProps {
  show?: boolean;                    // Show/hide legend
  position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
  title?: string;                    // Legend title
  width?: number;                    // Legend width (default: 200)
  height?: number;                   // Gradient height (default: 12)
  ticks?: number;                    // Number of tick labels (default: 5)
}
```

## Examples

### Basic World Map

```tsx
<ChoroplethMap
  mapData={worldGeoJson}
  data={countryData}
  propertyKey="name"
  height={500}
/>
```

### With Zoom and Legend

```tsx
<ChoroplethMap
  mapData={worldGeoJson}
  data={countryData}
  propertyKey="iso_a3"
  height={600}
  zoomEnabled
  legend={{
    show: true,
    position: 'bottom-right',
    title: 'Population',
  }}
/>
```

### Custom Colors and Projection

```tsx
<ChoroplethMap
  mapData={worldGeoJson}
  data={countryData}
  projection="naturalEarth1"
  mantineColor="teal"
  strokeWidth={1}
  height={500}
/>
```

### Click Tooltips with Custom Content

```tsx
<ChoroplethMap
  mapData={worldGeoJson}
  data={countryData}
  tooltipMode="click"
  tooltipContent={(feature, dataPoint) => (
    <div>
      <strong>{feature.properties.name}</strong>
      {dataPoint && <p>Value: {dataPoint.value.toLocaleString()}</p>}
    </div>
  )}
/>
```

### Diverging Color Scale

```tsx
<ChoroplethMap
  mapData={worldGeoJson}
  data={temperatureData}
  colorSchemeType="diverging"
  colorInterpolator={d3.interpolateRdBu}
  colorDomain={[-10, 40]}
  divergingMidpoint={15}
  useMantineColors={false}
/>
```

### Event Handling

```tsx
<ChoroplethMap
  mapData={worldGeoJson}
  data={countryData}
  onRegionClick={(feature, dataPoint) => {
    console.log('Clicked:', feature.properties.name);
    // Navigate, show modal, etc.
  }}
  onRegionHover={(feature, dataPoint) => {
    if (feature) {
      console.log('Hovering:', feature.properties.name);
    }
  }}
/>
```

## GeoJSON Sources

This library does not include any GeoJSON data. Here are some popular sources:

- **World Map**: [Natural Earth](https://www.naturalearthdata.com/)
- **Countries**: [world-atlas](https://github.com/topojson/world-atlas)
- **US States/Counties**: [us-atlas](https://github.com/topojson/us-atlas)
- **D3 Gallery**: [D3 Graph Gallery GeoJSON](https://github.com/holtzy/D3-graph-gallery/tree/master/DATA)

## TypeScript

All types are exported for TypeScript users:

```typescript
import {
  ChoroplethMap,
  type ChoroplethMapProps,
  type ChoroplethDataPoint,
  type ChoroplethLegendProps,
  type ProjectionType,
  type ColorSchemeType,
  type TooltipMode,
} from 'mantine-choropleth';
```

## License

MIT © Martin Mueller
