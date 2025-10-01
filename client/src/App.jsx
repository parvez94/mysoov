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
import Messages from './pages/Messages';
import Settings from './pages/Settings';
import { SocketProvider } from './contexts/SocketContext';
import { ChatProvider } from './contexts/ChatContext';

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
        path: 'messages',
        element: <Messages />,
      },
      {
        path: 'settings',
        element: <Settings />,
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
      <ChatProvider>
        <RouterProvider router={router} />
      </ChatProvider>
    </SocketProvider>
  );
};
export default App;
