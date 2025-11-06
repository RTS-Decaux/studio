import { Image, Sparkles, Video, Wand2 } from "lucide-react";
import Link from "next/link";
import { PlusIcon } from "@/components/icons";
import { ProjectGrid } from "@/components/studio/project/project-grid";
import { StudioHeader } from "@/components/studio/studio-header";
import { Button } from "@/components/ui/button";
import { getProjectsAction } from "@/lib/studio/actions";

export default async function StudioPage() {
  const projects = await getProjectsAction();

  return (
    <div className="flex h-full flex-col">
      <StudioHeader showNewButton={true} title="Projects" />

      <main className="flex-1 overflow-auto">
        {projects.length === 0 ? (
          <div className="flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center px-4">
            {/* Hero Section */}
            <div className="mx-auto max-w-3xl space-y-8 text-center">
              {/* Icon with gradient background */}
              <div className="relative inline-flex">
                <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 via-pink-500/20 to-blue-500/20 blur-3xl" />
                <div className="relative rounded-2xl border border-purple-500/20 bg-gradient-to-br from-purple-500/10 via-pink-500/10 to-blue-500/10 p-6 backdrop-blur-sm">
                  <Sparkles
                    className="h-16 w-16 text-purple-500"
                    strokeWidth={1.5}
                  />
                </div>
              </div>

              {/* Heading */}
              <div className="space-y-4">
                <h1 className="bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 bg-clip-text font-bold text-4xl text-transparent tracking-tight sm:text-5xl">
                  Welcome to AI Studio
                </h1>
                <p className="mx-auto max-w-2xl text-lg text-muted-foreground leading-relaxed">
                  Create stunning AI-generated images and videos with
                  cutting-edge models. From concept to creation, bring your
                  imagination to life.
                </p>
              </div>

              {/* Features Grid */}
              <div className="mx-auto grid max-w-2xl grid-cols-1 gap-4 pt-8 sm:grid-cols-3">
                <div className="flex flex-col items-center gap-2 rounded-lg border border-border bg-card/50 p-4 backdrop-blur-sm">
                  <div className="rounded-full bg-purple-500/10 p-3">
                    <Image
                      className="h-6 w-6 text-purple-500"
                      strokeWidth={1.5}
                    />
                  </div>
                  <h3 className="font-semibold text-sm">Image Generation</h3>
                  <p className="text-center text-muted-foreground text-xs">
                    FLUX, DALL·E, Stable Diffusion
                  </p>
                </div>

                <div className="flex flex-col items-center gap-2 rounded-lg border border-border bg-card/50 p-4 backdrop-blur-sm">
                  <div className="rounded-full bg-pink-500/10 p-3">
                    <Video
                      className="h-6 w-6 text-pink-500"
                      strokeWidth={1.5}
                    />
                  </div>
                  <h3 className="font-semibold text-sm">Video Creation</h3>
                  <p className="text-center text-muted-foreground text-xs">
                    Sora, Runway, Pika Labs
                  </p>
                </div>

                <div className="flex flex-col items-center gap-2 rounded-lg border border-border bg-card/50 p-4 backdrop-blur-sm">
                  <div className="rounded-full bg-blue-500/10 p-3">
                    <Wand2
                      className="h-6 w-6 text-blue-500"
                      strokeWidth={1.5}
                    />
                  </div>
                  <h3 className="font-semibold text-sm">AI Tools</h3>
                  <p className="text-center text-muted-foreground text-xs">
                    Edit, enhance, transform
                  </p>
                </div>
              </div>

              {/* CTA Button */}
              <div className="pt-4">
                <Button
                  asChild
                  className="h-12 bg-gradient-to-r from-purple-600 to-pink-600 px-8 font-semibold text-base shadow-lg shadow-purple-500/25 transition-all hover:from-purple-700 hover:to-pink-700 hover:shadow-purple-500/40 hover:shadow-xl"
                  size="lg"
                >
                  <Link
                    className="inline-flex items-center gap-2"
                    href="/studio/new"
                  >
                    <PlusIcon />
                    Create Your First Project
                  </Link>
                </Button>
                <p className="mt-4 text-muted-foreground text-xs">
                  No credit card required • Free to start
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="p-4 md:p-6 lg:p-8">
            <ProjectGrid projects={projects} />
          </div>
        )}
      </main>
    </div>
  );
}
