import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServer } from '@/lib/supabase-server';

// GET /api/documents/templates - List all templates
export async function GET(request: NextRequest) {
  try {
    const supabase = await getSupabaseServer();

    // Verify authentication server-side (getUser validates JWT, getSession does not)
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get query parameters
    const searchParams = request.nextUrl.searchParams;
    const category = searchParams.get('category');
    const includeInactive = searchParams.get('includeInactive') === 'true';

    // Build query
    let query = supabase
      .from('document_templates')
      .select('*')
      .order('sort_order', { ascending: true });

    if (!includeInactive) {
      query = query.eq('is_active', true);
    }

    if (category) {
      query = query.eq('category', category);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching templates:', error);
      return NextResponse.json({ error: 'Failed to fetch templates' }, { status: 500 });
    }

    return NextResponse.json({ templates: data });
  } catch (error) {
    console.error('Error in GET /api/documents/templates:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/documents/templates - Create a new template
export async function POST(request: NextRequest) {
  try {
    const supabase = await getSupabaseServer();

    // Verify authentication server-side (getUser validates JWT, getSession does not)
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check role from database (user_metadata is client-mutable and MUST NOT be trusted)
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (!profile?.role || !['admin', 'super_admin'].includes(profile.role)) {
      return NextResponse.json({ error: 'Forbidden - Admin access required' }, { status: 403 });
    }

    // Parse request body
    const body = await request.json();
    const { name, description, category, template_type, file_path, form_schema, requires_witness, expiry_months } = body;

    // Validate required fields
    if (!name || !template_type) {
      return NextResponse.json({ error: 'Name and template_type are required' }, { status: 400 });
    }

    // Create template
    const { data, error } = await supabase
      .from('document_templates')
      .insert({
        name,
        description,
        category,
        template_type,
        file_path,
        form_schema,
        requires_witness: requires_witness || false,
        expiry_months,
        created_by: user.id,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating template:', error);
      return NextResponse.json({ error: 'Failed to create template' }, { status: 500 });
    }

    return NextResponse.json({ template: data }, { status: 201 });
  } catch (error) {
    console.error('Error in POST /api/documents/templates:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
