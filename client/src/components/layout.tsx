import Footer from "./footer";
import Header from "./header";

const Layout = ({children}) => {

  return (
    <div className='h-screen overflow-y-auto overflow-x-hidden'>
      <Header />
      <div style={{ minHeight: "80vh" }} >
        {children}
      </div>   
      <Footer />
    </div>
  );
};

export default Layout;
