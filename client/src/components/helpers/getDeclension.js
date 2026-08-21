// Функция для склонения слов (пример: участник, участника, участников)
export const getDeclension = (number, one, two, five) => {
  const n = Math.abs(number) % 100;
  const n1 = n % 10;
  if (n > 10 && n < 20) return five;
  if (n1 > 1 && n1 < 5) return two;
  if (n1 === 1) return one;
  return five;
};