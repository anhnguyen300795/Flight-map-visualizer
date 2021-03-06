import $ from 'jquery';

import { Stylings } from './stylings.js';
import { DataProcessor } from './data-processor.js';
import { MapWrapper } from './map-wrapper.js';
import { DomHandler } from './dom-handler.js';
import { CAPITAL_JSON_URL } from './constants.js';

import '../styles/index.css';

function runApp() {
    const styling = new Stylings();

    const dataProcessor = new DataProcessor(CAPITAL_JSON_URL, styling);

    const mapWrapper = new MapWrapper(styling, dataProcessor);

    mapWrapper.addMapInitialLoadHandler(DomHandler.subscribeAndReactToStyleChanges(styling, mapWrapper));
}

$(document).ready(() => {
    runApp();
});


