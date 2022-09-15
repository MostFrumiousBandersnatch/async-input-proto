import React from 'react';
import { render } from 'react-dom';

import {App} from '@root/components/app/app';

const mountPoint = document.getElementById('react-root');

render(<App />, mountPoint);
