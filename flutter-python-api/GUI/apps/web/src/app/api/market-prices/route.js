import sql from "@/app/api/utils/sql";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const crop_id = searchParams.get('crop_id');
    const region = searchParams.get('region');

    let query = `
      SELECT 
        mp.*,
        c.name_en as crop_name,
        c.name_ta,
        c.name_te,
        c.name_kn,
        c.name_ml
      FROM market_prices mp
      JOIN crops c ON mp.crop_id = c.id
      WHERE 1=1
    `;
    
    const params = [];
    let paramIndex = 1;

    if (crop_id) {
      query += ` AND mp.crop_id = $${paramIndex}`;
      params.push(crop_id);
      paramIndex++;
    }

    if (region) {
      query += ` AND LOWER(mp.region) LIKE LOWER($${paramIndex})`;
      params.push(`%${region}%`);
      paramIndex++;
    }

    query += ` ORDER BY mp.created_at DESC`;

    const prices = await sql(query, params);

    return Response.json({ prices });
  } catch (error) {
    console.error('Error fetching market prices:', error);
    return Response.json({ error: 'Failed to fetch market prices' }, { status: 500 });
  }
}