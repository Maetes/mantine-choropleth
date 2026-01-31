import { useEffect, useState } from 'react';
import {
  MantineProvider,
  Container,
  Title,
  Text,
  Stack,
  Group,
  SegmentedControl,
  Switch,
  Select,
  Slider,
  Paper,
  useMantineColorScheme,
  ActionIcon, Button,
} from '@mantine/core';
import { ChoroplethMap, type ProjectionType, type TooltipMode } from './ChoroplethMap';
import '@mantine/core/styles.css';
import type { FeatureCollection } from 'geojson';

// Sample data with country names (Natural Earth "NAME" field)
const mockData = [
  { id: 'United States of America', value: 100, label: 'GDP' },
  { id: 'Germany', value: 80, label: 'GDP' },
  { id: 'France', value: 60, label: 'GDP' },
  { id: 'China', value: 95, label: 'GDP' },
  { id: 'Brazil', value: 45, label: 'GDP' },
  { id: 'Russia', value: 80, label: 'GDP' },
  { id: 'India', value: 55, label: 'GDP' },
  { id: 'Canada', value: 65, label: 'GDP' },
  { id: 'Australia', value: 50, label: 'GDP' },
  { id: 'Japan', value: 85, label: 'GDP' },
  { id: 'United Kingdom', value: 75, label: 'GDP' },
  { id: 'Italy', value: 58, label: 'GDP' },
  { id: 'Spain', value: 52, label: 'GDP' },
  { id: 'Mexico', value: 40, label: 'GDP' },
  { id: 'South Korea', value: 72, label: 'GDP' },
];

const projectionOptions: { value: ProjectionType; label: string }[] = [
  { value: 'mercator', label: 'Mercator' },
  { value: 'naturalEarth1', label: 'Natural Earth' },
  { value: 'equirectangular', label: 'Equirectangular' },
  { value: 'orthographic', label: 'Orthographic (Globe)' },
];

const colorOptions = [
  { value: 'blue', label: 'Blue' },
  { value: 'green', label: 'Green' },
  { value: 'red', label: 'Red' },
  { value: 'orange', label: 'Orange' },
  { value: 'violet', label: 'Violet' },
  { value: 'cyan', label: 'Cyan' },
  { value: 'teal', label: 'Teal' },
];

function ThemeToggle() {
  const { colorScheme, toggleColorScheme } = useMantineColorScheme();
  return (
    <ActionIcon
      variant="outline"
      size="lg"
      onClick={() => toggleColorScheme()}
      title="Toggle color scheme"
    >
      {colorScheme === 'dark' ? '☀️' : '🌙'}
    </ActionIcon>
  );
}

function DemoContent() {
  const [geoJson, setGeoJson] = useState<FeatureCollection | null>();
  const [projection, setProjection] = useState<ProjectionType>('naturalEarth1');
  const [mantineColor, setMantineColor] = useState('blue');
  const [zoomEnabled, setZoomEnabled] = useState(true);
  const [showLegend, setShowLegend] = useState(true);
  const [tooltipMode, setTooltipMode] = useState<TooltipMode>('combined');
  const [animated, setAnimated] = useState(true);
  const [strokeWidth, setStrokeWidth] = useState(0.5);
  const [data, setData] = useState(mockData);

  useEffect(() => {
    // Load world GeoJSON
    // fetch('https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/world.geojson')
    // fetch('https://raw.githubusercontent.com/johan/world.geo.json/refs/heads/master/countries.geo.json')
    fetch('https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/ne_110m_admin_0_countries.geojson')
      .then(res => res.json())
      .then(data => setGeoJson(data));
  }, []);

  // Randomize data for animation demo
  const randomizeData = () => {
    setData(mockData.map(d => ({
      ...d,
      value: Math.round(Math.random() * 100),
    })));
  };

  const increaseRussiaValue = () => {
    setData(data.map(d => d.id === 'Russia' ? { ...d, value: d.value + 10 } : d));
  }

  return (
    <Container size="xl" py="xl">
      <Stack gap="lg">
        <Group justify="space-between" align="center">
          <Title order={2}>Mantine Choropleth Map</Title>
          <ThemeToggle />
        </Group>

        <Text c="dimmed">
          A high-performance, canvas-rendered choropleth map component for Mantine v8.
          Fully configurable with zoom, tooltips, legends, and animations.
        </Text>

        {/* Controls */}
        <Paper p="md" withBorder>
          <Stack gap="md">
            <Group grow>
              <Select
                label="Projection"
                data={projectionOptions}
                value={projection}
                onChange={(val) => setProjection(val as ProjectionType)}
              />
              <Select
                label="Color"
                data={colorOptions}
                value={mantineColor}
                onChange={(val) => setMantineColor(val || 'blue')}
              />
              <div>
                <Text size="sm" fw={500} mb={4}>Tooltip Mode</Text>
                <SegmentedControl
                  fullWidth
                  data={[
                    { value: 'combined', label: 'Combined' },
                    { value: 'hover', label: 'Hover' },
                    { value: 'click', label: 'Click' },
                    { value: 'none', label: 'None' },
                  ]}
                  value={tooltipMode}
                  onChange={(val) => setTooltipMode(val as TooltipMode)}
                />
              </div>
            </Group>

            <Group grow>
              <Switch
                label="Enable Zoom & Pan"
                checked={zoomEnabled}
                onChange={(e) => setZoomEnabled(e.currentTarget.checked)}
              />
              <Switch
                label="Show Legend"
                checked={showLegend}
                onChange={(e) => setShowLegend(e.currentTarget.checked)}
              />
              <Switch
                label="Animated"
                checked={animated}
                onChange={(e) => setAnimated(e.currentTarget.checked)}
              />
            </Group>

            <div>
              <Text size="sm" fw={500} mb={4}>Stroke Width: {strokeWidth}</Text>
              <Slider
                min={0}
                max={2}
                step={0.1}
                value={strokeWidth}
                onChange={setStrokeWidth}
              />
            </div>

            <Group>
              <Button variant="filled" onClick={randomizeData}>
                🎲 Randomize Data (test animation)
              </Button>
              <Button variant="filled" onClick={increaseRussiaValue}>
                📈 Increase Russia GDP
              </Button>
            </Group>
          </Stack>
        </Paper>

        {/* Map */}
        <Paper withBorder style={{ overflow: 'hidden' }}>
          {geoJson ? (
            <ChoroplethMap
              mapData={geoJson}
              data={data}
              propertyKey="NAME"
              height={500}
              projection={projection}
              mantineColor={mantineColor}
              zoomEnabled={zoomEnabled}
              tooltipMode={tooltipMode}
              animated={animated}
              strokeWidth={strokeWidth}
              legend={showLegend ? {
                show: true,
                position: 'bottom-right',
                title: 'GDP Index',
                ticks: 5,
              } : undefined}
              onRegionClick={(feature, dataPoint) => {
                console.log(
                  'Clicked:',
                  feature.properties?.NAME ?? feature.properties?.name,
                  dataPoint
                );
              }}
              onRegionHover={(feature, dataPoint) => {
                if (feature) {
                  console.log(
                    'Hovered:',
                    feature.properties?.NAME ?? feature.properties?.name,
                    dataPoint
                  );
                }
              }}
            />
          ) : (
            <Stack align="center" justify="center" h={500}>
              <Text>Loading map data...</Text>
            </Stack>
          )}
        </Paper>

        {/* Feature List */}
        <Paper p="md" withBorder>
          <Title order={4} mb="sm">Features</Title>
          <Group gap="xs" wrap="wrap">
            {[
              '🎨 Mantine Theme Integration',
              '🗺️ Multiple Projections',
              '🔍 Zoom & Pan',
              '💬 Hover/Click Tooltips',
              '📊 Legend Component',
              '✨ Smooth Animations',
              '🌙 Dark Mode Support',
              '📐 Canvas Rendering',
              '🎯 Hit Testing',
              '📦 TypeScript Support',
            ].map((feature) => (
              <Paper key={feature} p="xs" withBorder radius="sm">
                <Text size="sm">{feature}</Text>
              </Paper>
            ))}
          </Group>
        </Paper>
      </Stack>
    </Container>
  );
}

function App() {
  return (
    <MantineProvider defaultColorScheme="light">
      <DemoContent />
    </MantineProvider>
  );
}

export default App;
