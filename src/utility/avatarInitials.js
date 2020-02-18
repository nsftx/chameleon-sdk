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

const getInitials = (content, config) => {
  const initials = [];
  content.forEach((item) => {
    item.label.split(' ').forEach((name) => {
      if (isEmpty(name) || initials.length >= (config.max || 2)) return;
      initials.push(toUpper(name[0]));
    });
  });
  return initials.join('');
};

const getRandomColor = () => {
  const color = `#${random(100000, 999999)}`;
  return `${color}`;
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
    let node = key.replace(/[A-Z]/g, m => `-${toLower(m)}`);
    element.setAttribute(node, attributes[key]);
  });

  return element;
};

const generateSvg = (content, config) => {
  const svg = createNode('svg', {
    width: config.width || defaultConfiguration.width,
    height: config.height || defaultConfiguration.height,
    borderRadius: config.borderRadius || defaultConfiguration.borderRadius,
    fontSize: defaultConfiguration.fontSize,
    style: `fill: ${ setBackgroundColor(config) }`,
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
  const initials = document.createTextNode(getInitials(content, config));
  span.appendChild(initials);
  text.appendChild(span);
  rect.appendChild(text);
  g.appendChild(rect);
  svg.appendChild(g);

  return svg;
};


export default {
  createAvatar(content, config) {
    return generateSvg(content, config);
  },
};
