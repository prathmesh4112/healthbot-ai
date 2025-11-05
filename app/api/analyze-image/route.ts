import { NextRequest, NextResponse } from "next/server";

/**
 * API Route for Medical Image Analysis
 * Uses Hugging Face Inference API (Free tier)
 * 
 * Supported models:
 * - microsoft/resnet-50 (General image classification)
 * - google/vit-base-patch16-224 (Vision Transformer)
 * - nlpconnect/vit-gpt2-image-captioning (Image to text)
 */

const HUGGINGFACE_API_KEY = process.env.HUGGINGFACE_API_KEY || "";
const HUGGINGFACE_API_URL = "https://api-inference.huggingface.co/models/";

// Free models available on Hugging Face
const MODELS = {
  classification: "microsoft/resnet-50",
  captioning: "nlpconnect/vit-gpt2-image-captioning",
  objectDetection: "facebook/detr-resnet-50",
};

interface ImageAnalysisResult {
  analysis: string;
  confidence?: number;
  tags?: string[];
  detailedResults?: any[];
}

/**
 * Query Hugging Face model
 */
async function queryHuggingFace(
  imageBuffer: Buffer,
  modelName: string
): Promise<any> {
  try {
    const response = await fetch(`${HUGGINGFACE_API_URL}${modelName}`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${HUGGINGFACE_API_KEY}`,
        "Content-Type": "application/octet-stream",
      },
      body: imageBuffer,
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("HuggingFace API Error:", errorText);
      
      // Handle model loading errors
      if (response.status === 503) {
        throw new Error("Model is loading. Please try again in a few moments.");
      }
      
      throw new Error(`API request failed: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error querying Hugging Face:", error);
    throw error;
  }
}

/**
 * Analyze image using multiple models for comprehensive results
 */
async function analyzeImage(imageBuffer: Buffer): Promise<ImageAnalysisResult> {
  try {
    // Run classification model
    const classificationResults = await queryHuggingFace(
      imageBuffer,
      MODELS.classification
    );

    // Run captioning model for description
    const captioningResults = await queryHuggingFace(
      imageBuffer,
      MODELS.captioning
    );

    // Process classification results
    let tags: string[] = [];
    let maxConfidence = 0;
    
    if (Array.isArray(classificationResults)) {
      tags = classificationResults
        .slice(0, 5)
        .map((result: any) => result.label);
      maxConfidence = classificationResults[0]?.score || 0;
    }

    // Process captioning results
    let description = "Image analysis completed.";
    if (Array.isArray(captioningResults) && captioningResults.length > 0) {
      description = captioningResults[0].generated_text || description;
    }

    // Generate comprehensive analysis
    const analysis = generateMedicalAnalysis(
      description,
      tags,
      maxConfidence,
      classificationResults
    );

    return {
      analysis,
      confidence: maxConfidence,
      tags,
      detailedResults: classificationResults,
    };
  } catch (error) {
    console.error("Image analysis error:", error);
    
    // Provide fallback analysis if API fails
    return {
      analysis: generateFallbackAnalysis(error),
      confidence: 0,
      tags: ["analysis-pending"],
    };
  }
}

/**
 * Generate medical-focused analysis from AI results
 */
function generateMedicalAnalysis(
  description: string,
  tags: string[],
  confidence: number,
  detailedResults: any[]
): string {
  const topResults = detailedResults.slice(0, 3);
  
  let analysis = `AI Image Analysis Report\n\n`;
  
  analysis += `Visual Description:\n${description}\n\n`;
  
  if (topResults.length > 0) {
    analysis += `Detected Classifications:\n`;
    topResults.forEach((result: any, idx: number) => {
      const confidencePercent = (result.score * 100).toFixed(1);
      analysis += `${idx + 1}. ${result.label} (${confidencePercent}% confidence)\n`;
    });
    analysis += `\n`;
  }
  
  analysis += `Key Observations:\n`;
  analysis += `• The image has been processed using advanced computer vision models\n`;
  analysis += `• Analysis confidence level: ${(confidence * 100).toFixed(1)}%\n`;
  analysis += `• Multiple detection algorithms were applied for comprehensive analysis\n\n`;
  
  analysis += `Important Notes:\n`;
  analysis += `• This AI analysis is for informational purposes only\n`;
  analysis += `• Results should be reviewed by qualified medical professionals\n`;
  analysis += `• Image quality and positioning can affect analysis accuracy\n`;
  analysis += `• Always consult with healthcare providers for medical diagnosis\n\n`;
  
  analysis += `Recommendations:\n`;
  analysis += `1. Share this analysis with your healthcare provider\n`;
  analysis += `2. Provide additional medical history and context\n`;
  analysis += `3. Consider follow-up imaging if recommended by professionals\n`;
  analysis += `4. Keep a record of this analysis for your medical records\n`;
  
  return analysis;
}

/**
 * Generate fallback analysis when API fails
 */
function generateFallbackAnalysis(error: any): string {
  const errorMessage = error instanceof Error ? error.message : "Unknown error";
  
  return `Image Analysis Status\n\n` +
    `The AI analysis service encountered an issue: ${errorMessage}\n\n` +
    `This may occur when:\n` +
    `• The AI model is temporarily loading or updating\n` +
    `• There's high demand on the service\n` +
    `• The image format needs optimization\n\n` +
    `What you can do:\n` +
    `1. Wait a few moments and try again\n` +
    `2. Ensure your image is in a supported format (JPG, PNG)\n` +
    `3. Try with a different image\n` +
    `4. Check your internet connection\n\n` +
    `Important Reminder:\n` +
    `Even with successful AI analysis, always consult qualified healthcare ` +
    `professionals for accurate medical diagnosis and treatment decisions.`;
}

/**
 * Compare multiple images
 */
function compareImages(results: ImageAnalysisResult[]): string {
  let comparison = `Comparative Analysis of ${results.length} Images\n\n`;
  
  results.forEach((result, idx) => {
    comparison += `Image ${idx + 1}:\n`;
    comparison += `${result.analysis}\n`;
    comparison += `\n${"=".repeat(60)}\n\n`;
  });
  
  comparison += `Comparison Summary:\n`;
  comparison += `• Total images analyzed: ${results.length}\n`;
  comparison += `• Each image was processed independently\n`;
  comparison += `• Results may show variations in similar images\n`;
  comparison += `• Consider all analyses collectively for comprehensive understanding\n`;
  
  return comparison;
}

/**
 * POST handler for image analysis
 */
export async function POST(request: NextRequest) {
  try {
    // Check for API key
    if (!HUGGINGFACE_API_KEY) {
      return NextResponse.json(
        {
          error: "API key not configured. Please set HUGGINGFACE_API_KEY environment variable.",
          analysis: "Service configuration required. Please contact administrator.",
        },
        { status: 500 }
      );
    }

    const formData = await request.formData();
    const images = formData.getAll("images") as File[];
    const compareMode = formData.get("compareMode") === "true";

    if (images.length === 0) {
      return NextResponse.json(
        { error: "No images provided" },
        { status: 400 }
      );
    }

    // Validate image files
    for (const image of images) {
      if (!image.type.startsWith("image/")) {
        return NextResponse.json(
          { error: "Invalid file type. Only images are allowed." },
          { status: 400 }
        );
      }

      if (image.size > 10 * 1024 * 1024) {
        return NextResponse.json(
          { error: "Image size too large. Maximum 10MB per image." },
          { status: 400 }
        );
      }
    }

    // Analyze images
    const analysisResults: ImageAnalysisResult[] = [];
    
    for (const image of images) {
      const arrayBuffer = await image.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      
      const result = await analyzeImage(buffer);
      analysisResults.push(result);
      
      // Limit to prevent timeout on free tier
      if (analysisResults.length >= 3) break;
    }

    // Generate final response
    let finalAnalysis: string;
    let finalConfidence: number | undefined;
    let finalTags: string[] | undefined;

    if (compareMode && analysisResults.length > 1) {
      finalAnalysis = compareImages(analysisResults);
      finalConfidence = analysisResults.reduce((sum, r) => sum + (r.confidence || 0), 0) / analysisResults.length;
      finalTags = Array.from(new Set(analysisResults.flatMap(r => r.tags || [])));
    } else {
      const firstResult = analysisResults[0];
      finalAnalysis = firstResult.analysis;
      finalConfidence = firstResult.confidence;
      finalTags = firstResult.tags;
    }

    return NextResponse.json({
      success: true,
      analysis: finalAnalysis,
      confidence: finalConfidence,
      tags: finalTags,
      imagesAnalyzed: analysisResults.length,
    });

  } catch (error) {
    console.error("Image analysis error:", error);
    
    return NextResponse.json(
      {
        error: "Analysis failed",
        analysis: generateFallbackAnalysis(error),
      },
      { status: 500 }
    );
  }
}

/**
 * GET handler - return API info
 */
export async function GET() {
  return NextResponse.json({
    service: "Medical Image Analysis API",
    version: "1.0.0",
    models: MODELS,
    status: HUGGINGFACE_API_KEY ? "configured" : "not configured",
    maxImageSize: "10MB",
    supportedFormats: ["JPG", "PNG", "WebP", "GIF"],
    features: [
      "Image classification",
      "Image captioning",
      "Confidence scoring",
      "Multi-image comparison",
    ],
  });
}