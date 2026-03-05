// Mobile Menu Toggle
function toggleMenu() {
  document.getElementById('nav').classList.toggle('open');
}

function closeMenu() {
  document.getElementById('nav').classList.remove('open');
}

// Sticky Header Shadow on Scroll
window.addEventListener('scroll', function () {
  var header = document.querySelector('.header');
  if (window.scrollY > 10) {
    header.style.boxShadow = '0 2px 20px rgba(0,0,0,0.15)';
  } else {
    header.style.boxShadow = 'none';
  }
});
