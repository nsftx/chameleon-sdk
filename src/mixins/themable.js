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
  },
};
