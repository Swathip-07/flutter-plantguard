import sql from "@/app/api/utils/sql";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const language = searchParams.get('language') || 'en';

    const crops = await sql`
      SELECT 
        id,
        name_en,
        name_ta,
        name_te,
        name_kn,
        name_ml,
        CASE 
          WHEN ${language} = 'ta' THEN COALESCE(name_ta, name_en)
          WHEN ${language} = 'te' THEN COALESCE(name_te, name_en)
          WHEN ${language} = 'kn' THEN COALESCE(name_kn, name_en)
          WHEN ${language} = 'ml' THEN COALESCE(name_ml, name_en)
          ELSE name_en
        END as display_name
      FROM crops 
      ORDER BY name_en
    `;

    return Response.json({ crops });
  } catch (error) {
    console.error('Error fetching crops:', error);
    return Response.json({ error: 'Failed to fetch crops' }, { status: 500 });
  }
}