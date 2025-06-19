import React from 'react';
import { BrowserRouter as Router, Route, Switch, Redirect } from 'react-router-dom';
import AppLayout from './components/AppLayout';
import MainMenu from './components/MainMenu';
import Overview from './components/Overview';
import MyCourses from './components/MyCourses';
import Students from './components/Students';
import AdminPanel from './components/AdminPanel';
import Messages from './components/Messages';
import Schedule from './components/Schedule';
import VideoConference from './components/VideoConference';
import LoginPage from './components/LoginPage';
import RegisterPage from './components/RegisterPage';
import ProfileSettings from './components/ProfileSettings';
import './styles/minimalist.css';

function PrivateRoute({ component: Component, pageTitle, onLogout, requiredRole, ...rest }) {
  return (
    <Route
      {...rest}
      render={props => {
        const user = JSON.parse(localStorage.getItem('user') || '{}');

        if (!user || !user.id) {
          return <Redirect to="/login" />;
        }
        
        if (requiredRole && user.role !== requiredRole && user.role !== 'admin') {
          console.warn(`Access denied: User with role '${user.role}' attempted to access route requiring '${requiredRole}'`);
          return <Redirect to="/" />;
        }
        
        return (
          <AppLayout pageTitle={pageTitle} user={user} onLogout={onLogout}>
            <Component {...props} />
          </AppLayout>
        );
      }}
    />
  );
}

function App() {
  const handleLogout = () => {
    localStorage.removeItem('user');
    window.location.href = '/login';
  };

  return (
    <Router>
      <Switch>
        <Route path="/login" component={LoginPage} />
        <Route path="/register" component={RegisterPage} />
        <PrivateRoute exact path="/" component={Overview} pageTitle="Главная" onLogout={handleLogout} />
        <PrivateRoute path="/my-courses" component={MyCourses} pageTitle="Мои курсы" onLogout={handleLogout} />
        <PrivateRoute path="/admin" component={AdminPanel} pageTitle="Админ-панель" onLogout={handleLogout} requiredRole="admin" />
        <PrivateRoute path="/messages" component={Messages} pageTitle="Сообщения" onLogout={handleLogout} />
        <PrivateRoute path="/schedule" component={Schedule} pageTitle="Расписание" onLogout={handleLogout} />
        <PrivateRoute path="/video-conference" component={VideoConference} pageTitle="Видеоконференции" onLogout={handleLogout} />
        <PrivateRoute path="/profile" component={ProfileSettings} pageTitle="Настройки профиля" onLogout={handleLogout} />
        <PrivateRoute path="/students" component={Students} pageTitle="Студенты" onLogout={handleLogout} requiredRole="admin" />
      </Switch>
    </Router>
  );
}

export default App;