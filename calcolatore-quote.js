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
    var html = "";
    var check = 0;
    quote.forEach(function (x) {
      check += x.q;
      html += '<div class="quota-row"><span>' + x.nome + "</span><strong>" + euro(x.q) + "</strong></div>";
    });
    html += '<div class="tot">Totale: ' + euro(check) + " · le quote sono arrotondate al centesimo</div>";
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
