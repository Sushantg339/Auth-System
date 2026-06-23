
import { useNavigate } from "react-router-dom"
import Loader from "../components/Loader"
import { AppData } from "../context/AppContext"

const Home = () => {

    const {logoutLoading, logoutUser} = AppData()
    const navigate = useNavigate()

    return (
        <div className="h-screen w-full flex items-center justify-center">
            <button onClick={()=>logoutUser(navigate)} className="bg-red-500 px-4 py-2 rounded-lg cursor-pointer">{logoutLoading ? <Loader/> : "Logout"}</button>
        </div>
    )
}

export default Home