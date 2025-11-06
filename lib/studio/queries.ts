import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { Database } from "@/lib/supabase/types";
import type {
  StudioAsset,
  StudioGeneration,
  StudioProject,
  StudioTemplate,
} from "./types";

// Database row types (snake_case)
type StudioProjectRow = Database["public"]["Tables"]["StudioProject"]["Row"];
type StudioProjectInsert =
  Database["public"]["Tables"]["StudioProject"]["Insert"];
type StudioProjectUpdate =
  Database["public"]["Tables"]["StudioProject"]["Update"];

type StudioAssetRow = Database["public"]["Tables"]["StudioAsset"]["Row"];
type StudioAssetInsert = Database["public"]["Tables"]["StudioAsset"]["Insert"];

type StudioGenerationRow =
  Database["public"]["Tables"]["StudioGeneration"]["Row"];
type StudioGenerationInsert =
  Database["public"]["Tables"]["StudioGeneration"]["Insert"];
type StudioGenerationUpdate =
  Database["public"]["Tables"]["StudioGeneration"]["Update"];

type StudioTemplateRow = Database["public"]["Tables"]["StudioTemplate"]["Row"];
type StudioTemplateInsert =
  Database["public"]["Tables"]["StudioTemplate"]["Insert"];

// Type conversion helpers
function projectRowToModel(row: StudioProjectRow): StudioProject {
  return {
    id: row.id,
    userId: row.user_id,
    title: row.title,
    description: row.description,
    thumbnail: row.thumbnail,
    settings: row.settings as StudioProject["settings"],
    createdAt: new Date(row.created_at),
    updatedAt: new Date(row.updated_at),
  };
}

function assetRowToModel(row: StudioAssetRow): StudioAsset {
  // If thumbnailUrl is null but we have an image, use the main URL
  // The getAssetPreviewUrl function will handle the transformation
  let thumbnailUrl = row.thumbnail_url;

  // For images without explicit thumbnails, use the main URL
  // (transformations will be applied on the client side)
  if (!thumbnailUrl && row.type === "image") {
    thumbnailUrl = row.url;
  }

  return {
    id: row.id,
    projectId: row.project_id,
    userId: row.user_id,
    type: row.type as StudioAsset["type"],
    name: row.name,
    url: row.url,
    thumbnailUrl,
    metadata: row.metadata as StudioAsset["metadata"],
    sourceType: row.source_type as StudioAsset["sourceType"],
    sourceGenerationId: row.source_generation_id,
    createdAt: new Date(row.created_at),
  };
}

function generationRowToModel(row: StudioGenerationRow): StudioGeneration {
  return {
    id: row.id,
    projectId: row.project_id,
    userId: row.user_id,
    modelId: row.model_id,
    generationType: row.generation_type as StudioGeneration["generationType"],
    status: row.status as StudioGeneration["status"],
    parameters: row.parameters as StudioGeneration["parameters"],
    prompt: row.prompt,
    negativePrompt: row.negative_prompt,
    referenceImageUrl: row.reference_image_url,
    firstFrameUrl: row.first_frame_url,
    lastFrameUrl: row.last_frame_url,
    referenceVideoUrl: row.reference_video_url,
    inputAssetId: row.input_asset_id,
    outputAssetId: row.output_asset_id,
    falRequestId: row.fal_request_id,
    falResponse: row.fal_response as StudioGeneration["falResponse"],
    error: row.error,
    cost: row.cost,
    processingTime: row.processing_time,
    createdAt: new Date(row.created_at),
    completedAt: row.completed_at ? new Date(row.completed_at) : null,
  };
}

function templateRowToModel(row: StudioTemplateRow): StudioTemplate {
  return {
    id: row.id,
    userId: row.user_id,
    name: row.name,
    description: row.description,
    type: row.type as StudioTemplate["type"],
    modelId: row.model_id,
    config: row.config as StudioTemplate["config"],
    thumbnail: row.thumbnail,
    isPublic: row.is_public ?? false,
    usageCount: row.usage_count ?? 0,
    createdAt: new Date(row.created_at),
  };
}

// ============================================================================
// Studio Projects
// ============================================================================

export async function getProjectsByUserId(
  userId: string
): Promise<StudioProject[]> {
  const supabase = await createSupabaseServerClient();

  const { data, error } = await supabase
    .from("StudioProject")
    .select("*")
    .eq("user_id", userId)
    .order("updated_at", { ascending: false });

  if (error) {
    console.error("Error fetching projects:", error);
    throw new Error("Failed to fetch projects");
  }

  return data.map(projectRowToModel);
}

export async function getProjectById(
  id: string
): Promise<StudioProject | null> {
  const supabase = await createSupabaseServerClient();

  const { data, error } = await supabase
    .from("StudioProject")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    console.error("Error fetching project:", error);
    return null;
  }

  return projectRowToModel(data);
}

export async function createProject(
  project: Omit<StudioProject, "id" | "createdAt" | "updatedAt">
): Promise<StudioProject> {
  const supabase = await createSupabaseServerClient();

  const insertData: StudioProjectInsert = {
    user_id: project.userId,
    title: project.title,
    description: project.description,
    thumbnail: project.thumbnail,
    settings:
      project.settings as Database["public"]["Tables"]["StudioProject"]["Insert"]["settings"],
  };

  const { data, error } = await supabase
    .from("StudioProject")
    .insert(insertData)
    .select()
    .single();

  if (error) {
    console.error("Error creating project:", error);
    throw new Error("Failed to create project");
  }

  return projectRowToModel(data);
}

export async function updateProject(
  id: string,
  updates: Partial<
    Omit<StudioProject, "id" | "userId" | "createdAt" | "updatedAt">
  >
): Promise<StudioProject> {
  const supabase = await createSupabaseServerClient();

  const updateData: StudioProjectUpdate = {
    ...(updates.title !== undefined && { title: updates.title }),
    ...(updates.description !== undefined && {
      description: updates.description,
    }),
    ...(updates.thumbnail !== undefined && { thumbnail: updates.thumbnail }),
    ...(updates.settings !== undefined && {
      settings:
        updates.settings as Database["public"]["Tables"]["StudioProject"]["Update"]["settings"],
    }),
    updated_at: new Date().toISOString(),
  };

  const { data, error } = await supabase
    .from("StudioProject")
    .update(updateData)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error("Error updating project:", error);
    throw new Error("Failed to update project");
  }

  return projectRowToModel(data);
}

export async function deleteProject(id: string): Promise<void> {
  const supabase = await createSupabaseServerClient();

  const { error } = await supabase.from("StudioProject").delete().eq("id", id);

  if (error) {
    console.error("Error deleting project:", error);
    throw new Error("Failed to delete project");
  }
}

// ============================================================================
// Studio Assets
// ============================================================================

export async function getAssetsByProjectId(
  projectId: string
): Promise<StudioAsset[]> {
  const supabase = await createSupabaseServerClient();

  const { data, error } = await supabase
    .from("StudioAsset")
    .select("*")
    .eq("project_id", projectId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching assets:", error);
    throw new Error("Failed to fetch assets");
  }

  return data.map(assetRowToModel);
}

export async function getAssetsByUserId(
  userId: string
): Promise<StudioAsset[]> {
  const supabase = await createSupabaseServerClient();

  const { data, error } = await supabase
    .from("StudioAsset")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching assets:", error);
    throw new Error("Failed to fetch assets");
  }

  return data.map(assetRowToModel);
}

export async function getAssetById(id: string): Promise<StudioAsset | null> {
  const supabase = await createSupabaseServerClient();

  const { data, error } = await supabase
    .from("StudioAsset")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    console.error("Error fetching asset:", error);
    return null;
  }

  return assetRowToModel(data);
}

export async function createAsset(
  asset: Omit<StudioAsset, "id" | "createdAt">
): Promise<StudioAsset> {
  const supabase = await createSupabaseServerClient();

  const insertData: StudioAssetInsert = {
    user_id: asset.userId,
    project_id: asset.projectId,
    type: asset.type,
    name: asset.name,
    url: asset.url,
    thumbnail_url: asset.thumbnailUrl,
    metadata:
      asset.metadata as Database["public"]["Tables"]["StudioAsset"]["Insert"]["metadata"],
    source_type: asset.sourceType,
    source_generation_id: asset.sourceGenerationId,
  };

  const { data, error } = await supabase
    .from("StudioAsset")
    .insert(insertData)
    .select()
    .single();

  if (error) {
    console.error("Error creating asset:", error);
    throw new Error("Failed to create asset");
  }

  return assetRowToModel(data);
}

export async function updateAsset(
  id: string,
  updates: Partial<Pick<StudioAsset, "name" | "metadata">>
): Promise<StudioAsset> {
  const supabase = await createSupabaseServerClient();

  const dbUpdates: any = {};

  if (updates.name !== undefined) {
    dbUpdates.name = updates.name;
  }

  if (updates.metadata !== undefined) {
    dbUpdates.metadata = updates.metadata;
  }

  const { data, error } = await supabase
    .from("StudioAsset")
    .update(dbUpdates)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error("Error updating asset:", error);
    throw new Error("Failed to update asset");
  }

  return assetRowToModel(data);
}

export async function deleteAsset(id: string): Promise<void> {
  const supabase = await createSupabaseServerClient();

  const { error } = await supabase.from("StudioAsset").delete().eq("id", id);

  if (error) {
    console.error("Error deleting asset:", error);
    throw new Error("Failed to delete asset");
  }
}

// ============================================================================
// Studio Generations
// ============================================================================

export async function getGenerationsByUserId(
  userId: string
): Promise<StudioGeneration[]> {
  const supabase = await createSupabaseServerClient();

  const { data, error } = await supabase
    .from("StudioGeneration")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching generations:", error);
    throw new Error("Failed to fetch generations");
  }

  return data.map(generationRowToModel);
}

export async function getGenerationsByProjectId(
  projectId: string
): Promise<StudioGeneration[]> {
  const supabase = await createSupabaseServerClient();

  const { data, error } = await supabase
    .from("StudioGeneration")
    .select("*")
    .eq("project_id", projectId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching generations:", error);
    throw new Error("Failed to fetch generations");
  }

  return data.map(generationRowToModel);
}

export async function getGenerationById(
  id: string
): Promise<StudioGeneration | null> {
  const supabase = await createSupabaseServerClient();

  const { data, error } = await supabase
    .from("StudioGeneration")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    console.error("Error fetching generation:", error);
    return null;
  }

  return generationRowToModel(data);
}

export async function createGeneration(
  generation: Omit<StudioGeneration, "id" | "createdAt" | "completedAt">
): Promise<StudioGeneration> {
  const supabase = await createSupabaseServerClient();

  const insertData: StudioGenerationInsert = {
    user_id: generation.userId,
    project_id: generation.projectId,
    model_id: generation.modelId,
    generation_type: generation.generationType,
    status: generation.status,
    prompt: generation.prompt,
    negative_prompt: generation.negativePrompt,
    reference_image_url: generation.referenceImageUrl,
    first_frame_url: generation.firstFrameUrl,
    last_frame_url: generation.lastFrameUrl,
    reference_video_url: generation.referenceVideoUrl,
    input_asset_id: generation.inputAssetId,
    output_asset_id: generation.outputAssetId,
    parameters:
      generation.parameters as Database["public"]["Tables"]["StudioGeneration"]["Insert"]["parameters"],
    fal_request_id: generation.falRequestId,
    fal_response:
      generation.falResponse as Database["public"]["Tables"]["StudioGeneration"]["Insert"]["fal_response"],
    error: generation.error,
    cost: generation.cost,
    processing_time: generation.processingTime,
  };

  const { data, error } = await supabase
    .from("StudioGeneration")
    .insert(insertData)
    .select()
    .single();

  if (error) {
    console.error("Error creating generation:", error);
    throw new Error("Failed to create generation");
  }

  return generationRowToModel(data);
}

export async function updateGeneration(
  id: string,
  updates: Partial<Omit<StudioGeneration, "id" | "userId" | "createdAt">>
): Promise<StudioGeneration> {
  const supabase = await createSupabaseServerClient();

  const updateData: StudioGenerationUpdate = {
    ...(updates.status !== undefined && { status: updates.status }),
    ...(updates.falRequestId !== undefined && {
      fal_request_id: updates.falRequestId,
    }),
    ...(updates.falResponse !== undefined && {
      fal_response:
        updates.falResponse as Database["public"]["Tables"]["StudioGeneration"]["Update"]["fal_response"],
    }),
    ...(updates.outputAssetId !== undefined && {
      output_asset_id: updates.outputAssetId,
    }),
    ...(updates.error !== undefined && { error: updates.error }),
    ...(updates.cost !== undefined && { cost: updates.cost }),
    ...(updates.processingTime !== undefined && {
      processing_time: updates.processingTime,
    }),
    ...(updates.completedAt !== undefined && {
      completed_at: updates.completedAt
        ? updates.completedAt.toISOString()
        : null,
    }),
  };

  const { data, error } = await supabase
    .from("StudioGeneration")
    .update(updateData)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error("Error updating generation:", error);
    throw new Error("Failed to update generation");
  }

  return generationRowToModel(data);
}

// ============================================================================
// Studio Templates
// ============================================================================

export async function getPublicTemplates(): Promise<StudioTemplate[]> {
  const supabase = await createSupabaseServerClient();

  const { data, error } = await supabase
    .from("StudioTemplate")
    .select("*")
    .eq("is_public", true)
    .order("usage_count", { ascending: false });

  if (error) {
    console.error("Error fetching templates:", error);
    throw new Error("Failed to fetch templates");
  }

  return data.map(templateRowToModel);
}

export async function getTemplatesByUserId(
  userId: string
): Promise<StudioTemplate[]> {
  const supabase = await createSupabaseServerClient();

  const { data, error } = await supabase
    .from("StudioTemplate")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching templates:", error);
    throw new Error("Failed to fetch templates");
  }

  return data.map(templateRowToModel);
}

export async function createTemplate(
  template: Omit<StudioTemplate, "id" | "createdAt" | "usageCount">
): Promise<StudioTemplate> {
  const supabase = await createSupabaseServerClient();

  const insertData: StudioTemplateInsert = {
    user_id: template.userId,
    type: template.type,
    name: template.name,
    description: template.description,
    thumbnail: template.thumbnail,
    model_id: template.modelId,
    config:
      template.config as Database["public"]["Tables"]["StudioTemplate"]["Insert"]["config"],
    is_public: template.isPublic,
  };

  const { data, error } = await supabase
    .from("StudioTemplate")
    .insert(insertData)
    .select()
    .single();

  if (error) {
    console.error("Error creating template:", error);
    throw new Error("Failed to create template");
  }

  return templateRowToModel(data);
}

export async function incrementTemplateUsage(id: string): Promise<void> {
  const supabase = await createSupabaseServerClient();

  // Fetch current count and increment
  const { data, error: fetchError } = await supabase
    .from("StudioTemplate")
    .select("usage_count")
    .eq("id", id)
    .single();

  if (fetchError || !data) {
    console.error("Error fetching template:", fetchError);
    return;
  }

  const { error: updateError } = await supabase
    .from("StudioTemplate")
    .update({ usage_count: (data.usage_count ?? 0) + 1 })
    .eq("id", id);

  if (updateError) {
    console.error("Error incrementing template usage:", updateError);
  }
}
