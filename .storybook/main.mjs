export default {
  stories: ['../src/**/*.stories.tsx'],

  addons: [
    '@storybook/addon-links',
    '@storybook/addon-essentials',
    '@storybook/addon-interactions',
    // {
    //   name: '@storybook/addon-styling',
    //   options: {
    //     // Check out https://github.com/storybookjs/addon-styling/blob/main/docs/api.md
    //     // For more details on this addon's options.
    //     postCss: {
    //       implementation: require.resolve('postcss'),
    //     },
    //   },
    // },
  ],

  // framework: {
  //   name: '@storybook/react-webpack5',
  //   options: {
  //     fastRefresh: true,
  //     // builder: { lazyCompilation: true },
  //   },
  // },
  framework: {
    name: '@storybook/react-vite',
    options: {},
  },

  docs: {
    autodocs: false,
  },
}
