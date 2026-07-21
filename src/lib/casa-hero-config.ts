// Fuente única del recorrido de scroll (en alturas de viewport) que el hero
// cinematográfico de "Construye tu casa" dedica a hacer scrub del vídeo mientras
// está fijado (pin). Lo consumen tanto el propio hero (ConstruyeCasaHero) para
// definir el largo del pin, como el Header, que mantiene la barra transparente
// hasta que se ha recorrido todo el vídeo. Debe ser el mismo valor en ambos.
export const CASA_HERO_SCRUB_VIEWPORTS = 3.4;

// Ruta (sin prefijo de idioma, tal como la devuelve usePathname de next-intl)
// de la página de "Construye tu casa".
export const CASA_HERO_PATHNAME = "/construir-casa-a-medida";
