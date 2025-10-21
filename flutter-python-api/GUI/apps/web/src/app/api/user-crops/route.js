import sql from "@/app/api/utils/sql";

export async function POST(request) {
  try {
    const { user_id, crop_id, planting_date } = await request.json();
    
    if (!user_id || !crop_id) {
      return Response.json({ error: 'User ID and crop ID are required' }, { status: 400 });
    }

    // Check if user already has this crop
    const existingCrop = await sql`
      SELECT * FROM user_crops 
      WHERE user_id = ${user_id} AND crop_id = ${crop_id}
    `;

    if (existingCrop.length > 0) {
      return Response.json({ 
        userCrop: existingCrop[0],
        message: 'Crop already added for this user'
      });
    }

    const newUserCrop = await sql`
      INSERT INTO user_crops (user_id, crop_id, planting_date)
      VALUES (${user_id}, ${crop_id}, ${planting_date || null})
      RETURNING *
    `;

    return Response.json({ userCrop: newUserCrop[0] });
  } catch (error) {
    console.error('Error adding user crop:', error);
    return Response.json({ error: 'Failed to add crop' }, { status: 500 });
  }
}

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const user_id = searchParams.get('user_id');
    const language = searchParams.get('language') || 'en';

    if (!user_id) {
      return Response.json({ error: 'User ID is required' }, { status: 400 });
    }

    const userCrops = await sql`
      SELECT 
        uc.*,
        c.name_en,
        c.name_ta,
        c.name_te,
        c.name_kn,
        c.name_ml,
        CASE 
          WHEN ${language} = 'ta' THEN COALESCE(c.name_ta, c.name_en)
          WHEN ${language} = 'te' THEN COALESCE(c.name_te, c.name_en)
          WHEN ${language} = 'kn' THEN COALESCE(c.name_kn, c.name_en)
          WHEN ${language} = 'ml' THEN COALESCE(c.name_ml, c.name_en)
          ELSE c.name_en
        END as crop_display_name
      FROM user_crops uc
      JOIN crops c ON uc.crop_id = c.id
      WHERE uc.user_id = ${user_id}
      ORDER BY uc.created_at DESC
    `;

    return Response.json({ userCrops });
  } catch (error) {
    console.error('Error fetching user crops:', error);
    return Response.json({ error: 'Failed to fetch user crops' }, { status: 500 });
  }
}