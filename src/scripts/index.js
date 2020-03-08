import $ from 'jquery';

import { Stylings } from './stylings.js';
import { DataProcessor } from './data-processor.js';
import { MapWrapper } from './map-wrapper.js';
import { ThemeSelector } from './theme-selector.js';

import '../styles/index.css';

const CAPITAL_JSON_URL = '/capitals';

function runApp() {
    console.log("change hello worssd");
    const styling = new Stylings();

    const dataProcessor = new DataProcessor(CAPITAL_JSON_URL, styling);

    const mapWrapper = new MapWrapper(styling, dataProcessor);

    mapWrapper.onLoad()
        .then(() => {
            ThemeSelector.themeChange(styling, theme => {
                styling.setTheme(theme);
                mapWrapper.changeTheme(theme);
            });

            ThemeSelector.colorHighlighterChange(styling, (category) => {
                styling.setHighLightedCategory(category);
                mapWrapper.highLightLines();
            });
        })


}

$(document).ready(() => {
    runApp();
});


