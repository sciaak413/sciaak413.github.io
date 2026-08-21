// Calcolatore quote bollette — vanilla JS, esterno per rispettare la CSP
// (script-src 'self': niente script inline). Nessun dato lascia la pagina.
(function () {
  var importoEl = document.getElementById("importo");
  var personeEl = document.getElementById("persone");
  var btnUguali = document.getElementById("mode-uguali");
  var btnDiverse = document.getElementById("mode-diverse");
  var partiList = document.getElementById("parti-list");
  var risultato = document.getElementById("risultato");
  var mode = "uguali";

  function euro(n) {
    return n.toLocaleString("it-IT", { style: "currency", currency: "EUR" });
  }

  function persone() {
    var n = parseInt(personeEl.value, 10);
    if (isNaN(n) || n < 2) n = 2;
    if (n > 12) n = 12;
    // Il numero si stringe fra 2 e 12, e la casella lo deve DIRE: scrivendo 20
    // restavano scritti 20 e comparivano 12 righe, senza niente che spiegasse
    // la differenza. Si corregge solo il numero fuori scala: una casella vuota
    // o un "1" a meta' digitazione non vanno riscritti sotto le dita.
    var battuto = parseInt(personeEl.value, 10);
    if (!isNaN(battuto) && battuto > 12) personeEl.value = String(n);
    return n;
  }

  function importo() {
    var v = String(importoEl.value).replace(",", ".");
    var n = parseFloat(v);
    return isNaN(n) || n < 0 ? 0 : n;
  }

  function renderPartiInputs() {
    var n = persone();
    partiList.innerHTML = "";
    for (var i = 0; i < n; i++) {
      var row = document.createElement("div");
      row.className = "parte-row";
      var label = document.createElement("span");
      label.textContent = "Coinquilino " + (i + 1) + " — parti:";
      var input = document.createElement("input");
      input.type = "number";
      input.min = "0.5";
      input.step = "0.5";
      input.value = "1";
      input.setAttribute("data-parte", String(i));
      input.addEventListener("input", calcola);
      row.appendChild(label);
      row.appendChild(input);
      partiList.appendChild(row);
    }
  }

  function calcola() {
    var tot = importo();
    var n = persone();
    if (tot <= 0) {
      risultato.style.display = "none";
      return;
    }
    var quote = [];
    if (mode === "uguali") {
      for (var i = 0; i < n; i++) quote.push({ nome: "Coinquilino " + (i + 1), q: tot / n });
    } else {
      var inputs = partiList.querySelectorAll("input[data-parte]");
      var parti = [];
      var somma = 0;
      inputs.forEach(function (inp) {
        var p = parseFloat(String(inp.value).replace(",", "."));
        if (isNaN(p) || p <= 0) p = 1;
        parti.push(p);
        somma += p;
      });
      if (somma <= 0) return;
      parti.forEach(function (p, i) {
        quote.push({ nome: "Coinquilino " + (i + 1) + " (" + p + (p === 1 ? " parte" : " parti") + ")", q: (tot * p) / somma });
      });
    }
    // I CENTESIMI CHE NON SI DIVIDONO. 100 fra 3 fa 33,33 a testa: sommando
    // quello che si legge vengono 99,99, mentre il totale scritto sotto diceva
    // 100,00. Un centesimo in meno e nessuno che dica dove sia finito — su una
    // pagina che promette conti che tornano, e che per molti e' il primo
    // incontro con l'app.
    // Si fa come nell'app: le quote si arrotondano e il resto va a QUALCUNO
    // invece di sparire. Cosi' la somma di cio' che si vede e' il totale.
    var cent = quote.map(function (x) { return Math.floor(x.q * 100); });
    var mancano = Math.round(tot * 100) - cent.reduce(function (a, b) { return a + b; }, 0);
    for (var k = 0; k < mancano; k++) cent[k % cent.length] += 1;

    var html = "";
    var check = 0;
    quote.forEach(function (x, i) {
      var q = cent[i] / 100;
      check += q;
      html += '<div class="quota-row"><span>' + x.nome + "</span><strong>" + euro(q) + "</strong></div>";
    });
    html += '<div class="tot">Totale: ' + euro(check) + " · i centesimi che non si dividono restano a chi paga</div>";
    risultato.innerHTML = html;
    risultato.style.display = "block";
  }

  function setMode(m) {
    mode = m;
    btnUguali.classList.toggle("active", m === "uguali");
    btnDiverse.classList.toggle("active", m === "diverse");
    partiList.hidden = m !== "diverse";
    if (m === "diverse") renderPartiInputs();
    calcola();
  }

  btnUguali.addEventListener("click", function () { setMode("uguali"); });
  btnDiverse.addEventListener("click", function () { setMode("diverse"); });
  importoEl.addEventListener("input", calcola);
  personeEl.addEventListener("input", function () {
    if (mode === "diverse") renderPartiInputs();
    calcola();
  });
})();
