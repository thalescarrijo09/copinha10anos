export const MODALITY_LABELS = { futsal: 'Futsal', queimada: 'Queimada' };
export const CATEGORY_LABELS = { sub09: 'Sub-09', sub11: 'Sub-11' };
export const GENDER_LABELS = { masculino: 'Masculino', feminino: 'Feminino' };
export const SEEDS = ['A','B','C','D','E','F','G','H','I','J'];

export const MAPS = {
  7:{
    winners:[
      [ {id:1,label:'Jogo 1',s:[{seed:'C'},{seed:'I'}]}, {id:2,label:'Jogo 2',s:[{seed:'F'},{seed:'B'}]}, {id:3,label:'Jogo 3',s:[{seed:'H'},{seed:'E'}]} ],
      [ {id:5,label:'Jogo 5',s:[{seed:'A'},{win:1}]}, {id:6,label:'Jogo 6',s:[{win:2},{win:3}]} ],
      [ {id:10,label:'Semifinal',s:[{win:5},{win:6}]} ],
      [ {id:12,label:'Final',s:[{win:10},{win:11}]} ],
    ],
    losers:[
      [ {id:4,label:'Jogo 4',s:[{lose:2},{lose:3}]} ],
      [ {id:7,label:'Jogo 7',s:[{lose:6},{lose:1}]}, {id:8,label:'Jogo 8',s:[{lose:5},{win:4}]} ],
      [ {id:9,label:'Jogo 9',s:[{win:7},{win:8}]} ],
      [ {id:11,label:'Final perd.',s:[{lose:10},{win:9}]} ],
    ]
  },
  8:{
    winners:[
      [ {id:1,label:'Jogo 1',s:[{seed:'A'},{seed:'H'}]}, {id:2,label:'Jogo 2',s:[{seed:'D'},{seed:'E'}]}, {id:3,label:'Jogo 3',s:[{seed:'C'},{seed:'F'}]}, {id:4,label:'Jogo 4',s:[{seed:'B'},{seed:'G'}]} ],
      [ {id:7,label:'Jogo 7',s:[{win:1},{win:2}]}, {id:8,label:'Jogo 8',s:[{win:3},{win:4}]} ],
      [ {id:12,label:'Semifinal',s:[{win:7},{win:8}]} ],
      [ {id:14,label:'Final',s:[{win:12},{win:13}]} ],
    ],
    losers:[
      [ {id:5,label:'Jogo 5',s:[{lose:1},{lose:2}]}, {id:6,label:'Jogo 6',s:[{lose:3},{lose:4}]} ],
      [ {id:10,label:'Jogo 10',s:[{lose:8},{win:5}]}, {id:9,label:'Jogo 9',s:[{lose:7},{win:6}]} ],
      [ {id:11,label:'Jogo 11',s:[{win:10},{win:9}]} ],
      [ {id:13,label:'Final perd.',s:[{lose:12},{win:11}]} ],
    ]
  },
  9:{
    winners:[
      [ {id:1,label:'Jogo 1',s:[{seed:'B'},{seed:'G'}]} ],
      [ {id:5,label:'Jogo 5',s:[{seed:'D'},{win:1}]}, {id:2,label:'Jogo 2',s:[{seed:'H'},{seed:'C'}]}, {id:3,label:'Jogo 3',s:[{seed:'A'},{seed:'E'}]}, {id:4,label:'Jogo 4',s:[{seed:'F'},{seed:'I'}]} ],
      [ {id:10,label:'Jogo 10',s:[{win:5},{win:2}]}, {id:9,label:'Jogo 9',s:[{win:3},{win:4}]} ],
      [ {id:14,label:'Semifinal',s:[{win:10},{win:9}]} ],
      [ {id:16,label:'Final',s:[{win:14},{win:15}]} ],
    ],
    losers:[
      [ {id:6,label:'Jogo 6',s:[{lose:4},{lose:1}]} ],
      [ {id:8,label:'Jogo 8',s:[{lose:3},{win:6}]}, {id:7,label:'Jogo 7',s:[{lose:2},{lose:5}]} ],
      [ {id:12,label:'Jogo 12',s:[{lose:10},{win:8}]}, {id:11,label:'Jogo 11',s:[{lose:9},{win:7}]} ],
      [ {id:13,label:'Jogo 13',s:[{win:12},{win:11}]} ],
      [ {id:15,label:'Final perd.',s:[{lose:14},{win:13}]} ],
    ]
  },
  10:{
    winners:[
      [ {id:1,label:'Jogo 1',s:[{seed:'B'},{seed:'G'}]}, {id:2,label:'Jogo 2',s:[{seed:'E'},{seed:'J'}]} ],
      [ {id:3,label:'Jogo 3',s:[{seed:'A'},{win:1}]}, {id:4,label:'Jogo 4',s:[{seed:'D'},{seed:'I'}]}, {id:5,label:'Jogo 5',s:[{seed:'C'},{seed:'H'}]}, {id:6,label:'Jogo 6',s:[{seed:'F'},{win:2}]} ],
      [ {id:11,label:'Jogo 11',s:[{win:3},{win:4}]}, {id:12,label:'Jogo 12',s:[{win:5},{win:6}]} ],
      [ {id:16,label:'Semifinal',s:[{win:11},{win:12}]} ],
      [ {id:18,label:'Final',s:[{win:16},{win:17}]} ],
    ],
    losers:[
      [ {id:8,label:'Jogo 8',s:[{lose:4},{lose:1}]}, {id:7,label:'Jogo 7',s:[{lose:3},{lose:2}]} ],
      [ {id:10,label:'Jogo 10',s:[{lose:6},{win:8}]}, {id:9,label:'Jogo 9',s:[{lose:5},{win:7}]} ],
      [ {id:13,label:'Jogo 13',s:[{lose:11},{win:10}]}, {id:14,label:'Jogo 14',s:[{lose:12},{win:9}]} ],
      [ {id:15,label:'Jogo 15',s:[{win:13},{win:14}]} ],
      [ {id:17,label:'Final perd.',s:[{lose:16},{win:15}]} ],
    ]
  }
};

export function matchById(map, id) {
  let found = null;
  ['winners','losers'].forEach(k => map[k].forEach(col => col.forEach(m => { if (m.id === id) found = m; })));
  return found;
}

export function resolveSlot(map, slot, seeds, results) {
  if (slot.seed !== undefined) return { teamId: seeds[slot.seed] || null, decided: true, feedLabel: null };
  if (slot.win !== undefined) {
    const r = results[slot.win];
    if (r !== undefined) {
      const m = matchById(map, slot.win);
      const wIdx = typeof r === 'object' ? r.winner : r;
      return resolveSlot(map, m.s[wIdx], seeds, results);
    }
    return { teamId: null, decided: false, feedLabel: 'Venc. Jogo ' + slot.win };
  }
  if (slot.lose !== undefined) {
    const r = results[slot.lose];
    if (r !== undefined) {
      const m = matchById(map, slot.lose);
      const wIdx = typeof r === 'object' ? r.winner : r;
      return resolveSlot(map, m.s[1 - wIdx], seeds, results);
    }
    return { teamId: null, decided: false, feedLabel: 'Perd. Jogo ' + slot.lose };
  }
  return { teamId: null, decided: false, feedLabel: '?' };
}

// Lista todas as partidas (winners + losers) de um mapa, em ordem plana
export function allMatches(map) {
  const list = [];
  ['winners','losers'].forEach(k => map[k].forEach(col => col.forEach(m => list.push(m))));
  return list;
}
