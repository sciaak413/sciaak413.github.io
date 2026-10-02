/**
 * STATISTICHE DELLE PAGINE STATICHE (guide SEO + calcolatore).
 *
 * PERCHE' ESISTE. Le 11 guide e il calcolatore erano vivi da due mesi e non
 * mandavano niente: `analytics_events` copriva solo la app React. Il canale che
 * dovrebbe portare sconosciuti — l'unico che cresce senza metterci la faccia —
 * era l'unico non misurato. Non «misurato a zero»: proprio non guardato.
 *
 * ⚠️ PERCHE' E' UN FILE E NON UNO SCRIPT INLINE. Le pagine statiche hanno una
 * CSP stretta: `script-src 'self'` blocca l'inline, e `connect-src` eredita da
 * `default-src 'self'`, quindi la chiamata al backend sarebbe bloccata. Uno
 * script inline qui darebbe zero visite in silenzio — e uno zero silenzioso
 * sarebbe peggio di nessuna statistica, perche' lo si leggerebbe come «non
 * viene nessuno». Serve il file servito dalla nostra origine E il `connect-src`
 * aperto sul nostro backend: se manca uno dei due, non parte niente.
 *
 * LO STESSO ID DI SESSIONE DELLA APP, di proposito: stessa origine, stesso
 * `sessionStorage`, stessa chiave. Cosi' si vede il percorso INTERO — ha letto
 * una guida, poi ha aperto l'app — che e' la domanda che conta davvero, non
 * quante visite fa una pagina.
 *
 * Niente cookie, nessun servizio terzo, nessun dato personale: id casuale che
 * muore alla chiusura della scheda, percorso della pagina e lingua. Dichiarato
 * nel §4.5 dell'informativa, che da ottobre 2026 nomina esplicitamente «le
 * pagine pubbliche del sito splittiamo.app, come guide e calcolatore».
 *
 * ⚠️ Fino ad allora questo commento diceva «e' quanto l'app gia' dichiara»:
 * era troppo largo. Il testo parlava di pagine visitate «all'interno
 * dell'App», e queste pagine le apre anche chi l'app non l'ha mai usata. Una
 * statistica nuova si scrive PRIMA nell'informativa, poi si registra.
 */
(function () {
  "use strict";

  // Sostituiti a build time da scripts/beacon-chiavi.mjs, che legge lo stesso
  // .env della build. Non stanno nel repo: la chiave pubblica non e' un
  // segreto, ma il progetto la tiene fuori da git e non cambio quella regola.
  var URL_BASE = "https://tqctjmfkwmbqgytjxzsl.supabase.co";
  var CHIAVE = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRxY3RqbWZrd21icWd5dGp4enNsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODMxMTkxMTIsImV4cCI6MjA5ODY5NTExMn0.gVqyyj6zkxbwdv1TGVauWPa7RqezUidBnHYrPTJKsnc";

  // Segnaposto non sostituito: la build non ha fatto il suo lavoro. Meglio
  // tacere che sparare richieste a un indirizzo finto.
  if (URL_BASE.indexOf("__") === 0 || CHIAVE.indexOf("__") === 0) return;

  // Sviluppo e anteprime locali non sporcano i numeri (stessa regola di
  // `isLocalHost` in src/lib/analytics.ts).
  var h = location.hostname;
  if (h === "localhost" || h === "127.0.0.1" || h.indexOf("192.168.") === 0) return;

  var sessione = null;
  try {
    sessione = sessionStorage.getItem("bollettiamo:session");
    if (!sessione) {
      sessione = Math.random().toString(36).slice(2, 12);
      sessionStorage.setItem("bollettiamo:session", sessione);
    }
  } catch (e) {
    sessione = null; // memoria del browser negata: si conta lo stesso, senza sessione
  }

  var lingua = (document.documentElement.getAttribute("lang") || "").slice(0, 8);

  try {
    // `fetch` con keepalive e non `sendBeacon`: servono le intestazioni
    // `apikey`/`Authorization`, che rendono la richiesta non-semplice e quindi
    // soggetta a preflight — cosa che sendBeacon non sa fare.
    fetch(URL_BASE + "/rest/v1/analytics_events", {
      method: "POST",
      mode: "cors",
      keepalive: true,
      headers: {
        apikey: CHIAVE,
        Authorization: "Bearer " + CHIAVE,
        "Content-Type": "application/json",
        Prefer: "return=minimal"
      },
      body: JSON.stringify({
        event: "page_view",
        path: location.pathname.slice(0, 200),
        lang: lingua || null,
        session_id: sessione
      })
    })["catch"](function () {
      /* una statistica non deve MAI disturbare la pagina */
    });
  } catch (e) {
    /* idem */
  }
})();
