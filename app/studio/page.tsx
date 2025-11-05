import { PlusIcon } from "@/components/icons";
import { ProjectGrid } from "@/components/studio/project/project-grid";
import { StudioHeader } from "@/components/studio/studio-header";
import { Button } from "@/components/ui/button";
import { getProjectsAction } from "@/lib/studio/actions";
import { Image, Sparkles, Video, Wand2 } from "lucide-react";
import Link from "next/link";

export default async function StudioPage() {
  const projects = await getProjectsAction();

  return (
    <div className="flex flex-col h-full">
      <StudioHeader title="Projects" showNewButton={true} />
      
      <main className="flex-1 overflow-auto">
        {projects.length === 0 ? (
          <div className="flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] px-4">
            {/* Hero Section */}
            <div className="max-w-3xl mx-auto text-center space-y-8">
              {/* Icon with gradient background */}
              <div className="relative inline-flex">
                <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 via-pink-500/20 to-blue-500/20 blur-3xl" />
                <div className="relative rounded-2xl bg-gradient-to-br from-purple-500/10 via-pink-500/10 to-blue-500/10 p-6 backdrop-blur-sm border border-purple-500/20">
                  <Sparkles className="h-16 w-16 text-purple-500" strokeWidth={1.5} />
                </div>
              </div>

              {/* Heading */}
              <div className="space-y-4">
                <h1 className="text-4xl sm:text-5xl font-bold tracking-tight bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 bg-clip-text text-transparent">
                  Welcome to AI Studio
                </h1>
                <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                  Create stunning AI-generated images and videos with cutting-edge models.
                  From concept to creation, bring your imagination to life.
                </p>
              </div>

              {/* Features Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-2xl mx-auto pt-8">
                <div className="flex flex-col items-center gap-2 p-4 rounded-lg border border-border bg-card/50 backdrop-blur-sm">
                  <div className="rounded-full bg-purple-500/10 p-3">
                    <Image className="h-6 w-6 text-purple-500" strokeWidth={1.5} />
                  </div>
                  <h3 className="font-semibold text-sm">Image Generation</h3>
                  <p className="text-xs text-muted-foreground text-center">
                    FLUX, DALL·E, Stable Diffusion
                  </p>
                </div>

                <div className="flex flex-col items-center gap-2 p-4 rounded-lg border border-border bg-card/50 backdrop-blur-sm">
                  <div className="rounded-full bg-pink-500/10 p-3">
                    <Video className="h-6 w-6 text-pink-500" strokeWidth={1.5} />
                  </div>
                  <h3 className="font-semibold text-sm">Video Creation</h3>
                  <p className="text-xs text-muted-foreground text-center">
                    Sora, Runway, Pika Labs
                  </p>
                </div>

                <div className="flex flex-col items-center gap-2 p-4 rounded-lg border border-border bg-card/50 backdrop-blur-sm">
                  <div className="rounded-full bg-blue-500/10 p-3">
                    <Wand2 className="h-6 w-6 text-blue-500" strokeWidth={1.5} />
                  </div>
                  <h3 className="font-semibold text-sm">AI Tools</h3>
                  <p className="text-xs text-muted-foreground text-center">
                    Edit, enhance, transform
                  </p>
                </div>
              </div>

              {/* CTA Button */}
              <div className="pt-4">
                <Button 
                  asChild 
                  size="lg" 
                  className="h-12 px-8 text-base font-semibold bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 shadow-lg shadow-purple-500/25 transition-all hover:shadow-xl hover:shadow-purple-500/40"
                >
                  <Link href="/studio/new" className="inline-flex items-center gap-2">
                    <PlusIcon />
                    Create Your First Project
                  </Link>
                </Button>
                <p className="text-xs text-muted-foreground mt-4">
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
