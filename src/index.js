import React, { Suspense, lazy } from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import { createMuiTheme, MuiThemeProvider } from '@material-ui/core/styles';
// import MuiThemeProvider from '@material-ui/core/styles/MuiThemeProvider';
import { SnackbarProvider } from 'notistack';
import CloseIcon from '@material-ui/icons/Close';
import IconButton from '@material-ui/core/IconButton';
// import { PersistGate } from 'redux-persist/lib/integration/react';

import { Helmet } from 'react-helmet';
import { IntlProvider } from 'react-intl';
import * as serviceWorker from './serviceWorker';
import { SimpleLoading } from './components/elements/GlobaLoading';
// import { persistor, store } from './store';
import { store } from './store';
import messageEn from './transaltions/en.json';
import messageJa from './transaltions/ja.json';

// we have to do it here because App component is lasily loaded
// so cannot this kind of stuff there
(function (p) {
  if (/^\/blog\/\d+\/?$/.test(p) || /^\/lock\/\d+(\/|$)/.test(p)) {
    window.prerenderReady = false;
  }
})(window.location.pathname);

// import App from './App';
const App = lazy(() =>
  import(
    /* webpackChunkName: "app" */
    /* webpackPreload: true */
    './App'
  )
);

// const defaultTheme = createMuiTheme();
const theme = createMuiTheme({
  palette: {
    primary: {
      main: '#8250c8',
    },
    secondary: {
      main: '#fe8dc3',
    },
  },
  typography: {
    // htmlFontSize: 16,
    fontSize: 12,
    fontFamily: [
      'Montserrat',
      'system-ui',
      '-apple-system',
      'BlinkMacSystemFont',
      '"Segoe UI"',
      'Roboto',
      '"Helvetica Neue"',
      'Arial',
      'sans-serif',
      '"Apple Color Emoji"',
      '"Segoe UI Emoji"',
      '"Segoe UI Symbol"',
    ].join(','),
    textTransform: 'none',
    button: {
      textTransform: 'none',
    },
  },
  overrides: {
    MuiSkeleton: {
      animate: {
        animation: 'MuiSkeleton-keyframes-animate 1s ease-in-out infinite',
      },
    },
    // Style sheet name ⚛️
    MuiButton: {
      // Name of the rule
      text: {
        // Some CSS
        // background: 'linear-gradient(45deg, #FE6B8B 30%, #FF8E53 90%)',
      },
    },
    MuiCardHeader: {
      root: {
        cursor: 'pointer',
      },
      title: {
        textTransform: 'capitalize',
        color: '#8250c8',
        fontWeight: 600,
        fontSize: 14,
        display: 'flex',
      },
      content: {
        color: '#8f8f8f',
      },
    },
    MuiOutlinedInput: {
      root: {
        position: 'relative',
        '& $notchedOutline': {
          borderColor: 'rgba(234, 236, 239, 0.7)',
        },
        '&:hover:not($disabled):not($focused):not($error) $notchedOutline': {
          borderColor: 'rgba(234, 236, 239, 0.7)',
          // Reset on touch devices, it doesn't add specificity
          '@media (hover: none)': {
            borderColor: 'rgba(234, 236, 239, 0.7)',
          },
        },
        '&$focused $notchedOutline': {
          borderWidth: 1,
        },
      },
    },
    MuiInput: {
      focused: {},
      disabled: {},
      error: {},
      underline: {
        borderBottom: 'rgba(234, 236, 239, 0.7)',
        '&:after': {
          borderBottom: `1px solid #fe8dc3`,
          transition: 'all .2s ease-in',
        },
        '&:focused::after': {
          borderBottom: `1px solid rgba(234, 236, 239, 0.7)`,
        },
        '&:before': {
          borderBottom: `1px solid rgba(234, 236, 239, 0.7)`,
        },
        '&:hover:not($disabled):not($focused):not($error):before': {
          borderBottom: '1px solid rgba(234, 236, 239, 0.7)',
        },
        '&:hover:not($disabled):before': {
          borderBottom: '1px solid rgba(234, 236, 239, 0.7)',
        },
        '&$disabled:before': {
          borderBottom: `1px dotted rgba(234, 236, 239, 0.7)`,
        },
      },
    },
  },
});

// add action to all snackbars
const notistackRef = React.createRef();
const onClickDismiss = (key) => () => {
  notistackRef.current.closeSnackbar(key);
};

// Define user's language. Different browsers have the user locale defined
// on different fields on the `navigator` object, so we make sure to account
// for these different by checking all of them
const language = (navigator.languages && navigator.languages[0]) || navigator.language || navigator.userLanguage;

// Split locales with a region code
const languageWithoutRegionCode = language.toLowerCase().split(/[_-]+/)[0];

// Try full locale, try locale without region code, fallback to 'en'
const messages = {
  en: messageEn,
  ja: messageJa,
};

// console.log('language', languageWithoutRegionCode);

ReactDOM.render(
  <MuiThemeProvider theme={theme}>
    <Provider store={store}>
      {/* <PersistGate loading={<GlobaLoading />} persistor={persistor}> */}
      <IntlProvider locale={languageWithoutRegionCode} messages={messages[languageWithoutRegionCode] || messages.en}>
        <SnackbarProvider
          ref={notistackRef}
          action={(key) => (
            <IconButton onClick={onClickDismiss(key)}>
              <CloseIcon />
            </IconButton>
          )}
          preventDuplicate
        >
          <Suspense fallback={<SimpleLoading />}>
            <App />
          </Suspense>
        </SnackbarProvider>
      </IntlProvider>
      {/* </PersistGate> */}
    </Provider>
    {/* <Helmet>
      <title>Lovelock - Cherish Your Intimate Memories</title>
      <meta property="og:title" content="Lovelock - Cherish Your Intimate Memories" />
      <meta property="og:type" content="website" />
      
      <meta
        name="description"
        content="A safe and peaceful place to store and celebrate your meaningful moments, keep them to yourself or share to close friends."
      />
      <meta property="og:image" content={`${process.env.PUBLIC_URL}/static/img/share.jpg`} />
      <meta
        property="og:description"
        content="A safe and peaceful place to store and celebrate your meaningful moments, keep them to yourself or share to close friends."
      />
    </Helmet> */}
  </MuiThemeProvider>,
  document.getElementById('root')
);

serviceWorker.register({
  onUpdate: (registration) => {
    const waitingServiceWorker = registration.waiting;

    if (waitingServiceWorker) {
      waitingServiceWorker.addEventListener('statechange', (event) => {
        if (event.target.state === 'activated') {
          if (
            window.confirm('The LoveLock website you are seeing is cached and outdated, click OK to refresh the page.')
          ) {
            window.location.reload();
          }
        }
      });
      waitingServiceWorker.postMessage({ type: 'SKIP_WAITING' });
    }
  },
});
