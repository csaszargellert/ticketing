import 'bootstrap/dist/css/bootstrap.css';
import Header from '@/components/header';
import { buildClient } from '../api/buildClient';

const AppComponent = ({ Component, pageProps, currentUser }) => {
  return (
    <div>
      <div className="container">
        <Header currentUser={currentUser} />
        <Component currentUser={currentUser} {...pageProps} />
      </div>
    </div>
  );
};

AppComponent.getInitialProps = async (appContext) => {
  const client = buildClient(appContext.ctx);
  const { data } = await client.get('/api/users/current-user');

  let pageProps = {};
  if (appContext.Component.getInitialProps) {
    pageProps = await appContext.Component.getInitialProps(
      appContext.ctx,
      client,
      data.currentUser
    );
  }

  return {
    pageProps,
    ...data,
  };
};

export default AppComponent;
