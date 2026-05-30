import { NextResponse } from "next/server";
import { fetchGitHubProjects } from "@/lib/github";
import { GITHUB_USERNAME } from "@/data/projects";

export async function GET() {
  const projects = await fetchGitHubProjects(GITHUB_USERNAME);
  return NextResponse.json({ projects, username: GITHUB_USERNAME });
}
