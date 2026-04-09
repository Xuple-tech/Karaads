import React from 'react';
import { createRoot } from 'react-dom/client';

import { WidgetApp } from './WidgetApp';
import styles from './widget.css?inline';

declare global {
    interface Window {
        KwatiWidgetToken?: string;
    }
}

const token = window.KwatiWidgetToken;

if (token) {
    const host = document.createElement('div');
    host.id = 'kwati-widget-root';
    document.body.appendChild(host);

    const shadowRoot = host.attachShadow({ mode: 'open' });
    const style = document.createElement('style');
    style.textContent = styles;
    shadowRoot.appendChild(style);

    const mount = document.createElement('div');
    shadowRoot.appendChild(mount);

    createRoot(mount).render(
        <React.StrictMode>
            <WidgetApp token={token} />
        </React.StrictMode>
    );
}
