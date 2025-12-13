export async function GET() {
  try {
    // Quick readiness check
    // You can add additional checks here if needed (e.g., API connectivity)

    return new Response(
      JSON.stringify({
        status: "ok",
        timestamp: new Date().toISOString(),
        service: "frontend"
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          "Cache-Control": "no-cache, no-store, must-revalidate"
        },
      }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({
        status: "error",
        message: error.message
      }),
      {
        status: 503,
        headers: {
          "Content-Type": "application/json"
        },
      }
    );
  }
}
