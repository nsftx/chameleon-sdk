import {
  isEmpty,
  random,
  forIn,
  toLower,
  toUpper,
} from 'lodash';

const defaultConfiguration = {
  width: '65px',
  height: '65px',
  borderRadius: '50%',
  fontSize: '18px',
  initialsLength: 1,
  commonColor: false,
};

const getInitials = (config, content) => {
  const initials = [];
  content.forEach((item) => {
    item.label.split(' ').forEach((name) => {
      if (isEmpty(name) || initials.length >= this.max) return;
      initials.push(toUpper(name[0]));
    });
  });
  return initials.join('');
};

const getRandomColor = () => {
  const color = this.color || `#${random(100000, 999999)}`;
  return `fill: ${color}`;
};

const getRandomColorFromPalette = (colortPalette) => {
  const randomItem = random(0, colortPalette.length);
  return colortPalette[randomItem];
};

const setBackgroundColor = (config) => {
  if (config.commonColor) {
    return config.commonColor;
  }
  if (config.colorPalette && config.colorPalette.length) {
    return getRandomColorFromPalette(config.colorPalette);
  }
  return getRandomColor();
};

const createNode = (node, attributes) => {
  const element = document.createElementNS('http://www.w3.org/2000/svg', node);
  forIn(attributes, (value, key) => {
    element.setAttributeNS(null, key.replace(/[A-Z]/g, m => `- ${toLower(m)}`, attributes[key]));
  });
};

const generateSvg = (config, content) => {
  const svg = createNode('svg', {
    width: config.width || defaultConfiguration.width,
    height: config.height || defaultConfiguration.height,
    borderRadius: config.borderRadius || defaultConfiguration.borderRadius,
    fontSize: defaultConfiguration.fontSize,
    style: { backgroundColor: setBackgroundColor(config) },
  });
  const g = createNode('g', {});
  const rect = createNode('rect', {
    width: '100%',
    height: '100%',
    rx: '5',
  });
  const text = createNode('text', {
    x: '50%',
    y: '50%',
    dominantBaseline: 'middle',
    textAnchor: 'middle',
  });
  const span = document.createElement('span');
  const initials = document.createTextNode(getInitials(config, content));
  span.appendChild(initials);
  text.appendChild(span);
  rect.appendChild(text);
  g.appendChild(rect);
  svg.appendChild(g);

  return svg;
};


export default {
  createAvatar(content, config) {
    generateSvg(config, content);
  },
};
