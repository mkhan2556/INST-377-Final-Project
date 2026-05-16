import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

export default async function handler(req, res) {
  // GET
  if (req.method === "GET") {
    const { data, error } = await supabase
      .from("conversion_history")
      .select("*")
      .order("id", { ascending: false });

    if (error) return res.status(500).json({ error });

    return res.status(200).json(data);
  }

  // POST
  if (req.method === "POST") {
    const { from, to, amount, result, date } = req.body;

    const { error } = await supabase
      .from("conversion_history")
      .insert([
        {
          from_currency: from,
          to_currency: to,
          amount: Number(amount),
          result: Number(result),
          date
        }
      ]);

    if (error) return res.status(500).json({ error });

    return res.status(200).json({ message: "Saved" });
  }
}