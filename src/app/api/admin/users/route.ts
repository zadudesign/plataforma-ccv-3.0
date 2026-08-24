import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password, nombre_completo, rol_id, telefono, avatar_url } = body;

    if (!email || !password || !nombre_completo) {
      return NextResponse.json(
        { error: 'Email, contraseña y nombre completo son requeridos.' },
        { status: 400 }
      );
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    // Si Supabase Service Role Key no está configurado, respondemos en modo desarrollo/mock
    if (!supabaseUrl || !serviceRoleKey || serviceRoleKey.includes('placeholder')) {
      return NextResponse.json({
        success: true,
        isMock: true,
        message: 'Usuario registrado localmente (modo offline/simulado).',
        user: {
          id: `u-${Date.now()}`,
          email,
          nombre_completo,
          rol_id,
          telefono,
          avatar_url,
        },
      });
    }

    // Inicializar cliente Supabase con Service Role Key para funciones administrativas
    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    // 1. Crear usuario en Supabase Auth con la contraseña asignada por el Admin
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // Confirmación automática de correo
      user_metadata: {
        nombre_completo,
        telefono,
        rol_id,
        avatar_url,
      },
    });

    if (authError) {
      return NextResponse.json({ error: authError.message }, { status: 400 });
    }

    // 2. Insertar o actualizar perfil en la tabla public.usuarios
    if (authData.user) {
      const { error: dbError } = await supabaseAdmin.from('usuarios').upsert({
        id: authData.user.id,
        nombre_completo,
        email,
        rol_id,
        telefono,
        avatar_url: avatar_url || null,
        activo: true,
      });

      if (dbError) {
        console.error('Error al registrar en public.usuarios:', dbError);
      }
    }

    return NextResponse.json({
      success: true,
      user: authData.user,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || 'Error interno del servidor.' },
      { status: 500 }
    );
  }
}
