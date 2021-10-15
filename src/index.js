import React from 'react';
import ReactDOM from 'react-dom';

import { Menu } from './Menu';


const ALL_STORIES = {
  'nhl-2022': {
    getEntryComponent: () => {
      const { Calendar } = require('./stories/nhl_2022/components/Calendar');
      return Calendar;
    },
    label: 'NHL 2021 - 2022',
    slug: 'nhl-2022',
  },
}; 


const rootElement = document.getElementById('root');

ReactDOM.render(
  (<Menu stories={ALL_STORIES} />),
  rootElement
);

