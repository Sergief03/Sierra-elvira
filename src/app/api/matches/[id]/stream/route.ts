import { matchBus } from "@/lib/match-bus";
import { getMatchSnapshot } from "@/services/match.service";

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;

  const snapshot = await getMatchSnapshot(id);
  if (!snapshot) {
    return new Response("Partido no encontrado", { status: 404 });
  }

  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    start(controller) {
      const send = (data: unknown) => {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
      };

      send(snapshot);

      const unsubscribe = matchBus.subscribe(id, (data) => {
        send(data);
      });

      const keepAlive = setInterval(() => {
        controller.enqueue(encoder.encode(":\n\n"));
      }, 15000);

      const request = _request as Request & { signal: AbortSignal };
      if (request.signal) {
        request.signal.addEventListener("abort", () => {
          unsubscribe();
          clearInterval(keepAlive);
          controller.close();
        });
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no",
    },
  });
}
