import sql from "@/app/api/utils/sql";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const disease_name = searchParams.get('disease_name');
    const language = searchParams.get('language') || 'en';

    if (!disease_name) {
      return Response.json({ error: 'Disease name is required' }, { status: 400 });
    }

    const medications = await sql`
      SELECT 
        id,
        disease_name,
        medication_name_en,
        medication_name_ta,
        medication_name_te,
        medication_name_kn,
        medication_name_ml,
        CASE 
          WHEN ${language} = 'ta' THEN COALESCE(medication_name_ta, medication_name_en)
          WHEN ${language} = 'te' THEN COALESCE(medication_name_te, medication_name_en)
          WHEN ${language} = 'kn' THEN COALESCE(medication_name_kn, medication_name_en)
          WHEN ${language} = 'ml' THEN COALESCE(medication_name_ml, medication_name_en)
          ELSE medication_name_en
        END as medication_display_name,
        CASE 
          WHEN ${language} = 'ta' THEN COALESCE(description_ta, description_en)
          WHEN ${language} = 'te' THEN COALESCE(description_te, description_en)
          WHEN ${language} = 'kn' THEN COALESCE(description_kn, description_en)
          WHEN ${language} = 'ml' THEN COALESCE(description_ml, description_en)
          ELSE description_en
        END as description,
        CASE 
          WHEN ${language} = 'ta' THEN COALESCE(application_method_ta, application_method_en)
          WHEN ${language} = 'te' THEN COALESCE(application_method_te, application_method_en)
          WHEN ${language} = 'kn' THEN COALESCE(application_method_kn, application_method_en)
          WHEN ${language} = 'ml' THEN COALESCE(application_method_ml, application_method_en)
          ELSE application_method_en
        END as application_method,
        image_url
      FROM medications 
      WHERE LOWER(disease_name) LIKE LOWER(${'%' + disease_name + '%'})
      ORDER BY medication_name_en
    `;

    return Response.json({ medications });
  } catch (error) {
    console.error('Error fetching medications:', error);
    return Response.json({ error: 'Failed to fetch medications' }, { status: 500 });
  }
}