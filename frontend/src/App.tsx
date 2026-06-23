import Loader from "./components/Loader";
import MainRoutes from "./components/MainRoutes";
import { AppData } from "./context/AppContext";

const App = () => {
  const {loading} = AppData()
  return <div className="w-full h-screen">
    {loading ? <Loader/> :<MainRoutes/>}
  </div>;
};

export default App;
