import { supabase } from '@/lib/supabase-client';

export async function POST(request: Request) {
    console.log('Salvando dados do PDF...');
    const { data, id } = await request.json();
    //find if id is already in the database
    const { data: existingData, error: existingError } = await supabase
        .from('pdf_data')
        .select('id')
        .eq('id', id)
        .single();

    if (existingData) {
        const { error, data: result } = await supabase
            .from('pdf_data')
            .update({ data })
            .eq('id', id)
            .select('id')
            .single();

        if (error) {
            console.error('Erro ao atualizar dados do PDF:', error);
            return new Response(JSON.stringify({ error: error.message }), { status: 500 });
        }

        return new Response(JSON.stringify({ id: result.id }), { status: 200 });
    }


    const { error, data: result } = await supabase
        .from('pdf_data')
        .insert([{ data }])
        .select('id')
        .single();

    if (error) {
        console.error('Erro ao salvar dados do PDF:', error);
        return new Response(JSON.stringify({ error: error.message }), { status: 500 });
    }

    return new Response(JSON.stringify({ id: result.id }), { status: 200 });
}
