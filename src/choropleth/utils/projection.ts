import * as d3 from 'd3';
import type { ProjectionType } from '../types.ts';

export function getProjection(
  type: ProjectionType,
  width: number,
  height: number,
  center?: [number, number],
  scale?: number,
  rotation?: [number, number, number]
): d3.GeoProjection {
  let projection: d3.GeoProjection;

  switch (type) {
    case 'equirectangular':
      projection = d3.geoEquirectangular();
      break;
    case 'orthographic':
      projection = d3.geoOrthographic();
      break;
    case 'naturalEarth1':
      projection = d3.geoNaturalEarth1();
      break;
    case 'albers':
      projection = d3.geoAlbers();
      break;
    case 'albersUsa':
      projection = d3.geoAlbersUsa();
      break;
    case 'conicEqualArea':
      projection = d3.geoConicEqualArea();
      break;
    case 'mercator':
    default:
      projection = d3.geoMercator();
      break;
  }

  projection.translate([width / 2, height / 2]);

  if (scale !== undefined) {
    projection.scale(scale);
  } else {
    // Auto-fit to container
    projection.scale(Math.min(width, height) / 2 / Math.PI * 0.9);
  }

  if (center && type !== 'albersUsa') {
    projection.center(center);
  }

  if (rotation && type !== 'albersUsa') {
    projection.rotate(rotation);
  }

  return projection;
}
