// Check the saved theme from localStorage or default to light
const savedTheme = localStorage.getItem('theme') || 'light';
const themeStyleLink = document.getElementById('theme-style');
const toggleButton = document.getElementById('theme-toggle');
const moonIcon = '<i class="fa-solid fa-moon p-2"></i>';
const sunIcon = '<i class="fa-solid fa-sun p-1" style="color:orange;"></i>';

if (savedTheme === 'dark') {
    themeStyleLink.setAttribute('href', '/css/dark-theme.css');
    toggleButton.innerHTML = sunIcon;
} else {
    themeStyleLink.setAttribute('href', '/css/light-theme.css');
    toggleButton.innerHTML = moonIcon;
}

toggleButton.addEventListener('click', () => {
    if (themeStyleLink.getAttribute('href') === '/css/dark-theme.css') {
        themeStyleLink.setAttribute('href', '/css/light-theme.css');
        toggleButton.innerHTML = moonIcon;
        localStorage.setItem('theme', 'light');
    } else {
        themeStyleLink.setAttribute('href', '/css/dark-theme.css');
        toggleButton.innerHTML = sunIcon;
        localStorage.setItem('theme', 'dark');
    }
});