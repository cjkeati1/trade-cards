import 'bootstrap/dist/css/bootstrap.css'

const app = ({Component, pageProps}) => {
   return <div className={'container'}><Component {...pageProps}/></div>
}

export default app;
