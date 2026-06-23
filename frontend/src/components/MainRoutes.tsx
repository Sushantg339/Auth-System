import { Route, Routes, Navigate } from "react-router-dom"
import { lazy } from "react"
import { AppData } from "../context/AppContext"

const Home = lazy(()=>import("../pages/Home"))
const Login = lazy(()=>import("../pages/Login"))
const Signup = lazy(()=>import("../pages/Signup"))
const VerifyToken = lazy(()=>import("../pages/VerifyToken"))
const VerifyOtp = lazy(()=>import("../pages/VerifyOtp"))



const MainRoutes = () => {
  const {isAuth} = AppData()

  return (
    <Routes>
        <Route path="/" element={isAuth ? <Home/> : <Login/>}/>
        <Route path="/login" element={isAuth ? <Navigate to="/" replace /> : <Login/>}/>
        <Route path="/signup" element={isAuth ? <Navigate to="/" replace /> : <Signup/>}/>
        <Route path="/verify" element={isAuth ? <Navigate to="/" replace /> : <VerifyOtp/>}/>
        <Route path="/token/:token" element={<VerifyToken/>}/>
    </Routes>
  )
}

export default MainRoutes