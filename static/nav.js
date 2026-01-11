const menu_Toggle = document.getElementById('menu-toggle');
const menu_Content = document.getElementById('menu-content');
const menu_Close = document.getElementById('menu-close');
const main_Title = document.getElementById('main-title');


// menu open button
menu_Toggle.addEventListener('click', () => {
  menu_Toggle.style.display = 'none';
  menu_Content.style.display = 'flex';
});

// menu close button
menu_Close.addEventListener('click', () => {
    menu_Content.style.display = 'none';
    menu_Toggle.style.display = 'inline-block';
});

// fade-in effect for the main title
window.addEventListener("DOMContentLoaded", () => {
  main_Title.classList.add("visible");
});
