export type ErrorType =
  | "bad_request"
  | "unauthorized"
  | "forbidden"
  | "not_found"
  | "rate_limit"
  | "offline";

export type Surface =
  | "chat"
  | "auth"
  | "api"
  | "stream"
  | "database"
  | "history"
  | "vote"
  | "document"
  | "suggestions"
  | "activate_gateway"
  | "studio_project"
  | "studio_asset"
  | "studio_generation"
  | "studio_template"
  | "fal_api"
  | "file_upload";

export type ErrorCode = `${ErrorType}:${Surface}`;

export type ErrorVisibility = "response" | "log" | "none";

export const visibilityBySurface: Record<Surface, ErrorVisibility> = {
  database: "log",
  chat: "response",
  auth: "response",
  stream: "response",
  api: "response",
  history: "response",
  vote: "response",
  document: "response",
  suggestions: "response",
  activate_gateway: "response",
  studio_project: "response",
  studio_asset: "response",
  studio_generation: "response",
  studio_template: "response",
  fal_api: "response",
  file_upload: "response",
};

export class ChatSDKError extends Error {
  type: ErrorType;
  surface: Surface;
  statusCode: number;

  constructor(errorCode: ErrorCode, cause?: string) {
    super();

    const [type, surface] = errorCode.split(":");

    this.type = type as ErrorType;
    this.cause = cause;
    this.surface = surface as Surface;
    this.message = getMessageByErrorCode(errorCode);
    this.statusCode = getStatusCodeByType(this.type);
  }

  toResponse() {
    const code: ErrorCode = `${this.type}:${this.surface}`;
    const visibility = visibilityBySurface[this.surface];

    const { message, cause, statusCode } = this;

    if (visibility === "log") {
      console.error({
        code,
        message,
        cause,
      });

      return Response.json(
        { code: "", message: "Something went wrong. Please try again later." },
        { status: statusCode }
      );
    }

    return Response.json({ code, message, cause }, { status: statusCode });
  }
}

export function getMessageByErrorCode(errorCode: ErrorCode): string {
  if (errorCode.includes("database")) {
    return "An error occurred while executing a database query.";
  }

  switch (errorCode) {
    case "bad_request:api":
      return "The request couldn't be processed. Please check your input and try again.";

    case "bad_request:activate_gateway":
      return "AI Gateway requires a valid credit card on file to service requests. Please visit https://vercel.com/d?to=%2F%5Bteam%5D%2F%7E%2Fai%3Fmodal%3Dadd-credit-card to add a card and unlock your free credits.";

    case "unauthorized:auth":
      return "You need to sign in before continuing.";
    case "forbidden:auth":
      return "Your account does not have access to this feature.";

    case "rate_limit:chat":
      return "You have exceeded your maximum number of messages for the day. Please try again later.";
    case "not_found:chat":
      return "The requested chat was not found. Please check the chat ID and try again.";
    case "forbidden:chat":
      return "This chat belongs to another user. Please check the chat ID and try again.";
    case "unauthorized:chat":
      return "You need to sign in to view this chat. Please sign in and try again.";
    case "offline:chat":
      return "We're having trouble sending your message. Please check your internet connection and try again.";

    case "not_found:document":
      return "The requested document was not found. Please check the document ID and try again.";
    case "forbidden:document":
      return "This document belongs to another user. Please check the document ID and try again.";
    case "unauthorized:document":
      return "You need to sign in to view this document. Please sign in and try again.";
    case "bad_request:document":
      return "The request to create or update the document was invalid. Please check your input and try again.";

    // Studio Project Errors
    case "not_found:studio_project":
      return "The requested project was not found. Please check the project ID and try again.";
    case "forbidden:studio_project":
      return "This project belongs to another user. You don't have permission to access it.";
    case "unauthorized:studio_project":
      return "You need to sign in to access this project. Please sign in and try again.";
    case "bad_request:studio_project":
      return "The project data is invalid. Please check your input and try again.";
    case "rate_limit:studio_project":
      return "You have reached the maximum number of projects. Please delete some projects or upgrade your plan.";

    // Studio Asset Errors
    case "not_found:studio_asset":
      return "The requested asset was not found. It may have been deleted.";
    case "forbidden:studio_asset":
      return "This asset belongs to another user. You don't have permission to access it.";
    case "unauthorized:studio_asset":
      return "You need to sign in to access this asset. Please sign in and try again.";
    case "bad_request:studio_asset":
      return "The asset data is invalid. Please check your input and try again.";
    case "rate_limit:studio_asset":
      return "You have reached the maximum number of assets. Please delete some assets or upgrade your plan.";

    // Studio Generation Errors
    case "not_found:studio_generation":
      return "The requested generation was not found. It may have been deleted.";
    case "forbidden:studio_generation":
      return "This generation belongs to another user. You don't have permission to access it.";
    case "unauthorized:studio_generation":
      return "You need to sign in to start a generation. Please sign in and try again.";
    case "bad_request:studio_generation":
      return "The generation request is invalid. Please check your parameters and try again.";
    case "rate_limit:studio_generation":
      return "You have exceeded your generation quota. Please wait or upgrade your plan.";

    // Studio Template Errors
    case "not_found:studio_template":
      return "The requested template was not found. It may have been deleted.";
    case "forbidden:studio_template":
      return "This template is private. You don't have permission to access it.";
    case "unauthorized:studio_template":
      return "You need to sign in to access templates. Please sign in and try again.";
    case "bad_request:studio_template":
      return "The template data is invalid. Please check your input and try again.";

    // fal.ai API Errors
    case "bad_request:fal_api":
      return "The generation request was rejected by the AI service. Please check your parameters.";
    case "unauthorized:fal_api":
      return "AI service authentication failed. Please contact support.";
    case "forbidden:fal_api":
      return "This AI model is not available in your plan. Please upgrade or choose a different model.";
    case "not_found:fal_api":
      return "The requested AI model was not found. It may have been deprecated.";
    case "rate_limit:fal_api":
      return "AI service rate limit exceeded. Please wait a moment and try again.";
    case "offline:fal_api":
      return "AI service is temporarily unavailable. Please try again later.";

    // File Upload Errors
    case "bad_request:file_upload":
      return "The file format is not supported or the file is too large. Please check and try again.";
    case "unauthorized:file_upload":
      return "You need to sign in to upload files. Please sign in and try again.";
    case "forbidden:file_upload":
      return "You don't have permission to upload files to this location.";
    case "rate_limit:file_upload":
      return "You have uploaded too many files. Please wait a moment and try again.";
    case "offline:file_upload":
      return "File upload service is temporarily unavailable. Please check your connection and try again.";

    default:
      return "Something went wrong. Please try again later.";
  }
}

function getStatusCodeByType(type: ErrorType) {
  switch (type) {
    case "bad_request":
      return 400;
    case "unauthorized":
      return 401;
    case "forbidden":
      return 403;
    case "not_found":
      return 404;
    case "rate_limit":
      return 429;
    case "offline":
      return 503;
    default:
      return 500;
  }
}
