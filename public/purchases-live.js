(function () {
  function bindEyes(root) {
    (root || document).querySelectorAll('.btn-eye').forEach(function (btn) {
      if (btn.getAttribute('data-bound') === '1') return;
      btn.setAttribute('data-bound', '1');
      btn.addEventListener('click', function () {
        var card = btn.closest('.purchase-card');
        if (!card) return;
        var values = card.querySelectorAll('.cred-value');
        var showing = btn.getAttribute('data-on') === '1';
        values.forEach(function (el) {
          el.textContent = showing
            ? el.getAttribute('data-masked')
            : el.getAttribute('data-secret');
        });
        btn.setAttribute('data-on', showing ? '0' : '1');
        btn.textContent = showing ? 'Mostrar' : 'Ocultar';
      });
    });
  }

  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function renderPurchases(list) {
    var mount = document.getElementById('purchasesMount');
    if (!mount) return;

    if (!list.length) {
      mount.innerHTML =
        '<div class="empty-state compact" style="grid-column:1/-1"><p class="lead" style="margin:0">Sem produtos adquiridos</p></div>';
      return;
    }

    mount.innerHTML = list
      .map(function (p) {
        var badge = p.expired ? 'Expirado' : p.days_left + ' dia(s)';
        return (
          '<article class="purchase-card' +
          (p.expired ? ' purchase-expired' : '') +
          '" data-id="' +
          escapeHtml(p.id) +
          '">' +
          '<div class="purchase-top"><div>' +
          '<p class="info-label">Produto</p>' +
          '<strong class="purchase-name">' +
          escapeHtml(p.product_name) +
          '</strong></div>' +
          '<div class="days-badge' +
          (p.expired ? ' expired' : '') +
          '">' +
          escapeHtml(badge) +
          '</div></div>' +
          '<div class="purchase-meta">' +
          '<div><span class="muted">Valor</span><br><strong>' +
          escapeHtml(p.price) +
          '</strong></div>' +
          '<div><span class="muted">Comprado</span><br>' +
          escapeHtml(p.created_label) +
          '</div>' +
          '<div><span class="muted">Expira</span><br>' +
          escapeHtml(p.expires_label) +
          '</div></div>' +
          '<div class="cred-box">' +
          '<div class="cred-row"><span class="muted">Email</span>' +
          '<code class="cred-value" data-secret="' +
          escapeHtml(p.email) +
          '" data-masked="••••••••••••">••••••••••••</code></div>' +
          '<div class="cred-row"><span class="muted">Senha</span>' +
          '<code class="cred-value" data-secret="' +
          escapeHtml(p.password) +
          '" data-masked="••••••••">••••••••</code></div>' +
          '<button class="btn btn-ghost btn-eye" type="button">Mostrar</button>' +
          '</div></article>'
        );
      })
      .join('');

    bindEyes(mount);
  }

  function updateCounters(count) {
    var c = document.getElementById('purchaseCount');
    var s = document.getElementById('purchaseLiveStat');
    if (c) c.textContent = String(count);
    if (s) s.textContent = count + ' item(ns)';
  }

  async function refresh() {
    try {
      var res = await fetch('/api/compras', { credentials: 'same-origin' });
      if (!res.ok) return;
      var data = await res.json();
      if (!data.ok) return;
      renderPurchases(data.purchases || []);
      updateCounters(data.count || 0);
    } catch (e) {
      /* ignore */
    }
  }

  bindEyes(document);
  setInterval(refresh, 60000);
})();
