document.addEventListener('DOMContentLoaded', function() {
    // Typed.js initialization
    new Typed('#typed-text', {
        strings: ['Muhammad Zaki As Shidiqi', 'a Developer', 'a Digital Creator'],
        typeSpeed: 50,
        backSpeed: 30,
        backDelay: 2000,
        loop: true
    });

    new Typed('#typed-role', {
        strings: [
            'Web Developer',
            'Python Programmer',
            'UI/UX Designer',
            'Informatics Student'
        ],
        typeSpeed: 50,
        backSpeed: 30,
        backDelay: 2000,
        loop: true
    });

    // Existing event listeners tetap sama
    const navbar = document.querySelector('nav');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            navbar.classList.add('navbar-scrolled');
        } else {
            navbar.classList.remove('navbar-scrolled');
        }
    });
});