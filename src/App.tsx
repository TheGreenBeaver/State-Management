import { FC } from 'react';
import { BrowserRouter as Router, Outlet, Route, Routes } from 'react-router-dom';
import { Nav, mains } from 'view';

const App: FC = () => (
  <Router>
    <Nav />
    <Routes>
      <Route path='/' element={<Outlet />}>
        {Object.entries(mains).map(([name, Main]) => (
          <Route
            key={name}
            path={`/${name}`}
            element={<Main />}
          />
        ))}
      </Route>
    </Routes>
  </Router>
);

export default App;
