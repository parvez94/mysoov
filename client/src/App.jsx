import { useEffect } from 'react';
import {
  RouterProvider,
  createBrowserRouter,
  Navigate,
  useParams,
} from 'react-router-dom';
import {
  Following,
  Home,
  Layout,
  Video,
  Feeds,
  Upload,
  PublicProfile,
  NotFound,
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
import DashboardFrontpage from './pages/dashboard/DashboardFrontpage';
import HappyTeamDashboard from './pages/HappyTeamDashboard';
import HappyContent from './pages/HappyContent';
import Frontpage from './pages/Frontpage';
import { Navbar, Modal, LeftSidebar } from './components/index';
import { useSelector } from 'react-redux';
import { selectModal } from './redux/modal/modalSlice';
import styled from 'styled-components';
import Blog from './pages/Blog';
import BlogPost from './pages/BlogPost';
import ArticleEditor from './pages/ArticleEditor';
import RefreshUser from './pages/RefreshUser';
import SearchResults from './pages/SearchResults';

// Helper component to handle post redirects from social media and old video links
const VideoRedirect = () => {
  const { id } = useParams();
  return <Navigate to={`/post/${id}`} replace />;
};

// Wrapper component for frontpage with navbar and sidebar (for preview)
const FrontpageWrapper = () => {
  const { isOpen } = useSelector(selectModal);
  return (
    <>
      {isOpen && <Modal />}
      <Navbar />
      <Main>
        <LeftSidebar />
        <Wrapper>
          <Frontpage />
        </Wrapper>
      </Main>
    </>
  );
};

const Main = styled.div`
  background-color: var(--tertiary-color);
  display: flex;
`;

const Wrapper = styled.div`
  flex: 10;
`;

// Wrapper component for 404 page with navbar
const NotFoundWrapper = () => {
  const { isOpen } = useSelector(selectModal);
  return (
    <>
      {isOpen && <Modal />}
      <Navbar />
      <NotFound />
    </>
  );
};

const HomeOrFrontpage = () => {
  return <Frontpage />;
};

const router = createBrowserRouter([
  {
    path: '/frontpage-preview',
    element: <FrontpageWrapper />,
  },
  {
    path: '/',
    element: <Layout />,
    children: [
      {
        index: true,
        element: <HomeOrFrontpage />,
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
        path: 'dashboard/frontpage',
        element: <DashboardFrontpage />,
      },
      {
        path: 'dashboard/happy-team',
        element: <HappyTeamDashboard />,
      },
      {
        path: 'happy-content',
        element: <HappyContent />,
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
        path: 'feeds',
        element: <Feeds />,
      },
      {
        path: 'search',
        element: <SearchResults />,
      },
      {
        path: 'upload',
        element: <Upload />,
      },
      {
        path: 'post/:id',
        element: <Video />,
      },
      {
        path: 'video/:id',
        element: <VideoRedirect />,
      },
      {
        path: 'video-redirect/:id',
        element: <VideoRedirect />,
      },
      {
        path: ':username',
        element: <PublicProfile />,
      },
      {
        path: '*',
        element: <NotFound />,
      },
    ],
  },
  {
    path: '*',
    element: <NotFoundWrapper />,
  },
]);

const App = () => {
  useEffect(() => {
    // Apply branding settings on app load
    const applyBranding = () => {
      try {
        const savedBranding = localStorage.getItem('siteBranding');

        if (savedBranding) {
          const branding = JSON.parse(savedBranding);

          // Update document title
          if (branding.siteTitle) {
            document.title = branding.siteTitle;
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
            }
            metaDescription.content = branding.metaDescription;
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
          }
        }
      } catch (err) {
        // Silent fail
      }
    };

    // Apply branding on initial load
    applyBranding();

    // Listen for branding updates
    const handleBrandingUpdate = () => {
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
