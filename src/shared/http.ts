export function ok<T>(data: T) {
  return Response.json({ success: true, data });
}

export function created<T>(data: T) {
  return new Response(JSON.stringify({ success: true, data }), { status: 201, headers: { 'Content-Type': 'application/json' } });
}

export function badRequest(message: string) {
  return new Response(JSON.stringify({ success: false, message }), { status: 400, headers: { 'Content-Type': 'application/json' } });
}

export function unauthorized(message = 'Unauthorized') {
  return new Response(JSON.stringify({ success: false, message }), { status: 401, headers: { 'Content-Type': 'application/json' } });
}

export function forbidden(message = 'Forbidden') {
  return new Response(JSON.stringify({ success: false, message }), { status: 403, headers: { 'Content-Type': 'application/json' } });
}

export function notFound(message = 'Not found') {
  return new Response(JSON.stringify({ success: false, message }), { status: 404, headers: { 'Content-Type': 'application/json' } });
}

export function serverError(message = 'An unexpected error occurred') {
  return new Response(JSON.stringify({ success: false, message }), { status: 500, headers: { 'Content-Type': 'application/json' } });
}
