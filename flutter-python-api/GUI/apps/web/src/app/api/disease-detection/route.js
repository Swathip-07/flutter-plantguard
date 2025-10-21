import sql from "@/app/api/utils/sql";

export async function POST(request) {
  try {
    const { user_id, crop_id, image_url, image_base64 } = await request.json();
    
    if (!user_id || !crop_id || (!image_url && !image_base64)) {
      return Response.json({ 
        error: 'User ID, crop ID, and image are required' 
      }, { status: 400 });
    }

    // Get crop information for context
    const crop = await sql`
      SELECT * FROM crops WHERE id = ${crop_id}
    `;

    if (crop.length === 0) {
      return Response.json({ error: 'Crop not found' }, { status: 404 });
    }

    // Prepare image for AI analysis
    const imageData = image_base64 || image_url;
    const imageFormat = image_base64 ? image_base64 : `data:image/jpeg;base64,${image_url}`;

    // Call GPT Vision API for disease detection
    const aiResponse = await fetch('/integrations/gpt-vision/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: `Analyze this ${crop[0].name_en} crop image for diseases. Please provide:
1. Whether the crop has any disease (yes/no)
2. If diseased, identify the specific disease name
3. Confidence level (0-100%)
4. Detailed description of symptoms observed
5. Severity level (mild/moderate/severe)
6. Recommended immediate actions

Be very specific and accurate in your analysis. Focus on common diseases affecting ${crop[0].name_en} crops.`
              },
              {
                type: 'image_url',
                image_url: {
                  url: imageFormat
                }
              }
            ]
          }
        ]
      })
    });

    if (!aiResponse.ok) {
      throw new Error('AI analysis failed');
    }

    const aiResult = await aiResponse.json();
    const aiContent = aiResult.choices[0].message.content;

    // Parse AI response to extract structured data
    const hasDisease = aiContent.toLowerCase().includes('yes') || 
                      aiContent.toLowerCase().includes('disease') ||
                      aiContent.toLowerCase().includes('infected');
    
    // Extract disease name (simple pattern matching)
    let diseaseName = null;
    let confidenceScore = 0.8; // Default confidence

    if (hasDisease) {
      // Common disease patterns
      const diseasePatterns = [
        'leaf blight', 'powdery mildew', 'rust', 'bacterial wilt',
        'fungal infection', 'viral infection', 'leaf spot', 'root rot',
        'stem borer', 'aphid infestation', 'thrips damage'
      ];
      
      for (const disease of diseasePatterns) {
        if (aiContent.toLowerCase().includes(disease)) {
          diseaseName = disease.charAt(0).toUpperCase() + disease.slice(1);
          break;
        }
      }

      // Extract confidence if mentioned
      const confidenceMatch = aiContent.match(/(\d+)%/);
      if (confidenceMatch) {
        confidenceScore = parseInt(confidenceMatch[1]) / 100;
      }
    }

    // Save detection session to database
    const session = await sql`
      INSERT INTO disease_sessions (
        user_id, crop_id, image_url, has_disease, 
        disease_name, confidence_score, ai_response
      )
      VALUES (
        ${user_id}, ${crop_id}, ${image_url || 'base64_image'}, 
        ${hasDisease}, ${diseaseName}, ${confidenceScore}, ${aiContent}
      )
      RETURNING *
    `;

    return Response.json({
      session: session[0],
      analysis: {
        hasDisease,
        diseaseName,
        confidenceScore,
        aiResponse: aiContent
      }
    });

  } catch (error) {
    console.error('Error in disease detection:', error);
    return Response.json({ 
      error: 'Failed to analyze image for diseases' 
    }, { status: 500 });
  }
}