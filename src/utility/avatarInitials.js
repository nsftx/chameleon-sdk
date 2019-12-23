import {
  isEmpty,
  random,
  forIn,
  toLower,
  toUpper,
} from 'lodash';

export default {
  createAvatar(config, content) {
    this.generateSvg(config, content);
  },
  generateSvg(config) {
    const self = this;
    const svg = this.createNode('svg', {
      width: config.width,
      height: config.height,
      borderRadius: config.borderRadius,
      style: { backgroundColor: self.getRandomColor() },
    });
    const g = this.createNode('g', {});
    const rect = this.createNode('rect', {
      width: '100%',
      height: '100%',
      rx: '5',
    });
    const text = this.createNode('text', {
      x: '50%',
      y: '50%',
      dominantBaseline: 'middle',
      textAnchor: 'middle',
    });
    const span = document.createElement('span');
    const initials = document.createTextNode(this.getInitials());
    span.appendChild(initials);
    text.appendChild(span);
    rect.appendChild(text);
    g.appendChild(rect);
    svg.appendChild(g);

    return svg;
  },
  createNode(node, attributes) {
    const element = document.createElementNS('http://www.w3.org/2000/svg', node);
    forIn(attributes, (value, key) => {
      element.setAttributeNS(null, key.replace(/[A-Z]/g, m => `- ${toLower(m)}`, attributes[key]));
    });
  },
  getInitials(config, content) {
    const initials = [];
    content.item.forEach((item) => {
      if (isEmpty(item) || config.initialsLength >= this.max) return;
      initials.push(toUpper(item[0]));
    });
    return initials.join('');
  },
  getRandomNumber(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  },
  getRandomColor() {
    const color = this.color || `#${this.getRandomNumber(100000, 999999)}`;
    return `fill: ${color}`;
  },
  getRandomColorFromPalette(colortPalette) {
    const randomItem = random(0, colortPalette.length);
    return colortPalette[randomItem];
  },
};
