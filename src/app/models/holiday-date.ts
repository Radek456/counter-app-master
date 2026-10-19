// Kalendářní datum zařízení, nikoliv datum odvozené z UTC času.
export function localDateIso(date = new Date()): string {
  const year = date.getFullYear();
  // Měsíce začínají nulou; padStart doplní čísla na dvě místa, např. 9 → 09.
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function daysUntil(target: string, today: string): number {
  // Hodiny × minuty × sekundy × milisekundy.
  const millisecondsPerDay = 24 * 60 * 60 * 1000;
  // YYYY-MM-DD se převede na UTC půlnoc, takže výpočet neovlivní změna času.
  const targetTime = Date.parse(target);
  const todayTime = Date.parse(today);

  // Rozdíl v milisekundách převedeme na počet kalendářních dnů.
  return (targetTime - todayTime) / millisecondsPerDay;
}