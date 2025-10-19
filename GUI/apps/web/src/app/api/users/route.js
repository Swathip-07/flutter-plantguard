import sql from "@/app/api/utils/sql";

export async function POST(request) {
  try {
    const { name, phone_number, language = 'en' } = await request.json();
    
    if (!name || !phone_number) {
      return Response.json({ error: 'Name and phone number are required' }, { status: 400 });
    }

    // Check if user already exists
    const existingUser = await sql`
      SELECT * FROM users WHERE phone_number = ${phone_number}
    `;

    if (existingUser.length > 0) {
      return Response.json({ 
        user: existingUser[0],
        message: 'User already exists'
      });
    }

    // Create new user
    const newUser = await sql`
      INSERT INTO users (name, phone_number, language)
      VALUES (${name}, ${phone_number}, ${language})
      RETURNING *
    `;

    return Response.json({ user: newUser[0] });
  } catch (error) {
    console.error('Error creating user:', error);
    return Response.json({ error: 'Failed to create user' }, { status: 500 });
  }
}

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const phone_number = searchParams.get('phone_number');

    if (phone_number) {
      const user = await sql`
        SELECT * FROM users WHERE phone_number = ${phone_number}
      `;
      return Response.json({ user: user[0] || null });
    }

    const users = await sql`
      SELECT * FROM users ORDER BY created_at DESC
    `;
    return Response.json({ users });
  } catch (error) {
    console.error('Error fetching users:', error);
    return Response.json({ error: 'Failed to fetch users' }, { status: 500 });
  }
}