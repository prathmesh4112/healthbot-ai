

/**
 * Hugging Face API Integration Library
 * Provides utilities for interacting with Hugging Face models
 * Free tier: 30,000 API calls/month
 */

export interface HFModelConfig {
  name: string;
  task: string;
  description: string;
  endpoint: string;
}

export interface HFResponse {
  success: boolean;
  data?: any;
  error?: string;
}

/**
 * Available free models on Hugging Face
 */
export const AVAILABLE_MODELS = {
  // Image Classification
  imageClassification: {
    resnet50: {
      name: "microsoft/resnet-50",
      task: "image-classification",
      description: "General purpose image classification",
      endpoint: "https://api-inference.huggingface.co/models/microsoft/resnet-50",
    },
    vit: {
      name: "google/vit-base-patch16-224",
      task: "image-classification",
      description: "Vision Transformer for image classification",
      endpoint: "https://api-inference.huggingface.co/models/google/vit-base-patch16-224",
    },
  },
  
  // Image Captioning
  imageCaptioning: {
    vitGpt2: {
      name: "nlpconnect/vit-gpt2-image-captioning",
      task: "image-to-text",
      description: "Generate text descriptions from images",
      endpoint: "https://api-inference.huggingface.co/models/nlpconnect/vit-gpt2-image-captioning",
    },
    blip: {
      name: "Salesforce/blip-image-captioning-base",
      task: "image-to-text",
      description: "BLIP model for image captioning",
      endpoint: "https://api-inference.huggingface.co/models/Salesforce/blip-image-captioning-base",
    },
  },
  
  // Object Detection
  objectDetection: {
    detr: {
      name: "facebook/detr-resnet-50",
      task: "object-detection",
      description: "Detect and locate objects in images",
      endpoint: "https://api-inference.huggingface.co/models/facebook/detr-resnet-50",
    },
  },
  
  // Text Generation (for report generation)
  textGeneration: {
    llama: {
      name: "meta-llama/Meta-Llama-3-8B-Instruct",
      task: "text-generation",
      description: "Generate medical reports and analysis",
      endpoint: "https://api-inference.huggingface.co/models/meta-llama/Meta-Llama-3-8B-Instruct",
    },
    mistral: {
      name: "mistralai/Mistral-7B-Instruct-v0.1",
      task: "text-generation",
      description: "Generate detailed text analysis",
      endpoint: "https://api-inference.huggingface.co/models/mistralai/Mistral-7B-Instruct-v0.1",
    },
  },
};

/**
 * Query Hugging Face Inference API
 */
export async function queryHuggingFaceModel(
  endpoint: string,
  data: any,
  apiKey: string,
  options: {
    timeout?: number;
    retries?: number;
    waitForModel?: boolean;
  } = {}
): Promise<HFResponse> {
  const {
    timeout = 30000,
    retries = 3,
    waitForModel = true,
  } = options;

  let lastError: Error | null = null;

  for (let attempt = 0; attempt < retries; attempt++) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeout);

      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": data instanceof Buffer ? "application/octet-stream" : "application/json",
        },
        body: data instanceof Buffer ? data : JSON.stringify({ 
          inputs: data,
          options: { wait_for_model: waitForModel }
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        
        // Handle model loading
        if (response.status === 503) {
          if (attempt < retries - 1) {
            await new Promise(resolve => setTimeout(resolve, 5000 * (attempt + 1)));
            continue;
          }
          throw new Error("Model is loading. Please try again in a few moments.");
        }
        
        throw new Error(errorData.error || `API Error: ${response.statusText}`);
      }

      const result = await response.json();
      
      return {
        success: true,
        data: result,
      };

    } catch (error) {
      lastError = error instanceof Error ? error : new Error("Unknown error");
      
      if (attempt === retries - 1) {
        break;
      }
      
      // Wait before retry
      await new Promise(resolve => setTimeout(resolve, 2000 * (attempt + 1)));
    }
  }

  return {
    success: false,
    error: lastError?.message || "Failed to query model",
  };
}

/**
 * Classify an image using ResNet-50
 */
export async function classifyImage(
  imageBuffer: Buffer,
  apiKey: string
): Promise<HFResponse> {
  const model = AVAILABLE_MODELS.imageClassification.resnet50;
  return queryHuggingFaceModel(model.endpoint, imageBuffer, apiKey);
}

/**
 * Generate caption for an image
 */
export async function captionImage(
  imageBuffer: Buffer,
  apiKey: string
): Promise<HFResponse> {
  const model = AVAILABLE_MODELS.imageCaptioning.vitGpt2;
  return queryHuggingFaceModel(model.endpoint, imageBuffer, apiKey);
}

/**
 * Detect objects in an image
 */
export async function detectObjects(
  imageBuffer: Buffer,
  apiKey: string
): Promise<HFResponse> {
  const model = AVAILABLE_MODELS.objectDetection.detr;
  return queryHuggingFaceModel(model.endpoint, imageBuffer, apiKey);
}

/**
 * Generate medical report using LLM
 */
export async function generateMedicalReport(
  analysisData: any,
  apiKey: string
): Promise<HFResponse> {
  const prompt = `Generate a detailed medical image analysis report based on the following information:

Image Classification Results: ${JSON.stringify(analysisData.classifications)}
Image Description: ${analysisData.description}
Detected Features: ${analysisData.features?.join(", ")}

Please provide:
1. A comprehensive analysis of the image
2. Key observations
3. Potential areas of interest
4. Recommendations for further evaluation

Remember to include appropriate medical disclaimers.`;

  const model = AVAILABLE_MODELS.textGeneration.mistral;
  
  return queryHuggingFaceModel(
    model.endpoint,
    prompt,
    apiKey,
    { timeout: 60000 }
  );
}

/**
 * Batch process multiple images
 */
export async function batchAnalyzeImages(
  imageBuffers: Buffer[],
  apiKey: string,
  maxConcurrent: number = 3
): Promise<HFResponse[]> {
  const results: HFResponse[] = [];
  
  for (let i = 0; i < imageBuffers.length; i += maxConcurrent) {
    const batch = imageBuffers.slice(i, i + maxConcurrent);
    
    const batchPromises = batch.map(buffer => 
      classifyImage(buffer, apiKey)
    );
    
    const batchResults = await Promise.all(batchPromises);
    results.push(...batchResults);
  }
  
  return results;
}

/**
 * Get model status
 */
export async function getModelStatus(
  modelEndpoint: string,
  apiKey: string
): Promise<{
  loaded: boolean;
  state: string;
  error?: string;
}> {
  try {
    const response = await fetch(modelEndpoint, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${apiKey}`,
      },
    });

    if (response.ok) {
      return {
        loaded: true,
        state: "ready",
      };
    }

    if (response.status === 503) {
      return {
        loaded: false,
        state: "loading",
      };
    }

    return {
      loaded: false,
      state: "error",
      error: response.statusText,
    };
  } catch (error) {
    return {
      loaded: false,
      state: "error",
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Validate API key
 */
export async function validateApiKey(apiKey: string): Promise<boolean> {
  try {
    const testEndpoint = AVAILABLE_MODELS.imageClassification.resnet50.endpoint;
    const response = await fetch(testEndpoint, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${apiKey}`,
      },
    });

    return response.status !== 401;
  } catch {
    return false;
  }
}

/**
 * Format analysis results for display
 */
export function formatAnalysisResults(results: any): {
  summary: string;
  confidence: number;
  tags: string[];
  detailed: any[];
} {
  if (!results || !Array.isArray(results)) {
    return {
      summary: "Analysis completed",
      confidence: 0,
      tags: [],
      detailed: [],
    };
  }

  const topResult = results[0];
  const confidence = topResult?.score || 0;
  const tags = results.slice(0, 5).map((r: any) => r.label);
  
  const summary = results.length > 0
    ? `Primary classification: ${topResult.label} (${(confidence * 100).toFixed(1)}% confidence)`
    : "No significant classifications detected";

  return {
    summary,
    confidence,
    tags,
    detailed: results,
  };
}

/**
 * Cache management for API responses
 */
class ResponseCache {
  private cache: Map<string, { data: any; timestamp: number }> = new Map();
  private maxAge: number = 3600000; // 1 hour

  set(key: string, data: any): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
    });
  }

  get(key: string): any | null {
    const entry = this.cache.get(key);
    if (!entry) return null;

    if (Date.now() - entry.timestamp > this.maxAge) {
      this.cache.delete(key);
      return null;
    }

    return entry.data;
  }

  clear(): void {
    this.cache.clear();
  }

  size(): number {
    return this.cache.size;
  }
}

export const responseCache = new ResponseCache();