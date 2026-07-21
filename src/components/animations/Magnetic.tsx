interface MagneticProps {
  children: React.ReactNode;
  className?: string;
  // Se mantiene por compatibilidad con las llamadas existentes; ya no se usa.
  strength?: number;
}

// El efecto magnético (los botones seguían al cursor y rebotaban) se ha
// desactivado a petición del cliente. Se conserva el wrapper y la firma para no
// tener que modificar todas las llamadas repartidas por el sitio.
export function Magnetic({ children, className = "" }: MagneticProps) {
  return <div className={className}>{children}</div>;
}
