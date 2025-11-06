#!/usr/bin/env tsx
/**
 * Manual testing script for fal.ai SDK integration
 *
 * Run: tsx scripts/test-fal-integration.ts
 *
 * Prerequisites:
 * - FAL_API_KEY environment variable set
 * - Supabase running (for database operations)
 */

import { getFalClient } from "@/lib/studio/fal";
import { getStudioService } from "@/lib/studio/service";
import type { GenerationRequest } from "@/lib/studio/types";

// ANSI color codes for pretty output
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

function section(title: string) {
    console.log(`\n${"=".repeat(60)}`);
    log(title, colors.cyan);
    console.log(`${"=".repeat(60)}\n`);
}

async function testFalClient() {
    section("Testing FalClient");

    try {
        const client = getFalClient();
        log("✓ FalClient created successfully", colors.green);

        // Test 1: Submit generation
        log("\n1. Testing submit()...", colors.blue);
        const submitResult = await client.submit("fal-ai/flux/schnell", {
            prompt: "A serene mountain landscape at sunset",
            image_size: "landscape_16_9",
            num_inference_steps: 4,
        });

        log(`✓ Submitted: ${submitResult.requestId}`, colors.green);

        // Test 2: Check status
        log("\n2. Testing getStatus()...", colors.blue);
        let status = await client.getStatus(
            "fal-ai/flux/schnell",
            submitResult.requestId,
            true,
        );
        log(`✓ Status: ${status.status}`, colors.green);
        if (status.position) {
            log(`  Queue position: ${status.position}`, colors.yellow);
        }

        // Test 3: Poll until completion
        log("\n3. Polling for completion...", colors.blue);
        let attempts = 0;
        const maxAttempts = 60; // 2 minutes max

        while (
            (status.status === "IN_QUEUE" || status.status === "IN_PROGRESS") &&
            attempts < maxAttempts
        ) {
            await new Promise((resolve) => setTimeout(resolve, 2000));
            status = await client.getStatus(
                "fal-ai/flux/schnell",
                submitResult.requestId,
                true,
            );
            attempts++;

            if (status.logs && status.logs.length > 0) {
                const latestLog = status.logs[status.logs.length - 1];
                log(`  ${latestLog.message}`, colors.yellow);
            }

            log(
                `  Status: ${status.status}${
                    status.position ? ` (queue pos: ${status.position})` : ""
                }`,
                colors.yellow,
            );
        }

        if (status.status === "COMPLETED") {
            log("✓ Generation completed!", colors.green);

            // Test 4: Get result
            log("\n4. Testing getResult()...", colors.blue);
            const result = await client.getResult(
                "fal-ai/flux/schnell",
                submitResult.requestId,
            );

            if (result.images && result.images.length > 0) {
                log(`✓ Image generated: ${result.images[0].url}`, colors.green);
                log(
                    `  Size: ${result.images[0].width}x${
                        result.images[0].height
                    }`,
                    colors.yellow,
                );
                if (result.timings) {
                    log(
                        `  Inference time: ${result.timings.inference}s`,
                        colors.yellow,
                    );
                }
            }
        } else {
            log(
                `✗ Generation failed or timed out: ${status.status}`,
                colors.red,
            );
            if (status.error) {
                log(`  Error: ${status.error}`, colors.red);
            }
        }

        // Test 5: File upload (optional)
        log("\n5. Testing uploadFile() (skipped - no file)", colors.yellow);

        log("\n✓ FalClient tests completed", colors.green);
        return true;
    } catch (error: any) {
        log(`✗ FalClient test failed: ${error.message}`, colors.red);
        console.error(error);
        return false;
    }
}

async function testStudioService() {
    section("Testing StudioService");

    try {
        const service = getStudioService();
        log("✓ StudioService created successfully", colors.green);

        // Test 1: Run generation with progress tracking
        log("\n1. Testing runGeneration() with progress...", colors.blue);

        const request: GenerationRequest = {
            modelId: "fal-ai/flux/schnell",
            generationType: "text-to-image",
            prompt: "A futuristic city with flying cars",
            parameters: {
                image_size: "square_hd",
                num_inference_steps: 4,
            },
        };

        const result = await service.runGeneration(request, {
            onProgress: (update) => {
                log(
                    `  Progress: ${update.status}${
                        update.position ? ` (pos: ${update.position})` : ""
                    }`,
                    colors.yellow,
                );
                if (update.logs && update.logs.length > 0) {
                    const latestLog = update.logs[update.logs.length - 1];
                    log(`    ${latestLog.message}`, colors.yellow);
                }
            },
            pollInterval: 2000,
            timeout: 120_000,
            logs: true,
        });

        if (result.images && result.images.length > 0) {
            log(
                `✓ Generation completed: ${result.images[0].url}`,
                colors.green,
            );
        } else if (result.video) {
            log(`✓ Video generated: ${result.video.url}`, colors.green);
        }

        log("\n✓ StudioService tests completed", colors.green);
        return true;
    } catch (error: any) {
        log(`✗ StudioService test failed: ${error.message}`, colors.red);
        console.error(error);
        return false;
    }
}

async function testErrorHandling() {
    section("Testing Error Handling");

    try {
        const client = getFalClient();

        // Test 1: Invalid model
        log("\n1. Testing invalid model ID...", colors.blue);
        try {
            await client.submit("invalid/model", { prompt: "Test" });
            log("✗ Should have thrown error", colors.red);
        } catch (error: any) {
            log(`✓ Correctly threw error: ${error.message}`, colors.green);
        }

        // Test 2: Invalid request ID
        log("\n2. Testing invalid request ID...", colors.blue);
        try {
            await client.getStatus("fal-ai/flux/schnell", "invalid-request-id");
            log("✗ Should have thrown error", colors.red);
        } catch (error: any) {
            log(`✓ Correctly threw error: ${error.message}`, colors.green);
        }

        log("\n✓ Error handling tests completed", colors.green);
        return true;
    } catch (error: any) {
        log(`✗ Error handling test failed: ${error.message}`, colors.red);
        console.error(error);
        return false;
    }
}

async function main() {
    log("fal.ai SDK Integration Test", colors.cyan);
    log("============================\n", colors.cyan);

    // Check prerequisites
    if (!process.env.FAL_API_KEY) {
        log("✗ FAL_API_KEY environment variable not set", colors.red);
        log("  Please set FAL_API_KEY in your .env.local file", colors.yellow);
        process.exit(1);
    }

    log("Prerequisites:", colors.blue);
    log(
        `✓ FAL_API_KEY: ${process.env.FAL_API_KEY.slice(0, 10)}...`,
        colors.green,
    );

    const results: boolean[] = [];

    // Run tests
    results.push(await testFalClient());
    results.push(await testStudioService());
    results.push(await testErrorHandling());

    // Summary
    section("Test Summary");
    const passed = results.filter(Boolean).length;
    const total = results.length;

    if (passed === total) {
        log(`✓ All tests passed (${passed}/${total})`, colors.green);
        process.exit(0);
    } else {
        log(`✗ Some tests failed (${passed}/${total})`, colors.red);
        process.exit(1);
    }
}

// Run tests
main().catch((error) => {
    log(`\n✗ Fatal error: ${error.message}`, colors.red);
    console.error(error);
    process.exit(1);
});
