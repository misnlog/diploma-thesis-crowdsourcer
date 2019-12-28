
var routes = [
  {
    path: '/story-petr/',
    url: './pages/story-petr.html',
  },
  {
    path: '/community/',
    url: './pages/community.html',
  },
  {
    path: '/kavarna-article/',
    url: './pages/kavarna-article.html',
  },
  {
    path: '/accessibility-article-1/',
    url: './pages/accessibility-article1.html',
  },
  {
    path: '/naviterier-article-1/',
    url: './pages/naviterier-article1.html',
  },
  {
    path: '/naviterier-article-2/',
    url: './pages/naviterier-article2.html',
  },
  {
    path: '/wheelchair-article-1/',
    url: './pages/wheelchair-article1.html',
  },
  {
    path: '/life/',
    url: './pages/life.html',
  },
  {
    path: '/photos/',
    url: './pages/photos.html',
  },
  {
    path: '/photos-crosswalk-type/',
    url: './pages/photos-crosswalk-type.html',
  },
  {
    path: '/photos-crosswalk-lines/',
    url: './pages/photos-crosswalk-lines.html',
  },
  {
    path: '/photos-corner-type/',
    url: './pages/photos-corner-type.html',
  },
  {
    path: '/photos-crosswalk-curb/',
    url: './pages/photos-crosswalk-curb.html',
  },
  {
    path: '/photos-crosswalk-tactile/',
    url: './pages/photos-crosswalk-tactile.html',
  },
  {
    path: '/photos-crosswalk-surface-type/',
    url: './pages/photos-crosswalk-surface-type.html',
  },
  {
    path: '/photos-crosswalk-surface-quality/',
    url: './pages/photos-crosswalk-surface-quality.html',
  },
  {
    path: '/photos-crosswalk-surface-type/',
    url: './pages/photos-crosswalk-surface-type.html',
  },
  {
    path: '/photos-crosswalk-semafor/',
    url: './pages/photos-crosswalk-semafor.html',
  },
  {
    path: '/photos-sidewalk-surface-type/',
    url: './pages/photos-sidewalk-surface-type.html',
  },
  {
    path: '/photos-sidewalk-surface-quality/',
    url: './pages/photos-sidewalk-surface-quality.html',
  },
  {
    path: '/games/',
    url: './pages/games.html',
  },
  {
    path: '/statistics/',
    url: './pages/statistics.html',
  },
  {
    path: '/map/',
    componentUrl: './pages/template_test.html',
  },
  {
    path: '/game1/',
    url: './pages/game-guess-obstacle.html',
  },
  {
    path: '/game2/',
    url: './pages/game-tactile-guidelines.html',
  },
  {
    path: '/chat/',
    url: './pages/chat.html',
  },
  {
    path: '/',
    url: './index.html',
  },
  {
    path: '/about/',
    url: './pages/about.html',
  },
  {
    path: '/form/',
    url: './pages/form.html',
  },
  {
    path: '/catalog/',
    componentUrl: './pages/catalog.html',
  },
  {
    path: '/product/:id/',
    componentUrl: './pages/product.html',
  },
  {
    path: '/settings/',
    url: './pages/settings.html',
  },

  {
    path: '/dynamic-route/blog/:blogId/post/:postId/',
    componentUrl: './pages/dynamic-route.html',
  },
  {
    path: '/request-and-load/user/:userId/',
    async: function (routeTo, routeFrom, resolve, reject) {
      // Router instance
      var router = this;

      // App instance
      var app = router.app;

      // Show Preloader
      app.preloader.show();

      // User ID from request
      var userId = routeTo.params.userId;

      // Simulate Ajax Request
      setTimeout(function () {
        // We got user data from request
        var user = {
          firstName: 'Vladimir',
          lastName: 'Kharlampidi',
          about: 'Hello, i am creator of Framework7! Hope you like it!',
          links: [
            {
              title: 'Framework7 Website',
              url: 'http://framework7.io',
            },
            {
              title: 'Framework7 Forum',
              url: 'http://forum.framework7.io',
            },
          ]
        };
        // Hide Preloader
        app.preloader.hide();

        // Resolve route to load page
        resolve(
          {
            componentUrl: './pages/request-and-load.html',
          },
          {
            context: {
              user: user,
            }
          }
        );
      }, 1000);
    },
  },
  // Default route (404 page). MUST BE THE LAST
  {
    path: '(.*)',
    url: './pages/404.html',
  },
];
