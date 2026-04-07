const scores = []; // temp memory (resets on deploy)

export default {
  async fetch(request) {
    const url = new URL(request.url);

    // GET leaderboard
    if (url.pathname === "/api/leaderboard") {
      return new Response(JSON.stringify(scores), {
        headers: { "Content-Type": "application/json" }
      });
    }

    // POST score
    if (url.pathname === "/api/score" && request.method === "POST") {
      const body = await request.json();

      scores.push({
        name: body.name || "anon",
        score: body.score || 0
      });

      // sort highest first
      scores.sort((a, b) => b.score - a.score);

      return new Response(JSON.stringify({ status: "saved" }), {
        headers: { "Content-Type": "application/json" }
      });
    }

    return new Response("Not found", { status: 404 });
  }
};
