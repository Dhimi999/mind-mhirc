(() => {
  // Konfigurasi dasar untuk call component dan call library
  const config = {
    HIGHLIGHT_COLOR: "#0da2e7",
    HIGHLIGHT_BG: "#0da2e71a",
  // Hanya origin resmi produksi sesuai permintaan. (Catatan: penghapusan localhost/vercel dapat menghambat debugging lokal)
  ALLOWED_ORIGINS: ["https://mind-mhirc.my.id", "https://localhost:4000", "https://localhost:8080"],
    DEBOUNCE_DELAY: 10,
    Z_INDEX: 10000,
    TOOLTIP_OFFSET: 25,
    MAX_TOOLTIP_WIDTH: 200,
    SCROLL_DEBOUNCE: 420,
    FULL_WIDTH_TOOLTIP_OFFSET: "12px",
    HIGHLIGHT_STYLE: {
      FULL_WIDTH: { OFFSET: "-5px", STYLE: "solid" },
      NORMAL: { OFFSET: "0", STYLE: "solid" }
    },
    SELECTED_ATTR: "data-lov-selected",
    HOVERED_ATTR: "data-lov-hovered",
    OVERRIDE_STYLESHEET_ID: "lovable-override"
  };

  // Fungsi untuk mengirim pesan ke origin yang diizinkan
  const sendMessage = (msg) => {
    config.ALLOWED_ORIGINS.forEach(origin => {
      try {
        if (window.parent) {
          window.parent.postMessage(msg, origin);
        }
      } catch (err) {
        console.error(`Gagal mengirim pesan ke ${origin}:`, err);
      }
    });
  };

  // Fungsi untuk memantau perubahan URL
  const monitorURLChange = () => {
    let currentURL = document.location.href;
    const observer = new MutationObserver(() => {
      if (currentURL !== document.location.href) {
        currentURL = document.location.href;
        sendMessage({ type: "URL_CHANGED", url: currentURL });
      }
    });
    const body = document.querySelector("body");
    if (body) {
      observer.observe(body, { childList: true, subtree: true });
    }
  };
  window.addEventListener("load", monitorURLChange);

  // ======================
  // Fungsi Interaksi Elemen
  // ======================
  class Selector {
    constructor() {
      this.hoveredElement = null;
      this.isActive = false;
      this.tooltip = null;
      this.mouseX = 0;
      this.mouseY = 0;
    }
    reset() {
      this.hoveredElement = null;
    }
  }
  const selector = new Selector();

  // Buat tooltip dan style untuk highlight elemen
  const createTooltip = () => {
    selector.tooltip = document.createElement("div");
    selector.tooltip.className = "gpt-selector-tooltip";
    selector.tooltip.setAttribute("role", "tooltip");
    document.body.appendChild(selector.tooltip);

    const style = document.createElement("style");
    style.textContent = `
      .gpt-selector-tooltip {
        position: fixed;
        z-index: ${config.Z_INDEX};
        pointer-events: none;
        background-color: ${config.HIGHLIGHT_COLOR};
        color: white;
        padding: 4px 8px;
        border-radius: 4px;
        font-size: 14px;
        font-weight: bold;
        line-height: 1;
        white-space: nowrap;
        display: none;
        box-shadow: 0 2px 4px rgba(0,0,0,0.2);
        transition: opacity 0.2s ease-in-out;
        margin: 0;
      }
      [${config.HOVERED_ATTR}]::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        border-radius: 0;
        outline: 1px dashed ${config.HIGHLIGHT_COLOR};
        outline-offset: ${config.HIGHLIGHT_STYLE.NORMAL.OFFSET};
        background-color: ${config.HIGHLIGHT_BG};
        z-index: ${config.Z_INDEX};
        pointer-events: none;
      }
      [${config.SELECTED_ATTR}]::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        border-radius: 0;
        outline: 1px dashed ${config.HIGHLIGHT_COLOR};
        outline-offset: 3px;
        z-index: ${config.Z_INDEX};
        pointer-events: none;
      }
    `;
    document.head.appendChild(style);
  };
  createTooltip();

  // Fungsi debounce untuk mengurangi frekuensi eksekusi
  const debounce = (func, delay) => {
    let timer;
    return (...args) => {
      if (timer) clearTimeout(timer);
      timer = setTimeout(() => func(...args), delay);
    };
  };

  // Update posisi dan isi tooltip berdasarkan elemen
  const updateTooltip = (element) => {
    if (!selector.tooltip || !element) return;
    try {
      const rect = element.getBoundingClientRect();
      selector.tooltip.style.maxWidth = `${config.MAX_TOOLTIP_WIDTH}px`;
      const isFullWidth = Math.abs(rect.width - window.innerWidth) < 5;
      if (isFullWidth) {
        selector.tooltip.style.left = config.FULL_WIDTH_TOOLTIP_OFFSET;
        selector.tooltip.style.top = config.FULL_WIDTH_TOOLTIP_OFFSET;
      } else {
        selector.tooltip.style.left = `${Math.max(0, rect.left)}px`;
        selector.tooltip.style.top = `${Math.max(0, rect.top - config.TOOLTIP_OFFSET)}px`;
      }
      selector.tooltip.textContent = element.tagName.toLowerCase();
    } catch (err) {
      console.error("Error saat mengupdate tooltip:", err);
    }
  };

  // Tambahkan atribut highlight pada elemen
  const addHighlight = (element) => {
    element.setAttribute(config.HOVERED_ATTR, "true");
    const rect = element.getBoundingClientRect();
    if (Math.abs(rect.width - window.innerWidth) < 5) {
      element.setAttribute("data-full-width", "true");
    }
  };

  // Hapus atribut highlight dari elemen
  const removeHighlight = (element) => {
    element.removeAttribute(config.HOVERED_ATTR);
    element.removeAttribute("data-full-width");
  };

  // Handler untuk event mouseover dengan debounce
  const handleMouseOver = debounce((event) => {
    if (!selector.isActive) return;
    if (selector.hoveredElement) {
      removeHighlight(selector.hoveredElement);
    }
    selector.hoveredElement = event.target;
    addHighlight(selector.hoveredElement);
    updateTooltip(selector.hoveredElement);
    if (selector.tooltip) {
      selector.tooltip.style.display = "block";
      selector.tooltip.style.opacity = "1";
    }
  }, config.DEBOUNCE_DELAY);

  // Handler untuk event mouseout dengan debounce
  const handleMouseOut = debounce(() => {
    if (selector.hoveredElement) {
      removeHighlight(selector.hoveredElement);
      selector.hoveredElement = null;
    }
    if (selector.tooltip) {
      selector.tooltip.style.opacity = "0";
      selector.tooltip.style.display = "none";
    }
  }, config.DEBOUNCE_DELAY);

  // Handler untuk event klik pada elemen
  const handleClick = (event) => {
    if (!selector.isActive) return;
    event.preventDefault();
    event.stopPropagation();
    if (selector.hoveredElement) {
      selector.hoveredElement.setAttribute(config.SELECTED_ATTR, "true");
      sendMessage({
        type: "ELEMENT_CLICKED",
        payload: { tag: selector.hoveredElement.tagName.toLowerCase() }
      });
    }
  };

  // Aktifkan mode selector
  const activateSelector = () => {
    selector.isActive = true;
    document.addEventListener("mouseover", handleMouseOver);
    document.addEventListener("mouseout", handleMouseOut);
    document.addEventListener("click", handleClick, true);
  };

  // Nonaktifkan mode selector
  const deactivateSelector = () => {
    selector.isActive = false;
    document.removeEventListener("mouseover", handleMouseOver);
    document.removeEventListener("mouseout", handleMouseOut);
    document.removeEventListener("click", handleClick, true);
    if (selector.tooltip) {
      selector.tooltip.style.opacity = "0";
      selector.tooltip.style.display = "none";
    }
  };

  // Contoh: Toggle mode selector dengan tombol "s"
  document.addEventListener("keydown", (event) => {
    if (event.ctrlKey && event.altKey && event.key.toLowerCase() === "s") {
    event.preventDefault(); // Mencegah aksi bawaan jika ada
      selector.isActive ? deactivateSelector() : activateSelector();
    }
  });

  // Kirim pesan bahwa script selector telah dimuat
  sendMessage({ type: "SELECTOR_SCRIPT_LOADED", payload: { version: "1.0.0" } });
})();
