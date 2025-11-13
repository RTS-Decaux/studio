"use client";

import { AnimatePresence, motion } from "framer-motion";
import {
  CheckCircle2,
  ChevronDown,
  CloudSun,
  FileText,
  Globe,
  Lightbulb,
  Loader2,
  Sparkles,
  WrenchIcon,
} from "lucide-react";
import { type ReactNode, useState } from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

// Icons mapping for different tool types
const toolIcons: Record<string, ReactNode> = {
  "tool-webSearch": <Globe className="size-3.5" />,
  "tool-getWeather": <CloudSun className="size-3.5" />,
  "tool-createDocument": <FileText className="size-3.5" />,
  "tool-updateDocument": <FileText className="size-3.5" />,
  "tool-requestSuggestions": <Lightbulb className="size-3.5" />,
};

// Tool labels
const toolLabels: Record<string, string> = {
  "tool-webSearch": "Web Search",
  "tool-getWeather": "Weather",
  "tool-createDocument": "Create Document",
  "tool-updateDocument": "Update Document",
  "tool-requestSuggestions": "Suggestions",
};

type ReasoningStep = {
  type: "reasoning" | "tool";
  title: string;
  content?: string;
  toolType?: string;
  state?: string;
  isStreaming?: boolean;
};

type ReasoningTraceProps = {
  steps: ReasoningStep[];
  isStreaming?: boolean;
};

function StepIcon({
  type,
  toolType,
  state,
  isStreaming,
}: {
  type: "reasoning" | "tool";
  toolType?: string;
  state?: string;
  isStreaming?: boolean;
}) {
  if (type === "reasoning") {
    return (
      <div className="flex size-6 items-center justify-center rounded-full bg-purple-500/10">
        <Sparkles className="size-3.5 text-purple-600 dark:text-purple-400" />
      </div>
    );
  }

  if (state === "input-available" || isStreaming) {
    return (
      <div className="flex size-6 items-center justify-center rounded-full bg-blue-500/10">
        <Loader2 className="size-3.5 animate-spin text-blue-600 dark:text-blue-400" />
      </div>
    );
  }

  if (state === "output-available") {
    return (
      <div className="flex size-6 items-center justify-center rounded-full bg-green-500/10">
        <CheckCircle2 className="size-3.5 text-green-600 dark:text-green-400" />
      </div>
    );
  }

  return (
    <div className="flex size-6 items-center justify-center rounded-full bg-muted">
      {toolType && toolIcons[toolType] ? (
        <div className="text-muted-foreground">{toolIcons[toolType]}</div>
      ) : (
        <WrenchIcon className="size-3.5 text-muted-foreground" />
      )}
    </div>
  );
}

function ReasoningStepItem({
  step,
  isLast,
  index,
}: {
  step: ReasoningStep;
  isLast: boolean;
  index: number;
}) {
  const [isExpanded, setIsExpanded] = useState(false);
  const hasContent = step.content && step.content.length > 0;

  return (
    <motion.div
      animate={{ opacity: 1, y: 0 }}
      className="relative"
      initial={{ opacity: 0, y: 10 }}
      transition={{ delay: index * 0.05, duration: 0.2 }}
    >
      {/* Connecting line */}
      {!isLast && (
        <div className="absolute top-6 left-3 h-full w-px bg-border" />
      )}

      <div className="flex items-start gap-3">
        <StepIcon
          isStreaming={step.isStreaming}
          state={step.state}
          toolType={step.toolType}
          type={step.type}
        />

        <div className="min-w-0 flex-1 pb-4">
          <button
            className={cn(
              "flex w-full items-center justify-between gap-2 text-left transition-colors",
              hasContent && "cursor-pointer hover:text-foreground"
            )}
            disabled={!hasContent}
            onClick={() => hasContent && setIsExpanded(!isExpanded)}
            type="button"
          >
            <div className="flex min-w-0 flex-1 items-center gap-2">
              <span className="truncate font-medium text-sm">{step.title}</span>
              {step.isStreaming && (
                <Badge className="rounded-full" variant="secondary">
                  <Loader2 className="mr-1 size-3 animate-spin" />
                  Running
                </Badge>
              )}
            </div>

            {hasContent && (
              <ChevronDown
                className={cn(
                  "size-4 shrink-0 text-muted-foreground transition-transform",
                  isExpanded && "rotate-180"
                )}
              />
            )}
          </button>

          <AnimatePresence>
            {isExpanded && hasContent && (
              <motion.div
                animate={{ height: "auto", opacity: 1 }}
                className="overflow-hidden"
                exit={{ height: 0, opacity: 0 }}
                initial={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <div className="mt-2 rounded-lg bg-muted/50 px-3 py-2 text-muted-foreground text-xs leading-relaxed">
                  {step.content}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
}

export function ReasoningTrace({ steps, isStreaming }: ReasoningTraceProps) {
  if (steps.length === 0) {
    return null;
  }

  // Get summary of steps for the trigger
  const completedSteps = steps.filter(
    (s) => !s.isStreaming && s.state === "output-available"
  ).length;
  const totalSteps = steps.length;

  return (
    <Accordion
      className="not-prose mb-4"
      collapsible
      data-testid="reasoning-trace"
      type="single"
    >
      <AccordionItem className="rounded-lg border bg-card" value="thinking">
        <AccordionTrigger className="px-4 py-3 hover:no-underline">
          <div className="flex items-center gap-2">
            <Sparkles className="size-4 text-purple-600 dark:text-purple-400" />
            <span className="font-semibold text-sm">Thinking Process</span>
            {isStreaming ? (
              <Badge className="ml-2 rounded-full" variant="secondary">
                <Loader2 className="mr-1 size-3 animate-spin" />
                Processing
              </Badge>
            ) : (
              <Badge className="ml-2 rounded-full" variant="secondary">
                {completedSteps}/{totalSteps} steps
              </Badge>
            )}
          </div>
        </AccordionTrigger>
        <AccordionContent className="px-4 pb-4">
          <div className="space-y-0 pt-2">
            {steps.map((step, index) => (
              <ReasoningStepItem
                index={index}
                isLast={index === steps.length - 1}
                key={`step-${index}`}
                step={step}
              />
            ))}
          </div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}
