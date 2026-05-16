import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

const currencyNames = {
  USD: "US Dollar",
  EUR: "Euro",
  GBP: "British Pound",
  AUD: "Australian Dollar",
  CAD: "Canadian Dollar",
  JPY: "Japanese Yen"
};

export default async function handler(req, res) {
  const url = new URL(req.url, `http://${req.headers.host}`);
  const pathname = url.pathname;

  // ======================
  // CONVERT
  // ======================
  if (pathname === "/api/convert" && req.method === "GET") {
    const from = url.searchParams.get("from");
    const to = url.searchParams.get("to");
    const amount = url.searchParams.get("amount");

    try {
      const response = await fetch(
        `https://api.frankfurter.app/latest?from=${from}&to=${to}`
      );
      const data = await response.json();

      const rate = data.rates[to];

      if (!rate) {
        return res.status(400).json({ error: "Currency not supported" });
      }

      const result = (rate * amount).toFixed(2);

      return res.status(200).json({
        fromCurrency: currencyNames[from],
        toCurrency: currencyNames[to],
        rate,
        result,
        date: data.date
      });

    } catch (err) {
      return res.status(500).json({ error: "Convert failed" });
    }
  }

  // ======================
  // POST HISTORY
  // ======================
  if (pathname === "/api/history" && req.method === "POST") {
    try {
      const body = req.body;

      const { error } = await supabase.from("conversion_history").insert([
        {
          from_currency: body.from,
          to_currency: body.to,
          amount: Number(body.amount),
          result: Number(body.result),
          date: body.date
        }
      ]);

      if (error) {
        return res.status(500).json({ error: error.message });
      }

      return res.status(200).json({ message: "Saved" });

    } catch (err) {
      return res.status(500).json({ error: "Insert failed" });
    }
  }

  // ======================
  // GET HISTORY
  // ======================
  if (pathname === "/api/history" && req.method === "GET") {
    try {
      const { data, error } = await supabase
        .from("conversion_history")
        .select("*")
        .order("id", { ascending: false });

      if (error) {
        return res.status(500).json({ error: error.message });
      }

      return res.status(200).json(data);

    } catch (err) {
      return res.status(500).json({ error: "Fetch failed" });
    }
  }

  return res.status(404).json({ error: "Not found" });
}