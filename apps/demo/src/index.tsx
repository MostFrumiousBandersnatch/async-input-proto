import React from 'react';
import { createRoot } from 'react-dom/client';

import { App } from '@root/components/app/app';

const mountPoint = document.getElementById('react-root');
const root = createRoot(mountPoint);
root.render(<App />);
