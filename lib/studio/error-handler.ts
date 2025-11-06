/**
 * Централизованная обработка ошибок для Studio
 */

import { ChatSDKError } from "@/lib/errors";
import { toast } from "sonner";

export type StudioErrorContext =
    | "project"
    | "asset"
    | "generation"
    | "template"
    | "upload"
    | "api";

export interface StudioErrorDetails {
    title: string;
    description: string;
    action?: string;
}

/**
 * Обрабатывает ошибку и показывает соответствующий toast
 */
export function handleStudioError(
    error: any,
    context: StudioErrorContext = "api",
): StudioErrorDetails {
    console.error(`Studio ${context} error:`, error);

    // Если это ChatSDKError, используем его сообщения
    if (error instanceof ChatSDKError) {
        return handleChatSDKError(error, context);
    }

    // Обрабатываем стандартные ошибки
    return handleGenericError(error, context);
}

/**
 * Обрабатывает ChatSDKError
 */
function handleChatSDKError(
    error: ChatSDKError,
    context: StudioErrorContext,
): StudioErrorDetails {
    const errorCode = `${error.type}:${error.surface}`;

    let title = "Error";
    let description = error.message;
    let action: string | undefined;

    // Специфичная обработка по типу ошибки
    switch (error.type) {
        case "not_found":
            title = "Not Found";
            if (context === "project") {
                action = "Return to projects";
            }
            break;

        case "forbidden":
            title = "Access Denied";
            action = "Contact support if this is unexpected";
            break;

        case "unauthorized":
            title = "Sign In Required";
            action = "Please sign in to continue";
            break;

        case "rate_limit":
            title = "Rate Limit Exceeded";
            action = "Please try again later";
            break;

        case "bad_request":
            title = "Invalid Request";
            action = "Please check your input and try again";
            break;

        case "offline":
            title = "Service Unavailable";
            action = "Check your connection and try again";
            break;
    }

    return { title, description, action };
}

/**
 * Обрабатывает обычные ошибки
 */
function handleGenericError(
    error: any,
    context: StudioErrorContext,
): StudioErrorDetails {
    const errorMessage = error.message || "An unexpected error occurred";
    let title = "Error";
    let description = errorMessage;
    let action: string | undefined;

    // Определяем тип ошибки по сообщению
    if (errorMessage.includes("rate limit") || errorMessage.includes("quota")) {
        title = "Rate Limit Exceeded";
        description = getRateLimitMessage(context);
        action = "Please try again later";
    } else if (
        errorMessage.includes("authentication") ||
        errorMessage.includes("unauthorized")
    ) {
        title = "Authentication Required";
        description = "Please sign in to continue";
        action = "Sign in";
    } else if (errorMessage.includes("not found")) {
        title = "Not Found";
        description = getNotFoundMessage(context);
    } else if (
        errorMessage.includes("forbidden") ||
        errorMessage.includes("permission")
    ) {
        title = "Access Denied";
        description = "You don't have permission to perform this action";
    } else if (
        errorMessage.includes("invalid") ||
        errorMessage.includes("bad request")
    ) {
        title = "Invalid Input";
        description = "Please check your parameters and try again";
    } else if (
        errorMessage.includes("timeout") ||
        errorMessage.includes("timed out")
    ) {
        title = "Request Timeout";
        description = "The request took too long to complete";
        action = "Please try again";
    } else if (
        errorMessage.includes("offline") ||
        errorMessage.includes("unavailable") ||
        errorMessage.includes("network")
    ) {
        title = "Service Unavailable";
        description = "The service is temporarily unavailable";
        action = "Check your connection and try again";
    } else if (
        errorMessage.includes("too large") || errorMessage.includes("size")
    ) {
        title = "File Too Large";
        description = "The file size exceeds the maximum allowed";
    } else if (
        errorMessage.includes("format") || errorMessage.includes("type")
    ) {
        title = "Invalid Format";
        description = "The file format is not supported";
    }

    return { title, description, action };
}

/**
 * Возвращает сообщение о rate limit в зависимости от контекста
 */
function getRateLimitMessage(context: StudioErrorContext): string {
    switch (context) {
        case "project":
            return "You've reached the maximum number of projects";
        case "asset":
            return "You've reached the maximum number of assets";
        case "generation":
            return "You've reached your generation limit for today";
        case "upload":
            return "You've uploaded too many files recently";
        default:
            return "Rate limit exceeded";
    }
}

/**
 * Возвращает сообщение о not found в зависимости от контекста
 */
function getNotFoundMessage(context: StudioErrorContext): string {
    switch (context) {
        case "project":
            return "The project was not found or may have been deleted";
        case "asset":
            return "The asset was not found or may have been deleted";
        case "generation":
            return "The generation was not found or may have been deleted";
        case "template":
            return "The template was not found or may have been deleted";
        default:
            return "The requested resource was not found";
    }
}

/**
 * Показывает toast с ошибкой
 */
export function showStudioError(
    error: any,
    context: StudioErrorContext = "api",
    duration: number = 5000,
): void {
    const details = handleStudioError(error, context);

    toast.error(details.title, {
        description: details.action
            ? `${details.description}\n${details.action}`
            : details.description,
        duration,
    });
}

/**
 * Показывает успешный toast с дополнительной информацией
 */
export function showStudioSuccess(
    title: string,
    description?: string,
    duration: number = 3000,
): void {
    toast.success(title, {
        description,
        duration,
    });
}

/**
 * Обёртка для async функций с автоматической обработкой ошибок
 */
export async function withErrorHandling<T>(
    fn: () => Promise<T>,
    context: StudioErrorContext,
    successMessage?: { title: string; description?: string },
): Promise<T | null> {
    try {
        const result = await fn();

        if (successMessage) {
            showStudioSuccess(successMessage.title, successMessage.description);
        }

        return result;
    } catch (error) {
        showStudioError(error, context);
        return null;
    }
}
