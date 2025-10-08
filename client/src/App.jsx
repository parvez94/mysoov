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
import RefreshUser from './pages/RefreshUser';
import { SocketProvider } from './contexts/SocketContext';

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
  return (
    <SocketProvider>
      <RouterProvider router={router} />
    </SocketProvider>
  );
};
export default App;
