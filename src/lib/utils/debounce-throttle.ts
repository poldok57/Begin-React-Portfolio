/* eslint-disable @typescript-eslint/no-explicit-any */
export function debounceThrottle<T extends (...args: any[]) => void>(
  func: T,
  interval: number,
  finalDelay: number
): (...args: Parameters<T>) => void {
  let lastExecTime = 0; // Temps de la dernière exécution
  let timeout: ReturnType<typeof setTimeout> | null = null; // Timer pour debounce
  let lastArgs: Parameters<T> | null = null; // Derniers arguments sauvegardés

  // Fonction pour exécuter immédiatement
  const execute = () => {
    lastExecTime = Date.now(); // Mettre à jour le temps de la dernière exécution
    if (lastArgs) {
      func(...(lastArgs as Parameters<T>)); // Appel de la fonction
      lastArgs = null; // Réinitialisation des arguments
    }
  };

  // Fonction retournée pour gérer l'appel
  return (...args: Parameters<T>) => {
    const now = Date.now(); // Temps actuel
    lastArgs = args; // Sauvegarder les derniers arguments

    // Vérifie si le temps écoulé depuis la dernière exécution permet une exécution (throttle)
    if (now - lastExecTime >= interval) {
      if (timeout) {
        clearTimeout(timeout); // Annuler le debounce en cours
        timeout = null;
      }
      execute(); // Exécuter immédiatement
    }

    // Planifier une exécution finale après le dernier appel (debounce)
    if (timeout) {
      clearTimeout(timeout); // Réinitialiser le timer existant
    }
    timeout = setTimeout(() => {
      execute(); // Exécuter à la fin après le délai
    }, finalDelay);
  };
}
