import './style.css'

const base = import.meta.env.BASE_URL
const playerUrl = `${base}emulator/index.html?disk_filename=prunelda.atr`

document.querySelector('#app').innerHTML = `
  <main class="page-shell">
    <section class="player-shell">
      <div class="player-actions player-overlay-actions">
        <button class="button-secondary" id="reload-player" type="button">Restart</button>
        <a class="button-primary" href="${playerUrl}" target="_blank" rel="noreferrer">Open player</a>
      </div>
      <div class="player-frame">
        <iframe
          id="prunelda-player"
          title="Aunt Prunelda's Inheritance"
          src="${playerUrl}"
          allow="fullscreen; gamepad; autoplay"
        ></iframe>
      </div>
    </section>
  </main>
`

document.querySelector('#reload-player')?.addEventListener('click', () => {
  const frame = document.querySelector('#prunelda-player')
  if (!(frame instanceof HTMLIFrameElement)) {
    return
  }

  frame.src = playerUrl
})
