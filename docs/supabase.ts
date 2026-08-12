import { createClient, SupabaseClient } from 'https://esm.sh/@supabase/supabase-js@2';

// Estructura tabla votaciones
interface VotacionRecord {
    id_votacion: number;
    tipo_documento: string | null;
    fecha_texto: string | null;
    materia: string | null;
    sesion: string | null;
    tramite:  string | null;
    articulo:  string | null;
    quorum:  string | null;
    resultado:  string | null;
    materia_resumen: string | null;
    articulo_resumen: string | null;
}

interface SupabaseWebhookPayload {
    type: 'INSERT' | 'UPDATE' | 'DELETE';
    table: string;
    schema: string;
    record: VotacionRecord;
    old_record: VotacionRecord | null;
}

//Estructura de respuesta de api de Gemini
interface GeminiResponse {
    candidates: Array<{
        content: {
            parts: Array<{
                text: string;
            }>
        }
    }>
}

const GEMINI_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent';  

async function llamarGemini(apiKey: string, prompt: string): Promise<string> {
    const response = await fetch(GEMINI_URL, {
        method: 'POST',
        headers: {
            "Content-Type": "application/json",
            'x-goog-api-key': apiKey
        },
        body: JSON.stringify({
            contents: [{parts: [{text: prompt}] }]
        })
    })

    if (!response.ok) {
        const errorBody = await response.text();
        console.error("Gemini error: ", errorBody);
        throw new Error(`Error en la API de gemini: ${response.statusText}`);
    }

    const data: GeminiResponse = await response.json();
    return data.candidates[0].content.parts[0].text;
}




Deno.serve( async (req: Request): Promise<Response> => {

    try {
        
        const payload: SupabaseWebhookPayload = await req.json();
        const { record } = payload;

        const idVotacion: number = record.id_votacion;
        const materiaOriginal: string | null = record.materia;
        const articuloOriginal: string | null = record.articulo;

       if (!materiaOriginal && !articuloOriginal ) {
            return new Response(
                JSON.stringify( { message: "No hay materia ni articulo para resumir", skipped: true, reason: "campos_vacios"} ),
                { status: 200, headers: { "Content-Type": "application/json" } }
            );
        }

        const materiaValida = materiaOriginal && materiaOriginal.length > 0;
        const articuloValido = articuloOriginal && articuloOriginal.length > 0;


        if (!materiaValida && !articuloValido ) {
            return new Response(
                JSON.stringify( { message: "Materia o articulo no existen", skipped: true, reason: "sin_texto"} ),
                { status: 200, headers: { "Content-Type": "application/json" } }
            );
        }


        const apiKey: string | undefined = Deno.env.get("GEMINI_API_KEY");
        if (!apiKey) throw new Error("Falta la variable de entorno GEMINI_API_KEY");

        const updatePayload: Record<string, string> = {};

        //

        if (materiaValida && articuloValido ) {

            if (materiaOriginal.length > 130) {
                const promptMateria = `
                    Resume el siguiente texto debe tener un máximo de 125 caracteres, contando espacios y signos de puntuación.
                    Debe escribirse en una sola línea, sin saltos de línea:
                    ${materiaOriginal}`;
                    
                updatePayload.materia_resumen = await llamarGemini(apiKey, promptMateria);
            }


            if (articuloOriginal.length > 200) {
                
            const promptArticulo = `
                Resume el siguiente texto debe tener un máximo de 190 caracteres, contando espacios y signos de puntuación.
                Debe escribirse en una sola línea, sin saltos de línea:
                ${articuloOriginal}`;

            updatePayload.articulo_resumen= await llamarGemini(apiKey, promptArticulo);

            }


        } else if (!articuloOriginal && materiaOriginal && materiaOriginal.length > 280) {

            const promptMateria = `
                El resumen debe tener un máximo de 270 caracteres, contando letras, números, espacios y signos de puntuación.
                Debe escribirse en una sola línea, sin saltos de línea:
                ${materiaOriginal}`;


            updatePayload.materia_resumen = await llamarGemini(apiKey, promptMateria);
        }

        //UPDATE de columnas con resumen generado por IA

        const supabaseUrl: string = Deno.env.get("SUPABASE_URL") ?? "";
        const supabaseServiceKey: string = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
        const supabase: SupabaseClient = createClient(supabaseUrl, supabaseServiceKey);

        const { error: updateError } = await supabase
            .from('votaciones')
            .update(updatePayload)
            .eq('id_votacion', idVotacion);

        if (updateError) throw updateError;

        return new Response(
            JSON.stringify( { success: true, ...updatePayload} ),
            { status: 200, headers: { "Content-Type": "application/json" } }
        ); 

    } catch (error) {

        const errorMessage = error instanceof Error ? error.message : "Error desconocido";
        return new Response(
            JSON.stringify( { error: errorMessage} ),
            { status: 500, headers: { "Content-Type": "application/json" } }
        ); 
        
    }

})