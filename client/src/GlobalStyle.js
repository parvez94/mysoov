import { createGlobalStyle } from 'styled-components';

const GlobalStyle = createGlobalStyle`

    *,::after,::before {
        margin: 0;
        padding: 0;
        box-sizing: border-box;
    }

    :root{
        --primary-color: #ca0806;
        --secondary-color: #f4f1e6;
        --tertiary-color: #15171e;

        --primary-fonts: 'Alata';
        --secondary-fonts: 'IBM Plex Sans';

        /* Text colors */
        --text-primary: #333333;
        --text-secondary: #666666;
        --text-light: #ffffff;

        /* Layout variables */
        --navbar-h: 67px; /* matches Navbar min-height */
    }

    /* fix 100vh issues on mobile by using --vh var set from JS */
    html, body, #root {
        height: auto;
        min-height: 100%;
    }

    h1,h2,h3,h4,h5,h6{
        font-family: "Poppins";
    }

    a{
        text-decoration: none;
        color: var(--primary-color)
    }

    img{
        display: block;
    }

    /* Ensure proper numeric rendering */
    body, input, textarea, button, select {
        font-variant-numeric: normal;
        font-feature-settings: normal;
        -webkit-font-feature-settings: normal;
        -moz-font-feature-settings: normal;
    }

    /* Emoji rendering improvements - only for emoji elements */
    em-emoji, .emoji {
        font-variant-emoji: emoji;
        text-rendering: optimizeLegibility;
        font-feature-settings: "liga" 1, "kern" 1;
        -webkit-font-feature-settings: "liga" 1, "kern" 1;
        -moz-font-feature-settings: "liga" 1, "kern" 1;
    }

    /* Emoji-mart picker styling fixes */
    em-emoji-picker {
        --epr-bg-color: #0f0f0f;
        --epr-text-color: #ffffff;
        --epr-category-icon-active-color: #3b82f6;
        --epr-search-input-bg-color: #111111;
        --epr-search-input-text-color: #ffffff;
        --epr-search-input-placeholder-color: rgba(255, 255, 255, 0.4);
        --epr-category-navigation-button-color: rgba(255, 255, 255, 0.6);
        --epr-emoji-hover-color: #2a2a2a;
        --epr-emoji-size: 20px;
        --epr-picker-border-radius: 8px;
    }

    /* Ensure emoji-mart header elements are visible */
    em-emoji-picker [role="tablist"],
    em-emoji-picker [role="searchbox"],
    em-emoji-picker .search,
    em-emoji-picker nav,
    em-emoji-picker .nav,
    em-emoji-picker .category,
    em-emoji-picker .categories {
        display: block !important;
        visibility: visible !important;
        opacity: 1 !important;
    }

    /* Style the category tabs */
    em-emoji-picker [role="tablist"],
    em-emoji-picker .nav,
    em-emoji-picker .categories {
        display: flex !important;
        visibility: visible !important;
        opacity: 1 !important;
    }

    /* Ensure search input is visible */
    em-emoji-picker input[type="search"],
    em-emoji-picker .search input {
        display: block !important;
        visibility: visible !important;
        opacity: 1 !important;
    }

    /* Force header section to be visible */
    em-emoji-picker > div:first-child,
    em-emoji-picker .header {
        display: block !important;
        visibility: visible !important;
        opacity: 1 !important;
    }

    /* Fix emoji rendering in emoji-mart */
    em-emoji-picker em-emoji {
        font-size: 20px !important;
        line-height: 1 !important;
        display: inline-block !important;
        width: auto !important;
        height: auto !important;
    }

    /* Fix emoji button sizing in emoji-mart */
    em-emoji-picker button[data-emoji] {
        width: 32px !important;
        height: 32px !important;
        display: flex !important;
        align-items: center !important;
        justify-content: center !important;
        padding: 0 !important;
        border-radius: 6px !important;
    }

    /* Ensure proper scrolling without browser scrollbar showing */
    em-emoji-picker .scroll {
        scrollbar-width: thin;
        scrollbar-color: rgba(255, 255, 255, 0.2) transparent;
    }

    em-emoji-picker .scroll::-webkit-scrollbar {
        width: 6px;
    }

    em-emoji-picker .scroll::-webkit-scrollbar-track {
        background: transparent;
    }

    em-emoji-picker .scroll::-webkit-scrollbar-thumb {
        background-color: rgba(255, 255, 255, 0.2);
        border-radius: 3px;
    }

`;

export default GlobalStyle;
