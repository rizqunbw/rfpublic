/* RF TEMPEST donation controller — maintained on GitHub */
(() => {
  "use strict";
  const RATE = Object.freeze({ idrPerPhp: 300, usdPerPhp: 1 / 50, coinsPerPhp: 1000 });
  const root = document.getElementById("tempest-donation");
  if (!root || root.dataset.donationController === "ready") return;
  root.dataset.donationController = "ready";
  const format = (value, locale, max = 2) => new Intl.NumberFormat(locale, {maximumFractionDigits:max}).format(value);
  const numeric = value => Number(String(value).replace(/[^0-9.]/g, "")) || 0;
  const money = (php, currency) => currency === "php"
    ? "₱ " + format(php, "en-PH")
    : currency === "idr"
      ? "Rp " + format(php * RATE.idrPerPhp, "id-ID", 0)
      : "$ " + format(php * RATE.usdPerPhp, "en-US");
  function updatePriceRow(row, php) {
    const cells = row.querySelectorAll(":scope > td");
    if (cells.length < 6) return;
    [3,4,5].forEach((index, i) => {
      const currency = ["php", "idr", "usd"][i];
      const cell = cells[index];
      const icon = cell.querySelector("i");
      if (icon) {
        // Keep the original Font Awesome icon and update only its trailing price.
        [...cell.childNodes].filter(n => n !== icon).forEach(n => n.remove());
        cell.append(document.createTextNode(" " + format(
          currency === "php" ? php : currency === "idr" ? php * RATE.idrPerPhp : php * RATE.usdPerPhp,
          currency === "idr" ? "id-ID" : "en-US", currency === "idr" ? 0 : 2
        )));
      } else cell.textContent = money(php, currency);
    });
  }
  function initialize() {
    root.querySelectorAll("tr").forEach(row => {
      const cells = row.querySelectorAll(":scope > td");
      if (cells.length < 6) return;
      const php = numeric(cells[3].textContent);
      updatePriceRow(row, php);
    });
    root.querySelectorAll(".coin-input-table").forEach(input => {
      if (!input.value.trim()) input.value = "100,000";
      const row = input.closest("tr");
      if (row) updatePriceRow(row, numeric(input.value) / RATE.coinsPerPhp);
    });
  }
  root.addEventListener("input", event => {
    const input = event.target.closest(".coin-input-table");
    if (!input || !root.contains(input)) return;
    const row = input.closest("tr");
    if (row) updatePriceRow(row, numeric(input.value) / RATE.coinsPerPhp);
  });
  root.addEventListener("click", event => {
    const toggle = event.target.closest(".accordion-toggle");
    if (!toggle || !root.contains(toggle)) return;
    event.preventDefault();
    event.stopPropagation();
    const table = toggle.closest("table");
    if (!table) return;
    const expanded = toggle.classList.contains("collapsed");
    toggle.classList.toggle("collapsed", !expanded);
    table.querySelectorAll(".hide-row").forEach(row => { row.style.display = expanded ? "" : "none"; });
  }, true);
  // Catch clicks on #preview anchors even if legacy modal handlers were bound before fetch.
  root.addEventListener("click", event => {
    const anchor = event.target.closest('a[href^="#"]');
    if (!anchor || !root.contains(anchor)) return;
    const id = anchor.getAttribute("href").slice(1);
    if (!id) return;
    const modal = document.getElementById(id);
    if (!modal || !modal.classList.contains("modal-overlay")) return;
    event.preventDefault();
    modal.style.display = "flex";
    modal.classList.add("active");
    document.body.style.overflow = "hidden";
  });
  root.addEventListener("click", event => {
    const close = event.target.closest(".close-btn");
    const overlay = event.target.closest(".modal-overlay");
    if (!overlay || !root.contains(overlay)) return;
    if (close || event.target === overlay) {
      event.preventDefault();
      overlay.style.display = "none";
      overlay.classList.remove("active");
      document.body.style.overflow = "";
    }
  });
  document.addEventListener("keydown", event => {
    if (event.key !== "Escape") return;
    root.querySelectorAll(".modal-overlay.active").forEach(modal => {
      modal.style.display = "none";
      modal.classList.remove("active");
    });
    document.body.style.overflow = "";
  });
  initialize();
  window.RFTempestDonation = {rate: RATE, refresh: initialize};
})();
