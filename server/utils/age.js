// Compute age from a YYYY-MM-DD string. Returns null on invalid or out-of-range age.
const calculateAge = (birthDateStr) => {
  if (!birthDateStr) return null;
  const birthDate = new Date(birthDateStr);
  if (Number.isNaN(birthDate.getTime())) return null;
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const m = today.getMonth() - birthDate.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) age--;
  return age < 0 || age > 125 ? null : age;
};

module.exports = { calculateAge };


