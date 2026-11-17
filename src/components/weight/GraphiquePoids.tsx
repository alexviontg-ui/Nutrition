import { CartesianGrid, ComposedChart, Legend, Line, ReferenceLine, ResponsiveContainer, Scatter, Tooltip, XAxis, YAxis } from 'recharts';
import type { Pesee } from '../../types';
import { moyenneMobile7, trierPesees } from '../../lib/weightStats';
import { dateCourte, parseISODate, toISODate } from '../../lib/dates';
import { fmt1 } from '../../lib/format';

// Couleurs : pesées brutes en gris (contexte), moyenne mobile en vert (signal),
// objectif en ambre pointillé. Le texte garde les couleurs de texte standard.
const COULEUR_PESEE = '#a8a29e';
const COULEUR_MOYENNE = '#2e7051';
const COULEUR_OBJECTIF = '#d97706';

export function GraphiquePoids({ pesees, objectif }: { pesees: Pesee[]; objectif?: number }) {
  const triees = trierPesees(pesees);
  if (triees.length === 0) {
    return <p className="py-12 text-center text-sm muted">Ajoutez une première pesée pour voir apparaître le graphique.</p>;
  }

  const moyennes = moyenneMobile7(triees);
  // Axe X en temps réel (jours) pour respecter les écarts entre pesées
  const points = triees.map((p, i) => ({
    t: parseISODate(p.date).getTime(),
    date: p.date,
    poids: p.poids,
    moyenne: moyennes[i].moyenne,
  }));

  const valeurs = points.flatMap((p) => [p.poids, p.moyenne]).concat(objectif ? [objectif] : []);
  const min = Math.floor(Math.min(...valeurs) - 1);
  const max = Math.ceil(Math.max(...valeurs) + 1);

  return (
    <div className="h-72 w-full text-stone-500 dark:text-stone-400">
      <ResponsiveContainer>
        <ComposedChart data={points} margin={{ top: 10, right: 12, bottom: 0, left: -12 }}>
          <CartesianGrid stroke="currentColor" strokeOpacity={0.15} vertical={false} />
          <XAxis
            dataKey="t"
            type="number"
            scale="time"
            domain={['dataMin', 'dataMax']}
            tickFormatter={(t) => dateCourte(toISODate(new Date(t)))}
            tick={{ fill: 'currentColor', fontSize: 12 }}
            stroke="currentColor"
            strokeOpacity={0.3}
            minTickGap={24}
            padding={{ left: 12, right: 12 }}
          />
          <YAxis
            domain={[min, max]}
            tick={{ fill: 'currentColor', fontSize: 12 }}
            stroke="currentColor"
            strokeOpacity={0.3}
            tickFormatter={(v) => fmt1(v)}
            width={48}
          />
          <Tooltip
            labelFormatter={(t) => new Date(t as number).toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'long' })}
            formatter={(v: number, nom: string) => [`${fmt1(v)} kg`, nom]}
            contentStyle={{ borderRadius: 12, border: '1px solid #e7e5e4', fontSize: 13, color: '#292524' }}
          />
          <Legend wrapperStyle={{ fontSize: 13 }} />
          {objectif && (
            <ReferenceLine
              y={objectif}
              stroke={COULEUR_OBJECTIF}
              strokeDasharray="6 4"
              strokeWidth={2}
              label={{ value: `Objectif ${fmt1(objectif)} kg`, position: 'insideTopRight', fill: 'currentColor', fontSize: 12 }}
            />
          )}
          <Scatter name="Pesée" dataKey="poids" fill={COULEUR_PESEE} shape="circle" />
          <Line name="Moyenne 7 jours" type="monotone" dataKey="moyenne" stroke={COULEUR_MOYENNE} strokeWidth={2.5} dot={false} activeDot={{ r: 5 }} />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}
