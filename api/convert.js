export default async function handler(req, res) {
  const { from, to, amount } = req.query;

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
      rate,
      result,
      date: data.date
    });

  } catch (err) {
    return res.status(500).json({ error: "Conversion failed" });
  }
}