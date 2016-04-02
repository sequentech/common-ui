/*
 * ConfigService is a function that returns the configuration that exists
 * in this same file, which you might want to edit and tune if needed.
 */

var AV_CONFIG_VERSION = '3.1.3';

var avConfigData = {
  // the base url path for ajax requests, for example for sending ballots or
  // getting info about an election. This url is usually in the form of
  // 'https://foo/api/v3/' and always ends in '/'.
  base: '',
  theme: "default",
  baseUrl: "https://agora/elections/api/",
  freeAuthId: 1,
  
  // Webpage title
  webTitle: "Agora Voting",

  // AuthApi base url
  authAPI: "https://agora/authapi/api/",
  dnieUrl: "https://agora.dev/authapi/api/authmethod/dnie/auth/",
  // Agora Elections base url
  electionsAPI: "https://agora/elections/api/",

  // Agora Admin help url
  helpUrl: "https://agoravoting.com/help",

  authorities: ['local-auth2'],
  director: "local-auth1",

  resourceUrlWhitelist: [
    // Allow same origin resource loads.
    'self',

    // Allow loading from our assets domain.  Notice the difference between * and **.
    // Uncomment the following to allow youtube videos
    //
    // 'https://www.youtube.com/**',
    // 'https://youtube.com/**'
  ],

  // i18next language options, see http://i18next.com/pages/doc_init.html for
  // details
  i18nextInitOptions: {
    // Default language of the application.
    //
    // Default: 'en'
    //
    language: "es",


    // Forces a specific language.
    //
    // Default: not set
    //
    lng: "es",


    // specifies the set language query string.
    //
    // Default: "lang"
    //
    detectLngQS: 'lang',


    // Specifies what translations will be available.
    //
    // Default: ['en', 'es', 'gl', 'ca']
    //
    // lngWhitelist: ['en', 'es', 'gl', 'ca'],
  },

  // specifies the language cookie options,
  // see https://github.com/ivpusic/angular-cookie#options
  i18nextCookieOptions: {
    // Expiration in days
    //
    // Default: 360
    //
    // expires: 360,


    // Cookie domain
    //
    // Default: not set
    //
    // domain: 'foobar',
  },

  // configure $locationProvider.html5Mode
  // see https://code.angularjs.org/1.2.28/docs/guide/$location
  //
  // Default: false
  // locationHtml5mode: false,
  locationHtml5mode: true,

  // If no Route is set, this is the route that will be loaded
  //
  // Default: '/admin/login'
  defaultRoute: '/admin/login',

  timeoutSeconds: 3600,

  publicURL: "https://agora/elections/public/",

  // if we are in debug mode or not
  debug: true,

  // contact data where users can reach to a human when they need it
  contact: {
    // Support contact email displayed in the footer links
    email: "contact@example.com",
    // Sales contact email displayed in the footer links
    sales: "sales@example.com",
    tlf: "-no tlf-"
  },
  
  // social networks footer links
  social: {
      facebook: "https://www.facebook.com/AgoraVoting",
      twitter: "https://twitter.com/agoravoting",
      twitterHandle: "agoravoting",
      googleplus: "https://plus.google.com/101939665794445172389/posts",
      youtube: "https://www.youtube.com/results?search_query=Agora+Voting",
      github: "https://github.com/agoravoting/"
  },
  
  // technology footer links
  technology: {
    aboutus: "https://agoravoting.com/#aboutus",
    pricing: "https://agoravoting.com/#pricing",
    overview: "https://agoravoting.com/overview/",
    solutions: "https://agoravoting.com/solutions/",
    admin_manual: "https://bit.ly/avguiadeuso"
  },
  
  // legality footer links
  legal: {
    terms_of_service: "https://agoravoting.com/tos/",
    cookies: "https://agoravoting.com/cookies/",
    privacy: "https://agoravoting.com/privacy/",
    security_contact: "https://agoravoting.com/security_contact/",
    community_website: "https://agoravoting.org"
  },

  // Details pertaining to the organization that runs the software
  organization: {
    // Name of the organization, appears in the logo mouse hover, in the login
    // page ("Login into __NAME__ admin account"), in the poweredBy, etc
    orgName: 'Agora Voting',

    // URL that the logo links to
    orgUrl: 'https://agoravoting.com'
  },
    
  verifier: {
    link: "",
    hash: ""
  },

  help: {
    info:""
  },

  success: {
    text: ""
  },

  tos: {
    text:"",
    title: ""
  }
};

angular.module('avConfig', [])
  .factory('ConfigService', function() {
    return avConfigData;
  });

angular.module('avConfig')
  .provider('ConfigService', function ConfigServiceProvider() {
    _.extend(this, avConfigData);

    this.$get = [function ConfigServiceProviderFactory() {
    return new ConfigServiceProvider();
    }];
  });
