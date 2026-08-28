import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sortByTrending } from "@/lib/ranking";

export async function GET(req: NextRequest) {
    try {
        const userId = req.headers.get("x-user-id");

        const projects = await prisma.project.findMany({
            include: {
                user: { select: { fullName: true } },
                upvotedBy: userId ? { where: { id: userId } } : false,
                heartedBy: userId ? { where: { id: userId } } : false,
                savedBy: userId ? { where: { id: userId } } : false,
            },
        });

        const projectsWithFlags = projects.map((p) => ({
            id: p.id,
            name: p.name,
            description: p.description,
            link: p.link,
            logoUrl: p.logoUrl,
            tags: p.tags,
            upvotes: p.upvotes,
            hearts: p.hearts,
            saves: p.saves,
            createdAt: p.createdAt,
            user: p.user,
            hasUpvoted: p.upvotedBy?.length > 0,
            hasHearted: p.heartedBy?.length > 0,
            hasSaved: p.savedBy?.length > 0,
        }));

        const sortedProjects = sortByTrending(projectsWithFlags);

        const stats = {
            totalProjects: sortedProjects.length,
            totalUpvotes: sortedProjects.reduce((sum, p) => sum + p.upvotes, 0),
            totalHearts: sortedProjects.reduce((sum, p) => sum + p.hearts, 0),
            totalSaves: sortedProjects.reduce((sum, p) => sum + p.saves, 0),
        };

        return NextResponse.json({ projects: sortedProjects, stats });
    } catch (error) {
        console.log(error);
        return NextResponse.json({ error: "Failed to fetch" }, { status: 500 });
    }
}
