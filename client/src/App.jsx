import { useEffect } from 'react';
import { RouterProvider, createBrowserRouter } from 'react-router-dom';
import {
  Following,
  Home,
  Layout,
  Video,
  Explore,
  Upload,
  PublicProfile,
} from './pages/index';
import Notifications from './pages/Notifications';
import Settings from './pages/Settings';
import Payment from './pages/Payment';
import Dashboard from './pages/dashboard/Dashboard';
import DashboardUsers from './pages/dashboard/DashboardUsers';
import DashboardPosts from './pages/dashboard/DashboardPosts';
import DashboardSettings from './pages/dashboard/DashboardSettings';
import DashboardArticles from './pages/dashboard/DashboardArticles';
import DashboardFilms from './pages/dashboard/DashboardFilms';
import Blog from './pages/Blog';
import BlogPost from './pages/BlogPost';
import ArticleEditor from './pages/ArticleEditor';
import RefreshUser from './pages/RefreshUser';
import SearchResults from './pages/SearchResults';

const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    children: [
      {
        index: true,
        element: <Home />,
      },
      {
        path: 'following',
        element: <Following />,
      },
      {
        path: 'notifications',
        element: <Notifications />,
      },
      {
        path: 'settings',
        element: <Settings />,
      },
      {
        path: 'payment',
        element: <Payment />,
      },
      {
        path: 'dashboard',
        element: <Dashboard />,
      },
      {
        path: 'dashboard/users',
        element: <DashboardUsers />,
      },
      {
        path: 'dashboard/posts',
        element: <DashboardPosts />,
      },
      {
        path: 'dashboard/settings',
        element: <DashboardSettings />,
      },
      {
        path: 'dashboard/articles',
        element: <DashboardArticles />,
      },
      {
        path: 'dashboard/films',
        element: <DashboardFilms />,
      },
      {
        path: 'blog',
        element: <Blog />,
      },
      {
        path: 'blog/:slug',
        element: <BlogPost />,
      },
      {
        path: 'article/:id',
        element: <ArticleEditor />,
      },
      {
        path: 'refresh-user',
        element: <RefreshUser />,
      },
      {
        path: 'explore',
        element: <Explore />,
        // children: [
        //   {
        //     path: ":id",
        //     element: <Video />,
        //   },
        // ],
      },
      {
        path: 'search',
        element: <SearchResults />,
      },
      {
        path: ':username',
        element: <PublicProfile />,
      },
      {
        path: 'upload',
        element: <Upload />,
      },
      {
        path: 'video/:id',
        element: <Video />,
      },
    ],
  },
]);

const App = () => {
  useEffect(() => {
    // Apply branding settings on app load
    const applyBranding = () => {
      try {
        const savedBranding = localStorage.getItem('siteBranding');
        console.log('🎨 Applying branding...', savedBranding);

        if (savedBranding) {
          const branding = JSON.parse(savedBranding);
          console.log('📦 Branding data:', branding);

          // Update document title
          if (branding.siteTitle) {
            document.title = branding.siteTitle;
            console.log('✅ Updated document title to:', branding.siteTitle);
          }

          // Update meta description
          if (branding.metaDescription) {
            let metaDescription = document.querySelector(
              'meta[name="description"]'
            );
            if (!metaDescription) {
              metaDescription = document.createElement('meta');
              metaDescription.name = 'description';
              document
                .getElementsByTagName('head')[0]
                .appendChild(metaDescription);
              console.log('✅ Created new meta description tag');
            }
            metaDescription.content = branding.metaDescription;
            console.log(
              '✅ Updated meta description to:',
              branding.metaDescription
            );
          }

          // Update favicon
          if (branding.favicon) {
            const link =
              document.querySelector("link[rel*='icon']") ||
              document.createElement('link');
            link.type = 'image/x-icon';
            link.rel = 'shortcut icon';
            link.href = branding.favicon;
            document.getElementsByTagName('head')[0].appendChild(link);
            console.log('✅ Updated favicon to:', branding.favicon);
          }
        } else {
          console.log('ℹ️ No saved branding found in localStorage');
        }
      } catch (err) {
        console.error('❌ Failed to apply branding:', err);
      }
    };

    // Apply branding on initial load
    applyBranding();

    // Listen for branding updates
    const handleBrandingUpdate = () => {
      console.log('🔄 Branding update event received');
      applyBranding();
    };

    window.addEventListener('brandingUpdated', handleBrandingUpdate);

    return () => {
      window.removeEventListener('brandingUpdated', handleBrandingUpdate);
    };
  }, []);

  return <RouterProvider router={router} />;
};
export default App;
