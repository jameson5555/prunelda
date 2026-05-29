import './style.css'

const base = import.meta.env.BASE_URL
const playerUrl = `${base}emulator/index.html?disk_filename=prunelda.atr`

document.querySelector('#app').innerHTML = `
  <main class="page-shell">
    <section class="player-shell">
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
