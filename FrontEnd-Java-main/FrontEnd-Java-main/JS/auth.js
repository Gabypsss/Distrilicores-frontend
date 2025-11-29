// auth.js - Sistema de Autenticación y Control de Acceso

// Obtener sesión activa
function getSession() {
  const session = localStorage.getItem('userSession') || sessionStorage.getItem('userSession');
  return session ? JSON.parse(session) : null;
}

// Verificar si el usuario está autenticado
function isAuthenticated() {
  return getSession() !== null;
}

// Verificar si el usuario es admin
function isAdmin() {
  const session = getSession();
  return session && session.role === 'admin';
}

// Cerrar sesión
function logout() {
  localStorage.removeItem('userSession');
  sessionStorage.removeItem('userSession');
  window.location.href = 'login.html';
}

// Proteger página - solo para usuarios autenticados
function protectPage() {
  if (!isAuthenticated()) {
    window.location.href = 'login.html';
  }
}

// Proteger página - solo para administradores
function protectAdminPage() {
  const session = getSession();
  
  if (!session) {
    alert('Debes iniciar sesión para acceder a esta página');
    window.location.href = 'login.html';
    return;
  }
  
  if (session.role !== 'admin') {
    alert('No tienes permisos para acceder a esta página. Solo administradores.');
    window.location.href = 'index.html';
    return;
  }
}

// Verificar autenticación antes de comprar
function checkAuthBeforePurchase() {
  if (!isAuthenticated()) {
    alert('Debes iniciar sesión para realizar una compra');
    // Guardar la intención de compra
    sessionStorage.setItem('redirectAfterLogin', 'pago.html');
    window.location.href = 'login.html';
    return false;
  }
  return true;
}

// Actualizar UI según el usuario
function updateUIForUser() {
  const session = getSession();
  const navbar = document.querySelector('.navbar ul');
  
  if (!navbar) return;

  // Si no hay sesión, mostrar solo acceso público
  if (!session) {
    // Ocultar enlace de inventario si no está autenticado
    const inventarioLink = Array.from(navbar.querySelectorAll('a')).find(a => a.textContent.includes('Inventario'));
    if (inventarioLink) {
      inventarioLink.parentElement.style.display = 'none';
    }
    
    // Agregar botón de login si no existe
    if (!navbar.querySelector('.login-btn-nav')) {
      const loginLi = document.createElement('li');
      loginLi.innerHTML = '<a href="login.html" class="login-btn-nav" style="color: #edb312; font-weight: 700;">Iniciar Sesión</a>';
      // Insertar antes del carrito
      const cartItem = navbar.querySelector('.cart-icon')?.closest('li');
      if (cartItem) {
        navbar.insertBefore(loginLi, cartItem);
      } else {
        navbar.appendChild(loginLi);
      }
    }
    return;
  }

  // Usuario autenticado
  const inventarioLink = Array.from(navbar.querySelectorAll('a')).find(a => a.textContent.includes('Inventario'));
  
  // Si es usuario normal, ocultar inventario
  if (session.role === 'usuario' && inventarioLink) {
    inventarioLink.parentElement.style.display = 'none';
  } else if (session.role === 'admin' && inventarioLink) {
    inventarioLink.parentElement.style.display = 'block';
  }

  // Remover botón de login si existe
  const loginBtn = navbar.querySelector('.login-btn-nav');
  if (loginBtn) {
    loginBtn.closest('li').remove();
  }

  // Agregar menú de usuario si no existe
  if (!navbar.querySelector('.user-menu')) {
    const userLi = document.createElement('li');
    userLi.className = 'user-menu';
    userLi.innerHTML = `
      <div style="position: relative; display: inline-block;">
        <a href="#" style="color: #edb312; display: flex; align-items: center; gap: 8px;" onclick="toggleUserMenu(event)">
          <i class="ri-user-line"></i>
          <span>${session.name}</span>
          <i class="ri-arrow-down-s-line"></i>
        </a>
        <div class="user-dropdown" style="display: none; position: absolute; top: 100%; right: 0; background: #1e1e1e; border-radius: 12px; padding: 10px 0; min-width: 200px; box-shadow: 0 4px 15px rgba(0,0,0,0.3); z-index: 1000; margin-top: 10px;">
          <div style="padding: 12px 20px; border-bottom: 1px solid #3a3a3a;">
            <p style="color: #edb312; font-weight: 600; margin: 0;">${session.name}</p>
            <p style="color: #a1a1a1; font-size: 12px; margin: 5px 0 0 0;">${session.email}</p>
            <p style="color: #edb312; font-size: 11px; margin: 5px 0 0 0; text-transform: uppercase; font-weight: 600;">
              ${session.role === 'admin' ? '👑 Administrador' : '👤 Usuario'}
            </p>
          </div>
          ${session.role === 'admin' ? '<a href="inventario.html" style="display: block; padding: 12px 20px; color: #a1a1a1; text-decoration: none; transition: all 0.3s;" onmouseover="this.style.background=\'#2a2a2a\'; this.style.color=\'#edb312\'" onmouseout="this.style.background=\'transparent\'; this.style.color=\'#a1a1a1\'"><i class="ri-store-line"></i> Gestionar Inventario</a>' : ''}
          <a href="#" onclick="logout()" style="display: block; padding: 12px 20px; color: #e74c3c; text-decoration: none; transition: all 0.3s; border-top: 1px solid #3a3a3a;" onmouseover="this.style.background='#2a2a2a'" onmouseout="this.style.background='transparent'">
            <i class="ri-logout-box-line"></i> Cerrar Sesión
          </a>
        </div>
      </div>
    `;
    
    // Insertar antes del carrito
    const cartItem = navbar.querySelector('.cart-icon')?.closest('li');
    if (cartItem) {
      navbar.insertBefore(userLi, cartItem);
    } else {
      navbar.appendChild(userLi);
    }
  }
}

// Toggle menú de usuario
function toggleUserMenu(event) {
  event.preventDefault();
  const dropdown = document.querySelector('.user-dropdown');
  if (dropdown) {
    dropdown.style.display = dropdown.style.display === 'none' ? 'block' : 'none';
  }
}

// Cerrar menú al hacer clic fuera
document.addEventListener('click', function(event) {
  const userMenu = document.querySelector('.user-menu');
  const dropdown = document.querySelector('.user-dropdown');
  
  if (dropdown && userMenu && !userMenu.contains(event.target)) {
    dropdown.style.display = 'none';
  }
});

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', function() {
  updateUIForUser();
  
  // Si estamos en la página de login y ya hay sesión, redirigir
  if (window.location.pathname.includes('login.html') && isAuthenticated()) {
    window.location.href = 'index.html';
  }

  // Si venimos de un redirect después del login
  const redirectTo = sessionStorage.getItem('redirectAfterLogin');
  if (redirectTo && isAuthenticated() && !window.location.pathname.includes('login.html')) {
    sessionStorage.removeItem('redirectAfterLogin');
    if (window.location.pathname.includes('index.html')) {
      window.location.href = redirectTo;
    }
  }
});