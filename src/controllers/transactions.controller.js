import Transaction from '../models/Transaction.js';

export const createTransaction = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { type, amount, category, note, date, recurring } = req.body;

    if (!type || !amount || !category) {
      return res.status(400).json({ message: 'type, amount and category are required' });
    }

    const tx = new Transaction({
      user: userId,
      type,
      amount,
      category,
      note,
      date: date ? new Date(date) : undefined,
      recurring: !!recurring,
    });

    await tx.save();
    res.status(201).json({ message: 'Transaction created', transaction: tx });
  } catch (error) {
    console.error('Create transaction error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const listTransactions = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { page = 1, limit = 50, sort = '-date' } = req.query;

    const skip = (Number(page) - 1) * Number(limit);

    const transactions = await Transaction.find({ user: userId })
      .sort(sort)
      .skip(skip)
      .limit(Number(limit));

    const total = await Transaction.countDocuments({ user: userId });

    res.json({ transactions, total });
  } catch (error) {
    console.error('List transactions error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const deleteTransaction = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { id } = req.params;

    const tx = await Transaction.findOneAndDelete({ _id: id, user: userId });
    if (!tx) return res.status(404).json({ message: 'Transaction not found' });

    res.json({ message: 'Transaction deleted' });
  } catch (error) {
    console.error('Delete transaction error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export default { createTransaction, listTransactions, deleteTransaction };
