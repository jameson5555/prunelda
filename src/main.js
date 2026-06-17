import './style.css'
import {
  BUSINESSES,
  CASH_EVENTS,
  HEADLINES,
  INHERITANCE_BONUS,
  PRIME_RATES,
  STARTING_CASH,
  STORAGE_KEY,
} from './game-data.js'

const app = document.querySelector('#app')
const baseUrl = import.meta.env.BASE_URL
const state = {
  view: 'title',
  setupCount: 1,
  setupNames: ['', '', '', ''],
  game: loadGame(),
}

function loadGame() {
  const raw = window.localStorage.getItem(STORAGE_KEY)
  if (!raw) {
    return null
  }

  try {
    const game = JSON.parse(raw)
    const updated = normalizeSavedGame(game)
    if (updated) {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(game))
    }
    return game
  } catch {
    window.localStorage.removeItem(STORAGE_KEY)
    return null
  }
}

function normalizeSavedGame(game) {
  if (!game?.currentTurn) {
    return false
  }

  let updated = false
  const player = currentPlayer(game)
  if (!player) {
    return false
  }

  const oldInstruction = `${player.name}, enter the number of the property you wish to visit next.`
  const previousInstruction = `${player.name}, trade stocks, place one optional dice bet, then press Continue to end your turn.`
  if (game.currentTurn.status === oldInstruction || game.currentTurn.status === previousInstruction) {
    game.currentTurn.status = turnInstruction(player)
    updated = true
  }

  if (!game.headlineModal || typeof game.headlineModal !== 'object') {
    game.headlineModal = {
      month: game.month,
      dismissed: false,
    }
    updated = true
  }

  syncHeadlineModal(game)
  if (game.headlineModal.month !== game.month) {
    game.headlineModal.month = game.month
    updated = true
  }

  return updated
}

function turnInstruction(player) {
  return `${player.name}, review the news, trade any stocks you want, optionally roll the dice, then end your turn.`
}

function saveGame() {
  if (state.game) {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state.game))
  }
}

function clearSavedGame() {
  window.localStorage.removeItem(STORAGE_KEY)
  state.game = null
}

function assetUrl(path) {
  return `${baseUrl}${path}`
}

function sample(list) {
  return list[Math.floor(Math.random() * list.length)]
}

function clamp(value, minimum, maximum) {
  return Math.min(Math.max(value, minimum), maximum)
}

function formatMoney(value) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(value)
}

function formatPercent(value) {
  return `${value}%`
}

function formatSector(sector) {
  return sector
    .split('-')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ')
}

function headlineImpactForBusiness(game, business) {
  return game.headline?.effects?.[business.id] || 0
}

function headlineImpactLabel(value) {
  if (value > 0) {
    return `News boost +${Math.round(value * 100)}%`
  }

  if (value < 0) {
    return `News drag ${Math.round(value * 100)}%`
  }

  return 'No direct news'
}

function headlineImpactClass(value) {
  if (value > 0) {
    return 'is-up'
  }

  if (value < 0) {
    return 'is-down'
  }

  return 'is-neutral'
}

function affectedBusinesses(game) {
  const map = businessMap(game)
  return Object.entries(game.headline?.effects || {})
    .map(([id, effect]) => ({
      business: map.get(Number(id)),
      effect,
    }))
    .filter((entry) => entry.business)
    .sort((left, right) => Math.abs(right.effect) - Math.abs(left.effect))
}

function monthsLeft(game) {
  return Math.max(0, game.monthsTotal - game.month + 1)
}

function horatioGap(game, netWorth) {
  return Math.max(0, game.horatioNetWorth - netWorth + 1)
}

function businessMap(game) {
  return new Map(game.businesses.map((business) => [business.id, business]))
}

function sellableBusinesses(game, player) {
  const map = businessMap(game)

  return Object.entries(player.holdings)
    .map(([id, shares]) => ({
      business: map.get(Number(id)),
      shares,
    }))
    .filter((entry) => entry.business && entry.shares > 0)
    .sort((left, right) => left.business.id - right.business.id)
}

function syncHeadlineModal(game) {
  if (!game) {
    return
  }

  if (!game.headlineModal || typeof game.headlineModal !== 'object') {
    game.headlineModal = {
      month: game.month,
      dismissed: false,
    }
    return
  }

  if (game.headlineModal.month !== game.month) {
    game.headlineModal = {
      month: game.month,
      dismissed: false,
    }
  }
}

function isHeadlineModalOpen(game) {
  syncHeadlineModal(game)
  return Boolean(game?.headline && !game.headlineModal.dismissed)
}

function dismissHeadlineModal() {
  if (!state.game) {
    return
  }

  syncHeadlineModal(state.game)
  state.game.headlineModal.dismissed = true
  saveGame()
  render()
}

function currentPlayer(game) {
  return game.players[game.activePlayerIndex]
}

function playerNetWorth(game, player) {
  const map = businessMap(game)
  const holdingsValue = Object.entries(player.holdings).reduce((total, [id, shares]) => {
    const business = map.get(Number(id))
    return total + (business ? business.price * shares : 0)
  }, 0)

  return player.cash + holdingsValue
}

function sortedPlayers(game) {
  return [...game.players]
    .map((player) => ({ ...player, netWorth: playerNetWorth(game, player) }))
    .sort((left, right) => right.netWorth - left.netWorth)
}

function pushLog(game, text) {
  game.log.unshift({ month: game.month, text })
  game.log = game.log.slice(0, 18)
}

function createPlayer(name, index) {
  return {
    id: index + 1,
    name,
    cash: STARTING_CASH,
    holdings: {},
    monthlySavings: 0,
    monthlyUpkeep: 0,
    hasTableTennisTeam: false,
  }
}

function createGame() {
  const players = state.setupNames
    .slice(0, state.setupCount)
    .map((name, index) => createPlayer(name || `Player ${index + 1}`, index))

  const game = {
    month: 1,
    monthsTotal: 12,
    activePlayerIndex: 0,
    headline: null,
    primeRate: 0,
    horatioNetWorth: 58000,
    players,
    businesses: BUSINESSES.map((business) => ({ ...business, price: business.baseValue })),
    currentTurn: null,
    currentTurnKey: null,
    log: [],
    headlineModal: {
      month: 1,
      dismissed: false,
    },
    finished: false,
    outcome: null,
  }

  startMonth(game, true)
  return game
}

function applyMarketForMonth(game, headline) {
  const headlineEffects = headline.effects || {}

  for (const business of game.businesses) {
    const directed = headlineEffects[business.id] || 0
    const drift = (Math.random() * 0.12) - 0.06
    const rateBias = business.sector === 'finance'
      ? game.primeRate / 200
      : business.sector === 'property'
        ? -game.primeRate / 300
        : 0
    const multiplier = 1 + directed + drift + rateBias
    business.price = clamp(Math.round(business.price * multiplier), 1500, 45000)
  }
}

function applyCashEvent(game, player) {
  const event = sample(CASH_EVENTS.filter((candidate) => {
    if (candidate.kind === 'computer') {
      return player.monthlySavings === 0
    }

    if (candidate.kind === 'team') {
      return !player.hasTableTennisTeam
    }

    if (candidate.kind === 'teamWin') {
      return player.hasTableTennisTeam
    }

    return true
  }))

  let amount = 0
  let text = event.text

  if (candidateIs(event, 'tax')) {
    amount = -Math.max(3000, Math.round(player.cash * 0.1))
  } else if (candidateIs(event, 'refund')) {
    amount = Math.max(3000, Math.round(player.cash * 0.1))
  } else if (candidateIs(event, 'computer')) {
    amount = Math.max(0, (game.monthsTotal - game.month) * 1000)
    player.monthlySavings += 1000
  } else if (candidateIs(event, 'team')) {
    player.hasTableTennisTeam = true
    player.monthlyUpkeep += 800
  } else if (candidateIs(event, 'teamWin')) {
    amount = 40000
    player.hasTableTennisTeam = false
    player.monthlyUpkeep = Math.max(0, player.monthlyUpkeep - 800)
  } else if (typeof event.percent === 'number') {
    amount = Math.round(player.cash * event.percent)
  } else {
    amount = event.amount || 0
  }

  player.cash += amount
  pushLog(game, `${player.name}: ${text} ${amount !== 0 ? `(${amount > 0 ? '+' : ''}${formatMoney(amount)})` : ''}`)

  return { text, amount }
}

function candidateIs(event, kind) {
  return event.kind === kind
}

function beginTurn(game) {
  const player = currentPlayer(game)

  if (player.monthlySavings > 0) {
    player.cash += player.monthlySavings
    pushLog(game, `${player.name}: your computer saves you ${formatMoney(player.monthlySavings)} this month.`)
  }

  if (player.monthlyUpkeep > 0) {
    player.cash -= player.monthlyUpkeep
    pushLog(game, `${player.name}: your monthly obligations cost ${formatMoney(player.monthlyUpkeep)}.`)
  }

  const eventResult = applyCashEvent(game, player)
  game.currentTurn = {
    eventText: eventResult.text,
    eventAmount: eventResult.amount,
    canBet: true,
    status: turnInstruction(player),
  }
  game.currentTurnKey = `${game.month}-${player.id}`
}

function finishGame(game) {
  const rankings = sortedPlayers(game)
  const winner = rankings[0]
  const beatHoratio = winner.netWorth > game.horatioNetWorth

  game.finished = true
  game.outcome = {
    rankings,
    beatHoratio,
    inheritanceAwarded: beatHoratio ? INHERITANCE_BONUS : 0,
  }

  if (beatHoratio) {
    pushLog(game, `${winner.name} has won Aunt Prunelda's fortune and is now ${formatMoney(INHERITANCE_BONUS)} wealthier.`)
  } else {
    pushLog(game, `${winner.name} finishes ahead of the family field, but Cousin Horatio keeps Aunt Prunelda unimpressed.`)
  }
}

function startMonth(game, firstMonth = false) {
  if (!firstMonth) {
    game.month += 1
  }

  if (game.month > game.monthsTotal) {
    finishGame(game)
    return
  }

  game.activePlayerIndex = 0
  game.primeRate = sample(PRIME_RATES)
  game.headline = sample(HEADLINES)
  game.headlineModal = {
    month: game.month,
    dismissed: false,
  }
  applyMarketForMonth(game, game.headline)
  game.horatioNetWorth = clamp(
    Math.round(game.horatioNetWorth * (1 + ((Math.random() * 0.14) - 0.05)) + game.headline.horatioDelta),
    25000,
    250000,
  )

  pushLog(game, `Month ${game.month}: ${game.headline.text} The prime rate is now ${formatPercent(game.primeRate)}.`)
  beginTurn(game)
}

function advanceTurn() {
  const game = state.game
  if (!game || game.finished) {
    return
  }

  if (game.activePlayerIndex < game.players.length - 1) {
    game.activePlayerIndex += 1
    beginTurn(game)
  } else {
    startMonth(game)
  }

  if (game.finished) {
    state.view = 'ending'
  }

  saveGame()
  render()
}

function handleBuy(formData) {
  const game = state.game
  const player = currentPlayer(game)
  const businessId = Number(formData.get('businessId'))
  const quantity = Number(formData.get('quantity'))
  const business = game.businesses.find((entry) => entry.id === businessId)

  if (!business || !Number.isFinite(quantity) || quantity <= 0) {
    return
  }

  const total = business.price * quantity
  if (player.cash < total) {
    game.currentTurn.status = 'Not enough cash on hand for that purchase.'
    render()
    return
  }

  player.cash -= total
  player.holdings[businessId] = (player.holdings[businessId] || 0) + quantity
  game.currentTurn.status = `Bought ${quantity} ${business.name} stake${quantity > 1 ? 's' : ''} for ${formatMoney(total)}. You now own ${player.holdings[businessId]} and have ${formatMoney(player.cash)} cash left.`
  pushLog(game, `${player.name} bought ${quantity} ${business.name} stake${quantity > 1 ? 's' : ''} for ${formatMoney(total)}.`)
  saveGame()
  render()
}

function handleSell(formData) {
  const game = state.game
  const player = currentPlayer(game)
  const businessId = Number(formData.get('businessId'))
  const quantity = Number(formData.get('quantity'))
  const business = game.businesses.find((entry) => entry.id === businessId)
  const owned = player.holdings[businessId] || 0

  if (!business || !Number.isFinite(quantity) || quantity <= 0) {
    return
  }

  if (owned < quantity) {
    game.currentTurn.status = "You can't sell what you do not own."
    render()
    return
  }

  const total = business.price * quantity
  player.cash += total
  player.holdings[businessId] = owned - quantity
  if (player.holdings[businessId] === 0) {
    delete player.holdings[businessId]
  }

  game.currentTurn.status = `Sold ${quantity} ${business.name} stake${quantity > 1 ? 's' : ''} for ${formatMoney(total)}. You now own ${player.holdings[businessId] || 0} and have ${formatMoney(player.cash)} cash.`
  pushLog(game, `${player.name} sold ${quantity} ${business.name} stake${quantity > 1 ? 's' : ''} for ${formatMoney(total)}.`)
  saveGame()
  render()
}

function handleBet(formData) {
  const game = state.game
  const player = currentPlayer(game)
  const bet = Number(formData.get('bet'))

  if (!game.currentTurn.canBet) {
    game.currentTurn.status = 'You have already placed your bet this turn.'
    render()
    return
  }

  if (!Number.isFinite(bet) || bet <= 0 || bet > player.cash) {
    game.currentTurn.status = 'Your bet is invalid.'
    render()
    return
  }

  const roll = () => Math.floor(Math.random() * 6) + 1
  const first = roll() + roll()
  let text = `Your bet is ${formatMoney(bet)}. Your point is ${first}. `
  let delta = 0

  if (first === 7 || first === 11) {
    delta = bet
    text += "You're a winner!"
  } else if ([2, 3, 12].includes(first)) {
    delta = -bet
    text += "That's a loser."
  } else {
    let resolved = false
    while (!resolved) {
      const next = roll() + roll()
      if (next === first) {
        delta = bet
        text += ` Rolled ${next}. You're a winner!`
        resolved = true
      } else if (next === 7) {
        delta = -bet
        text += ' Seven out. That is a loser.'
        resolved = true
      }
    }
  }

  player.cash += delta
  game.currentTurn.canBet = false
  game.currentTurn.status = `${text} ${delta > 0 ? 'Cash gained' : 'Cash lost'}: ${formatMoney(Math.abs(delta))}. Cash now: ${formatMoney(player.cash)}.`
  pushLog(game, `${player.name}: ${text} ${delta !== 0 ? `(${delta > 0 ? '+' : ''}${formatMoney(delta)})` : ''}`)
  saveGame()
  render()
}

function pruneldaArt(extraClass = '') {
  return `
    <img class="prunelda-art ${extraClass}" src="${assetUrl('images/prunelda-money-bags.png')}" alt="Aunt Prunelda standing with two money bags." />
  `
}

function titleView() {
  const continueButton = state.game
    ? '<button class="hero-button secondary" data-action="continue-game">Continue Game</button>'
    : ''

  return `
    <main class="game-shell intro-shell title-shell">
      <section class="arcade-marquee retro-screen title-marquee">
        <p class="marquee-mini">Aunt</p>
        <p class="marquee-big">Prunelda&apos;s</p>
        <h1 class="marquee-title">Inheritance!</h1>
        <p class="marquee-copy">Compete with other players and Cousin Horatio for your ridiculously wealthy aunt&apos;s estate.</p>
        ${pruneldaArt('title-prunelda-art')}
        <div class="hero-actions marquee-actions">
          <button class="hero-button" data-action="begin-setup">Start New Game</button>
          ${continueButton}
          ${state.game ? '<button class="hero-button ghost" data-action="clear-save">Clear Save</button>' : ''}
        </div>
        <div class="title-footer">
          <p>Trade across 26 stocks</p>
          <p>Ride monthly news swings</p>
          <p>Beat Cousin Horatio</p>
        </div>
      </section>
    </main>
  `
}

function setupView() {
  const rows = Array.from({ length: 4 }, (_, index) => {
    const enabled = index < state.setupCount
    return `
      <label class="setup-row ${enabled ? '' : 'disabled'}">
        <span>${index === 0 ? 'PLAYER #1, WHAT IS YOUR NAME?' : `PLAYER #${index + 1} NAME`}</span>
        <input type="text" name="player-${index}" value="${state.setupNames[index] || ''}" ${enabled ? '' : 'disabled'} maxlength="24" />
      </label>
    `
  }).join('')

  return `
    <main class="game-shell setup-shell">
      <section class="setup-panel retro-screen gameplay-panel setup-screen-panel">
        <h1>Set Up Player Files</h1>
        <p class="screen-rule">HOW MANY WILL BE PLAYING (1-4)?</p>
        <div class="count-row">
          ${[1, 2, 3, 4].map((count) => `
            <button class="count-pill ${state.setupCount === count ? 'selected' : ''}" data-action="player-count" data-count="${count}">${count}</button>
          `).join('')}
        </div>
        <form id="setup-form" class="setup-form">
          ${rows}
          <div class="setup-actions">
            <button type="submit" class="hero-button">Begin</button>
            <button type="button" class="hero-button ghost" data-action="back-title">Back</button>
          </div>
        </form>
      </section>
    </main>
  `
}

function holdingsMarkup(game, player) {
  const map = businessMap(game)
  const entries = Object.entries(player.holdings)
  if (!entries.length) {
    return '<p class="empty-note">NO HOLDINGS YET.</p>'
  }

  return `
    <ul class="holding-list">
      ${entries.map(([id, shares]) => {
        const business = map.get(Number(id))
        const value = business ? business.price * shares : 0
        return `<li><span>${business.name} x${shares}</span><strong>${formatMoney(value)}</strong></li>`
      }).join('')}
    </ul>
  `
}

function marketTable(game, player) {
  return `
    <div class="market-table">
      ${game.businesses.map((business) => {
        const owned = player.holdings[business.id] || 0
        const impact = headlineImpactForBusiness(game, business)
        return `
          <article class="market-row ${impact !== 0 ? 'has-impact' : ''}">
            <div class="market-business">
              <p class="market-id">${business.id}. ${business.name}</p>
              <p class="market-sector">${formatSector(business.sector)}</p>
            </div>
            <div class="market-stats">
              <span>${formatMoney(business.price)}</span>
              <span>Owned: ${owned}</span>
              <span class="impact-badge ${headlineImpactClass(impact)}">${headlineImpactLabel(impact)}</span>
            </div>
          </article>
        `
      }).join('')}
    </div>
  `
}

function marketReferenceMarkup(game, player) {
  const defaultOpen = window.matchMedia('(min-width: 721px)').matches

  return `
    <details class="side-panel market-reference retro-screen gameplay-panel" ${defaultOpen ? 'open' : ''}>
      <summary class="market-reference-summary">
        <span>Market Board</span>
      </summary>
      ${marketTable(game, player)}
    </details>
  `
}

function playerScoreboard(game) {
  const rankingRows = sortedPlayers(game).map((player, index) => `
    <li>
      <span>${index + 1}. ${player.name}</span>
      <strong>${formatMoney(player.netWorth)}</strong>
    </li>
  `).join('')

  return `
    <section class="side-panel retro-screen gameplay-panel">
      <h2>Family Ledger</h2>
      <ul class="score-list">${rankingRows}</ul>
      <div class="horatio-card">
        <span>Cousin Horatio now has</span>
        <strong>${formatMoney(game.horatioNetWorth)}</strong>
      </div>
    </section>
  `
}

function logMarkup(game) {
  return `
    <section class="log-panel retro-screen gameplay-panel">
      <h2>Monthly News</h2>
      <ul class="log-list">
        ${game.log.map((entry) => `<li><span class="log-month">M${entry.month}</span><span>${entry.text}</span></li>`).join('')}
      </ul>
    </section>
  `
}

function affectedBusinessesMarkup(game) {
  const entries = affectedBusinesses(game)
  if (!entries.length) {
    return '<p class="helper-copy">No stocks are directly named by this bulletin. Watch the market drift and prime rate.</p>'
  }

  return `
    <ul class="affected-list">
      ${entries.map(({ business, effect }) => `
        <li>
          <span>${business.name}</span>
          <strong class="${headlineImpactClass(effect)}">${effect > 0 ? 'Up' : 'Down'} ${Math.abs(Math.round(effect * 100))}%</strong>
        </li>
      `).join('')}
    </ul>
  `
}

function strategyBriefingMarkup(game, player, netWorth) {
  if (game.month !== 1 || game.activePlayerIndex !== 0) {
    return ''
  }

  return `
    <section class="strategy-panel retro-screen gameplay-panel">
      <h2>How To Win</h2>
      <ul class="strategy-list">
        <li>Beat Cousin Horatio after 12 months.</li>
        <li>Net worth is your cash plus the current value of your holdings.</li>
        <li>Monthly news points toward stocks that may be worth buying or selling.</li>
        <li>The dice bet is optional. Skip it whenever your cash matters more.</li>
      </ul>
      <p class="helper-copy">${player.name} needs ${formatMoney(horatioGap(game, netWorth))} more net worth to pass Horatio right now.</p>
    </section>
  `
}

function turnChecklistMarkup(game) {
  const traded = !game.currentTurn.status.includes('review the news')
  return `
    <ol class="turn-checklist" aria-label="Turn checklist">
      <li class="is-done"><span>1</span><strong>Read the monthly news</strong></li>
      <li class="${traded ? 'is-done' : ''}"><span>2</span><strong>Buy or sell stocks</strong></li>
      <li class="${game.currentTurn.canBet ? '' : 'is-done'}"><span>3</span><strong>Optional dice bet</strong></li>
      <li><span>4</span><strong>End turn</strong></li>
    </ol>
  `
}

function headlineModalMarkup(game) {
  if (!isHeadlineModalOpen(game)) {
    return ''
  }

  return `
    <div class="headline-modal-backdrop" data-headline-modal-backdrop="true">
      <section class="headline-modal retro-screen gameplay-panel" data-headline-modal-panel="true" role="dialog" aria-modal="true" aria-labelledby="headline-modal-title">
        <p class="eyebrow">Monthly News Bulletin</p>
        <h2 id="headline-modal-title" class="headline-modal-title">${game.headline.text}</h2>
        <p class="headline-modal-copy">${game.headline.blurb}</p>
        <div class="headline-impacts">
          <h3>Stocks named by the news</h3>
          ${affectedBusinessesMarkup(game)}
        </div>
        <div class="headline-modal-actions">
          <button class="hero-button secondary" type="button" data-action="dismiss-headline-modal">Continue To Trading</button>
        </div>
      </section>
    </div>
  `
}

function gameView() {
  const game = state.game
  const player = currentPlayer(game)
  const netWorth = playerNetWorth(game, player)
  const ownedBusinesses = sellableBusinesses(game, player)
  const canSell = ownedBusinesses.length > 0
  const reviewMode = game.finished
  const gap = horatioGap(game, netWorth)

  return `
    <main class="game-shell play-shell gameplay-shell">
      <section class="masthead-panel retro-screen gameplay-panel">
        <div>
          <p class="eyebrow">Month ${game.month} of ${game.monthsTotal}</p>
          <h1>Aunt Prunelda&apos;s Inheritance</h1>
          <p class="headline">${game.headline.text}</p>
          <p class="headline-blurb">${game.headline.blurb}</p>
        </div>
        <div class="masthead-stats">
          <div><span>The prime rate is now</span><strong>${formatPercent(game.primeRate)}</strong></div>
          <div><span>Current player</span><strong>${player.name}</strong></div>
          <div><span>Cash on hand</span><strong>${formatMoney(player.cash)}</strong></div>
          <div><span>Net worth</span><strong>${formatMoney(netWorth)}</strong></div>
          <div><span>Months left</span><strong>${monthsLeft(game)}</strong></div>
          <div><span>Needed to beat Horatio</span><strong>${gap > 0 ? formatMoney(gap) : 'Ahead!'}</strong></div>
        </div>
      </section>

      <section class="play-grid">
        <section class="main-panel">
          ${strategyBriefingMarkup(game, player, netWorth)}

          <div class="turn-card retro-screen focus-card">
            <h2>${reviewMode ? 'Final Turn Summary' : 'Current Turn'}</h2>
            <p class="turn-event">${game.currentTurn.eventText}</p>
            <p class="turn-status">${reviewMode ? 'Review the final standings and monthly headlines below.' : game.currentTurn.status}</p>
            ${reviewMode ? '' : turnChecklistMarkup(game)}
          </div>

          <div class="action-grid">
            <form id="buy-form" class="action-card retro-screen gameplay-panel">
              <h3>Buy Shares</h3>
              <label>
                <span>Business</span>
                <select name="businessId">
                  ${game.businesses.map((business) => {
                    const impact = headlineImpactForBusiness(game, business)
                    const impactText = impact === 0 ? '' : ` - ${headlineImpactLabel(impact)}`
                    return `<option value="${business.id}">${business.id}. ${business.name} (${formatMoney(business.price)})${impactText}</option>`
                  }).join('')}
                </select>
              </label>
              <label>
                <span>Quantity</span>
                <input type="number" name="quantity" min="1" value="1" />
              </label>
              <button type="submit" class="hero-button small" ${reviewMode ? 'disabled' : ''}>Buy</button>
            </form>

            <form id="sell-form" class="action-card retro-screen gameplay-panel">
              <h3>Sell Shares</h3>
              <label>
                <span>Business</span>
                <select name="businessId" ${canSell ? '' : 'disabled'}>
                  ${canSell
                    ? ownedBusinesses.map(({ business, shares }) => `<option value="${business.id}">${business.id}. ${business.name} (${shares} owned)</option>`).join('')
                    : '<option value="">No holdings to sell</option>'}
                </select>
              </label>
              <label>
                <span>Quantity</span>
                <input type="number" name="quantity" min="1" value="1" ${canSell ? '' : 'disabled'} />
              </label>
              <button type="submit" class="hero-button small secondary" ${(canSell && !reviewMode) ? '' : 'disabled'}>Sell</button>
            </form>

            <form id="bet-form" class="action-card retro-screen gameplay-panel">
              <h3>Optional Dice Bet</h3>
              <p class="helper-copy">One roll per turn. It can help, but it can also erase useful trading cash.</p>
              <label>
                <span>Your bet is</span>
                <input type="number" name="bet" min="1" max="${Math.max(1, Math.floor(player.cash))}" value="1000" />
              </label>
              <button type="submit" class="hero-button small ghost" ${(game.currentTurn.canBet && !reviewMode) ? '' : 'disabled'}>${reviewMode ? 'Game Complete' : game.currentTurn.canBet ? 'Roll Dice' : 'Bet Placed'}</button>
            </form>
          </div>

          <section class="holdings-panel retro-screen gameplay-panel">
            <div class="panel-heading">
              <h2>${player.name}&apos;s Current Holdings</h2>
              <button class="hero-button small secondary desktop-end-turn" data-action="end-turn" ${reviewMode ? 'disabled' : ''}>End Turn</button>
            </div>
            ${holdingsMarkup(game, player)}
          </section>
        </section>

        <aside class="rail-panel">
          ${playerScoreboard(game)}
          ${reviewMode ? '' : marketReferenceMarkup(game, player)}
          <section class="side-panel compact-actions retro-screen gameplay-panel">
            <button class="hero-button secondary" data-action="save-quit">Save</button>
            <button class="hero-button ghost" data-action="restart-game">Restart</button>
          </section>
        </aside>
      </section>

      ${logMarkup(game)}
      ${headlineModalMarkup(game)}
      <div class="mobile-end-turn-bar ${reviewMode ? 'is-hidden' : ''}" aria-hidden="${reviewMode ? 'true' : 'false'}">
        <button class="hero-button secondary" data-action="end-turn" ${reviewMode ? 'disabled' : ''}>End Turn</button>
      </div>
    </main>
  `
}

function endingView() {
  const game = state.game
  const outcome = game.outcome
  const winner = outcome.rankings[0]
  const finalFortune = winner.netWorth + outcome.inheritanceAwarded

  return `
    <main class="game-shell ending-shell">
      <section class="hero-panel ending-panel retro-screen gameplay-panel">
        <div class="ending-layout">
          <div class="ending-copy">
            <p class="eyebrow">Final Results</p>
            <p class="win-banner ${outcome.beatHoratio ? 'is-win' : 'is-loss'}">${outcome.beatHoratio ? 'You&apos;ve Won Aunt Prunelda&apos;s Fortune!' : 'Cousin Horatio Wins This Round'}</p>
            <h1>${outcome.beatHoratio ? 'Aunt Prunelda Would Be Very Pleased!' : 'Aunt Prunelda Would Be Disappointed!'}</h1>
            <p class="hero-copy">
              ${outcome.beatHoratio
                ? `${winner.name} has won Aunt Prunelda's fortune and is now ${formatMoney(INHERITANCE_BONUS)} wealthier.`
                : `${winner.name} finishes with the strongest ledger, but Cousin Horatio still holds the family bragging rights.`}
            </p>
            <div class="ending-summary">
              <div><span>Winning player</span><strong>${winner.name}</strong></div>
              <div><span>Final net worth</span><strong>${formatMoney(winner.netWorth)}</strong></div>
              <div><span>After inheritance</span><strong>${formatMoney(finalFortune)}</strong></div>
              <div><span>Cousin Horatio</span><strong>${formatMoney(game.horatioNetWorth)}</strong></div>
            </div>
            <div class="hero-actions">
              <button class="hero-button" data-action="begin-setup">Play Again</button>
              <button class="hero-button ghost" data-action="clear-save">Clear Save</button>
            </div>
          </div>
          <div class="ending-art">
            ${pruneldaArt('ending-prunelda-art')}
          </div>
        </div>
      </section>
    </main>
  `
}

function render() {
  if (state.view === 'ending' && state.game?.finished) {
    app.innerHTML = endingView()
    return
  }

  if (state.view === 'setup') {
    app.innerHTML = setupView()
    return
  }

  if (state.view === 'game' && state.game) {
    app.innerHTML = gameView()
    return
  }

  app.innerHTML = titleView()
}

app.addEventListener('click', (event) => {
  if (event.target instanceof Element && event.target.hasAttribute('data-headline-modal-backdrop')) {
    dismissHeadlineModal()
    return
  }

  const target = event.target.closest('[data-action]')
  if (!target) {
    return
  }

  const { action } = target.dataset
  if (action === 'begin-setup') {
    state.view = 'setup'
  } else if (action === 'back-title') {
    state.view = 'title'
  } else if (action === 'dismiss-headline-modal') {
    dismissHeadlineModal()
    return
  } else if (action === 'player-count') {
    state.setupCount = Number(target.dataset.count)
  } else if (action === 'continue-game' && state.game) {
    state.view = state.game.finished ? 'ending' : 'game'
  } else if (action === 'review-finished-game' && state.game?.finished) {
    state.view = 'game'
  } else if (action === 'clear-save') {
    clearSavedGame()
    state.view = 'title'
  } else if (action === 'save-quit') {
    saveGame()
    state.view = 'title'
  } else if (action === 'restart-game') {
    state.view = 'setup'
  } else if (action === 'end-turn') {
    advanceTurn()
    return
  }

  render()
})

app.addEventListener('submit', (event) => {
  event.preventDefault()
  const formData = new FormData(event.target)

  if (event.target.id === 'setup-form') {
    state.setupNames = Array.from({ length: 4 }, (_, index) => String(formData.get(`player-${index}`) || '').trim())
    state.game = createGame()
    state.view = 'game'
    saveGame()
    render()
    return
  }

  if (!state.game || state.game.finished) {
    return
  }

  if (event.target.id === 'buy-form') {
    handleBuy(formData)
  } else if (event.target.id === 'sell-form') {
    handleSell(formData)
  } else if (event.target.id === 'bet-form') {
    handleBet(formData)
  }
})

if (state.game?.finished) {
  state.view = 'ending'
}

render()
