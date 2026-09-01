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
import { useMyActivity } from "@/lib/queries/hooks"

const chartConfig = {
    listings: { label: "Listings", color: "#2563eb" },
    upvotes: { label: "Upvotes", color: "#60a5fa" },
} satisfies ChartConfig

export default function ProfileActivityChart() {
    const { data, isLoading } = useMyActivity()
    const chartData = data ?? []

    return (
        <Card className="w-full max-w-3xl gap-0 py-0">
            <CardHeader className="px-6 pt-6 pb-4">
                <CardTitle>Activity</CardTitle>
                <CardDescription>
                    {isLoading
                        ? "Loading…"
                        : "Listings and upvotes for the last 15 days"}
                </CardDescription>
            </CardHeader>
            <CardContent className="px-6 pb-6">
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
            </CardContent>
        </Card>
    )
}
