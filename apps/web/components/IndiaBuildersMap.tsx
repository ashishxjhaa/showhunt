'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import Link from 'next/link'
import { geoPath } from 'd3-geo'
import { select } from 'd3-selection'
import { zoom, zoomIdentity } from 'd3-zoom'
import { feature } from 'topojson-client'
import type { Feature, FeatureCollection, MultiPolygon, Polygon } from 'geojson'
import type { GeometryCollection, Topology } from 'topojson-specification'
import indiaTopo from '@/lib/geo/india-states.topo.json'
import {
    fanOffsets,
    fitIndiaProjection,
    stateInterior,
    type StateProps,
} from '@/lib/geo/india-projection'
import UserAvatar from '@/components/UserAvatar'
import type { MapBuilder } from '@/lib/queries/types'
import { indiaStateName } from '@/lib/india-states'
import { cn } from '@/lib/utils'

type StateFeature = Feature<Polygon | MultiPolygon, StateProps>

const topology = indiaTopo as unknown as Topology<{
    states: GeometryCollection<StateProps>
}>

const statesCollection = feature(topology, topology.objects.states) as FeatureCollection<
    Polygon | MultiPolygon,
    StateProps
>

const interiors = new Map<string, [number, number]>()
for (const feat of statesCollection.features) {
    interiors.set(feat.properties.slug, stateInterior(feat as StateFeature))
}

const PIN = 28

interface IndiaBuildersMapProps {
    builders: MapBuilder[]
    highlightUsername?: string
    highlightState?: string | null
}

export default function IndiaBuildersMap({
    builders,
    highlightUsername,
    highlightState,
}: IndiaBuildersMapProps) {
    const viewportRef = useRef<HTMLDivElement>(null)
    const worldRef = useRef<HTMLDivElement>(null)
    const [size, setSize] = useState({ width: 0, height: 0 })
    const [hovered, setHovered] = useState<string | null>(null)

    useEffect(() => {
        const el = viewportRef.current
        if (!el) return
        const ro = new ResizeObserver((entries) => {
            const rect = entries[0]?.contentRect
            if (!rect) return
            setSize({ width: Math.round(rect.width), height: Math.round(rect.height) })
        })
        ro.observe(el)
        return () => ro.disconnect()
    }, [])

    const projection = useMemo(() => {
        if (size.width < 8 || size.height < 8) return null
        return fitIndiaProjection(size.width, size.height, statesCollection)
    }, [size.width, size.height])

    const pathGen = useMemo(() => (projection ? geoPath(projection) : null), [projection])

    const pins = useMemo(() => {
        if (!projection) return []
        const groups = new Map<string, MapBuilder[]>()
        for (const builder of builders) {
            if (!interiors.has(builder.state)) continue
            const list = groups.get(builder.state) ?? []
            list.push(builder)
            groups.set(builder.state, list)
        }

        const placed: {
            builder: MapBuilder
            x: number
            y: number
            active: boolean
        }[] = []

        for (const [slug, group] of groups) {
            const origin = interiors.get(slug)
            if (!origin) continue
            const projected = projection(origin)
            if (!projected) continue
            const [cx, cy] = projected
            const ordered = [...group].sort((a, b) => {
                if (a.username === highlightUsername) return 1
                if (b.username === highlightUsername) return -1
                return a.username.localeCompare(b.username)
            })
            const offsets = fanOffsets(ordered.length, PIN)
            ordered.forEach((builder, i) => {
                const [dx, dy] = offsets[i]
                placed.push({
                    builder,
                    x: cx + dx,
                    y: cy + dy,
                    active: builder.username === highlightUsername,
                })
            })
        }

        return placed
    }, [builders, projection, highlightUsername])

    useEffect(() => {
        const viewport = viewportRef.current
        const world = worldRef.current
        if (!viewport || !world || size.width < 8) return

        const behavior = zoom<HTMLDivElement, unknown>()
            .scaleExtent([1, 8])
            .extent([
                [0, 0],
                [size.width, size.height],
            ])
            .translateExtent([
                [0, 0],
                [size.width, size.height],
            ])
            .filter((event) => {
                if (event.type === 'wheel') return true
                const target = event.target as HTMLElement | null
                if (target?.closest('a')) return false
                return !event.ctrlKey && event.button === 0
            })
            .on('zoom', (event) => {
                const { x, y, k } = event.transform
                world.style.transform = `translate(${x}px, ${y}px) scale(${k})`
            })

        const selection = select(viewport)
        selection.call(behavior)
        selection.call(behavior.transform, zoomIdentity)
        world.style.transform = 'translate(0px, 0px) scale(1)'

        return () => {
            selection.on('.zoom', null)
        }
    }, [size.width, size.height])

    const stateName = indiaStateName(highlightState)

    return (
        <section className="flex h-svh flex-col overflow-hidden rounded-[8px] border border-[var(--paper-border)] bg-[var(--paper-surface)]">
            <div className="flex shrink-0 items-center justify-between border-b border-[var(--paper-border)] px-5 py-3">
                <h2 className="text-sm font-semibold uppercase tracking-wide text-[#3559E9]">
                    {stateName ? `Builder (${stateName})` : 'Builder'}
                </h2>
                <p className="text-xs text-[var(--paper-muted)]">Scroll to zoom · drag to pan</p>
            </div>
            <div
                ref={viewportRef}
                className="relative min-h-0 w-full flex-1 cursor-grab touch-none overflow-hidden bg-[#FBFBFC] active:cursor-grabbing"
            >
                <div
                    ref={worldRef}
                    className="absolute inset-0 origin-top-left will-change-transform"
                >
                    {pathGen && size.width > 0 && (
                        <svg
                            width={size.width}
                            height={size.height}
                            viewBox={`0 0 ${size.width} ${size.height}`}
                            className="absolute inset-0 h-full w-full"
                            aria-hidden="true"
                        >
                            {statesCollection.features.map((feat) => {
                                const slug = feat.properties.slug
                                const d = pathGen(feat)
                                if (!d) return null
                                const active = slug === highlightState
                                return (
                                    <path
                                        key={slug}
                                        d={d}
                                        fill={active ? '#FDF0FA' : '#F3F3F4'}
                                        stroke="#D8D8DA"
                                        strokeWidth={0.7}
                                        strokeLinejoin="round"
                                    />
                                )
                            })}
                        </svg>
                    )}

                    {pins.map(({ builder, x, y, active }) => {
                        const showTip = hovered === builder.username
                        return (
                            <Link
                                key={builder.username}
                                href={`/u/${builder.username}`}
                                title={`${builder.fullName} (@${builder.username})`}
                                onMouseEnter={() => setHovered(builder.username)}
                                onMouseLeave={() => setHovered(null)}
                                className={cn(
                                    'absolute z-10 block hover:z-20',
                                    active && 'z-20'
                                )}
                                style={{
                                    left: x,
                                    top: y,
                                    width: PIN,
                                    height: PIN,
                                    transform: 'translate(-50%, -50%)',
                                }}
                            >
                                <span className="block overflow-hidden rounded-full border border-[var(--paper-border)] bg-white shadow-sm transition-transform hover:scale-110">
                                    <UserAvatar
                                        avatarUrl={builder.avatarUrl}
                                        seed={builder.username}
                                        size={PIN}
                                        alt={`${builder.fullName} avatar`}
                                    />
                                </span>
                                {showTip && (
                                    <span className="pointer-events-none absolute left-1/2 top-full z-30 mt-1.5 w-max -translate-x-1/2 rounded-md border border-[var(--paper-border)] bg-white px-2 py-1 text-xs font-medium text-[var(--paper-ink)] shadow-sm">
                                        {builder.fullName}
                                        <span className="ml-1 text-[var(--paper-muted)]">
                                            @{builder.username}
                                        </span>
                                    </span>
                                )}
                            </Link>
                        )
                    })}
                </div>
            </div>
        </section>
    )
}
