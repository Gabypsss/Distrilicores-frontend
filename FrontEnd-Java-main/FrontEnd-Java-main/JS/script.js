var swiper =new Swiper(".mySwiper-1",{
    slidesPerView:1,
    spaceBetween: 30,
    loop:true,
    pagination:{
        el:".swiper-pagination",
        clickable:true,

    },
    navigation: {
        nextEl:".swiper-button-next",
        prevEl:".swiper-button-prev",
    }
})

var swiper =new Swiper(".mySwiper-2",{
    slidesPerView:4,
    spaceBetween: 30,
    loop:true,
    loopFillGroupWithBlank:true,
    navigation: {
        nextEl:".swiper-button-next",
        prevEl:".swiper-button-prev",
    },
    breakpoints : {
        0:{
            slidesPerView:1
        },
        520:{
            slidesPerView:2
        },
        950:{
            slidesPerView:3
        }
    }
})

//carrito
document.addEventListener("DOMContentLoaded", () => {
  // ====== SELECTORES BÁSICOS ======
  const cartIcon    = document.querySelector(".cart-icon");
  const cart        = document.querySelector(".cart");
  const cartClose   = document.querySelector("#cart-close");
  const cartOverlay = document.querySelector(".cart-overlay");
  const cartContent = document.querySelector(".cart-content");
  const buyNowBtn   = document.querySelector(".btn-buy");

  // Botones "agregar" en tarjetas .product
  const addCartCardButtons = document.querySelectorAll(".add-cart");
  // Botones genéricos con data-*
  const addCartDataButtons = document.querySelectorAll("[data-add-to-cart]");

  // ====== STORAGE ======
  const STORAGE_KEY = "cartItems_v1";

  const getCart = () => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch (_) {
      return [];
    }
  };

  const setCart = (items) => localStorage.setItem(STORAGE_KEY, JSON.stringify(items));

  // ====== UTILES ======
  const parseCOP = (txt) => {
    // "$8.000 COP" -> 8000 | "Desde $120.000" -> 120000
    if (typeof txt === "number") return txt;
    const m = (txt || "").match(/(\d[\d\.]*)/);
    if (!m) return 0;
    return Number(m[1].replace(/\./g, ""));
  };

  const formatCOP = (n) =>
    new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      maximumFractionDigits: 0,
    }).format(n || 0);

  const openCart  = () => {
    cart?.classList.add("active");
    cartOverlay?.classList.add("show");
    document.body.classList.add("body-no-scroll");
  };
  const closeCart = () => {
    cart?.classList.remove("active");
    cartOverlay?.classList.remove("show");
    document.body.classList.remove("body-no-scroll");
  };

  // ====== UI RENDER ======
  const drawCart = () => {
    if (!cartContent) return;
    const items = getCart();
    cartContent.innerHTML = "";

    if (items.length === 0) {
      cartContent.innerHTML = `
        <div style="text-align: center; padding: 40px 20px;">
          <i class="ri-shopping-cart-line" style="font-size: 60px; color: #3a3a3a;"></i>
          <p style="color: #a1a1a1; margin-top: 20px;">Tu carrito está vacío</p>
          <p style="color: #666; font-size: 14px; margin-top: 10px;">Agrega productos para comenzar</p>
        </div>
      `;
      updateTotalsAndBadge();
      return;
    }

    items.forEach((it) => {
      const box = document.createElement("div");
      box.className = "cart-box";
      box.innerHTML = `
        <img src="${it.img}" class="cart-img" alt="">
        <div class="cart-detail">
          <h2 class="cart-product-tittle">${it.title}</h2>
          <span class="cart-price">${formatCOP(it.price)}</span>
          <div class="cart-quantity">
            <button id="decrement" type="button">-</button>
            <span class="number">${it.qty}</span>
            <button id="increment" type="button">+</button>
          </div>
        </div>
        <i class="ri-delete-bin-line cart-remove" title="Eliminar"></i>
      `;
      cartContent.appendChild(box);
    });

    updateTotalsAndBadge();
  };

  const updateTotalsAndBadge = () => {
    const totalPriceEl = document.querySelector(".total-price");
    const badge        = document.querySelector(".cart-item-count");

    const items = getCart();
    const total = items.reduce((s, it) => s + it.price * it.qty, 0);
    const count = items.reduce((s, it) => s + it.qty, 0);

    if (totalPriceEl) totalPriceEl.textContent = formatCOP(total);
    if (badge) {
      badge.textContent = count > 0 ? String(count) : "";
      badge.style.visibility = count > 0 ? "visible" : "hidden";
    }
  };

  // ====== OPERACIONES ======
  const upsertItem = (title, price, img) => {
    const items = getCart();
    const i = items.findIndex((x) => x.title === title);
    if (i >= 0) items[i].qty += 1;
    else items.push({ title, price, img, qty: 1 });
    setCart(items);
    drawCart();
  };

  const changeQty = (title, delta) => {
    const items = getCart();
    const i = items.findIndex((x) => x.title === title);
    if (i < 0) return;
    items[i].qty = Math.max(1, items[i].qty + delta);
    setCart(items);
    drawCart();
  };

  const removeItem = (title) => {
    const items = getCart().filter((x) => x.title !== title);
    setCart(items);
    drawCart();
  };

  const clearCart = () => {
    localStorage.removeItem(STORAGE_KEY);
    drawCart();
  };

  // ====== EVENTOS GLOBALES ======
  cartIcon?.addEventListener("click", openCart);
  cartClose?.addEventListener("click", closeCart);
  cartOverlay?.addEventListener("click", closeCart);

  // Delegación dentro del carrito: + / − / eliminar
  cartContent?.addEventListener("click", (ev) => {
    const box = ev.target.closest(".cart-box");
    if (!box) return;
    const title = box.querySelector(".cart-product-tittle")?.textContent?.trim() || "";

    if (ev.target.id === "increment") changeQty(title, +1);
    else if (ev.target.id === "decrement") changeQty(title, -1);
    else if (ev.target.closest(".cart-remove")) removeItem(title);
  });

  // Botón comprar - VALIDAR LOGIN PRIMERO
  buyNowBtn?.addEventListener("click", () => {
    const items = getCart();
    if (!items.length) {
      alert("Tu carro está vacío. Agrega artículos antes de comprar.");
      return;
    }

    // Verificar si el usuario está autenticado
    const session = localStorage.getItem('userSession') || sessionStorage.getItem('userSession');
    
    if (!session) {
      // No está autenticado - guardar intención y redirigir a login
      closeCart();
      
      // Crear un modal personalizado para mejor UX
      const confirmLogin = confirm("Debes iniciar sesión para realizar tu compra.\n\n¿Deseas ir a la página de inicio de sesión ahora?");
      
      if (confirmLogin) {
        sessionStorage.setItem('redirectAfterLogin', 'pago.html');
        window.location.href = 'login.html';
      }
      return;
    }

    // Usuario autenticado - ir a página de pago
    closeCart();
    window.location.href = 'pago.html';
  });

  // Botones "agregar al carrito" en tarjetas .product
  addCartCardButtons.forEach((btn) => {
    btn.addEventListener("click", (e) => {
      const product = e.currentTarget.closest(".product");
      if (!product) return;

      const img   = product.querySelector("img")?.src || "";
      const title = product.querySelector(".product-txt h4")?.textContent?.trim() || "Producto";
      const priceText = product.querySelector(".price")?.textContent || "";
      const price = parseCOP(priceText);

      upsertItem(title, price, img);
      openCart();
    });
  });

  // Botones genéricos con data-*
  addCartDataButtons.forEach((btn) => {
    btn.addEventListener("click", (e) => {
      const el = e.currentTarget;
      const title = el.getAttribute("data-title") || "Producto";
      const price = parseCOP(Number(el.getAttribute("data-price") || 0));
      const img   = el.getAttribute("data-img") || "";

      upsertItem(title, price, img);
      openCart();
    });
  });

  // ====== ESTADO INICIAL ======
  drawCart();
});