import './main.scss';
import 'imports?jQuery=jquery!./plugin.js';
import 'bootstrap-loader';
import SpinTheWheel from './modules/spin-the-wheel.js';
import './imgs/favicon.ico';
import './data/gift.json';

const wheel = new SpinTheWheel('wheel');
wheel.run();