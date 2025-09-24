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
  return <RouterProvider router={router} />;
};
export default App;
