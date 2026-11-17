import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react';
import type { AppData } from './types';
import { charger, sauvegarder } from './lib/storage';

// Magasin global : un seul objet AppData, sauvegardé dans localStorage à chaque changement.

interface Store {
  data: AppData;
  maj: (fn: (d: AppData) => AppData) => void;
  remplacer: (d: AppData) => void;
}

const Ctx = createContext<Store | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<AppData>(charger);

  useEffect(() => {
    sauvegarder(data);
  }, [data]);

  const maj = useCallback((fn: (d: AppData) => AppData) => setData((d) => fn(d)), []);
  const remplacer = useCallback((d: AppData) => setData(d), []);

  return <Ctx.Provider value={{ data, maj, remplacer }}>{children}</Ctx.Provider>;
}

export function useStore(): Store {
  const s = useContext(Ctx);
  if (!s) throw new Error('useStore doit être utilisé dans StoreProvider');
  return s;
}
