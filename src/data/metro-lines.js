// Barcelona Metro (TMB) - Complete line and station data
// Source: TMB official network map
// Last updated: 2026

export const LINES = {
  L1: {
    id: 'L1',
    name: 'L1',
    color: '#E23831',
    textColor: '#FFFFFF',
    terminals: ['Hospital de Bellvitge', 'Fondo'],
    stations: [
      { name: 'Hospital de Bellvitge', transfers: [] },
      { name: 'Bellvitge', transfers: [] },
      { name: 'Av. Carrilet', transfers: [] },
      { name: 'Rambla Just Oliveras', transfers: [] },
      { name: 'Can Serra', transfers: [] },
      { name: 'Florida', transfers: [] },
      { name: 'Torrassa', transfers: ['L9S'] },
      { name: 'Santa Eulàlia', transfers: [] },
      { name: 'Mercat Nou', transfers: [] },
      { name: 'Plaça de Sants', transfers: [] },
      { name: 'Hostafrancs', transfers: [] },
      { name: 'Espanya', transfers: ['L3'] },
      { name: 'Rocafort', transfers: [] },
      { name: 'Urgell', transfers: [] },
      { name: 'Universitat', transfers: ['L2'] },
      { name: 'Catalunya', transfers: ['L3'] },
      { name: 'Urquinaona', transfers: ['L4'] },
      { name: 'Arc de Triomf', transfers: [] },
      { name: 'Marina', transfers: [] },
      { name: 'Glòries', transfers: [] },
      { name: 'Clot', transfers: ['L2'] },
      { name: 'Navas', transfers: [] },
      { name: 'La Sagrera', transfers: ['L5', 'L9N', 'L10N'] },
      { name: 'Fabra i Puig', transfers: [] },
      { name: 'Sant Andreu', transfers: [] },
      { name: 'Torras i Bages', transfers: [] },
      { name: 'Trinitat Vella', transfers: [] },
      { name: 'Baró de Viver', transfers: [] },
      { name: 'Santa Coloma', transfers: [] },
      { name: 'Fondo', transfers: ['L9N'] },
    ]
  },
  L2: {
    id: 'L2',
    name: 'L2',
    color: '#9B2791',
    textColor: '#FFFFFF',
    terminals: ['Paral·lel', 'Badalona Pompeu Fabra'],
    stations: [
      { name: 'Paral·lel', transfers: ['L3'] },
      { name: 'Sant Antoni', transfers: [] },
      { name: 'Universitat', transfers: ['L1'] },
      { name: 'Passeig de Gràcia', transfers: ['L3', 'L4'] },
      { name: 'Tetuan', transfers: [] },
      { name: 'Monumental', transfers: [] },
      { name: 'Sagrada Família', transfers: ['L5'] },
      { name: 'Encants', transfers: [] },
      { name: 'Clot', transfers: ['L1'] },
      { name: 'Bac de Roda', transfers: [] },
      { name: 'Sant Martí', transfers: [] },
      { name: 'La Pau', transfers: ['L4'] },
      { name: 'Verneda', transfers: [] },
      { name: 'Artigues | Sant Adrià', transfers: [] },
      { name: 'Sant Roc', transfers: [] },
      { name: 'Gorg', transfers: ['L10S'] },
      { name: 'Pep Ventura', transfers: [] },
      { name: 'Badalona Pompeu Fabra', transfers: [] },
    ]
  },
  L3: {
    id: 'L3',
    name: 'L3',
    color: '#3D9B35',
    textColor: '#FFFFFF',
    terminals: ['Zona Universitària', 'Trinitat Nova'],
    stations: [
      { name: 'Zona Universitària', transfers: [] },
      { name: 'Palau Reial', transfers: [] },
      { name: 'Maria Cristina', transfers: [] },
      { name: 'Les Corts', transfers: [] },
      { name: 'Plaça del Centre', transfers: [] },
      { name: 'Sants Estació', transfers: ['L5'] },
      { name: 'Tarragona', transfers: [] },
      { name: 'Espanya', transfers: ['L1'] },
      { name: 'Poble Sec', transfers: [] },
      { name: 'Paral·lel', transfers: ['L2'] },
      { name: 'Drassanes', transfers: [] },
      { name: 'Liceu', transfers: [] },
      { name: 'Catalunya', transfers: ['L1'] },
      { name: 'Passeig de Gràcia', transfers: ['L2', 'L4'] },
      { name: 'Diagonal', transfers: ['L5'] },
      { name: 'Fontana', transfers: [] },
      { name: 'Lesseps', transfers: [] },
      { name: 'Vallcarca', transfers: [] },
      { name: 'Penitents', transfers: [] },
      { name: 'Vall d\'Hebron', transfers: ['L5'] },
      { name: 'Montbau', transfers: [] },
      { name: 'Mundet', transfers: [] },
      { name: 'Valldaura', transfers: [] },
      { name: 'Canyelles', transfers: [] },
      { name: 'Roquetes', transfers: [] },
      { name: 'Trinitat Nova', transfers: ['L4', 'L11'] },
    ]
  },
  L4: {
    id: 'L4',
    name: 'L4',
    color: '#FFBF00',
    textColor: '#1a1a2e',
    terminals: ['Trinitat Nova', 'La Pau'],
    stations: [
      { name: 'Trinitat Nova', transfers: ['L3', 'L11'] },
      { name: 'Via Júlia', transfers: [] },
      { name: 'Llucmajor', transfers: [] },
      { name: 'Maragall', transfers: ['L5'] },
      { name: 'Guinardó | Hospital de Sant Pau', transfers: [] },
      { name: 'Alfons X', transfers: [] },
      { name: 'Joanic', transfers: [] },
      { name: 'Verdaguer', transfers: ['L5'] },
      { name: 'Girona', transfers: [] },
      { name: 'Passeig de Gràcia', transfers: ['L2', 'L3'] },
      { name: 'Urquinaona', transfers: ['L1'] },
      { name: 'Jaume I', transfers: [] },
      { name: 'Barceloneta', transfers: [] },
      { name: 'Ciutadella | Vila Olímpica', transfers: [] },
      { name: 'Bogatell', transfers: [] },
      { name: 'Llacuna', transfers: [] },
      { name: 'Poblenou', transfers: [] },
      { name: 'Selva de Mar', transfers: [] },
      { name: 'El Maresme | Fòrum', transfers: [] },
      { name: 'Besòs Mar', transfers: [] },
      { name: 'Besòs', transfers: [] },
      { name: 'La Pau', transfers: ['L2'] },
    ]
  },
  L5: {
    id: 'L5',
    name: 'L5',
    color: '#007BC2',
    textColor: '#FFFFFF',
    terminals: ['Cornellà Centre', 'Vall d\'Hebron'],
    stations: [
      { name: 'Cornellà Centre', transfers: [] },
      { name: 'Gavarra', transfers: [] },
      { name: 'Sant Ildefons', transfers: [] },
      { name: 'Can Boixeres', transfers: [] },
      { name: 'Can Vidalet', transfers: [] },
      { name: 'Pubilla Cases', transfers: [] },
      { name: 'Collblanc', transfers: ['L9S'] },
      { name: 'Badal', transfers: [] },
      { name: 'Plaça de Sants', transfers: [] },
      { name: 'Sants Estació', transfers: ['L3'] },
      { name: 'Entença', transfers: [] },
      { name: 'Hospital Clínic', transfers: [] },
      { name: 'Diagonal', transfers: ['L3'] },
      { name: 'Verdaguer', transfers: ['L4'] },
      { name: 'Sagrada Família', transfers: ['L2'] },
      { name: 'Sant Pau | Dos de Maig', transfers: [] },
      { name: 'Camp de l\'Arpa', transfers: [] },
      { name: 'La Sagrera', transfers: ['L1', 'L9N', 'L10N'] },
      { name: 'Congrés', transfers: [] },
      { name: 'Maragall', transfers: ['L4'] },
      { name: 'Virrei Amat', transfers: [] },
      { name: 'Vilapicina', transfers: [] },
      { name: 'Horta', transfers: [] },
      { name: 'El Carmel', transfers: [] },
      { name: 'El Coll | La Teixonera', transfers: [] },
      { name: 'Vall d\'Hebron', transfers: ['L3'] },
    ]
  },
  L9N: {
    id: 'L9N',
    name: 'L9N',
    color: '#F68B1F',
    textColor: '#FFFFFF',
    terminals: ['La Sagrera', 'Can Zam'],
    stations: [
      { name: 'La Sagrera', transfers: ['L1', 'L5', 'L10N'] },
      { name: 'Onze de Setembre', transfers: [] },
      { name: 'Bon Pastor', transfers: [] },
      { name: 'Can Peixauet', transfers: [] },
      { name: 'Santa Rosa', transfers: [] },
      { name: 'Fondo', transfers: ['L1'] },
      { name: 'Església Major', transfers: [] },
      { name: 'Singuerlin', transfers: [] },
      { name: 'Can Zam', transfers: [] },
    ]
  },
  L9S: {
    id: 'L9S',
    name: 'L9S',
    color: '#F68B1F',
    textColor: '#FFFFFF',
    terminals: ['Aeroport T1', 'Zona Universitària'],
    stations: [
      { name: 'Aeroport T1', transfers: [] },
      { name: 'Aeroport T2', transfers: [] },
      { name: 'Mas Blau', transfers: [] },
      { name: 'Parc Nou', transfers: [] },
      { name: 'Cèntric', transfers: [] },
      { name: 'El Prat Estació', transfers: [] },
      { name: 'Les Moreres', transfers: [] },
      { name: 'Mercabarna', transfers: [] },
      { name: 'Parc Logístic', transfers: [] },
      { name: 'Fira', transfers: [] },
      { name: 'Europa | Fira', transfers: [] },
      { name: 'Can Tries | Gornal', transfers: [] },
      { name: 'Torrassa', transfers: ['L1'] },
      { name: 'Collblanc', transfers: ['L5'] },
      { name: 'Zona Universitària', transfers: [] },
    ]
  },
  L10N: {
    id: 'L10N',
    name: 'L10N',
    color: '#71C5E8',
    textColor: '#1a1a2e',
    terminals: ['La Sagrera', 'Gorg'],
    stations: [
      { name: 'La Sagrera', transfers: ['L1', 'L5', 'L9N'] },
      { name: 'Onze de Setembre', transfers: [] },
      { name: 'Bon Pastor', transfers: [] },
      { name: 'Llefià', transfers: [] },
      { name: 'La Salut', transfers: [] },
      { name: 'Gorg', transfers: ['L2'] },
    ]
  },
  L10S: {
    id: 'L10S',
    name: 'L10S',
    color: '#71C5E8',
    textColor: '#1a1a2e',
    terminals: ['Zona Franca', 'Foc'],
    stations: [
      { name: 'Zona Franca', transfers: [] },
      { name: 'ZAL | Riu Vell', transfers: [] },
      { name: 'Ecoparc', transfers: [] },
      { name: 'Port Comercial', transfers: [] },
      { name: 'Foc', transfers: [] },
    ]
  },
  L11: {
    id: 'L11',
    name: 'L11',
    color: '#B5CC18',
    textColor: '#1a1a2e',
    terminals: ['Trinitat Nova', 'Can Cuiàs'],
    stations: [
      { name: 'Trinitat Nova', transfers: ['L3', 'L4'] },
      { name: 'Casa de l\'Aigua', transfers: [] },
      { name: 'Torre Baró | Vallbona', transfers: [] },
      { name: 'Ciutat Meridiana', transfers: [] },
      { name: 'Can Cuiàs', transfers: [] },
    ]
  },
};

// Flat list of all unique station names (for search)
export const ALL_STATIONS = [...new Set(
  Object.values(LINES).flatMap(line =>
    line.stations.map(s => s.name)
  )
)].sort();

// Get line color as CSS variable reference
export function getLineColor(lineId) {
  return LINES[lineId]?.color || '#888';
}

// Get text color for a line badge
export function getLineTextColor(lineId) {
  return LINES[lineId]?.textColor || '#FFFFFF';
}

// Check if line uses dark text (for yellow/light backgrounds)
export function isDarkText(lineId) {
  return LINES[lineId]?.textColor === '#1a1a2e';
}

// Get all lines that serve a given station
export function getLinesAtStation(stationName) {
  return Object.values(LINES).filter(line =>
    line.stations.some(s => s.name === stationName)
  );
}

// Get stations reachable from a boarding station in a given direction
export function getStationsAfter(lineId, boardingStation, direction) {
  const line = LINES[lineId];
  if (!line) return [];

  const stations = line.stations;
  const terminalIdx = direction === line.terminals[1]
    ? stations.length - 1
    : 0;
  const boardIdx = stations.findIndex(s => s.name === boardingStation);
  if (boardIdx === -1) return [];

  if (terminalIdx > boardIdx) {
    return stations.slice(boardIdx + 1);
  } else {
    return stations.slice(0, boardIdx).reverse();
  }
}

// Get all line IDs
export function getLineIds() {
  return Object.keys(LINES);
}
