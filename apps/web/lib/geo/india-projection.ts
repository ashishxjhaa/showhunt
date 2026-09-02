import { geoConicEqualArea, type GeoProjection } from "d3-geo"
import polylabel from "polylabel"
import type { Feature, FeatureCollection, MultiPolygon, Polygon, Position } from "geojson"

export type StateProps = { name: string; slug: string }

const PAD = 28

function ringArea(ring: Position[]): number {
  let area = 0
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const [x0, y0] = ring[j]
    const [x1, y1] = ring[i]
    area += x0 * y1 - x1 * y0
  }
  return Math.abs(area / 2)
}

function largestPolygon(geom: Polygon | MultiPolygon): Position[][] {
  if (geom.type === "Polygon") return geom.coordinates
  let best = geom.coordinates[0]
  let bestArea = 0
  for (const poly of geom.coordinates) {
    const area = ringArea(poly[0] ?? [])
    if (area > bestArea) {
      best = poly
      bestArea = area
    }
  }
  return best
}

export function stateInterior(feature: Feature<Polygon | MultiPolygon, StateProps>): [number, number] {
  const poly = largestPolygon(feature.geometry)
  const pt = polylabel(poly as unknown as [number, number][][], 0.01)
  return [pt[0], pt[1]]
}

export function fanOffsets(count: number, avatarSize: number): [number, number][] {
  if (count <= 1) return [[0, 0]]
  const radius = Math.max(avatarSize * 0.62, avatarSize * 0.38 * Math.sqrt(count))
  return Array.from({ length: count }, (_, i) => {
    const angle = -Math.PI / 2 + (2 * Math.PI * i) / count
    return [Math.cos(angle) * radius, Math.sin(angle) * radius]
  })
}

export function fitIndiaProjection(
  width: number,
  height: number,
  object: FeatureCollection
): GeoProjection {
  return geoConicEqualArea()
    .rotate([-80, 0])
    .center([0, 23])
    .parallels([12, 38])
    .fitExtent(
      [
        [PAD, PAD],
        [Math.max(PAD + 1, width - PAD), Math.max(PAD + 1, height - PAD)],
      ],
      object
    )
}
