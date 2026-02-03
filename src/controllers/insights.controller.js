import Transaction from '../models/Transaction.js';
import aiService from '../services/ai.service.js';

function aggregateTransactions(transactions) {
  const byCategory = {};
  let total = 0;
  transactions.forEach((t) => {
    const amt = Number(t.amount) || 0;
    total += amt;
    byCategory[t.category] = (byCategory[t.category] || 0) + amt;
  });

  const categories = Object.keys(byCategory).map((k) => ({ category: k, total: byCategory[k] }));
  return { total, categories };
}

export const getInsights = async (req, res) => {
  try {
    const userId = req.user.userId;
    const days = Number(req.query.days) || 30;
    const since = new Date();
    since.setDate(since.getDate() - days);

    const transactions = await Transaction.find({ user: userId, date: { $gte: since } });

    const agg = aggregateTransactions(transactions);

    const summary = {
      days,
      total_spent: agg.total,
      by_category: agg.categories,
      transaction_count: transactions.length,
    };

    // If AI key is available, ask the model for insights
    if (process.env.OPENAI_API_KEY) {
      const prompt = `User spending summary for last ${days} days:\n${JSON.stringify(summary)}\nProvide 3 concise insights and 3 actionable recommendations in JSON {"insights":[],"actions":[]} `;
      try {
        const aiText = await aiService.requestInsights(prompt, { max_tokens: 400 });
        // Try to parse JSON from AI response
        let aiJson = null;
        try {
          aiJson = JSON.parse(aiText);
        } catch (e) {
          // not JSON — return text as fallback
          return res.json({ summary, ai: { raw: aiText } });
        }

        return res.json({ summary, ai: aiJson });
      } catch (err) {
        console.error('AI service error:', err);
        return res.json({ summary, ai_error: String(err) });
      }
    }

    res.json({ summary });
  } catch (error) {
    console.error('Get insights error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export default { getInsights };
