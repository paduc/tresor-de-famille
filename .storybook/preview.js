import '../src/pages/style.css'

import { INITIAL_VIEWPORTS } from '@storybook/addon-viewport'

const { iphone6, iphone8p, ipad, ipad10p, ipad12p } = INITIAL_VIEWPORTS

function rotate(viewport) {
  return {
    ...viewport,
    name: `${viewport.name} (R)`,
    styles: {
      width: viewport.styles.height,
      height: viewport.styles.width,
    },
  }
}

export const parameters = {
  viewport: {
    viewports: {
      iphone6, // sm
      iphone8p,
      // iphone8pr: rotate(iphone8p),
      ipad10p, // md
      ipad10pr: rotate(ipad10p), // lg
      // ipad12p,
      // sm: {
      //   name: 'sm',
      //   styles: {
      //     width: '640px',
      //     height: '1130px',
      //   },
      // },
      // md: {
      //   name: 'md',
      //   styles: {
      //     width: '768px',
      //     height: '1130px',
      //   },
      // },
      // lg: {
      //   name: 'lg',
      //   styles: {
      //     width: '1024px',
      //     height: '1130px',
      //   },
      // },
      // xl: {
      //   name: 'xl',
      //   styles: {
      //     width: '1280px',
      //     height: '1130px',
      //   },
      // },
      // '2xl': {
      //   name: '2xl',
      //   styles: {
      //     width: '1536px',
      //     height: '1130px',
      //   },
      // },
    },
  },
  layout: 'fullscreen',
}
