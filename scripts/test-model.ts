#!/usr/bin/env tsx
/**
 * Quick model testing script
 *
 * Test specific fal.ai models with Studio integration
 *
 * Usage:
 *   tsx scripts/test-model.ts flux-schnell
 *   tsx scripts/test-model.ts veo-2
 *   tsx scripts/test-model.ts --list
 */

import { getStudioService } from "@/lib/studio/service";
import type { GenerationRequest } from "@/lib/studio/types";

const colors = {
  reset: "\x1b[0m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  red: "\x1b[31m",
  cyan: "\x1b[36m",
};

function log(message: string, color = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

const testConfigs: Record<
  string,
  {
    name: string;
    request: GenerationRequest;
    expectedDuration: string;
  }
> = {
  "flux-schnell": {
    name: "FLUX Schnell (Fast Image Generation)",
    request: {
      modelId: "fal-ai/flux/schnell",
      generationType: "text-to-image",
      prompt: "A serene mountain landscape at sunset, photorealistic",
      parameters: {
        image_size: "landscape_16_9",
        num_inference_steps: 4,
      },
    },
    expectedDuration: "5-10 seconds",
  },
  "flux-dev": {
    name: "FLUX Dev (High Quality Image)",
    request: {
      modelId: "fal-ai/flux/dev",
      generationType: "text-to-image",
      prompt: "A futuristic city with flying cars, detailed, cinematic",
      parameters: {
        image_size: "landscape_16_9",
        num_inference_steps: 28,
      },
    },
    expectedDuration: "15-30 seconds",
  },
  "flux-pro": {
    name: "FLUX Pro (Best Quality)",
    request: {
      modelId: "fal-ai/flux-pro",
      generationType: "text-to-image",
      prompt: "A professional portrait photo, studio lighting, high resolution",
      parameters: {
        image_size: "portrait_4_3",
      },
    },
    expectedDuration: "20-40 seconds",
  },
  "veo-2": {
    name: "Veo 2 (Text-to-Video)",
    request: {
      modelId: "fal-ai/veo/v2",
      generationType: "text-to-video",
      prompt: "Ocean waves crashing on a rocky shore at sunset",
      parameters: {
        duration: 5,
        aspect_ratio: "16:9",
      },
    },
    expectedDuration: "30-60 seconds",
  },
  "minimax-video": {
    name: "MiniMax Video-01 (Text-to-Video)",
    request: {
      modelId: "fal-ai/minimax/video-01/text-to-video",
      generationType: "text-to-video",
      prompt: "A cat walking through a garden",
      parameters: {
        duration: 5,
      },
    },
    expectedDuration: "30-90 seconds",
  },
};

async function listModels() {
  log("\nAvailable test models:", colors.cyan);
  log("====================\n", colors.cyan);

  for (const [key, config] of Object.entries(testConfigs)) {
    log(`  ${key}`, colors.blue);
    log(`    ${config.name}`, colors.yellow);
    log(`    Expected: ${config.expectedDuration}`, colors.yellow);
    log("");
  }

  log("Usage: tsx scripts/test-model.ts <model-key>", colors.green);
}

async function testModel(modelKey: string) {
  const config = testConfigs[modelKey];

  if (!config) {
    log(`✗ Unknown model: ${modelKey}`, colors.red);
    log("  Use --list to see available models", colors.yellow);
    process.exit(1);
  }

  log(`\nTesting: ${config.name}`, colors.cyan);
  log("=".repeat(60), colors.cyan);
  log(`Expected duration: ${config.expectedDuration}\n`, colors.yellow);

  const service = getStudioService();

  const startTime = Date.now();
  let lastStatus = "";

  try {
    const result = await service.runGeneration(config.request, {
      onProgress: (update) => {
        if (update.status !== lastStatus) {
          lastStatus = update.status;
          const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
          log(
            `[${elapsed}s] Status: ${update.status}${
              update.position ? ` (queue: ${update.position})` : ""
            }`,
            colors.yellow
          );
        }

        if (update.logs && update.logs.length > 0) {
          const latestLog = update.logs.at(-1);
          if (latestLog) {
            log(`  ${latestLog.message}`, colors.yellow);
          }
        }
      },
      pollInterval: 2000,
      timeout: 600_000,
      logs: true,
    });

    const duration = ((Date.now() - startTime) / 1000).toFixed(1);

    log(`\n✓ Generation completed in ${duration}s`, colors.green);

    if (result.images && result.images.length > 0) {
      log("\nGenerated Images:", colors.blue);
      result.images.forEach((img, i) => {
        log(`  [${i + 1}] ${img.url}`, colors.green);
        log(`      Size: ${img.width}x${img.height}`, colors.yellow);
      });
    }

    if (result.video) {
      log("\nGenerated Video:", colors.blue);
      log(`  ${result.video.url}`, colors.green);
      log(
        `  Size: ${result.video.width}x${result.video.height}`,
        colors.yellow
      );
      if (result.video.duration) {
        log(`  Duration: ${result.video.duration}s`, colors.yellow);
      }
    }

    if (result.timings) {
      log("\nTimings:", colors.blue);
      log(`  Inference: ${result.timings.inference}s`, colors.yellow);
    }

    if (result.seed) {
      log(`\nSeed: ${result.seed}`, colors.yellow);
    }

    log("\n✓ Test passed!", colors.green);
    return true;
  } catch (error: any) {
    const duration = ((Date.now() - startTime) / 1000).toFixed(1);
    log(`\n✗ Test failed after ${duration}s`, colors.red);
    log(`  Error: ${error.message}`, colors.red);

    if (error.code) {
      log(`  Code: ${error.code}`, colors.red);
    }

    if (error.details) {
      log(`  Details: ${JSON.stringify(error.details, null, 2)}`, colors.red);
    }

    console.error(error);
    return false;
  }
}

async function main() {
  const args = process.argv.slice(2);

  if (!process.env.FAL_API_KEY) {
    log("✗ FAL_API_KEY environment variable not set", colors.red);
    log("  Please set FAL_API_KEY in your .env.local file", colors.yellow);
    process.exit(1);
  }

  if (args.length === 0 || args[0] === "--help" || args[0] === "-h") {
    log("\nQuick Model Testing", colors.cyan);
    log("==================\n", colors.cyan);
    log("Usage:", colors.blue);
    log("  tsx scripts/test-model.ts <model-key>", colors.yellow);
    log("  tsx scripts/test-model.ts --list", colors.yellow);
    log("\nExample:", colors.blue);
    log("  tsx scripts/test-model.ts flux-schnell", colors.yellow);
    log("");
    await listModels();
    process.exit(0);
  }

  if (args[0] === "--list" || args[0] === "-l") {
    await listModels();
    process.exit(0);
  }

  const success = await testModel(args[0]);
  process.exit(success ? 0 : 1);
}

main().catch((error) => {
  log(`\n✗ Fatal error: ${error.message}`, colors.red);
  console.error(error);
  process.exit(1);
});
