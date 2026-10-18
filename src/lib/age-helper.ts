export function age(dob: string, today: Date = new Date()): number {
  const birth = new Date(dob);

  // 2026 - 1996 = 30.
  let years = today.getFullYear() - birth.getFullYear();

  // Month is compared first. If it's the same month, the day is compared
  // to check if the birthday has passed.
  const hadBirthdayThisYear =
    today.getMonth() > birth.getMonth() ||
    (today.getMonth() === birth.getMonth() &&
      today.getDate() >= birth.getDate());

  // 1 year younger IF this year's birthday hasn't happened yet.
  if (!hadBirthdayThisYear) years -= 1;

  return years;
}
