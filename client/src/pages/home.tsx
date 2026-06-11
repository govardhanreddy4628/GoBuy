import Hero from "../components/hero"
import Layout from "../components/layout";
import { MessageCircle } from "lucide-react"; // chat icon
import { useNavigate } from "react-router-dom";

const Home = () => {
  const navigate = useNavigate();
  
  return (
    <>
      <Layout>
        <div>
          <Hero />
          <button
            onClick={() => navigate("/customersupport")}
            className="
        fixed bottom-6 right-6 
        bg-red-600 text-white 
        p-4 rounded-lg shadow-lg 
        hover:bg-red-700 transition 
        flex items-center justify-center z-50
      "
            aria-label="Chat with us"
          >
            <MessageCircle size={24} />
          </button>
        </div>
      </Layout>
    </>
  )
}

export default Home
