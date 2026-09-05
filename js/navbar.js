document.addEventListener("DOMContentLoaded", () => {
  const currentPath = window.location.pathname.split('/').pop() || 'dashboard.html';
  const activeLink = document.querySelector(`.nav-item[href="${currentPath}"]`);
  const megaLink = document.querySelector(`.mega-menu-item[href="${currentPath}"]`);
  
  document.querySelectorAll('.nav-item').forEach(el => el.classList.remove('active'));
  
  if (activeLink) activeLink.classList.add('active');
  if (megaLink) {
    const parent = megaLink.closest('.has-dropdown');
    if (parent) parent.classList.add('active');
  }

  const userTrigger = document.getElementById('user-profile-trigger');
  const userSubmenu = document.getElementById('user-submenu');
  let isMenuOpen = false;
  let animationTimeout = null;

  if (userTrigger && userSubmenu) {
    userTrigger.addEventListener('click', function(e) {
      e.stopPropagation();
      userSubmenu.classList.remove('hiding');
      
      if (isMenuOpen) {
        userSubmenu.classList.remove('show');
        userSubmenu.classList.add('hiding');
        userTrigger.classList.remove('open');
        clearTimeout(animationTimeout);
        animationTimeout = setTimeout(() => {
          userSubmenu.classList.remove('hiding');
        }, 250);
        isMenuOpen = false;
      } else {
        userSubmenu.classList.remove('hiding');
        userSubmenu.classList.add('show');
        userTrigger.classList.add('open');
        isMenuOpen = true;
      }
    });

    document.addEventListener('click', function(e) {
      if (!userTrigger.contains(e.target) && !userSubmenu.contains(e.target) && isMenuOpen) {
        userSubmenu.classList.remove('show');
        userSubmenu.classList.add('hiding');
        userTrigger.classList.remove('open');
        clearTimeout(animationTimeout);
        animationTimeout = setTimeout(() => {
          userSubmenu.classList.remove('hiding');
        }, 250);
        isMenuOpen = false;
      }
    });

    document.addEventListener('keydown', function(e) {
      if (e.key === 'Escape' && isMenuOpen) {
        userSubmenu.classList.remove('show');
        userSubmenu.classList.add('hiding');
        userTrigger.classList.remove('open');
        clearTimeout(animationTimeout);
        animationTimeout = setTimeout(() => {
          userSubmenu.classList.remove('hiding');
        }, 250);
        isMenuOpen = false;
      }
    });
  }

  const navbar = document.getElementById('navbar');
  if (navbar) {
    window.addEventListener('scroll', () => {
      if (window.scrollY > 50) {
        navbar.classList.remove('navbar-transparent');
        navbar.classList.add('navbar-scrolled');
      } else {
        navbar.classList.remove('navbar-scrolled');
        navbar.classList.add('navbar-transparent');
      }
    });

    if (window.scrollY > 50) {
      navbar.classList.remove('navbar-transparent');
      navbar.classList.add('navbar-scrolled');
    }
  }
});