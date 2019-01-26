export default {
  computed: {
    isThemeDark() {
      return this.theme === 'dark';
    },
    isThemeLight() {
      return this.theme === 'light';
    },
    theme() {
      return this.config.theme;
    },
    themeBackgroundColor() {
      return this.isThemeDark ? '#424242' : '#fff';
    },
    themeTextColor() {
      return this.isThemeDark ? 'rgba(255,255,255,1)' : 'rgba(0,0,0,0.87)';
    },
  },
};
