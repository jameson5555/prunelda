export const STORAGE_KEY = 'prunelda-remake-save-v1'

export const STARTING_CASH = 60000
export const INHERITANCE_BONUS = 550000000

export const PRIME_RATES = [1, 2, 3, 4, 6, 8, 10, 11.5, 12, 13, 15, 20, 25, 26]

export const BUSINESSES = [
  { id: 1, name: 'Cars & Trucks', baseValue: 15000, sector: 'transport' },
  { id: 2, name: 'Banking', baseValue: 17500, sector: 'finance' },
  { id: 3, name: 'Construction', baseValue: 11000, sector: 'industry' },
  { id: 4, name: 'Casinos', baseValue: 12500, sector: 'leisure' },
  { id: 5, name: 'Finance Co.', baseValue: 10000, sector: 'finance' },
  { id: 6, name: 'Furnaces', baseValue: 8000, sector: 'industry' },
  { id: 7, name: 'Garbage Removal', baseValue: 6000, sector: 'services' },
  { id: 8, name: 'Real Estate', baseValue: 7500, sector: 'property' },
  { id: 9, name: 'Inventions', baseValue: 5000, sector: 'technology' },
  { id: 10, name: 'Jewelry', baseValue: 15000, sector: 'luxury' },
  { id: 11, name: 'Bowling Lanes', baseValue: 10000, sector: 'leisure' },
  { id: 12, name: 'Livestock', baseValue: 7500, sector: 'agriculture' },
  { id: 13, name: 'Dept. Stores', baseValue: 10000, sector: 'retail' },
  { id: 14, name: 'Insurance', baseValue: 15000, sector: 'finance' },
  { id: 15, name: 'Orange Groves', baseValue: 7000, sector: 'agriculture' },
  { id: 16, name: 'Pool Installers', baseValue: 9500, sector: 'services' },
  { id: 17, name: 'Silver Mine', baseValue: 13000, sector: 'materials' },
  { id: 18, name: 'Restaurants', baseValue: 7500, sector: 'hospitality' },
  { id: 19, name: 'Music Studios', baseValue: 6500, sector: 'media' },
  { id: 20, name: 'Tool & Die', baseValue: 12000, sector: 'industry' },
  { id: 21, name: 'Airlines', baseValue: 12000, sector: 'transport' },
  { id: 22, name: 'Rest Homes', baseValue: 8000, sector: 'services' },
  { id: 23, name: 'Warplanes', baseValue: 5000, sector: 'defense' },
  { id: 24, name: 'Hotels', baseValue: 15000, sector: 'hospitality' },
  { id: 25, name: 'Publishing', baseValue: 10000, sector: 'media' },
  { id: 26, name: 'Dairies', baseValue: 17500, sector: 'agriculture' },
]

export const HEADLINES = [
  {
    text: 'Housing starts up slightly!',
    blurb: 'Builders and landlords are smiling this month.',
    effects: { 3: 0.14, 6: 0.08, 8: 0.12, 16: 0.11, 24: 0.06 },
    horatioDelta: 2500,
  },
  {
    text: 'Unemployment shows signs of rising sharply.',
    blurb: 'Retail and travel take the worst of the shock.',
    effects: { 2: -0.08, 5: -0.11, 13: -0.12, 18: -0.09, 21: -0.08, 24: -0.1 },
    horatioDelta: -3500,
  },
  {
    text: 'Truckers strike!',
    blurb: 'Anything that relies on moving goods slows to a crawl.',
    effects: { 1: -0.13, 7: -0.08, 15: -0.07, 20: -0.05, 26: -0.1 },
    horatioDelta: -1800,
  },
  {
    text: 'New union contract signed across heavy industry.',
    blurb: 'Payroll costs climb while the market squints at margins.',
    effects: { 1: -0.07, 3: -0.09, 6: -0.08, 20: -0.12, 23: -0.06 },
    horatioDelta: -900,
  },
  {
    text: 'Hopes for peace raise spirits on the street.',
    blurb: 'Travel and entertainment boom while defense cools off.',
    effects: { 4: 0.07, 11: 0.08, 21: 0.09, 23: -0.18, 24: 0.12 },
    horatioDelta: 3200,
  },
  {
    text: 'High tech stocks take a pounding on the market.',
    blurb: 'A thought-wave computer has spooked the clever money.',
    effects: { 9: -0.18, 17: 0.05, 19: -0.07, 25: -0.05 },
    horatioDelta: -1500,
  },
  {
    text: 'Foreign buyers circle American assets.',
    blurb: 'Finance and travel outfits attract fresh money.',
    effects: { 2: 0.09, 5: 0.06, 14: 0.08, 21: 0.07, 25: 0.05 },
    horatioDelta: 2100,
  },
  {
    text: 'Prime borrowing costs tighten across the board.',
    blurb: 'Cheap speculation fades and cash suddenly looks handsome.',
    effects: { 2: 0.05, 5: 0.04, 8: -0.09, 14: 0.06, 24: -0.05 },
    horatioDelta: -500,
  },
]

export const CASH_EVENTS = [
  { kind: 'tax', text: 'Your tax payment costs you 10% of your total cash or $3000, whichever is higher.' },
  { kind: 'refund', text: 'Your tax refund is for 10% of your cash on hand or $3000, whichever is more.' },
  { kind: 'flat', text: 'Your banker likes you. He is paying an interest bonus of 5%.', amount: 0, percent: 0.05 },
  { kind: 'flat', text: 'Repairs to your Mercedes cost $900.', amount: -900 },
  { kind: 'flat', text: 'Repairs to your corporate jet cost $2500.', amount: -2500 },
  { kind: 'flat', text: "That's a nice pool you just put in. I'll bet it set you back about $6000.", amount: -6000 },
  { kind: 'flat', text: 'How is your kid doing in college? Tuition of $2500 is due.', amount: -2500 },
  { kind: 'flat', text: 'Take your check for $5000 and run.', amount: 5000 },
  { kind: 'flat', text: 'Your annual bonus payment is due. Take the extra $10000.', amount: 10000 },
  { kind: 'flat', text: "It's time to collect a deferred bonus. Pocket the $7500 and use it wisely.", amount: 7500 },
  { kind: 'computer', text: 'You bought a computer. It saves you $1000 for each month remaining in the game.' },
  { kind: 'flat', text: 'A cover story in Time magazine increases your value by $5000.', amount: 5000 },
  { kind: 'flat', text: 'It is payday. Your check is for $3500.', amount: 3500 },
  { kind: 'flat', text: "It's payday. Do not complain about that $1500 check.", amount: 1500 },
  { kind: 'flat', text: "It's payday. Your check is for $4000. That's not bad for a hot dog like you.", amount: 4000 },
  { kind: 'flat', text: 'A Sports Illustrated cover story costs you $2500 to live down.', amount: -2500 },
  { kind: 'flat', text: 'A bonus payment of $15000 is in your mailbox. Try to look surprised.', amount: 15000 },
  { kind: 'team', text: 'You bought a professional table tennis team. It costs you $800 per month.' },
  { kind: 'teamWin', text: 'Your professional table tennis team won the championship. You sold it for $40000. Congratulations!' },
  { kind: 'flat', text: 'An uninsured theft costs you $1000.', amount: -1000 },
]