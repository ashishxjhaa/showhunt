"use client"

import { Bar, BarChart, XAxis } from "recharts"
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import {
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
    type ChartConfig,
} from "@/components/ui/chart"
import { Skeleton } from "@/components/ui/skeleton"
import type { ActivityDay } from "@/lib/queries/types"
import { cn } from "@/lib/utils"

const chartConfig = {
    listings: { label: "Listings", color: "#2563eb" },
    upvotes: { label: "Upvotes", color: "#60a5fa" },
} satisfies ChartConfig

interface ProfileActivityChartProps {
    data?: ActivityDay[]
    isLoading?: boolean
    className?: string
}

export default function ProfileActivityChart({
    data,
    isLoading = false,
    className,
}: ProfileActivityChartProps) {
    const chartData = data ?? []

    return (
        <Card className={cn("w-full gap-0 py-0", className)}>
            <CardHeader className="px-6 pt-6 pb-4">
                <CardTitle>Activity</CardTitle>
                <CardDescription>
                    {isLoading
                        ? "Loading…"
                        : "Listings and upvotes for the last 15 days"}
                </CardDescription>
            </CardHeader>
            <CardContent className="px-6 pb-6">
                {isLoading ? (
                    <Skeleton className="h-[250px] w-full rounded-[8px] bg-[var(--paper-border)]" />
                ) : (
                    <ChartContainer config={chartConfig} className="aspect-auto h-[250px] w-full">
                        <BarChart accessibilityLayer data={chartData}>
                            <XAxis
                                dataKey="date"
                                tickLine={false}
                                tickMargin={10}
                                axisLine={false}
                                minTickGap={32}
                                tickFormatter={(value) =>
                                    new Date(value).toLocaleDateString("en-US", {
                                        month: "short",
                                        day: "numeric",
                                    })
                                }
                            />
                            <Bar
                                dataKey="listings"
                                stackId="a"
                                fill="var(--color-listings)"
                            />
                            <Bar
                                dataKey="upvotes"
                                stackId="a"
                                fill="var(--color-upvotes)"
                            />
                            <ChartTooltip
                                content={<ChartTooltipContent />}
                                cursor={false}
                            />
                        </BarChart>
                    </ChartContainer>
                )}
            </CardContent>
        </Card>
    )
}
