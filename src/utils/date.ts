/**
 * Calcula o tempo relativo de uma data em relação ao momento atual.
 * Ex: "há 2 min", "há 1h", "há 3 dias"
 */
export function getRelativeTime(isoString: string): string {
  const now = new Date();
  const past = new Date(isoString);
  const diffInSeconds = Math.floor((now.getTime() - past.getTime()) / 1000);

  if (diffInSeconds < 60) {
    return 'agora mesmo';
  }

  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) {
    return `há ${diffInMinutes} min`;
  }

  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) {
    return `há ${diffInHours}h`;
  }

  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) {
    return `há ${diffInDays} d`;
  }

  // Para datas mais antigas, retorna a data formatada
  return past.toLocaleDateString('pt-BR');
}
