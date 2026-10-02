// src/context/RanchoContext.jsx
import { createContext, useContext, useState, useEffect } from 'react';

const RanchoContext = createContext();

export function RanchoProvider({ children }) {
  const [ranchoConfig, setRanchoConfig] = useState({
    nombreRancho: 'Rancho Puerta Pesada',
    logoUrl: '/logo-Rancho.png',
    moneda: 'MXN',
    unidadPeso: 'kg'
  });

  const fetchConfiguracionGlobal = async () => {
    try {
      const res = await fetch('http://localhost:4000/api/configuracion');
      if (res.ok) {
        const data = await res.json();
        setRanchoConfig({
          nombreRancho: data.nombreRancho || 'Rancho Puerta Pesada',
          logoUrl: data.logoUrl || '/logo-Rancho.png',
          moneda: data.moneda || 'MXN',
          unidadPeso: data.unidadPeso || 'kg'
        });
      }
    } catch (err) {
      console.error('Error al cargar la configuración global:', err);
    }
  };

  useEffect(() => {
    let isMounted = true;

    async function cargarDatosIniciales() {
      try {
        const res = await fetch('http://localhost:4000/api/configuracion');
        if (res.ok) {
          const data = await res.json();
          if (isMounted) {
            setRanchoConfig({
              nombreRancho: data.nombreRancho || 'Rancho Puerta Pesada',
              logoUrl: data.logoUrl || '/logo-Rancho.png',
              moneda: data.moneda || 'MXN',
              unidadPeso: data.unidadPeso || 'kg'
            });
          }
        }
      } catch (err) {
        console.error('Error al cargar la configuración global:', err);
      }
    }

    cargarDatosIniciales();

    return () => {
      isMounted = false;
    };
  }, []);

return (
    <RanchoContext.Provider value={{ ranchoConfig, actualizarConfigGlobal: fetchConfiguracionGlobal }}>
      {children}
    </RanchoContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useRancho() {
  return useContext(RanchoContext);
}