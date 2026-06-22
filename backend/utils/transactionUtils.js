const Transaction = require('../models/Transaction');

const hasActiveTransaction = async (userId, bookId) => {
  const transaction = await Transaction.findOne({
    $or: [
      { user: userId, book: bookId },
      { user_id: userId, book_id: bookId }
    ],
    status: "issued"
  });
  return !!transaction;
};

const markOverdueBooks = async () => {
  const currentDate = new Date();
  
  await Transaction.updateMany(
    {
      status: "issued",
      due_date: { $lt: currentDate }
    },
    {
      $set: { status: "overdue" }
    }
  );
};

module.exports = {
  hasActiveTransaction,
  markOverdueBooks
};
