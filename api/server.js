import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  "https://ltqaugjddzsfaenqfump.supabase.co",
  "YOUR_KEY"
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
  const { pathname } = new URL(req.url, `http://${req.headers.host}`);

 
  if (pathname === "/api/convert") {
    const { from, to, amount } = req.query;

    const response = await fetch(
      `https://api.frankfurter.app/latest?from=${from}&to=${to}`
    );
    const data = await response.json();

    const rate = data.rates[to];
    const result = (rate * amount).toFixed(2);

    return res.json({
      fromCurrency: currencyNames[from],
      toCurrency: currencyNames[to],
      rate,
      result,
      date: data.date
    });
  }

 
  if (pathname === "/api/history" && req.method === "POST") {
    const body = req.body;

    const { error } = await supabase.from("conversion_history").insert([
      {
        from_currency: body.from,
        to_currency: body.to,
        amount: body.amount,
        result: body.result,
        date: body.date
      }
    ]);

    if (error) return res.status(500).json({ error });

    return res.json({ message: "Saved" });
  }

  
  if (pathname === "/api/history" && req.method === "GET") {
    const { data, error } = await supabase
      .from("conversion_history")
      .select("*")
      .order("id", { ascending: false });

    if (error) return res.status(500).json({ error });

    return res.json(data);
  }

  return res.status(404).json({ error: "Not found" });
}